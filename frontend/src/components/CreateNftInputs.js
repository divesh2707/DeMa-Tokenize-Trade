import React, {useState} from "react";
import { BiSolidCoinStack } from "react-icons/bi";
import { MdOutlineDescription } from "react-icons/md";
import { IoIosOptions } from "react-icons/io";
import { TiPlus } from "react-icons/ti";
import { BsTrash3Fill } from "react-icons/bs";

const CreateNftInputs=({uploadCategory, uploadCustomAttributes, uploadName, uploadDescription})=>{
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Digital");
    const [customAttributes, setCustomAttributes] = useState([]);

    const handleAttributeChange = (index, field, value) => {
        const updated = [...customAttributes];
        updated[index][field] = value;
        setCustomAttributes(updated);
        uploadCustomAttributes(updated);
      };
    
      const addAttributeField = () => {
        setCustomAttributes([...customAttributes, { trait_type: "", value: "" }]);
      };
    
      const removeAttributeField = (index) => {
        const updated = [...customAttributes];
        updated.splice(index, 1);
        setCustomAttributes(updated);
        uploadCustomAttributes(updated)
      };

    return(
        <div className="create-nft-inputs">
            <div className="create-nft-input">
                <label><BiSolidCoinStack /> Name*</label>
                <input type="text" placeholder="Name your NFT" value={name} onChange={(e) => {setName(e.target.value); uploadName(e.target.value)}} />
            </div>
            <div className="create-nft-input">
                <label><MdOutlineDescription />Description*</label>
                <textarea placeholder="Enter a description" value={description} onChange={(e) => {setDescription(e.target.value); uploadDescription(e.target.value)}} />
            </div>
            <div className="create-nft-category-radio-group">
                <p><IoIosOptions />Asset Type:</p>
                <label>
                    <input type="radio" name="category" value="Digital" checked={category === "Digital"} onChange={(e) => {setCategory(e.target.value); uploadCategory(e.target.value)}}/>
                        Digital
                </label>

                <label>
                    <input type="radio" name="category" value="Physical" checked={category === "Physical"} onChange={(e) => {setCategory(e.target.value);  uploadCategory(e.target.value)}}/>
                        Physical
                </label>
            </div>
            <div className="create-nft-traits">
                <p style={{fontWeight:"bold", margin:"0px"}}>Traits</p>
                <p style={{fontSize:"16px", margin:"0px", width:"590px" }}>Traits in NFTs represent unique characteristics or attributes that define an NFT’s appearance or properties.</p>
                {customAttributes.map((attr, index) => (
                    <div key={index} className="create-nft-trait">
                        <input type="text" placeholder="Type" value={attr.trait_type} onChange={(e) => handleAttributeChange(index, "trait_type", e.target.value)}/>
                        <input type="text" placeholder="Value" value={attr.value} onChange={(e) => handleAttributeChange(index, "value", e.target.value)}/>
                        <div onClick={() => removeAttributeField(index)} style={{cursor:"pointer"}}><BsTrash3Fill size={25}/></div>
                    </div>
                    ))}
                <div onClick={addAttributeField} className="create-nft-add-trait" style={{cursor:"pointer"}}><TiPlus size={25}/> Add Trait</div>
            </div>
        </div>
    );
};

export default CreateNftInputs;