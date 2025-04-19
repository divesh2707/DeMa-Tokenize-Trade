import web3 from "./web3";
import { TrackingContract } from "./contract";
import {
  FaBoxOpen,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaUserShield,
  FaClock,
  FaFlagCheckered
} from "react-icons/fa";
import { BsFillShieldSlashFill } from "react-icons/bs";

export const getShipmentActivity = async (shipmentId, startBlock = 0) => {
  const fromBlock = startBlock;
  const toBlock = "latest";
  const events = [];

  const iconMap = {
    Created: <FaBoxOpen />,
    Updated: <FaEdit />,
    Delivered: <FaCheckCircle />,
    Rejected: <FaTimesCircle />,
    Cancelled: <FaBan />,
    Authorized: <FaUserShield />,
    Revoked: <BsFillShieldSlashFill />,
    "Expired": <FaClock />,
    Finalized: <FaFlagCheckered />,
  };

  const [
    created,
    updated,
    delivered,
    rejected,
    cancelled,
    authorized,
    revoked,
    autoCancelled,
    finalized,
  ] = await Promise.all([
    TrackingContract.getPastEvents("ShipmentCreated", { fromBlock, toBlock, filter: { shipmentId } }),
    TrackingContract.getPastEvents("ShipmentUpdated", { fromBlock, toBlock, filter: { shipmentId } }),
    TrackingContract.getPastEvents("ShipmentDelivered", { fromBlock, toBlock, filter: { shipmentId } }),
    TrackingContract.getPastEvents("ShipmentRejected", { fromBlock, toBlock, filter: { shipmentId } }),
    TrackingContract.getPastEvents("ShipmentCancelled", { fromBlock, toBlock, filter: { shipmentId } }),
    TrackingContract.getPastEvents("ThirdPartyAuthorized", { fromBlock, toBlock, filter: { shipmentId } }),
    TrackingContract.getPastEvents("ThirdPartyRevoked", { fromBlock, toBlock, filter: { shipmentId } }),
    TrackingContract.getPastEvents("ShipmentAutoCancelled", { fromBlock, toBlock, filter: { shipmentId } }),
    TrackingContract.getPastEvents("finalizeShipment", { fromBlock, toBlock, filter: { shipmentId } }),
  ]);

  const missingTimestampEvents = [];

  const pushEvent = (type, e, additional = {}) => {
    const hasTimestamp = !!e.returnValues.timestamp;
    const eventObj = {
      type,
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      icon: iconMap[type],
      ...additional,
    };
    if (hasTimestamp) {
      eventObj.timestamp = e.returnValues.timestamp;
    } else {
      missingTimestampEvents.push(eventObj);
    }
    events.push(eventObj);
  };

  created.forEach(e => pushEvent("Created", e));
  updated.forEach(e => pushEvent("Updated", e, { from: e.returnValues.updater }));
  delivered.forEach(e => pushEvent("Delivered", e, { from: e.returnValues.updater }));
  rejected.forEach(e => pushEvent("Rejected", e, { from: e.returnValues.buyer }));
  cancelled.forEach(e => pushEvent("Cancelled", e, { from: e.returnValues.seller }));
  authorized.forEach(e => pushEvent("Authorized", e, { from: e.returnValues.seller, to: e.returnValues.thirdParty }));
  revoked.forEach(e => pushEvent("Revoked", e, { from: e.returnValues.seller, to: e.returnValues.thirdParty }));
  autoCancelled.forEach(e => pushEvent("Expired", e, { from: e.returnValues.sender }));
  finalized.forEach(e => pushEvent("Finalized", e, { from: e.returnValues.from }));

  const uniqueMissingBlocks = [...new Set(missingTimestampEvents.map(e => e.blockNumber))];
  const blockData = await Promise.all(uniqueMissingBlocks.map(bn => web3.eth.getBlock(bn)));
  const blockTimestamps = blockData.reduce((acc, b) => {
    acc[b.number] = b.timestamp;
    return acc;
  }, {});

  for (const e of missingTimestampEvents) {
    e.timestamp = blockTimestamps[e.blockNumber];
  }

  return events.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
};
