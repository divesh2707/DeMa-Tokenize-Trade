import pool from "../config/db.js";

export const createShipment = async ({
  shipmentId,
  nftAddress,
  tokenId,
  buyerAddress,
  sellerAddress,
  shippingAddress,
}) => {
  const result = await pool.query(
    `INSERT INTO shipments 
     (shipment_id, nft_address, token_id, buyer_address, seller_address, shipping_address)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [shipmentId, nftAddress, tokenId, buyerAddress, sellerAddress, shippingAddress]
  );
  return result.rows[0];
};

export const getShipmentById = async (shipmentId) => {
  const result = await pool.query(
    `SELECT * FROM shipments WHERE shipment_id = $1`,
    [shipmentId]
  );
  return result.rows[0];
};
