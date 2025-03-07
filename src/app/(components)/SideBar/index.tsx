"use client";

import { Menu } from "lucide-react";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSideBarCollapsed } from "@/redux/globalSlice";

const Sidebar = () => {
  const dispatch = useAppDispatch();

  const isSideBarCollapsed = useAppSelector(
    (state) => state.global.isSideBarCollapsed
  );

  const toggleSideBarCollapsed = () => {
    dispatch(setIsSideBarCollapsed(!isSideBarCollapsed));
  };

  const sidebarClassnames = `${!isSideBarCollapsed && "fixed"} flex flex-col ${
    isSideBarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-gray-100 transition-all  fixed duration-300 overflow-hidden h-full shadow-md z-30`;

  return (
    <div className={sidebarClassnames}>
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-2 ${
          isSideBarCollapsed ? " m-auto" : "px-8"
        }`}
      >
        <img
          src="/webLogo.jpg"
          alt="Logo"
          className={`${
            isSideBarCollapsed ? "`w-9 h-9" : "w-12 h-12"
          } rounded-full`}
        />
        <div
          className={`flex items-center ${
            isSideBarCollapsed ? "hidden" : "block"
          }`}
        >
          <h1
            className={`font-extrabold text-2xl mr-2 ${
              isSideBarCollapsed ? "hidden" : "block"
            }`}
          >
            Horizon
          </h1>
          <button
            className="px-3  py-3 bg-gray-100 rounded-full hover:bg-blue-100"
            onClick={toggleSideBarCollapsed}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-grow mt-8">
        {/* <SidebarLinks
          href="/dashboard"
          icon={Layout}
          label="Dashboard"
          isCollapseed={isSidebarCollapsed}
        /> */}
      </div>
      <div className={`${isSideBarCollapsed ? "hidden" : "block"} mb-10 `}>
        <p className="text-center text-xs text-gray-500">&copy; 2025 Start</p>
      </div>
    </div>
  );
};

export default Sidebar;
