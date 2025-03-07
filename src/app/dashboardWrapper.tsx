"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./(components)/SideBar";
import Navbar from "./(components)/Navbar";
import { Product } from "./types/globalStateTypes";
import StoreProvider, { useAppSelector, useAppDispatch } from "./redux";
import { usePathname } from "next/navigation";
import { setCategories } from "@/redux/categorySlice";
import axios from "axios";
import { useSession } from "next-auth/react";
import useGetUser from "./actions/getUser";
import useGetCartItems from "./hooks/getCartItems";
import useGetWishlistItems from "./hooks/getWislistItems";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  const { getUser } = useGetUser();
  const { GetCart } = useGetCartItems();
  const { getWishlistItems } = useGetWishlistItems();

  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const isSideBarCollapsed = useAppSelector(
    (state) => state.global?.isSideBarCollapsed
  );

  useEffect(() => {
    async function getMainItems() {
      try {
        const CartegoryResp = await axios.get("/api/categories?top=true");
        dispatch(setCategories(CartegoryResp.data.categories));
      } catch (error: unknown) {
        console.log("Error while getting categories");
      }
    }
    getMainItems();
  }, [dispatch]);

  const isDarkMode = useAppSelector((state) => state.global?.isDarkMode);

  useEffect(() => {
    if (status === "authenticated") {
      getUser();
      GetCart();
      getWishlistItems();
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.add("light");
    }
  });

  const isAuth = pathname === "/authentification" ? true : false;

  return (
    <div className="flex w-full">
      {/* <div
        className={` ${
          isDarkMode ? "dark" : "light"
        }  bg-gray-50 text-gray-900 min-h-screen`}
      >
        {!isAuth && <Sidebar />}
      </div> */}
      <div
        className={` ${
          isDarkMode ? "dark" : "light"
        } flex flex-col w-full min-h-screen bg-gray-50`}
      >
        <Navbar />
        <main className={` ${!isAuth && "px-4 lg:px-8 xl:px-40 mt-7"} `}>
          {children}
        </main>
      </div>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};
export default DashboardWrapper;
