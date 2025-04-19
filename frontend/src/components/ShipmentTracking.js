import React, {useState} from "react";
import "../styles/ShipmentTracking.css";
import nothing from "../images/not-track-removebg-preview.png"
import UpdateModal from "./UpdateModal";
import { FaExternalLinkAlt } from "react-icons/fa";
import DeliveredModal from "./DeliveredModal";

const ShipmentTracking = ({ shipmentDetails, isBuyer, shipping_id, setRefetch, timeRemaining }) => {
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeliveredModal, setShowDeliveredModal] = useState(false);
    const [length , setLength] = useState(shipmentDetails.locations.length);

    const handleCancel=()=>{
        setShowUpdateModal(false);
    }

    const handleCancel2=()=>{
      setShowDeliveredModal(false);
  }

  return (
    <div className="shipment-tracking-layout">
      {length === 0 ? (
        <div className={`shipment-tracking-placeholder ${isBuyer && "pad"}`}>
            <div className="shipment-tracking-nothing">
                <h2 className="shipment-tracking-title">SHIPMENT INITATED</h2>
                <p className="shipment-tracking-message">
                    {isBuyer?"The shipment has been successfully initiated, but tracking updates have not been received yet." :
                    "Your shipment has been successfully created and is awaiting the first location update from the delivery party."}
                </p>
                <p className="shipment-tracking-message">
                    {isBuyer?"Please check back later once the delivery party begins updating the location status." :
                    "Please ensure the responsible party has access to the tracking system and updates the location as the shipment progresses."}
                </p>
            </div>
            <div>
                <img src={nothing} alt="No Tracking Updates Yet!" />
            </div>
        </div>
      ) : (
        <div className="shipment-tracking-activity-log">
          <div className="shipment-tracking-activity-header">
            <span>LATITUDE , LONGITUDE</span>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>TIMESTAMP</div>
          </div>

          {shipmentDetails.locations.map((act, index) => (
            <div key={index} className="shipment-tracking-activity-row">
              <a href={`https://www.google.com/maps?q=${act.latitude},${act.longitude}`} target="_blank" rel="noopener noreferrer" >
                <div className="shipment-tracking-activity-col-1">{act.latitude} , {act.longitude} 
                <FaExternalLinkAlt size={18} style={{ marginLeft: "6px" }} /></div>
              </a>
              {shipmentDetails.timestamps[index] && (
                <div className="shipment-tracking-activity-col-5">
                  {shipmentDetails.timestamps[index]}   
                </div>
              )}
            </div>
          ))}
    </div>
      )}
      {!isBuyer && timeRemaining !== "Expired" && <div className="shipment-tracking-buttons">
        {length<5 && (shipmentDetails.status== 0 || shipmentDetails.status== 1 )&& <button  className="shipment-tracking-update" onClick={()=>{setShowUpdateModal(true);}}>Log Shipment Progress</button>}
        {length>=1 && (shipmentDetails.status== 1) && <button  className="shipment-tracking-update" onClick={()=>{setShowDeliveredModal(true);}}>Finalize Shipment</button>}
      </div>}
      {showUpdateModal && <UpdateModal onClose={handleCancel} shipmentId={shipping_id} length={length}  setRefetch={setRefetch}/>}
      {showDeliveredModal && <DeliveredModal onClose={handleCancel2} shipmentId={shipping_id}  setRefetch={setRefetch}/>}
    </div>
  );
};

export default ShipmentTracking;
