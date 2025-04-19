import React, {useState, useRef, useEffect} from "react";
import MintNavbar from "../components/MintNavbar"
import web3 from "../utils/web3";
import { NftMintContract } from "../utils/contract";
import axios from "axios";
import CreateNftFile from "../components/CreateNftFile";
import CreateNftInputs from "../components/CreateNftInputs";
import "../styles/CreateNft.css"
import { useNavigate } from "react-router-dom";
import ErrorToast from "../components/ErrorToast";

const CreateNft = () =>{
    const [file, setFile] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Digital");
    const [customAttributes, setCustomAttributes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const errorRef = useRef();
    const navigate = useNavigate();

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

    const uploadFile=(input)=>{
        setFile(input);
    }

    const uploadName=(input)=>{
        setName(input);
    }

    const uploadDescription=(input)=>{
        setDescription(input);
    }

    const uploadCategory=(input)=>{
        setCategory(input);
    }
    const uploadCustomAttributes=(input)=>{
        setCustomAttributes(input);
    }

    const mintNFT = async () => {
        if (!file || !name || !description) {
          setError("Please fill in all required fields.");
          setShowToast(true);
          setTimeout(() => {
            errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
          return;
        }
        setLoading(true);
        setError("");
        setShowToast(false);
    
        try {
          // 1️⃣ Upload Main File
          const formData = new FormData();
          formData.append("file", file);
    
          const fileResponse = await axios.post("http://localhost:5000/api/pinata/upload-file", formData);
          if (!fileResponse.data.success) throw new Error("File upload failed!");
          const fileURL = fileResponse.data.fileURL;     
          const isImage = file.type.startsWith("image/");
    
          // 3️⃣ Prepare Metadata
          const defaultAttributes = [
            { trait_type: "Category", value: category },
          ];
    
          // Filter out empty attributes
          const validCustomAttrs = customAttributes.filter(attr => attr.trait_type && attr.value);
    
          const metadata = {
            name,
            description,
            attributes: [...defaultAttributes, ...validCustomAttrs],
          };
    
          if (isImage) {
            metadata.image = fileURL;
          } else {
            metadata.animation_url = fileURL;
          }
    
          // 4️⃣ Upload Metadata
          const metadataResponse = await axios.post("http://localhost:5000/api/pinata/upload-metadata", metadata);
          if (!metadataResponse.data.success) throw new Error("Metadata upload failed!");
          const tokenURI = metadataResponse.data.metadataURI;
    
          // 5️⃣ Mint NFT
          const accounts = await web3.eth.getAccounts();
          const sender = accounts[0];
          await NftMintContract.methods.mintNFT(tokenURI).send({ from: sender });
          navigate(`/${sender}`)
        } catch (error) {
          console.error(error);
          setError("Minting failed.");
          setShowToast(true);
          setTimeout(() => {
            errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        } 
        setLoading(false);
      };

    return(
      <div className="create-nft-layout">
        <MintNavbar />
      <div className="create-nft-background"> 
        <div className="create-nft-body">
            <div className="create-nft-body-1">
                <h1>Create an NFT</h1>
                <p>Once your item is minted you will not be able to change any of its information.</p>
                <CreateNftFile uploadFile={uploadFile}/>
            </div>
            <div className="create-nft-body-2">
                <CreateNftInputs uploadCategory={uploadCategory} uploadCustomAttributes={uploadCustomAttributes} 
                    uploadDescription={uploadDescription} uploadName={uploadName}/>
                    <button onClick={mintNFT} disabled={loading} className="create-nft-button">
                        {loading ? "Minting..." : "Mint NFT"}
                    </button>
            </div>
        </div>
        {showToast && <ErrorToast message={error} onClose={() => setShowToast(false)} />}
      </div>
    </div>
    );
};

export default CreateNft;