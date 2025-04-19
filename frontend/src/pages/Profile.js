import React, {useState, useEffect} from "react";
import AboutNavbar from "../components/AboutNavbar";
import { useParams } from "react-router-dom";
import ProfileBody from "../components/ProfileBody";
import "../styles/Profile.css"
import { isAddress } from "web3-validator"; 
import NotFound from "./NotFound";
import ListItemModal from "../components/ListItemModal";
import CancelNFTModal from "../components/CancelNftModal";
import BuyNFTModal from "../components/BuyNFTModal";
import ProfileFilter from "../components/ProfileFilter";
import UserActivityFilter from "../components/UserActivityFilter";

const Profile=()=>{
    const {account} = useParams();
    const [avatarUrl, setAvatarUrl] = useState("");
    const [subItem, setSubItem] = useState("Items");
    const [showItemModal, setShowItemModal] = useState(false);
    const [listItemInfo, setListItemInfo] = useState("");
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelItemInfo, setcancelItemInfo] = useState({});
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [buyItemInfo, setBuyItemInfo] = useState({});
    const [filters, setFilters] = useState({
      search: "",
      assetType: "",
      listingStatus: "",
      maxPrice: 2,
    });
    const [activityFilters, setActivityFilters] = useState(["All"]);
    const [shipmentStatus, setShipmentStatus] = useState(false);

    useEffect(() => {
        if (window.ethereum) {
          const handleAccountsChanged = (accounts) => {
            if (accounts.length > 0) {
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
      

    const handleClose=()=>{
        setShowItemModal(false);
    }

    const handleCancel=()=>{
        setShowCancelModal(false);
    }

    const handleBuyCancel=()=>{
        setShowBuyModal(false);
    }

    const handleShipment=()=>{
      setShipmentStatus(true);
      setSubItem("Activity");
    }

    useEffect(()=>{
        const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${account}`;
        setAvatarUrl(url);
    },[account]);

    if (!isAddress(account)) {
        return <NotFound />;
      }

    return(
        <div className="profile-background">
            <div>
                <AboutNavbar lg="linear-gradient(to right, #000000,rgb(21, 19, 19),rgb(19, 18, 18))"/>
            </div>
            <div className="profile-left-right">
              <div className="profile-left">
                <div className="profile-heading">
                    <img className="profile-avatar" src={avatarUrl} alt="Avatar" />
                    <p>{account.slice(0, 8)}...{account.slice(-6)}</p>
                </div>
                <div className="profile-subHeadings">
                    <div className={`profile-subHeadings-items ${subItem === "Items" ? "active" : ""}`} onClick={()=>{setSubItem("Items");setShipmentStatus(false)}}>Items</div>
                    <div className={`profile-subHeadings-items ${subItem === "Listings" ? "active" : ""}`} onClick={()=>{setSubItem("Listings");setShipmentStatus(false)}}>Listings</div>
                    <div className={`profile-subHeadings-items ${subItem === "Activity" ? "active" : ""}`} onClick={()=>{setSubItem("Activity");setShipmentStatus(false)}}>Activity</div>
                </div>
                <div className="profile-subHeadings-bottom">
                { account === localStorage.getItem("dema_wallet")?
                  <button className={`shipment-status-button ${shipmentStatus?"activeStatus":""}`} onClick={handleShipment}>SHIPMENT STATUS</button>:<></>}
                {subItem!=="Activity"?<ProfileFilter onFilterChange={setFilters}/>:
                <UserActivityFilter filters={activityFilters} setFilters={setActivityFilters} setShipmentStatus={setShipmentStatus} shipmentStatus={shipmentStatus}/>}
              </div>
              </div>
              <div className="profile-right">
                <div className="profile-subitems-body">
                    <ProfileBody subItem={subItem} setSubItem={setSubItem} account={account} 
                    setShowItemModal={setShowItemModal} setListItemInfo={setListItemInfo} 
                    setShowCancelModal={setShowCancelModal} setcancelItemInfo={setcancelItemInfo}
                    setShowBuyModal={setShowBuyModal} setBuyItemInfo={setBuyItemInfo} filters={filters} activityFilters={activityFilters} shipmentStatus={shipmentStatus}/>
                </div>
              </div>
            </div>
            {showItemModal && <ListItemModal onClose={handleClose} token={listItemInfo} setSubItem={setSubItem}/>}
            {showCancelModal && <CancelNFTModal onClose={handleCancel} token={cancelItemInfo} />}
            {showBuyModal && <BuyNFTModal onClose={handleBuyCancel} token={buyItemInfo} />}
        </div>
    );
};

export default Profile;