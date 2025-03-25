"use client";

import React, { useEffect, useState } from "react";

import Navbar from "./(components)/Navbar";
import StoreProvider, { useAppSelector, useAppDispatch } from "./redux";
import { usePathname, useRouter } from "next/navigation";
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
import { Input } from "antd";
import { MoveRight } from "lucide-react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const { getUser } = useGetUser();
  const { GetCart } = useGetCartItems();
  const { getWishlistItems } = useGetWishlistItems();
  const dispatch = useAppDispatch();
  const Categories = useAppSelector((state) => state.categories.Categories);
  const categoryChildrens = useAppSelector(
    (state) => state.categories.categoryChildren
  );
  const isAllCategories = useAppSelector(
    (state) => state.categories.isAllCategories
  );
  const filteredCategories = categoryChildrens?.filter((child: any) =>
    Categories?.some((item: any) => item.id === child.parentId)
  );
  const isAuth = pathname === "/authentification" ? true : false;

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
        {pathname === "/" && (
          <footer>
            <div className="bg-green-100">
              <div className="grid  text-sm md:text-lg gap-8 bg-opacity-50 py-12 grid-cols-2  md:grid-cols-4 px-4 lg:px-8 xl:px-40 justify-between w-full">
                <div className="flex flex-col  w-full gap-5">
                  <h1 className="font-semibold">ჩვენ შესახებ</h1>
                  <p>მანიფესტი</p>
                  <p>მიწოდება</p>
                  <p>ბლოგი</p>
                  <p>ჩამოტვირთე აპლიკაცია</p>
                  <p>მიმდინარე შეთავაზებები</p>
                  <p>FAQ</p>
                </div>
                <div className="flex flex-col w-full gap-5">
                  <h1 className="font-semibold">წესები & პირობები</h1>
                  <p>წესები & პირობები</p>
                  <p>კონფიდენციალურობა</p>
                  <p>დაბრუნება</p>
                  <p>განვადება</p>
                  <p>გარანტია</p>
                </div>
                <div className="flex flex-col w-full gap-5">
                  <h1 className="font-semibold">რატომ ველი?</h1>
                  <p>უფასო მიწოდება ყველგან</p>
                  <p>თბილისში მიტანა 3 საათში</p>
                  <p>მიტანის დროის არჩევანი</p>
                  <p>უფასო სასაჩუქრე შეფუთვა</p>
                  <p>0% ეფექტური განვადება</p>
                  <p>მიმდინარე შეთავაზებები</p>
                </div>{" "}
                <div className="flex flex-col w-full gap-5">
                  <h1 className="font-semibold">კონტაქტი</h1>
                  <p>023 2 32 43 54 support@vvv.store</p>
                  <p className="hidden md:block">ჩამოტვირთე აპლიკაცია</p>
                  <p className="hidden md:block"> მიმდინარე შეთავაზებები</p>
                  <div className="hidden md:flex flex-col gap-2">
                    <div className="flex items-center w-full justify-center relative ">
                      <Input
                        className="py-2 border-none font-semibold w-full"
                        placeholder="შეიყვანე მეილი"
                      />
                      <MoveRight className="size-4 md:size-6 absolute cursor-pointer right-2" />
                    </div>
                    <p>გამოიწერე სიახლეები</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex md:hidden px-4 pb-6 flex-col gap-2">
                  <div className="flex items-center w-full justify-center relative ">
                    <Input
                      className="py-2 border-none font-semibold w-full"
                      placeholder="შეიყვანე მეილი"
                    />
                    <MoveRight className="size-4 md:size-6 absolute cursor-pointer right-2" />
                  </div>
                  <p>გამოიწერე სიახლეები</p>
                </div>
              </div>
            </div>
            <div className="bg-black text-white px-4 lg:px-8 xl:px-40">
              <div className="grid  text-sm md:text-lg gap-8 py-12 grid-cols-2  md:grid-cols-4  justify-between w-full">
                {filteredCategories?.map((item) => (
                  <div key={item.id}>
                    <h1
                      onClick={() => router.push(`/category/${item.name}`)}
                      className="cursor-pointer hover:text-gray-200 transition duration-300 font-semibold py-2"
                    >
                      {item.name}
                    </h1>
                    {item.children.map((child) => (
                      <h1
                        onClick={() =>
                          router.push(`/category/name/${child.name}`)
                        }
                        key={child.id}
                        className="cursor-pointer hover:text-gray-400 transition duration-300 text-gray-300"
                      >
                        {child.name}
                      </h1>
                    ))}
                  </div>
                ))}
              </div>
              <div className="block text-center pb-12 md:flex justify-between items-center">
                <div className="pb-12 flex justify-center md:justify-start gap-2">
                  <button className="bg-black gap-2  flex items-center border rounded-xl h-12  px-4">
                    <img
                      className="h-6 w-6 object-contain"
                      src="/apple_logo.png"
                      alt="apple-icon"
                    />
                    <div className="text-start">
                      <p className="text-[6px]">download of the app store</p>
                      <h1>App Store</h1>
                    </div>
                  </button>
                  <button className="bg-black gap-2  flex items-center border rounded-xl h-12  px-4">
                    <img
                      className="h-6 w-6  object-contain"
                      src="/google-play.png"
                      alt=""
                    />
                    <div className="text-start">
                      <p className="text-[6px]">GET IT ON</p>
                      <h1>Google Play</h1>
                    </div>
                  </button>
                </div>
                <h1 className="text-[12px]">
                  Copyright © 2025 Veli.store, ყველა უფლება დაცულია.
                </h1>
              </div>
            </div>
          </footer>
        )}
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
