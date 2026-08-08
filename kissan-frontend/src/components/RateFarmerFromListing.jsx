import { useState, useEffect } from "react";
import { api } from "../api/client";
import RateButton from "./RateButton";

export default function RateFarmerFromListing({ listingId }) {
  const [farmerId, setFarmerId] = useState(null);

  useEffect(() => {
    api.get("/listings?retail_only=false")
      .then((all) => {
        const found = all.find(
          (listing) => String(listing.id) === String(listingId)
        );

        if (found) {
          setFarmerId(found.farmer_id);
        }
      })
      .catch(() => {});
  }, [listingId]);

  if (!farmerId) return null;

  return <RateButton userId={farmerId} label="Rate Farmer" />;
}