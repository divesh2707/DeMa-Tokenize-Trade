import express from "express";
import { getFileType } from "../controllers/fileTypeController.js";

const router = express.Router();

router.get("/detect", getFileType);

export default router;