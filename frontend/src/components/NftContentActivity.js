import React, { useEffect, useState } from "react";
import { getActivitiesForToken } from "../utils/NFTActivity.js";
import { FaExternalLinkAlt } from "react-icons/fa";
import "../styles/NftContentActivity.css";
import { useNavigate } from "react-router-dom";
import NftActivityPlaceholder from "./NftActivityPlaceholder.js";
import NftActivityFilter from "./NftActivityFilter.js";
import NftNoActivityPlaceholder from "./NftNoActivityPlaceholder.js";

const NftContentActivity = ({ contractAddress, tokenId, startBlock = 0}) => {
  const [activities, setActivities] = useState([]);
  const [filters, setFilters] = useState(["All"]);
  const [activities2, setActivities2] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const shortAddress = (addr) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      if (!contractAddress || !tokenId) return; // Prevent fetch if data is not ready
      const data = await getActivitiesForToken(contractAddress, tokenId, startBlock);
      setActivities(data);
      setActivities2(data);
      setLoading(false);
    };
    fetchActivities();
  }, [contractAddress, tokenId, startBlock]);
  
  useEffect(()=>{
    const filteredLogs = activities2.filter((log) => {
      return filters.includes("All") || filters.includes(log.type);
    });
    setActivities(filteredLogs);
  },[filters, activities2])


  return (
    <div className="nft-activity-log">
      {loading ? (
        <div style={{marginTop:"20px"}}>
          <NftActivityPlaceholder />
        </div>
      ) : (
        <>
          {/* Table Headers */}
          <NftActivityFilter filters={filters} setFilters={setFilters}/>
          <div className="nft-activity-header">
            <span>EVENT</span>
            <span>PRICE</span>
            <span>FROM</span>
            <span>TO</span>
            <div style={{display:"flex", justifyContent:"flex-end"}}>TIME</div>
          </div>

          {activities.length===0?(<NftNoActivityPlaceholder />):(
  
          activities.map((act, index) => (
            <div key={index} className="nft-activity-row">
              <div className="nft-activity-col-1"><p style={{margin:"0"}}>{act.icon}</p><p style={{margin:"0"}}>{act.type}</p></div>
              <div className="nft-activity-col-2">{act.price? act.price + " ETH" : "---"}</div>
              <div className="nft-activity-col-3" onClick={()=>navigate(`/${act.from}`)}>{act.from? shortAddress(act.from) : "---"}</div>
              <div className="nft-activity-col-4" onClick={()=>navigate(`/${act.to}`)}>{act.to? shortAddress(act.to) : "---"}</div>
              <a
                  href={`https://sepolia.etherscan.io/tx/${act.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
              <div className="nft-activity-col-5">
                {new Date(Number(act.timestamp) * 1000).toLocaleString()}
                  <FaExternalLinkAlt size={12} style={{ marginLeft: "6px" }} />
              </div>
              </a>
            </div>
          )))}
        </>
      )}
    </div>
  );
};

export default NftContentActivity;
