import React, { useState, useEffect } from "react";
import { TrackingContract } from "../utils/contract";
import web3 from "../utils/web3";
import "../styles/ProfileShipmentEvents.css";
import { fetchNFTMetadata } from "../utils/NftMetadata";
import { FaExternalLinkAlt } from "react-icons/fa";
import defaultFileImg from "../images/file-management.webp";
import defaultAudioImg from "../images/gettyimages-1467667303-640x640.jpg";
import { useNavigate } from "react-router-dom";
import ProfileBodyNothing from "./ProfileBodyNothing";

const ProfileShipmentEvents = ({ setSubItem}) => {
  const navigate = useNavigate();
  const [shipmentEvents, setShipmentEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const address = localStorage.getItem("dema_wallet");

  useEffect(() => {
  const fetchShipmentCreatedEvent = async () => {
    setLoading(true);
    try {
      const events = await TrackingContract.getPastEvents("ShipmentCreated", {
        fromBlock: 0,
        toBlock: "latest",
      });

      const filteredEvents = events.filter(
        (event) =>
          event.returnValues.buyer.toLowerCase() === address ||
          event.returnValues.seller.toLowerCase() === address
      ).sort((a, b) => {
        const idA = Number(a.returnValues.shipmentId);
        const idB = Number(b.returnValues.shipmentId);
        return idB - idA; // Descending order: latest first
      });

      // Fetch metadata for each event
      const eventsWithMetadata = await Promise.all(
        filteredEvents.map(async (e) => {
          try {
            const metadata = await fetchNFTMetadata(e.returnValues.tokenId, e.returnValues.nft);
            return {
              ...e,
              metadata,
            };
          } catch (err) {
            console.error("Failed to fetch metadata for event:", e, err);
            return {
              ...e,
              metadata: null,
            };
          }
        })
      );

      setShipmentEvents(eventsWithMetadata);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching ShipmentCreated events:", error);
      setLoading(false);
    }
  };

  if (address) {
    fetchShipmentCreatedEvent();
  }
}, [address]);

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
            
          if (shipmentEvents.length === 0) return <ProfileBodyNothing setSubItem={setSubItem} subItem="Activity" />

  return (
    <div className="profile-shipment-events-container">
        <div className="profile-shipment-events-header">
            <span>ID</span>
            <span>ITEM</span>
            <span>PRICE</span>
            <span>FROM</span>
            <span>TO</span>
            <div style={{display:"flex", justifyContent:"flex-end"}}>TIME</div>
        </div>
        {shipmentEvents.map((event, index) => (
  <div
    key={index}
    className="profile-shipment-events-row"
    onClick={() => navigate(`/shipment/${event.returnValues.shipmentId}`)}
  >
    <div className="profile-shipment-col-1">{event.returnValues.shipmentId}</div>

    <div
      className="profile-shipment-events-item"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/${event.returnValues.nft}/${event.returnValues.tokenId}`);
      }}
    >
      {renderPreview(
        event.metadata.mediaType,
        event.metadata.animation_url,
        event.metadata.image,
        event.metadata.name
      )}
      <div className="profile-shipment-events-info">
        <p className="profile-shipment-events-info1">
          {event.metadata.name
            ? event.metadata.name.slice(0, 20) + (event.metadata.name.length > 20 ? "..." : "")
            : null}
        </p>
        <p className="profile-shipment-events-info2">
          {event.metadata.description
            ? event.metadata.description.slice(0, 20) +
              (event.metadata.description.length > 20 ? "..." : "")
            : null}
        </p>
      </div>
    </div>

    <div className="profile-shipment-col-2">
      {web3.utils.fromWei(`${event.returnValues.price}`, "ether")} ETH
    </div>

    <div
      className="profile-shipment-col-3"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/${event.returnValues.seller}`);
        window.location.reload();
      }}
    >
      {`${event.returnValues.seller.slice(0, 6)}...${event.returnValues.seller.slice(-4)}`}
    </div>

    <div
      className="profile-shipment-col-4"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/${event.returnValues.buyer}`);
        window.location.reload();
      }}
    >
      {`${event.returnValues.buyer.slice(0, 6)}...${event.returnValues.buyer.slice(-4)}`}
    </div>

    <a
      href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="profile-shipment-col-5">
        {new Date(Number(event.returnValues.timestamp) * 1000).toLocaleString()}
        <FaExternalLinkAlt size={12} style={{ marginLeft: "6px" }} />
      </div>
    </a>
  </div>
))}
    </div>
  );
};

export default ProfileShipmentEvents;
