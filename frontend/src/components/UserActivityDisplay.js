// components/UserActivityDisplay.js
import React, { useEffect, useState } from "react";
import { getUserActivity } from "../utils/UserActivity";
import { useNavigate } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";
import ProfileBodyNothing from "./ProfileBodyNothing";
import defaultFileImg from "../images/file-management.webp";
import defaultAudioImg from "../images/gettyimages-1467667303-640x640.jpg";
import "../styles/UserActivity.css";

const UserActivityDisplay = ({ account, setSubItem, activityFilters}) => {
  const [activities, setActivities] = useState([]);
   const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const shortAddress = (addr) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

   const renderPreview = (fileType, animation_url, image, name) => {
            if (fileType === null) {
              return <div className="loading-spinner" />; // Add some CSS or spinner here
            }
            if (fileType === "video") {
              return <video src={animation_url} alt={name} preload="metadata" width="100%" />;
            } else if (fileType === "audio") {
              return <img src={defaultAudioImg} alt={name} style={{objectFit:"cover"}}/>;
            } else if (fileType === "file") {
              return <img src={defaultFileImg} alt={name} style={{objectFit:"cover"}}/>;
            } else {
              return <img src={image} alt={name} style={{objectFit:"cover"}}/>;
            }
          };
      

  useEffect(() => {
    const load = async () => {
      const logs = await getUserActivity(account);
      setActivities(logs);
      setAllActivities(logs);
      setLoading(false);
    };
    load();
  }, [account]);

  useEffect(() => {
    const filteredLogs = allActivities.filter((log) => {
        return activityFilters.includes("All") || activityFilters.includes(log.type);
    });
     setActivities(filteredLogs);
    }, [activityFilters, allActivities]);

    if (loading)
      return Array.from({ length: 7}).map((_, rowIdx) => (
        <div
          className={`user-activity-placeholder-row ${rowIdx === 0 ? "user-activity-first-placeholder-row" : ""}`}
          key={rowIdx}
        >
          {Array.from({ length: 6 }).map((_, colIdx) => (
            <div
              className={`user-activity-placeholder-col ${
                colIdx === 5 ? "user-activity-placeholder-col-end" : ""
              }`}
              key={colIdx}
            >
              <div className="user-activity-placeholder-box" />
            </div>
          ))}
        </div>
      ));
    
  if (activities.length === 0) return <ProfileBodyNothing setSubItem={setSubItem} subItem="Activity" />

  return (
    <div className="user-activity-log">
      <div className="user-activity-header">
        <span>EVENT</span>
        <span>ITEM</span>
        <span>PRICE</span>
        <span>FROM</span>
        <span>TO</span>
        <div style={{display:"flex", justifyContent:"flex-end"}}>TIME</div>
      </div>

      {activities.map((act, index) => (
                  <div key={index} className="user-activity-row">
                    <div className="user-activity-col-1"><p style={{margin:"0"}}>{act.icon}</p><p style={{margin:"0"}}>{act.type}</p></div>
                    <div className="activity-col-item" onClick={()=>{navigate(`/${act.metadata.contractAddress}/${act.tokenId}`)}}>
                                  {renderPreview(act.metadata.mediaType, act.metadata.animation_url, act.metadata.image, act.metadata.name)}
                                  <div className="activity-col-item-info">
                                      <p className="activity-col-item-info1">
                                        {act.metadata.name ? act.metadata.name.slice(0,20) + (act.metadata.name.length>20 ? '...' : ''): null
                                        }</p>
                                      <p className="activity-col-item-info2">
                                      {act.metadata.description ? 
                                          act.metadata.description.slice(0, 20) + (act.metadata.description.length > 20 ? '...' : '') 
                                            : null}
                                      </p>
                                  </div>
                              </div>
                    <div className="user-activity-col-2">{act.price? act.price + " ETH" : "---"}</div>
                    <div className="user-activity-col-3" onClick={()=>{navigate(`/${act.from}`);window.location.reload()}}>{act.from? shortAddress(act.from) : "---"}</div>
                    <div className="user-activity-col-4" onClick={()=>{navigate(`/${act.to}`);window.location.reload()}}>{act.to? shortAddress(act.to) : "---"}</div>
                    <a
                        href={`https://sepolia.etherscan.io/tx/${act.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                    <div className="user-activity-col-5">
                      {new Date(Number(act.timestamp) * 1000).toLocaleString()}
                        <FaExternalLinkAlt size={12} style={{ marginLeft: "6px" }} />
                    </div>
                    </a>
                  </div>
                ))}
    </div>
  );
};

export default UserActivityDisplay;
