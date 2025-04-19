import React, { useEffect, useState } from "react";
import axios from "axios";
import ProfileItemCard from "./ProfileItemCard";
import { MarketplaceContract } from "../utils/contract";
import ProfileBodyNothing from "./ProfileBodyNothing";
import web3 from "../utils/web3";
import LoadingCardPlaceholder from "./LoadingCardPlaceholder";

const ProfileItems = ({account, setShowItemModal, setListItemInfo, 
  setShowCancelModal, setcancelItemInfo, setShowBuyModal, setBuyItemInfo, setSubItem, filters}) => {
  const [tokenURI, setTokenURI] = useState([]);
  const [tokenURI2, setTokenURI2] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNFTsFromAlchemy = async () => {
    const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_KEY;
    const ALCHEMY_NETWORK = process.env.REACT_APP_ALCHEMY_NETWORK;
    const url = `https://${ALCHEMY_NETWORK}.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/getNFTs?owner=${account}`;
    setLoading(true);
    try {
      const res = await axios.get(url);
      const nfts = await Promise.all(
        res.data.ownedNfts.map(async (nft) => {
          const contractAddress = nft.contract.address;
          const tokenId = nft.id.tokenId;
          
          let listing = null;
          try {
            listing = await MarketplaceContract.methods.listings(contractAddress, tokenId).call();
          } catch (err) {
            console.warn(`Listing not found for token ${tokenId}`, err);
          }
  
          return {
            tokenId,
            uri: nft.tokenUri?.gateway || "No URI",
            contractAddress,
            metadata: nft.metadata,
            image: nft.media[0]?.gateway || "",
            listing: listing && listing.seller !== "0x0000000000000000000000000000000000000000"
              ? {
                  seller: listing.seller,
                  price: listing.price
                }
              : null
          };
        })
      );
      setTokenURI(nfts);
      setTokenURI2(nfts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching NFTs from Alchemy:", error);
      setTokenURI([]);
      setTokenURI2([]);
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchNFTsFromAlchemy();
  }, []);

  useEffect(()=>{
    const filteredNFTs = tokenURI2.filter((nft) => {
      const { search, assetType, listingStatus, maxPrice } = filters;

      // Filter by search (name)
      const nameMatch = search === "" || nft.metadata?.name?.toLowerCase().includes(search.toLowerCase());
      const typeMatch = assetType === "" || (String(nft.metadata?.attributes?.[0]?.value || "")).toLowerCase() === assetType
      const listingMatch =
        listingStatus === "" ||
        (listingStatus === "listed" && nft.listing) ||
        (listingStatus === "unlisted" && !nft.listing);
       
        const priceMatch = !nft.listing || (nft.listing && web3.utils.fromWei(nft.listing.price.toString(), "ether") <= maxPrice);
        
      
      return nameMatch && typeMatch && listingMatch && priceMatch;
    });
    setTokenURI(filteredNFTs);
  },[filters, tokenURI2]);

  if (loading) {
    return (
      <div className="profile-body-items-card">
        {Array.from({ length: 8 }).map((_, i) => (
          <LoadingCardPlaceholder key={i} />
        ))}
      </div>
    );
  }
  

  if (tokenURI.length === 0) {
    return <ProfileBodyNothing setSubItem={setSubItem} subItem="Items" />;
  }
  

  return (
    <div className="profile-body-items-card">
      {tokenURI.map((token, index) => (
        <div key={index}>
            <ProfileItemCard token={token} setShowItemModal={setShowItemModal} setListItemInfo={setListItemInfo} account={account}
              setShowCancelModal={setShowCancelModal} setcancelItemInfo={setcancelItemInfo} 
              setShowBuyModal={setShowBuyModal} setBuyItemInfo={setBuyItemInfo}/>
        </div>
      ))}
    </div>
  );
};

export default ProfileItems;
