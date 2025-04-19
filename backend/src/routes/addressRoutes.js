import express from "express";
import {saveShipment, getShipment } from "../controllers/addressController.js";

const router = express.Router();

router.post("/save", saveShipment);
router.get("/by-shipment/:shipmentId", getShipment);

export default router;
