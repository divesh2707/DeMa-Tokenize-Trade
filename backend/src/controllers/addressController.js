import { createShipment, getShipmentById } from "../Models/addressModel.js";

export const saveShipment = async (req, res) => {
  try {
    const {
      shipmentId,
      nftAddress,
      tokenId,
      buyerAddress,
      sellerAddress,
      shippingAddress,
    } = req.body;
    console.log(req.body)

    if (
      !shipmentId ||
      !nftAddress ||
      !tokenId ||
      !buyerAddress ||
      !sellerAddress ||
      !shippingAddress
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const shipment = await createShipment({
      shipmentId,
      nftAddress,
      tokenId,
      buyerAddress,
      sellerAddress,
      shippingAddress,
    });

    res.status(201).json(shipment);
  } catch (err) {
    console.error("Error saving shipment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getShipment = async (req, res) => {
  try {
    const shipmentId = req.params.shipmentId;

    const shipment = await getShipmentById(shipmentId);
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });

    res.status(200).json(shipment);
  } catch (err) {
    console.error("Error retrieving shipment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
