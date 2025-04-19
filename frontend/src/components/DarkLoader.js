import React from "react";
import { motion } from "framer-motion";
import { FaClock } from "react-icons/fa";
import "../styles/DarkLoader.css"

const DarkLoader = () => {
  return (
    <div className="dark-loader-container">
      {/* Rotating clock icon */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="clock-icon"
      >
        <FaClock />
      </motion.div>

      {/* Animated bouncing dots as "please wait" */}
      <div className="dots-container">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="dot"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: dot * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DarkLoader;
