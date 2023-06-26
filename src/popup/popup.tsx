import React from "react";
import './popup.css'

const Popup = () => {
    return (
        <div className="flex justify-center bg-gray-200 items-center h-screen">
            <div className="text-center">
                <div className="p-4 mb-4">
                    <h1 className="text-4xl text-blue-500">Welcome to</h1>
                </div>
                <div className="p-4">
                    <img className="block" src="logo.png" width={200} />
                </div>
            </div>
      </div>
    )
};

export default Popup;