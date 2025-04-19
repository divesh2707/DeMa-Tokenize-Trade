import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import pinataConfig from "../config/pinataConfig.js";

export const uploadFileToPinata = async (filePath) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  try {
    const response = await axios.post(pinataConfig.pinFileURL, formData, {
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: pinataConfig.apiKey,
        pinata_secret_api_key: pinataConfig.secretKey,
      },
    });

    return response.data.IpfsHash;
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  } finally {
    fs.unlinkSync(filePath); // Delete file after upload
  }
};

export const uploadJSONToPinata = async (jsonData) => {
  try {
    const response = await axios.post(pinataConfig.pinJSONURL, jsonData, {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: pinataConfig.apiKey,
        pinata_secret_api_key: pinataConfig.secretKey,
      },
    });

    return response.data.IpfsHash;
  } catch (error) {
    throw new Error(`Metadata upload failed: ${error.message}`);
  }
};
