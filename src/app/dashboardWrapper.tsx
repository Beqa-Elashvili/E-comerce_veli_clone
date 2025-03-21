"use client";

import React, { useEffect, useState } from "react";
import Navbar from "./(components)/Navbar";
import StoreProvider, { useAppSelector, useAppDispatch } from "./redux";
import { usePathname } from "next/navigation";
import { setCategories } from "@/redux/categorySlice";
import axios from "axios";
import { useSession } from "next-auth/react";
import useGetUser from "./actions/getUser";
import useGetCartItems from "./hooks/getCartItems";
import useGetWishlistItems from "./hooks/getWislistItems";
import MobileFooter from "./(components)/mobilefooter";
import AllCategories from "./(components)/AllCategories/isAllCategories";
import { Product } from "./types/globalStateTypes";
import { setIsCartItemUnauthentificated } from "@/redux/globalSlice";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  const { getUser } = useGetUser();
  const { GetCart } = useGetCartItems();
  const { getWishlistItems } = useGetWishlistItems();

  const pathname = usePathname();
  const dispatch = useAppDispatch();

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
    } else {
      let cart: Product[] = [];
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        cart = JSON.parse(storedCart);
      }
      dispatch(setIsCartItemUnauthentificated(cart));
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.add("light");
    }
  });

  const isAllCategories = useAppSelector(
    (state) => state.categories.isAllCategories
  );
  const isAuth = pathname === "/authentification" ? true : false;

  return (
    <div className="flex w-full">
      <div
        className={` ${
          isDarkMode ? "dark" : "light"
        } flex flex-col w-full min-h-screen relative bg-gray-50`}
      >
        <Navbar />
        <main className={` ${!isAuth && "px-4 lg:px-8 xl:px-40"} `}>
          {isAllCategories ? <AllCategories /> : <>{children}</>}
        </main>
        <div className="block z-50 sticky bottom-0 lg:hidden">
          <MobileFooter />
        </div>
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
