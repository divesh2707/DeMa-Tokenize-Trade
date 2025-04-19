import React from "react";
import { QRCodeSVG } from "qrcode.react";
import "../styles/ShipmentLeft.css"

const ShipmentLeft=({deadline, timeRemaining, shipping_id, shipmentDetails})=>{
    return(
        <div className="shipment-left">
          {(shipmentDetails.status == 0 || shipmentDetails.status == 1 ) && 
            <>
            <p  className="shipment-section-deadline-title">DEADLINE</p>
            <p className="shipment-section-deadline">{deadline && new Date(deadline).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}</p>
            <p className="shipment-section-deadline-time">{timeRemaining}</p>
        </>}
        <div className="shipment-qr-container">
          <QRCodeSVG
            value={`${window.location.origin}/shipment/${shipping_id}`}
            size={210}
            fgColor="#210F37"
          />
          <p className="shipment-qr-label">Scan to verify authenticity and update shipment.</p>
        </div>
      </div>
    );
};

export default ShipmentLeft;