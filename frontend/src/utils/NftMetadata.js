import axios from "axios";
import {  resolveIPFS } from "../utils/detectFileType";

const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_KEY;
const BASE_URL = `https://eth-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;

const checkType = async (url) => {
    const res = await axios.get(`http://localhost:5000/api/filetype/detect`, {
      params: { url: url }
    });
    return res.data.type;
  };

export const fetchNFTMetadata = async (tokenId, contractAddress) => {
  try {
    const response = await axios.get(`${BASE_URL}/getNFTMetadata`, {
      params: {
        contractAddress,
        tokenId,
        tokenType: 'erc721',
      },
    });

    const res = response.data;
    if (!res || !res.name || !res.image) {
      return {};
    }

    const nft={
      contractAddress,
      tokenId,
      name: res.name,
      description: res.description,
      attributes: res.raw.metadata.attributes,
      image: res.image.originalUrl || null,
      animation_url: resolveIPFS(res.raw.metadata.animation_url) || null,
      mediaType: await checkType(res.raw.metadata.animation_url?res.raw.metadata.animation_url:"image"),
    }

    return nft;

  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
}
};
