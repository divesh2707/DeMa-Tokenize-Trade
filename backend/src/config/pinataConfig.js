import dotenv from "dotenv";

dotenv.config();

export default {
  apiKey: process.env.PINATA_API_KEY,
  secretKey: process.env.PINATA_SECRET_KEY,
  pinFileURL: "https://api.pinata.cloud/pinning/pinFileToIPFS",
  pinJSONURL: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
};
