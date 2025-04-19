import React, {useState, useEffect} from "react";
import web3 from "../utils/web3";
import { useNavigate } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FaLink } from "react-icons/fa";
import "../styles/ShipmentSection1.css"
import RejectModal from "./RejectModal.js"
import TrackCancelModal from "./TrackCancelModal.js";
import { TrackingContract } from "../utils/contract";
import ERC721 from "../contracts/ERC721.json";
import ErrorToast from "./ErrorToast";
import ShipmentMessage from "./ShipmentMessage.js";
import ThirdModal from "./ThirdModal.js";

const ShipmentSection1=({shipmentDetails, shortAddress, isBuyer, setRefetch, shipping_id, timeRemaining, isSeller, thirdParty})=>{
    const STATUS_MAP = ["INITIATED", "INTRANSIT", "DELIVERED", "REJECTED", "CANCELLED", "FINALIZED"];
    const navigate = useNavigate();
    const isShow = (isBuyer && shipmentDetails.status == 2) ||( !isBuyer && shipmentDetails.status!=2);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showTrackCancelModal, setShowTrackCancelModal] = useState(false);
    const [rejectionDeadline, setRejectionDeadline] = useState(null);
    const [timeLeft, setTimeLeft] = useState("0d 0h 0m 0s");
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(false);
    const [owner, setOwner] = useState(shipmentDetails?.buyer);
    const [showThirdModal, setShowThirdModal] = useState(false);
    const NFTContract = new web3.eth.Contract(ERC721.abi, shipmentDetails.nft);
    
    useEffect(()=>{
      const fetchOwner=async()=>{
        const owner = await NFTContract.methods.ownerOf(shipmentDetails.tokenId).call();
        setOwner(owner);
      }
      fetchOwner();
    },[shipmentDetails]);
       
    const calculateTimeLeft = (deadlineInSeconds) => {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const distance = deadlineInSeconds - nowInSeconds;
    
      if (distance <= 0) return "Expired";
    
      const days = Math.floor(distance / (60 * 60 * 24));
      const hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((distance % (60 * 60)) / 60);
      const seconds = distance % 60;
    
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };    
  
    useEffect(() => {
      const fetchRejectionDeadline = async () => {
        try {
          const days = Number(await TrackingContract.methods.defaultRejectionDeadlineSeconds().call());
          const deliveredAt = Number(shipmentDetails.deliveredAt) ;
          const deadlineTime = deliveredAt + days; // already in seconds
          setRejectionDeadline(deadlineTime);
        } catch (err) {
          console.error("Failed to fetch rejection deadline", err);
        }
      };
    
      if (shipmentDetails?.status == 2) {
        fetchRejectionDeadline();
      }
    }, [shipmentDetails]);

    useEffect(() => {
      if (!rejectionDeadline) return;
    
      const interval = setInterval(() => {
        const left = calculateTimeLeft(rejectionDeadline);
        setTimeLeft(left);
      }, 1000); // Update every 1 minute
    
      // Run once immediately
      setTimeLeft(calculateTimeLeft(rejectionDeadline));
    
      return () => clearInterval(interval);
    }, [rejectionDeadline]);
    

    const handleCancel=()=>{
      setShowRejectModal(false);
    }

    const handleCancel2=()=>{
      setShowTrackCancelModal(false);
    }

    const handleCancel3=()=>{
      setShowThirdModal(false);
    }

    const handleAutoCancel=async()=>{
      const account = localStorage.getItem("dema_wallet");
      try {
        setLoading(true);
        await TrackingContract.methods.autoCancelIfLate(shipping_id).send({ from: account });
        setRefetch(prev => !prev); // Refresh shipment details
        setLoading(false);
      } catch (error) {
        console.error("Cancel failed:", error);
        setError("Cancel failed");
        setShowToast(true);
        setLoading(false);
      }
    }

    const handleComplete=async()=>{
      const account = localStorage.getItem("dema_wallet");
      try {
        setLoading(true);
        await TrackingContract.methods.finalizeDeliveredShipment(shipping_id).send({ from: account });
        setRefetch(prev => !prev); // Refresh shipment details
        setLoading(false);
      } catch (error) {
        console.error("Something Went Wrong!", error);
        setError("Something Went Wrong!");
        setShowToast(true);
        setLoading(false);
      }
    }

    const showRejectButton = isBuyer && shipmentDetails.status == 2 && // status is DELIVERED
    owner.toLowerCase() === shipmentDetails.buyer.toLowerCase() && // buyer is the owner
    timeLeft !== "Expired" && timeLeft !== "0d 0h 0m 0s"; // time left is greater than 1 second


    return(
        <>
        {shipmentDetails && (
              <div className={`shipment-section-nft-details ${isShow && "pad2"}`}>
                <div className="shipment-section-nft-details-1">
                  <p><span className={`shipment-status shipment-status-${STATUS_MAP[shipmentDetails.status]}`}>{STATUS_MAP[shipmentDetails.status]}</span></p>
                  <div className="shipment-section-nft-details-row-link" onClick={()=>{navigate(`/${shipmentDetails.nft}/${shipmentDetails.tokenId}`)}}>
                   View NFT Details on DeMa <FaExternalLinkAlt color="white"/>
                  </div>
                </div>
                <div>
                  <div className="shipment-section-nft-details-row">
                    <p className="shipment-section-nft-details-heading">SELLER</p>
                    <p className="shipment-section-nft-details-value" style={{cursor:"pointer"}} onClick={()=>{navigate(`/${shipmentDetails.seller}`)}}>
                      {shortAddress(shipmentDetails.seller)} <FaExternalLinkAlt color="white"/></p>
                  </div>
                  <div className="shipment-section-nft-details-row">
                    <p className="shipment-section-nft-details-heading">BUYER</p>
                    <p className="shipment-section-nft-details-value" style={{cursor:"pointer"}} onClick={()=>{navigate(`/${shipmentDetails.buyer}`)}}>
                      {shortAddress(shipmentDetails.buyer)} <FaExternalLinkAlt color="white"/></p>
                  </div>
                  <div className="shipment-section-nft-details-row">
                    <p className="shipment-section-nft-details-heading">PRICE</p>
                    <p className="shipment-section-nft-details-value2">{web3.utils.fromWei(`${shipmentDetails.price}`, "ether")} 
                        <span style={{color:"white", fontWeight:"bold"}}>ETH</span></p>
                  </div>
                  <div className="shipment-section-nft-details-row">
                    <p className="shipment-section-nft-details-heading">CONTRACT ADDRESS</p>
                    <a
                        href={`https://sepolia.etherscan.io/address/${shipmentDetails.nft}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shipment-section-nft-details-value"
                    >
                    <p className="shipment-section-nft-details-value" style={{cursor:"pointer"}}> 
                      {shortAddress(shipmentDetails.nft)} <FaLink color="white"/></p>
                      </a>
                  </div>
                  <div className="shipment-section-nft-details-row">
                    <p className="shipment-section-nft-details-heading">TOKEN ID</p>
                    <p className="shipment-section-nft-details-value2">{Number(shipmentDetails.tokenId)}</p>
                  </div>
                  <div className="shipment-section-nft-details-row" >
                    <p className="shipment-section-nft-details-heading">SHIPPING ADDRESS</p>
                    <p className="shipment-section-nft-details-value2" style={{textAlign:"justify"}}>{shipmentDetails.shippingAddress}</p>
                  </div>
              </div>
              <div>
                {showRejectButton && (
                  <div className="shipment-section-nft-details-reject-div">
                  <button className="shipment-section-nft-details-reject" onClick={()=>setShowRejectModal(true)}>Reject Shipment</button>
                  <div>
                    <p style={{margin:"0", letterSpacing:"2px"}}>REJECTION WINDOW</p>
                    <p style={{margin:"0"}}> <strong>{timeLeft}</strong></p>
                  </div>
                  </div>
                )}
                {isSeller && (shipmentDetails.status == 0 || shipmentDetails.status == 1) && timeRemaining !== "Expired" &&
                  <div className="shipment-section-nft-details-seller-buttons">
                    <button className="shipment-section-nft-details-reject" onClick={()=>setShowThirdModal(true)}>Manage Delegates</button>
                    <button className="shipment-section-nft-details-reject" onClick={()=>setShowTrackCancelModal(true)}>Cancel Shipment</button>
                  </div>
                }
                <ShipmentMessage isBuyer={isBuyer} shipmentDetails={shipmentDetails} timeRemaining={timeRemaining} timeLeft={timeLeft}
                  loading={loading} handleAutoCancel={handleAutoCancel} handleComplete={handleComplete} isSeller={isSeller}/>
              </div>
            </div>
        )}
        {showRejectModal && <RejectModal onClose={handleCancel} shipmentId={shipping_id}  setRefetch={setRefetch}/>}
        {showThirdModal && <ThirdModal onClose={handleCancel3} shipping_id={shipping_id}  setRefetch={setRefetch} thirdParty={thirdParty}/>}
        {showTrackCancelModal && <TrackCancelModal onClose={handleCancel2} shipmentId={shipping_id}  setRefetch={setRefetch}/>}
        {showToast && <ErrorToast message={error} onClose={() => setShowToast(false)} />}
        </>
    );
};

export default ShipmentSection1;