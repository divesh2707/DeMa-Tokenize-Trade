// components/ErrorToast.js
import React, { useEffect } from "react";
import "../styles/ErrorToast.css";
import { MdErrorOutline } from "react-icons/md";

const ErrorToast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // auto close after 3s
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="error-toast">
      <MdErrorOutline size={22} />
      <span>{message}</span>
    </div>
  );
};

export default ErrorToast;
