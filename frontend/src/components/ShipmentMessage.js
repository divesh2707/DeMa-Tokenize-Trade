import React from "react";
import { IoIosInformationCircle } from "react-icons/io";
import { BsShieldSlashFill } from "react-icons/bs";

const ShipmentMessage=({isBuyer, shipmentDetails, timeRemaining, timeLeft, handleAutoCancel, handleComplete, loading, isSeller})=>{
    return(
        <>
        
                        {
                          timeRemaining === "Expired" && isBuyer && (shipmentDetails.status == 0 || shipmentDetails.status == 1) &&
                          <div className="shipment-section-nft-details-autocancel">
                            <button className="shipment-section-nft-details-reject" onClick={()=>handleAutoCancel()}>
                                {!loading?"Cancel Shipment":"Cancelling..."}</button>
                            <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p>Delivery deadline passed. You can cancel and get a full refund.</p></div>
                          </div>
                        }
                        {
                          timeRemaining === "Expired" && !isBuyer && (shipmentDetails.status == 0 || shipmentDetails.status == 1) &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                            Delivery window expired. Once buyer cancel — 2.5% penalty applies.
                            </p>
                            </div>
                        }
                        
                        {
                           !isBuyer && (shipmentDetails.status == 4) &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                              Shipment has been Cancelled.
                               You incured a penalty of 2.5% of the total item price.
                            </p>
                            </div>
                        }
                        {
                           isBuyer && (shipmentDetails.status == 1)  && timeRemaining!== "Expired" &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                            Your product is on the way. You’ll be able to take action once it’s delivered.
                            </p>
                            </div>
                        }
                        {
                           isBuyer && (shipmentDetails.status == 0) && timeRemaining!== "Expired" &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                            Shipment Initiated. Waiting for seller to dispatch the product.
                            </p>
                            </div>
                        }
                        {
                          isBuyer && (shipmentDetails.status == 4) &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                            Shipment has been Cancelled. You have received a full refund for your purchase.
                            </p>
                            </div>
                        }
                        {
                           isBuyer && (shipmentDetails.status == 3) &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                            Shipment rejected. You’ve been refunded 98.75%, 1.25% fee applied to prevent misuse.
                            </p>
                            </div>
                        }
                        {
                          !isBuyer && (shipmentDetails.status == 3) &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                            Buyer rejected the product — 50% fee refunded, NFT returned to seller to uphold integrity.
                            </p>
                            </div>
                        }
                        {
                          isBuyer && (shipmentDetails.status == 2) && timeLeft==="Expired" &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                            Product delivered, rejection window expired — waiting for seller to finalize.
                            </p>
                            </div>
                        }
                        {console.log("rem", timeRemaining)}
                        {console.log("lef", timeLeft)}
                        {
                          isSeller && (shipmentDetails.status == 2) && (timeLeft==="Expired" ) &&
                          <div className="shipment-section-nft-details-autocancel">
                            <button className="shipment-section-nft-details-reject" onClick={()=>handleComplete()}>
                                {!loading?"Close Deal":"Closing..."}</button>
                            <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p>Rejection window expired, Close to receive payment.</p></div>
                          </div>
                        }
                        {
                          !isBuyer && !isSeller && (shipmentDetails.status == 2) && (timeLeft==="Expired" ) &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                            Waiting for Seller to close the deal!
                            </p>
                            </div>
                        }
                        {
                          !isBuyer && !isSeller && (shipmentDetails.status == 0 || shipmentDetails.status == 1) && timeRemaining !== "Expired" &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                            Go to Transit Path to log shipment progress.
                            </p>
                            </div>
                        }
                        {
                          isBuyer && (shipmentDetails.status == 5) &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                            Deal closed successfully — the NFT is now yours and the shipment is complete!
                            </p>
                            </div>
                        }
                        {
                          !isBuyer && (shipmentDetails.status == 5) &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                            Deal Closed, payment received and NFT officially transferred to the buyer.
                            </p>
                            </div>
                        }
                        {
                          !isBuyer && (shipmentDetails.status == 2) &&  (timeLeft !== "Expired") &&
                          <div className="shipment-section-nft-details-info-icon"><IoIosInformationCircle size={80}/>
                            <p style={{color:"#999"}}>
                            Product delivered. Waiting for buyer's action during rejection window.
                            </p>
                            </div>
                        }
        </>
    );
};

export default ShipmentMessage;