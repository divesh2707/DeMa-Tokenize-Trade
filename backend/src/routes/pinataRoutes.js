import express from "express";
import multer from "multer";
import {
  uploadImage,
  uploadFile,
  uploadMetadata,
} from "../controllers/pinataController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Existing
router.post("/upload-image", upload.single("image"), uploadImage);
router.post("/upload-metadata", uploadMetadata);

// New
router.post("/upload-file", upload.single("file"), uploadFile); // for audio, video, docs, etc.

export default router;
