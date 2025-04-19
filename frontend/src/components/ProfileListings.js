import React, {useState, useEffect} from "react";
import { MarketplaceContract } from "../utils/contract";
import web3 from "../utils/web3";
import ERC721 from "../contracts/ERC721.json";
import ProfileListCard from "./ProfileListCard";
import ProfileBodyNothing from "./ProfileBodyNothing";
import { resolveIPFS } from "../utils/detectFileType";
import LoadingCardPlaceholder from "./LoadingCardPlaceholder";

const ProfileListings=({account, setShowCancelModal, setcancelItemInfo, setShowBuyModal, setBuyItemInfo, setSubItem, filters })=>{
    const [listings, setListings] = useState([]);
    const [listings2, setListings2] = useState([]);
    const [loading, setLoading] = useState(false);

    const getUserListings = async () => {
      try {
        const userListings = await MarketplaceContract.getPastEvents("NFTListed", {
          fromBlock: 0,
          toBlock: "latest",
          filter: {
            seller: account
          }
        });
    
        const uniqueListingsMap = new Map();
    
        for (let i = userListings.length - 1; i >= 0; i--) {
          const listing = userListings[i];
          const key = `${listing.returnValues.nft}_${listing.returnValues.tokenId}`;
    
          if (!uniqueListingsMap.has(key)) {
            const nft = listing.returnValues.nft;
            const tokenId = listing.returnValues.tokenId;
    
            try {
              const currentListing = await MarketplaceContract.methods
                .listings(nft, tokenId)
                .call();
    
                if (
                  currentListing.seller !== "0x0000000000000000000000000000000000000000" &&
                  currentListing.seller.toLowerCase() === account.toLowerCase()
                )
                 {
                // Save latest listing info with updated price
                uniqueListingsMap.set(key, {
                  ...listing,
                  returnValues: {
                    ...listing.returnValues,
                    price: currentListing.price, // Use actual current price
                  },
                });
              }
            } catch (err) {
              console.warn(`Listing not found for token ${tokenId}`, err);
            }
          }
        }
    
        return Array.from(uniqueListingsMap.values());
      } catch (error) {
        console.error("Error fetching listings:", error);
        return [];
      }
    };
    
    const getMetadataForListing = async (listing) => {
        try {
            const nftAddress = listing.returnValues.nft;
            const tokenId = listing.returnValues.tokenId;
            const price = listing.returnValues.price;
            const nftContract = new web3.eth.Contract(ERC721.abi, nftAddress);
            const tokenURI = await nftContract.methods.tokenURI(tokenId).call();
            const resolveURI = resolveIPFS(tokenURI);
            const metadataResponse = await fetch(resolveURI);
            const metadata = await metadataResponse.json();
            return { tokenId, nftAddress, price, metadata };
        } catch (err) {
            console.error("Error fetching metadata:", err);
            return null;
        }
    };

    const fetchUserListedNFTs = async () => {
      setLoading(true);
    
      const listings = await getUserListings();
      const detailedListings = await Promise.all(
        listings.map(async (listing) => {
          return await getMetadataForListing(listing);
        })
      );
    
      const res = detailedListings.filter((item) => {
        if (!item || !item.metadata) return false;
        return true;
      });
    
      setListings(res);
      setListings2(res);
      setLoading(false);
    };
    
      useEffect(()=>{
        fetchUserListedNFTs();
      },[])  
      
      useEffect(()=>{
        const res = listings2.filter((item) => {
          if (!item || !item.metadata) return false;
      
          // Filter by search (NFT name)
          if (
            filters.search &&
            !item.metadata.name?.toLowerCase().includes(filters.search.toLowerCase())
          ) return false;
      
          // Filter by assetType (first attribute's value)
          if (
            filters.assetType &&
            item.metadata?.attributes?.[0]?.value?.toLowerCase() !== filters.assetType
          ) return false;
      
          // Filter by listingStatus (always "listed" here, but included for completeness)
          if (
            filters.listingStatus === "unlisted"
          ) return false; // this is a listed section only
      
          // Filter by maxPrice (converted from wei to ETH)
          const priceInETH = parseFloat(web3.utils.fromWei(item.price, "ether"));
          if (priceInETH > filters.maxPrice) return false;
      
          return true;
        });
        setListings(res);
      },[filters, listings2])

      if (loading) {
        return (
          <div className="profile-body-items-card">
            {Array.from({ length: 8 }).map((_, i) => (
              <LoadingCardPlaceholder key={i} />
            ))}
          </div>
        );
      }
      if(listings.length===0) return <ProfileBodyNothing setSubItem={setSubItem} subItem="Listings" />

    return(
        <div className="profile-body-items-card">
            {listings.map((list, index)=>{
                return(
                    <div key={index}>
                    <ProfileListCard token={list} account={account} setShowCancelModal={setShowCancelModal} setcancelItemInfo={setcancelItemInfo}
                        setShowBuyModal={setShowBuyModal} setBuyItemInfo={setBuyItemInfo}/>
                    </div>
                )
            })}
        </div>
    );
};

export default ProfileListings;