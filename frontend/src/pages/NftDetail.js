import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {  resolveIPFS } from "../utils/detectFileType";
import "../styles/NftDetail.css";
import NftDetailMedia from "../components/NftDetailMedia";
import NftDetailContent from "../components/NftDetailContent";
import ContentPlaceholder from "../components/ContentPlaceholder";
import ListItemModal from "../components/ListItemModal";
import BuyNFTModal from "../components/BuyNFTModal";
import CancelNFTModal from "../components/CancelNftModal";
import NotFound from "./NotFound";
import UpdateItemModal from "../components/UpdateItemModal";
import { MarketplaceContract } from "../utils/contract";
import AboutNavbar from "../components/AboutNavbar";

const NftDetail=()=>{
    const {contractAddress, tokenId} = useParams();
    const [nft, setNft] = useState({});
    const [loading, setLoading] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [listItemInfo, setListItemInfo] = useState({});
    const [price, setPrice] = useState("0");
    const [nothing, setNothing] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isPhysical, setIsPhysical] = useState(false);

    useEffect(() => {
            if (window.ethereum) {
              const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                  localStorage.setItem("dema_wallet", accounts[0]);
                  window.location.reload();
                }
              };
          
              window.ethereum.on("accountsChanged", handleAccountsChanged);
              // Cleanup on unmount
              return () => {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
              };
            }
          }, []);

    const handleClose=()=>{
      setShowItemModal(false);
  }

  useEffect(() => {
    const fetchListingStatus = async () => {
      try {
        const listing = await MarketplaceContract.methods
          .listings(nft.contractAddress, nft.tokenId)
          .call();
  
        const isListed = listing && listing.seller !== "0x0000000000000000000000000000000000000000";
        if (isListed) {
          setPrice(listing.price);
          setListItemInfo(prev => ({
            ...prev,
            money: listing.price
          }));
        }
  
      } catch (error) {
        console.error("Error fetching listing status:", error);
      }
    };
  
    if (nft.contractAddress && nft.tokenId) {
      fetchListingStatus();
    }
  }, [nft]);

  useEffect(() => {
    if (nft?.attributes && Array.isArray(nft.attributes)) {
      const physicalAttribute = nft.attributes.find(attr => attr?.value === "Physical");
      setIsPhysical(!!physicalAttribute);
    }
  }, [nft.attributes]);
  
  

  const handleClose2=()=>{
    setShowUpdateModal(false);
}

  const handleCancel=()=>{
      setShowCancelModal(false);
  }

  const handleBuyCancel=()=>{
      setShowBuyModal(false);
  }

    const checkType = async (url) => {
      const res = await axios.get(`http://localhost:5000/api/filetype/detect`, {
        params: { url: url }
      });
      return res.data.type;
    };

    const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_KEY;
    const BASE_URL = `https://eth-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;

    const getNftOwner = async (contractAddress, tokenId) => {
      try {
        const response = await axios.get(`${BASE_URL}/getOwnersForNFT`, {
          params: {
            contractAddress,
            tokenId,
            tokenType: 'erc721',
          },
        });
    
        const owners = response.data.owners;
        return owners && owners.length > 0 ? owners[0] : "No owner found";
        } catch (error) {
        console.error("Error fetching NFT owner:", error.message);
        return null;
        }
      };


    const fetchNFTMetadata = async () => {
        setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/getNFTMetadata`, {
          params: {
            contractAddress,
            tokenId,
            tokenType: 'erc721',
          },
        });
  
        const owner = await getNftOwner(contractAddress, tokenId);
        const res = response.data;
        if (!res || !res.name || !res.image) {
          setNothing(true);
          return;
        }

        const nft={
          contractAddress: contractAddress,
          tokenId: tokenId,
          TokenStandard: "ERC721",
          Chain: "Sepolia",
          name: res.name,
          startBlock: res.contract.deployedBlockNumber,
          description: res.description,
          image: res.image.originalUrl || null,
          animation_url: resolveIPFS(res.raw.metadata.animation_url) || null,
          attributes: res.raw.metadata.attributes,
          tokenUri: res.tokenUri,
          mediaType: await checkType(res.raw.metadata.animation_url?res.raw.metadata.animation_url:"image"),
          owner: owner,
        }
        setNft(nft);
        setLoading(false);

        const token={
          tokenId: nft.tokenId,
          contractAddress: nft.contractAddress,
          image: nft.image || "",
          metadata: {
            name: nft.name,
            description: nft.description,
            attributes: nft.attributes,
            animation_url: res.raw.metadata.animation_url
          },
        }
        setListItemInfo(token);
      } catch (err) {
        console.error('Error:', err.response?.data || err.message);
        setNothing(true);
      }finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchNFTMetadata();
    }, [contractAddress, tokenId]);

    if (nothing) return <NotFound />;
    
    
    return(
      <div className="nft-detail-layout">
        <div className="nft-detail-layout1">
            <div className="about-search">
                <AboutNavbar lg="linear-gradient(to right ,rgb(5, 5, 5), #1e0505)"/>
            </div>
        </div>
          <div className="nft-detail-container">   
            <div className="nft-detail-container-media">
              <NftDetailMedia image={nft.image} animation_url={nft.animation_url} type={nft.mediaType} name={nft.name} />
            </div>
            <div className="nft-detail-container-content">
            {loading ? <ContentPlaceholder /> : <NftDetailContent nft={nft} setPrice={setPrice} 
              setShowBuyModal={setShowBuyModal} setShowItemModal={setShowItemModal} setShowCancelModal={setShowCancelModal}
              setShowUpdateModal={setShowUpdateModal}/>}
            </div>
              {showItemModal && <ListItemModal onClose={handleClose} token={listItemInfo} navigate2={true}/>}
              {showCancelModal && <CancelNFTModal onClose={handleCancel} token={{tokenid: nft.tokenId, contractAddress: nft.contractAddress}} />} 
              {showBuyModal && <BuyNFTModal onClose={handleBuyCancel} 
                token={{tokenid: nft.tokenId, contractAddress: nft.contractAddress, price: price.toString() , isPhysical: isPhysical}} />}
              {showUpdateModal && <UpdateItemModal onClose={handleClose2} token={listItemInfo} />}
          </div>
        </div>
    );
};

export default NftDetail;