import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pinataRoutes from "./routes/pinataRoutes.js";
import fileTypeRoutes from "./routes/fileTypeRoutes.js"
import addressRoutes from "./routes/addressRoutes.js"

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/pinata", pinataRoutes);
app.use("/api/filetype", fileTypeRoutes);
app.use("/api/address", addressRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
