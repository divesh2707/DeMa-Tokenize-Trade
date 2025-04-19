import React, { useState } from "react";
import { MdFileUpload } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

const CreateNftFile = ({uploadFile}) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [other, setOther] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      uploadFile(selectedFile);
      if (selectedFile.type.startsWith("image/") || selectedFile.type.startsWith("video/")) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setOther(true);
        setPreviewUrl(""); // No preview for other file types
      }
    }
  };

  const removeFile = (e) => {
    e.stopPropagation(); // prevent triggering file input
    setFile(null);
    setPreviewUrl("");
    setOther(false);
    document.getElementById("hiddenFileInput").value = null;
  };

  return (
    <div className={`create-nft-file-upload-box ${previewUrl ? "create-nft-file-preview-mode" : other? "create-nft-file-preview-mode-2" : "" }`}
      onClick={!file ? () => document.getElementById("hiddenFileInput").click() : undefined} >
      <input id="hiddenFileInput" type="file" onChange={handleFileChange} accept="*" className="create-nft-file-hidden-input" />

    {file ? (
        <div className="create-nft-file-preview">
          <button className="create-nft-file-remove-file-button" onClick={removeFile}>
            <FaTrash size={22} />
          </button>
          {file.type.startsWith("image/") ? (
            <img src={previewUrl} alt="preview" className="create-nft-file-preview-media" />
          ) : file.type.startsWith("video/") ? (
            <video src={previewUrl} controls className="create-nft-file-preview-media" />
          ) : (
            <p className="create-nft-file-preview-text">{file.name}</p>
          )}
        </div>
      ) : (
        <div className="create-nft-file-upload-text">
          <MdFileUpload size={50} color="white" />
          <p className="create-nft-file-title">Click to upload media*</p>
          <p className="create-nft-file-subtitle">Browse files</p>
        </div>
      )}
    </div>
  );
};

export default CreateNftFile;
