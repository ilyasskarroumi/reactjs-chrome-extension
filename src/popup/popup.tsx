import React from "react";
import './popup.css';

const Popup = () => {
  const handleClick = () => {
    window.open("https://play.google.com/store", "_blank");
  };

  return (
    <div
      className="flex justify-center bg-gray-200 items-center h-screen"
      onClick={handleClick}
      style={{cursor: "pointer"}}
    >
      <div className="text-center">
        <div style={{display: "flex", justifyContent: "center"}}>
          <img
            className="block"
            src="https://mobioptions.com/wp-content/uploads/2023/06/logo.png"
            width={200}
            alt="Logo"
          />
        </div>
        <div className="mt-4">
          <p className="text-sm text-blue-600">
            Click anywhere to go to Google Play Store
          </p>
        </div>
      </div>
    </div>
  );
};

export default Popup;