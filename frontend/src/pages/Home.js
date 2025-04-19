import React, { useEffect, useState, useRef } from "react";
import HomeNavbar from "../components/HomeNavbar";
import { MarketplaceContract } from "../utils/contract";
import "../styles/About.css"
import Home1 from "../components/Home1";
import Home2 from "../components/Home2";
import Home3 from "../components/Home3";
import Features from "../components/Features";
import Home4 from "../components/Home4";
import { fetchNFTMetadata } from "../utils/NftMetadata";
import SearchResult from "../components/SearchResult";


const Home = () => {
  const [all, setAll] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [cnfts, setCnfts] = useState([]);
  const [pnfts, setPnfts] = useState([]);
  const [dnfts, setDnfts] = useState([]);
  const [fnfts, setFnfts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const loggedInAccount = localStorage.getItem("dema_wallet");
  const searchRef = useRef(null);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
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

  const getListings = async () => {
    try {
      const listedEvents = await MarketplaceContract.getPastEvents("NFTListed", {
        fromBlock: 0,
        toBlock: "latest",
      });
  

      const uniqueListingsMap = new Map();
  
      for (let i = listedEvents.length - 1; i >= 0; i--) {
        const listing = listedEvents[i];
        const key = `${listing.returnValues.nft}_${listing.returnValues.tokenId}`;
  
       if (!uniqueListingsMap.has(key)) {
            const nft = listing.returnValues.nft;
            const tokenId = listing.returnValues.tokenId;
           
            try {
                const currentListing = await MarketplaceContract.methods.listings(nft, tokenId).call();
            if (currentListing.seller !== "0x0000000000000000000000000000000000000000" &&
                currentListing.seller.toLowerCase() !== loggedInAccount?.toLowerCase()
              ) {
        
                uniqueListingsMap.set(key, {
                  ...listing,
                  returnValues: {
                    ...listing.returnValues,
                    price: currentListing.price, // Use actual current price
                  },
                });
              }
        } catch (err) {
          console.warn(`Error fetching current listing for ${nft} ${tokenId}`, err);
        }
      }
    }
  
      return Array.from(uniqueListingsMap.values());
    } catch (error) {
      console.error("Error fetching listings:", error);
      return [];
    }
  };
  

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const listings = await getListings();

      const enriched = await Promise.all(
        listings.map(async (nft) => {
          try {
            const meta = await fetchNFTMetadata(Number(nft.returnValues.tokenId), nft.returnValues.nft);
            return {
              ...nft,
              ...meta,
              price: Number(nft.returnValues.price) / 1e18,
            };
          } catch (err) {
            console.error("Metadata fetch error", err);
            return nft; // fallback to original if metadata fails
          }
        })
      );
      setAll(enriched);
      setCnfts(enriched.filter(nft => [8, 7, 15, 9, 12, 11, 19].includes(Number(nft.returnValues.tokenId))));
      setPnfts(
        enriched.filter(n => n.returnValues.isPhysical)
          .sort(() => 0.5 - Math.random()).slice(0, 6)
      );
      setDnfts(
        enriched.filter(n => !n.returnValues.isPhysical)
          .sort(() => 0.5 - Math.random()).slice(0, 6)
      );
      setNfts(
        enriched.sort(() => 0.5 - Math.random()).slice(0, 6)
      );
      setLoading(false);
    };
    
    fetchListings();
  }, []);
  
  useEffect(() => {
    const lower = searchQuery.trim().toLowerCase();
  
    const filtered = all.filter(nft => {
      const name = nft.name?.toLowerCase() || "";
      const desc = nft.description?.toLowerCase() || "";
      const attrs = (nft.attributes || [])
        .map(attr => `${attr.trait_type} ${attr.value}`.toLowerCase())
        .join(" ");
  
      return (
        name.includes(lower) ||
        desc.includes(lower) ||
        attrs.includes(lower) ||
        name.startsWith(lower) ||
        name.split(" ").some(word => word.startsWith(lower))
      );
    });
  
    setFnfts(filtered);
  
    if (lower.length > 0 && searchRef.current) {
      searchRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchQuery]);
  
  return(
    <div className="about-background">
      <div>
        <HomeNavbar setSearchQuery={setSearchQuery}/>
      </div>
      <div>
        <Home1 cnfts={cnfts} loading={loading} />
      </div>
      <div style={{marginTop:"0px"}} ref={searchRef}>
        <div style={{marginTop:"50px"}} >
          {searchQuery.length>0 && <SearchResult fnfts={fnfts} searchQuery={searchQuery}/>}
        </div>
      </div>
      <div style={{marginTop:"50px"}}>
        <Home2 dnfts={dnfts} loading={loading}/>
      </div>
      <div style={{marginTop:"50px"}}>
        <Home3 nfts={nfts} loading={loading}/>
      </div>
      <div style={{marginTop:"50px"}}>
        <Home4 pnfts={pnfts} loading={loading}/>
      </div>
      <div style={{marginTop:"50px", marginBottom:"30px"}}>
        <Features/>
      </div>
    </div>
  );
};

export default Home;
