import { detectFileTypeFromURL } from "../services/detectFileType.js";

export const getFileType = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url or CID" });

  const type = await detectFileTypeFromURL(url);
  res.json({ type });
};
