import axios from "axios";

// List of IPFS gateways to try
const ipfsGateways = [
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://nftstorage.link/ipfs/",
];

// Extract hash and resolve to full URLs across multiple gateways
export const resolveIPFS = (url) => {
  if (!url) return [];

  let ipfsHash = url;
  if (url.startsWith("ipfs://")) {
    ipfsHash = url.split("ipfs://")[1];
  } else if (url.includes("/ipfs/")) {
    ipfsHash = url.split("/ipfs/")[1];
  }

  return ipfsGateways.map((gateway) => `${gateway}${ipfsHash}`);
};

// Detect file type from MIME type
const getTypeFromMime = (type) => {
  if (!type) return null;
  const lower = type.toLowerCase();
  if (lower.startsWith("image/")) return "image";
  if (lower.startsWith("video/")) return "video";
  if (lower.startsWith("audio/")) return "audio";
  return null;
};

// Main detection function
export const detectFileTypeFromURL = async (url) => {
  if (!url) return "file";
  if (url === "image") return "image";

  const resolvedURLs = resolveIPFS(url);

  for (const resolvedURL of resolvedURLs) {
    try {
      const res = await axios.head(resolvedURL, { timeout: 5000 });
      const contentType = res.headers["content-type"];
      const fileType = getTypeFromMime(contentType);
      if (fileType) return fileType;
    } catch (err) {
      // Try next fallback
      continue;
    }
  }

  return "file"; // If nothing matched, assume it's a generic file
};
