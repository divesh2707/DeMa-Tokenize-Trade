import React, {useState, useEffect} from "react";
import { getShipmentActivity } from "../utils/ShippingEvents";
import { useNavigate } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";
import TrackingEventsPlaceholder from "./TrackingEventsPlaceholder";
import "../styles/ShipmentEvents.css";

const ShipmentEvents=(shipping_id)=>{
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const shortAddress = (addr) =>
        addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

    useEffect(()=>{
        const fetchShippingActivity=async()=>{
            try{    
                setLoading(true);
                const res = await getShipmentActivity(shipping_id.shipping_id);
                setActivities(res);
                setLoading(false);
            }catch(err){
                console.log(err);
                setLoading(false);
            }
        }
        fetchShippingActivity()
    },[])

    return(
        <div className="shipment-events-activity-log">
      {loading ? (
        <div style={{marginTop:"20px"}}>
          <TrackingEventsPlaceholder />
        </div>
      ) : (
        <>
          {/* Table Headers */}
          <div className="shipment-events-activity-header">
            <span>EVENT</span>
            <span>FROM</span>
            <span>TO</span>
            <div style={{display:"flex", justifyContent:"flex-end"}}>TIME</div>
          </div>
        {
          activities.map((act, index) => (
            <div key={index} className="shipment-events-activity-row">
              <div className="shipment-events-activity-col-1"><p style={{margin:"0"}}>{act.icon}</p><p style={{margin:"0"}}>{act.type}</p></div>
              <div className="shipment-events-activity-col-3" onClick={()=>navigate(`/${act.from}`)}>{act.from? shortAddress(act.from) : "---"}</div>
              <div className="shipment-events-activity-col-4" onClick={()=>navigate(`/${act.to}`)}>{act.to? shortAddress(act.to) : "---"}</div>
              <a
                  href={`https://sepolia.etherscan.io/tx/${act.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
              <div className="shipment-events-activity-col-5">
                {new Date(Number(act.timestamp) * 1000).toLocaleString()}
                  <FaExternalLinkAlt size={12} style={{ marginLeft: "6px" }} />
              </div>
              </a>
            </div>
          ))}
        </>
      )}
    </div>
    );
};

export default ShipmentEvents;