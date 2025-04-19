import React, { useState, useEffect } from "react";
import { TrackingContract } from "../utils/contract";
import "../styles/Shipment.css";
import { useParams } from "react-router-dom";
import ShipmentNavbar from "../components/ShipmentNavbar";
import ShipmentSection1 from "../components/ShipmentSection1";
import ShipmentLeft from "../components/ShipmentLeft";
import ShipmentEvents from "../components/ShipmentEvents";
import axios from "axios";
import ShipmentTracking from "../components/ShipmentTracking";
import DarkLoader from "../components/DarkLoader";
import NotAuthorized from "./NotAuthorized";

const Shipment = () => {
  
  const { shipping_id } = useParams();
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [deadline, setDeadline] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("0d 0h 0m 0s");
  const [options, setOptions] = useState("Trade Info")
  const [refetch, setRefetch] = useState(false);
  const [thirdParty, setThirdParty] = useState([]);
  const [isThirdParty, setIsThirdParty] = useState(false);

  const shortAddress = (addr) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          localStorage.setItem("dema_wallet",accounts[0]);
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

  useEffect(() => {
    const fetchShipmentDetails = async () => {
      setLoading(true);
      const account = localStorage.getItem("dema_wallet");

      try {
        const res = await TrackingContract.methods.shipments(shipping_id).call();
        const { locations, timestamps, authorizedThirdParties } = await TrackingContract.methods
          .getShipmentDetails(shipping_id)
          .call({ from: account });

        const decodedLocations = locations.map(bytes32 => {
          // Remove the '0x' and get the first 32 characters (lat) and next 32 (long)
          const hex = bytes32.slice(2);
        
          const latHex = hex.slice(0, 16);       // First 8 bytes (16 hex chars)
          const longHex = hex.slice(16, 32);     // Next 8 bytes (16 hex chars)
        
          // Convert hex to signed integers
          const latInt = parseInt(latHex, 16);
          const longInt = parseInt(longHex, 16);
        
          // Convert back to float by dividing by 1e6
          const latitude = latInt / 1e6;
          const longitude = longInt / 1e6;
          return { latitude, longitude };
      })
        const formattedTimestamps = timestamps.map(ts => new Date(Number(ts) * 1000).toLocaleString());

        const createdAt = Number(res.createdAt);
        const defaultDeadlineDays = Number(await TrackingContract.methods.defaultDeadlineSeconds().call());
        const deadlineSeconds = createdAt + defaultDeadlineDays;
        setDeadline(deadlineSeconds); // Keep in seconds


        const shippingAddressRes = await axios.get(`http://localhost:5000/api/address/by-shipment/${shipping_id}`);
        const shippingAddress = shippingAddressRes.data.shipping_address;

        setShipmentDetails({
          ...res,
          locations: decodedLocations,
          timestamps: formattedTimestamps,
          authorizedThirdParties,
          shippingAddress
        });
        const normalizedThirdParties = authorizedThirdParties.map(addr => addr.toLowerCase());
        setThirdParty(normalizedThirdParties);
        const wallet = account?.toLowerCase();
        setIsSeller(res?.seller?.toLowerCase() === wallet);
        setIsBuyer(res?.buyer?.toLowerCase() === wallet);
        setIsThirdParty(normalizedThirdParties.includes(wallet));
      } catch (error) {
        console.error("Error fetching Shipment Details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentDetails();
  }, [shipping_id, refetch ]);

  useEffect(() => {
    if (!deadline) return;
  
    const interval = setInterval(() => {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const diff = deadline - nowInSeconds;
  
      if (diff <= 0) {
        setTimeRemaining("Expired");
        clearInterval(interval);
      } else {
        const d = Math.floor(diff / (60 * 60 * 24));
        const h = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
        const m = Math.floor((diff % (60 * 60)) / 60);
        const s = diff % 60;
        setTimeRemaining(`${d}d ${h}h ${m}m ${s}s`);
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [deadline]);
  

  if (loading) return <DarkLoader />;
  if (!isBuyer && !isSeller && !isThirdParty) return <NotAuthorized />;

  return (
    <div className="shipment-layout">
      <ShipmentNavbar options={options} setOptions={setOptions}/>
      <div className="shipment-container">
        <div style={{flex:"1.75"}}>
          <ShipmentLeft deadline={deadline} timeRemaining={timeRemaining} shipping_id={shipping_id} shipmentDetails={shipmentDetails}/>
        </div>
        <div style={{flex:"2"}} >
          { options === "Trade Info" && <ShipmentSection1 isSeller={isSeller} shipmentDetails={shipmentDetails} shipping_id={shipping_id} shortAddress={shortAddress} 
          isBuyer={isBuyer} setRefetch={setRefetch} timeRemaining={timeRemaining} thirdParty={thirdParty}/>}
          { options === "Events" && <ShipmentEvents shipping_id={shipping_id} />}
          { options === "Transit Path" && <ShipmentTracking shipmentDetails={shipmentDetails} isBuyer={isBuyer} shipping_id={shipping_id} setRefetch={setRefetch} timeRemaining={timeRemaining}/>}
        </div>
      </div>
    </div>
  );
};

export default Shipment;
