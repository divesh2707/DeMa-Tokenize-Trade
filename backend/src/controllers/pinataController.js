import { uploadFileToPinata, uploadJSONToPinata } from "../services/pinataService.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imageCID = await uploadFileToPinata(req.file.path);
    const imageURL = `https://gateway.pinata.cloud/ipfs/${imageCID}`;

    res.json({ success: true, imageURL });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload any file (audio, video, document, etc.)
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileCID = await uploadFileToPinata(req.file.path);
    const fileURL = `https://gateway.pinata.cloud/ipfs/${fileCID}`;

    res.json({ success: true, fileURL });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// export const uploadMetadata = async (req, res) => {
//   try {
//     console.log(req.body)
//     const { name, description, attributes, image } = req.body;
    
    
//     const metadata = {
//       name,
//       description,
//       image,
//       attributes,
//     };

//     const metadataCID = await uploadJSONToPinata(metadata);
//     const metadataURI = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;

//     res.json({ success: true, metadataURI });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

export const uploadMetadata = async (req, res) => {
  try {
    const { name, description, attributes, image, animation_url } = req.body;

    const metadata = {
      name,
      description,
      image, // still optional
      animation_url, // NEW: add this if exists
      attributes,
    };

    const metadataCID = await uploadJSONToPinata(metadata);
    const metadataURI = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;

    res.json({ success: true, metadataURI });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};