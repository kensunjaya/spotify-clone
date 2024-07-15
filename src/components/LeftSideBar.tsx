import React from "react";
import { FaHome, FaSearch, FaBook } from "react-icons/fa";

const LeftSideBar = () => {
  return (
    <div className="fixed left-0 w-[35vh] h-full  text-white m-2">
      <div className="bg-primary h-fit p-5 rounded-lg mb-2">
        <div className="flex items-center mb-5">
          <FaHome size={25} color='#A7A7A7'/>
          <p className="ml-5 text-md text-grays font-semibold">Home</p>
        </div>
        <div className="flex items-center">
          <FaSearch size={25} color='#A7A7A7'/>
          <p className="ml-5 text-md text-grays font-semibold">Search</p>
        </div>
      </div>
      <div className="bg-primary h-full p-5 rounded-lg">
        <div className="flex items-center mb-5">
          <FaBook size={25} color='#A7A7A7'/>
          <p className="ml-5 text-md text-grays font-semibold">Your Library</p>
        </div>
      </div>
    </div>
  );
}

export default LeftSideBar;