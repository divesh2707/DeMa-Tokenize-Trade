// utils/detectFileType.js

export const resolveIPFS = (url) => {
  if (!url) return "";

  // Extract IPFS hash from ipfs:// or any Pinata gateway format
  let ipfsHash = url;

  if (url.includes("gateway.pinata.cloud/ipfs/")) {
    ipfsHash = url.split("gateway.pinata.cloud/ipfs/")[1];
  }

  return `https://ipfs.io/ipfs/${ipfsHash}`;
};

 /* ipfs.io/ipfs/ */
  
  export const detectFileTypeFromURL = async (url) => {
    const resolvedURL = url;
    if (!resolvedURL) return "file";
  
    try {
      const res = await fetch(resolvedURL, { method: "HEAD" });
      const type = res.headers.get("Content-Type") || "";
      
      if (type.startsWith("image/")) return "image";
      if (type.startsWith("video/")) return "video";
      if (type.startsWith("audio/")) return "audio";
      return "file";
    } catch (error) {
      return "file";
    }
  };
  