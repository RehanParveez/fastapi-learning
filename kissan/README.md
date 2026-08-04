# KisanLink — Farm Credit & Market Access Platform

A FastAPI project built on a real, documented problem in Pakistani agriculture, not an invented one.

## 1. The problem, as it actually works today

Most Pakistani smallholder farmers can't get a bank loan — they mostly hold land through family/inherited arrangements rather than clean individual titles, so they have nothing a bank will accept as collateral. Into that gap steps the **arthi** (commission agent), and this relationship is well documented by the State Bank of Pakistan's own rural finance research and by agricultural economists:

- The **kacha arthi** effectively acts as the farmer's bank. At sowing time he advances cash or inputs on credit. In return, the farmer is expected to bring the harvested crop back to that same arthi to sell.
- The **pakka arthi** is a crop buyer — he takes possession of the produce and resells it to millers, stockists, or consumers.
- At sale, the arthi deducts an agreed commission (locally called **arhat**) from the proceeds before handing over the balance — so the "interest" on the original advance is rarely a stated rate, it's baked into the commission and the price the farmer receives.
- This system persists specifically *because* formal banks won't lend without collateral, and because arthis offer something banks don't: flexible repayment if a crop fails, and a relationship-based approval process instead of paperwork.
- The tradeoff: this credit is reported to be expensive, and the farmer has little visibility into or leverage over the terms once the advance is taken.

That's the actual gap: not "farmers need an app," but "farmers need the flexibility of the arthi relationship with the transparency a bank statement gives you." A handful of real Pakistani startups already attack pieces of this — Ricult (inputs + credit + market access), Tazah (B2B produce marketplace), Farm to Home / Kissan Bazaar (farmer-to-consumer, cutting out middlemen). None of them are shipping fully as a single system, which is exactly why it's a legitimate, non-trivial project to design one — not because you're expected to out-build funded startups, but because the domain has real, layered logic worth implementing properly instead of faking with dummy data.

## 2. Actors and what each one actually wants

| Role | Real motivation |
|---|---|
| **Farmer** | Get inputs and cash before harvest without predatory terms; know exactly what's owed and to whom; sell at a fair price |
| **Shopkeeper** (agri-input dealer) | Sell seed/fertilizer/pesticide, extend credit to regular customers without losing money on defaults |
| **Broker** (the arthi role, made transparent) | Advance cash against a future crop, earn a commission on the sale — the platform's job is to make the *terms* visible up front instead of settled unilaterally at harvest |
| **Factory** (mill, processor, ginner) | Secure a reliable volume of a specific crop at a known quality, at a pre-agreed price, without negotiating with hundreds of individual farmers |
| **Consumer** | Buy produce closer to farm price, without four layers of markup between field and kitchen |
| **Admin** | Verify identities, resolve disputes, keep the platform trustworthy |

## 3. Tech stack

Same core as your last project, plus a couple of additions that matter for this specific domain:

- **FastAPI** + **Pydantic v2** / `pydantic-settings`
- **PostgreSQL** + **Alembic**
- **JWT auth** (`python-jose`) + `passlib`/bcrypt, role-based access control
- **APScheduler** for due-date reminders and unmet-contract alerts
- **WebSockets** for real-time notifications (offer received, payment settled, etc.)
- **pytest** + `httpx.AsyncClient`
- A pluggable **notification adapter** interface (console/log in dev, but designed so an SMS gateway can be dropped in later) — worth doing from day one, because a real farmer-facing product in Pakistan cannot assume everyone is checking a mobile app; SMS is the realistic reach channel. You don't have to integrate a real SMS provider — just don't hardcode notifications to "send an email" the way your last project did.

## 4. Domain model

| Entity | Key fields | Purpose |
|---|---|---|
| `User` | id, role, phone, email, hashed_password | role: farmer / shopkeeper / broker / factory / consumer / admin |
| `FarmerProfile` | user_id, land_size_acres, location, verified | |
| `ShopkeeperProfile` / `BrokerProfile` / `FactoryProfile` | user_id, business_name, location, verified | |
| `VerificationDocument` | user_id, doc_type (cnic/land_record/business_reg), file_path, status | Admin approves before a role gets full privileges |
| `InputProduct` | id, shopkeeper_id, name, category, unit_price, stock_qty | Seed/fertilizer/pesticide catalog |
| `InputOrder` / `InputOrderItem` | farmer_id, shopkeeper_id, payment_mode (cash/credit), status | |
| `CropAdvance` | id, farmer_id, broker_id, crop_type, expected_qty, advance_amount, commission_rate, pricing_mode (fixed/market_minus_commission), status, due_date | The digitized, transparent version of the kacha-arthi advance |
| `ContractDemand` | id, factory_id, crop_type, quantity_needed, price_offered, quality_specs, delivery_window | Factory's open call for supply |
| `ContractAllocation` | id, demand_id, farmer_id, allocated_qty, status | Farmer fulfilling part of a `ContractDemand` |
| `CropListing` | id, farmer_id, crop_type, quantity, quality_grade, price, retail_available | A harvested batch for sale — to brokers/factories, and optionally to consumers |
| `Delivery` | id, source_type (contract/listing), source_id, delivered_qty, quality_grade, recorded_by | |
| `ConsumerOrder` / `ConsumerOrderItem` | consumer_id, listing_id, qty, payment_mode | payment_mode defaults to cash-on-delivery — matches how these platforms actually operate here |
| `RecordEntry` | id, farmer_id, entry_type, direction (debit/credit), amount, reference_type, reference_id, created_at | Append-only. Every credit, advance, sale, and repayment is a row here — never an update to a running balance |
| `Rating` | rater_id, ratee_id, reference_type, reference_id, score, comment | |

## 5. The logic, module by module

### 5.1 Input marketplace & credit

A farmer orders from a shopkeeper's catalog, choosing cash or credit. On credit approval:

```python
def place_input_order_on_credit(db, farmer_id, shopkeeper_id, items):
  order = create_input_order(db, farmer_id, shopkeeper_id, items, payment_mode = "credit")
  total = sum(i.qty * i.unit_price for i in items)
  add_record_entry(db, farmer_id, entry_type = "input_credit",
    direction = "debit", amount=total, reference_type = "input_order", reference_id=order.id)
  return order
```

The shopkeeper sets a `credit_markup_percent` on credit orders, shown to the farmer *before* they accept — this is the actual point of the platform: the informal system settles the cost at harvest, unilaterally; here the farmer sees the number up front.

### 5.2 Crop advance (the core "digitized arthi/middleman" flow)

A broker offers an advance against a specific, named future crop. State machine:

`offered → accepted → disbursed → repaying → settled`
(with a side branch to `extended` if the crop fails — real arthis grant repayment extensions in bad years and charge interest only on the unpaid remainder, and this platform should too, rather than silently defaulting the farmer)

```python
def disburse_advance(db, advance: CropAdvance):
  advance.status = "disbursed"
  add_record_entry(db, advance.farmer_id, entry_type = "crop_advance",
    direction="credit", amount=advance.advance_amount, reference_type = "crop_advance", reference_id=advance.id)
  db.commit()
  broadcast(advance.farmer_id, "advance_disbursed", {...})
```

### 5.3 Settlement — the piece worth getting right

This is the module that actually replicates (and improves on) what an middleman/arthi does today: when a farmer's crop sells, dues get settled automatically, in a fixed and disclosed order, instead of an opaque deduction at the counter.

```python
def settle_sale_proceeds(db, farmer_id: int, sale_amount: float, broker_commission_rate: float | None):
  remaining = sale_amount

  if broker_commission_rate:
    commission = sale_amount * broker_commission_rate
    add_ledger_entry(db, farmer_id, "broker_commission", "debit", commission, ...)
    remaining -= commission

  for advance in open_crop_advances(db, farmer_id):
    take = min(remaining, advance.outstanding_balance)
    add_ledger_entry(db, farmer_id, "advance_repayment", "debit", take,
      reference_type = "crop_advance", reference_id=advance.id)
    advance.outstanding_balance -= take
    if advance.outstanding_balance == 0:
      advance.status = "settled"
    remaining -= take

  for credit in open_input_credits(db, farmer_id):
    take = min(remaining, credit.outstanding_balance)
    add_ledger_entry(db, farmer_id, "credit_repayment", "debit", take, ...)
    credit.outstanding_balance -= take
    remaining -= take

  add_ledger_entry(db, farmer_id, "net_payment", "credit", remaining, ...)
  db.commit()
  return remaining  # what actually reaches the farmer
```

`farmer_balance(farmer_id)` — a function, not a stored column — sums `RecordEntry` rows to get the current net position. Same principle as an inventory system deriving stock from movements instead of trusting a mutable counter: nothing here is ever updated in place, only appended to.

### 5.4 Contract farming (factory ↔ farmer)

Factory posts a `ContractDemand`. Farmers apply, get allocated a quantity (`ContractAllocation`). At delivery, a quality grade (A/B/C) is recorded and maps to a `price_adjustment_percent`, so a lower-grade delivery pays proportionally less — matching how real contract-farming quality specs work, instead of a flat pass/fail.

### 5.5 Crop marketplace & consumer direct sales

A `CropListing` is visible to brokers and factories by default. A farmer can additionally flag `retail_available=true` with a retail unit size (e.g. 5kg bags) to open it to consumers directly — this is the farm-to-consumer channel that lets at least part of a harvest skip several markup layers, the same mechanism the real farmer-to-consumer apps in this space are built around. Keep checkout simple: cash-on-delivery as the default payment mode, since that's the dominant pattern in this market — don't over-engineer a payment gateway integration for a portfolio project.

### 5.6 Trust layer

After any completed order, advance, or contract, both sides can rate each other. This directly answers the information-asymmetry problem in the informal system today, where a farmer has no way to compare brokers before committing.

### 5.7 Notifications & background jobs

Websocket events: `credit_offer_received`, `advance_disbursed`, `contract_allocated`, `delivery_recorded`, `payment_settled`.

Daily APScheduler jobs: flag advances/credits approaching `due_date` unpaid; flag `ContractDemand`s nearing their delivery window with unmet allocation.

## 6. Roles & permissions

| Action | Farmer | Shopkeeper | Broker | Factory | Consumer | Admin |
|---|---|---|---|---|---|---|
| Order inputs | ✓ | | | | | |
| List input products | | ✓ | | | | |
| Offer crop advance | | | ✓ | | | |
| Accept advance | ✓ | | | | | |
| Post contract demand | | | | ✓ | | |
| Create crop listing | ✓ | | ✓ (on behalf) | | | |
| Buy from listing | | | ✓ | ✓ | ✓ (if retail) | |
| Approve verification | | | | | | ✓ |

## 7. Project structure

```
kisan/
├── alembic/
├── app/
│   ├── core/            # config.py, security.py
│   ├── db/
│   ├── models/           # user.py, input.py, advance.py, contract.py, listing.py, record.py
│   ├── schemas/
│   ├── repositories/
│   ├── services/          # input_service.py, advance_service.py, settlement_service.py,
│   │                       # contract_service.py, listing_service.py, rating_service.py
│   ├── routers/
│   ├── background/        # tasks.py, scheduler.py
│   ├── websocket/
│   ├── middleware/
│   ├── exceptions/
│   ├── deps.py
│   └── main.py
├── tests/
│   ├── test_settlement.py   # the one worth writing carefully — proves the payout order is correct
│   └── ...
├── docker-compose.yml
└── requirements.txt
```

## 8. Suggested build order

1. Auth + roles + verification (`VerificationDocument`, admin approval)
2. Input catalog + `InputOrder` (cash only first, then add credit + `RecordEntry`)
3. `CropAdvance` — offer, accept, disburse
4. `settle_sale_proceeds()` + `farmer_balance()` — the core logic, get this right and tested
5. `ContractDemand` + `ContractAllocation` + delivery grading
6. `CropListing` — broker/factory side first, then `retail_available` + `ConsumerOrder`
7. Ratings
8. Websocket events + APScheduler reminders
9. Tests, especially the settlement order test
10. Docker Compose, README

## 9. Feature checklist

**Core (build these):** everything in §5–8 above.

**Worth adding once the core works:**
- Reference mandi price feed (even a manually-seeded daily price table per crop/region gives listings a "fair price" benchmark to display)
- Urdu labels/messages alongside English in API responses — a real localization need in this market, not a nice-to-have
- Simple bidding on `CropListing` instead of fixed-price-only
- SMS/WhatsApp adapter behind the notification interface you already built
- Land-record verification workflow detail (multi-owner family land is the actual norm here, so a single "owner" field is a simplification worth revisiting later)

**Deliberately out of scope for this project:** live payment gateway integration, satellite crop-health imagery, weather advisory — all real features in this space, but each is its own project, not a logic point of *this* one.
