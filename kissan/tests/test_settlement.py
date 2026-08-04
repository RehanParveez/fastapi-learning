from tests.conftest import make_user, auth_headers
from app.models.user import UserRole

def test_settlement_pays_commission_then_advance_then_credit_then_net(db, client):
  farmer = make_user(db, role=UserRole.farmer, phone="+925134688921")
  broker = make_user(db, role=UserRole.broker, phone="+924890557212")
  shopkeeper = make_user(db, role=UserRole.shopkeeper, phone="+921289437983")
    
  product_resp = client.post("/inputs/products", json={"name": "DAP Fertilizer", "category": "fertilizer", "unit_price": 100, "stock_qty": 50,
  }, headers=auth_headers(shopkeeper))
  product_id = product_resp.json()["id"]

  order_resp = client.post("/input-orders", json={
    "payment_mode": "credit", "credit_markup_percent": 0.10,
    "items": [{"product_id": product_id, "qty": 10}],
  }, headers=auth_headers(farmer))
  assert order_resp.json()["total_amount"] == 1000
  assert order_resp.json()["outstanding_balance"] == 1100

  offer_resp = client.post("/advances/offer", json={
    "farmer_id": farmer.id, "advance_type": "crop_consignment", "advance_amount": 2000,
    "crop_type": "wheat", "expected_qty": 500, "commission_rate": 0.05, "pricing_mode": "fixed",
  }, headers=auth_headers(broker))
  advance_id = offer_resp.json()["id"]

  client.post(f"/advances/{advance_id}/accept", headers=auth_headers(farmer))
  client.post(f"/advances/{advance_id}/disburse", headers=auth_headers(broker))

  settle_resp = client.post(f"/advances/{advance_id}/settle", json={"sale_amount": 5000}, headers=auth_headers(broker))
  result = settle_resp.json()

  assert result["commission"] == 250  
  assert result["advance_repaid"] == 2000
  assert result["net_to_farmer"] == 1650 
  assert result["advance_status"] == "settled"

  balance_resp = client.get("/record/me/balance", headers=auth_headers(farmer))
  assert balance_resp.json()["balance"] == 1300

def test_advance_cannot_be_disbursed_twice(db, client):
  farmer = make_user(db, role=UserRole.farmer, phone="+925134688911")
  broker = make_user(db, role=UserRole.broker, phone="+924890557222")

  offer_resp = client.post("/advances/offer", json={"farmer_id": farmer.id, "advance_type": "unconditional_credit", "advance_amount": 500, "interest_rate": 0.25,
  }, headers=auth_headers(broker))
  advance_id = offer_resp.json()["id"]

  client.post(f"/advances/{advance_id}/accept", headers=auth_headers(farmer))
  first = client.post(f"/advances/{advance_id}/disburse", headers=auth_headers(broker))
  assert first.status_code == 200

  second = client.post(f"/advances/{advance_id}/disburse", headers=auth_headers(broker))
  assert second.status_code == 400 