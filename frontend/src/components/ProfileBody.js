import React from "react";
import ProfileItems from "./ProfileItems";
import ProfileListings from "./ProfileListings";import UserActivityDisplay from "./UserActivityDisplay";
import ProfileShipmentEvents from "./ProfileShipmentEvents";

const ProfileBody = ({ subItem, setSubItem, account, setShowItemModal, setListItemInfo
  ,setShowCancelModal, setcancelItemInfo, setShowBuyModal, setBuyItemInfo, filters, activityFilters, shipmentStatus }) => {
  
  return (
    <>
      {subItem === "Items" && (     
          <ProfileItems account={account} setShowItemModal={setShowItemModal} setListItemInfo={setListItemInfo} 
            setShowCancelModal={setShowCancelModal} setcancelItemInfo={setcancelItemInfo}
            setShowBuyModal={setShowBuyModal} setBuyItemInfo={setBuyItemInfo} setSubItem={setSubItem} filters={filters}/>
      )}

      {subItem === "Listings" && (
          <ProfileListings account={account} setShowCancelModal={setShowCancelModal} setcancelItemInfo={setcancelItemInfo}
          setShowBuyModal={setShowBuyModal} setBuyItemInfo={setBuyItemInfo} setSubItem={setSubItem} filters={filters}/>
      )}

      {subItem === "Activity" && (
        shipmentStatus?<ProfileShipmentEvents setSubItem={setSubItem} /> :
        <UserActivityDisplay account={account} setSubItem={setSubItem} activityFilters={activityFilters}/>
      )}
    </>
  );
};

export default ProfileBody;
