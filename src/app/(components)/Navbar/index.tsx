"use client";

import { Bell, Heart, Menu, Moon, Sun } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import {
  setIsCartItemUnauthentificated,
  setISDarkMode,
  setIsSideBarCollapsed,
  setIsWishlist,
} from "@/redux/globalSlice";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { UserRound, ShoppingCart, SearchX, Search } from "lucide-react";
import { DotLoader } from "react-spinners";
import { Product } from "@/app/types/globalStateTypes";
import axios from "axios";
import { usePathname } from "next/navigation";
import { SyncLoader } from "react-spinners";
import useHandleCartquantity from "@/app/hooks/useHandleCartQuantity";

const Navbar = () => {
  const { status } = useSession();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { handleCartQuantity } = useHandleCartquantity();

  const isSideBarCollapsed = useAppSelector(
    (state) => state.global.isSideBarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const currentUser = useAppSelector((state) => state.user.user);

  const toggleTheme = () => {
    dispatch(setISDarkMode(!isDarkMode));
  };

  const toggleSideBarCollapsed = () => {
    dispatch(setIsSideBarCollapsed(!isSideBarCollapsed));
  };

  const cart = useAppSelector(
    (state) => state.global.isCartItemUnauthentificated
  );

  const SignOut = () => {
    dispatch(setIsCartItemUnauthentificated([]));
    dispatch(setIsWishlist([]));
    localStorage.removeItem("cart");
    signOut({ callbackUrl: "/" });
  };
  const wishlist = useAppSelector((state) => state.global.isWishlist);

  const [value, setValue] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function getSearchResult(query: string) {
    try {
      setLoading(true);
      const resp = await axios.get(`/api/products?query=${query}`);
      if (value === "") {
        setSearchResults([]);
        return;
      }
      setLoading(false);
      setSearchResults(resp.data.products);
    } catch (error) {
      console.log("error while fetch search data");
    } finally {
      setLoading(false);
    }
  }
  const [showResults, setShowResults] = useState<boolean>(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    if (value !== "") {
      const timeOut = setTimeout(async () => {
        getSearchResult(value);
      }, 500);
      return () => clearTimeout(timeOut);
    } else {
      setSearchResults([]);
    }
    setLoading(false);
  }, [value]);

  useEffect(() => {
    if (showResults) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [searchResults, showResults]);

  useEffect(() => {
    setValue("");
    setSearchResults([]);
  }, [pathname]);

  return (
    <div
      className={`flex justify-between gap-12 bg-indigo-500 py-4 px-2 lg:px-8 xl:px-40 items-center w-full`}
    >
      <div
        ref={searchRef}
        className={` ${
          showResults ? "block" : "hidden"
        } fixed bg-gray-800 inset-0 z-30 h-full bg-opacity-60`}
      ></div>
      <div className="flex justify-between w-full items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSideBarCollapsed}
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="relative z-30 w-full">
          <input
            ref={inputRef}
            onFocus={() => setShowResults(true)}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="search"
            placeholder="ჩაწერე საძიებო სიტყვა"
            className="pl-10 pr-2 z-10 text-sm leading-6 text-gray-900 py-2 w-full   bg-white rounded-lg  focus:outline-none focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Bell className="text-gray-900" size={20} />
          </div>
          <div
            ref={searchRef}
            className={`${
              showResults ? "absolute" : "hidden"
            }   bg-white top-16 w-full flex max-h-96 overflow-x-auto flex-col   transition duration-300 rounded-lg p-4   scrollbar-thin scrollbar-thumb-sky-500 scrollbar-track-sky-100 snap-x snap-mandatory scroll-smooth`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <SyncLoader className="text-center py-4" color="#5c88ca" />
              </div>
            ) : (
              <>
                {value.length !== 0 && searchResults.length === 0 && (
                  <div className="flex items-center justify-between ">
                    პროდუქტი ვერ მოიძებნა ! <SearchX />
                  </div>
                )}
              </>
            )}

            {value.length === 0 && searchResults.length === 0 && (
              <div className="flex items-center justify-between">
                გთხოვთ შეიყვანოთ საძიებო სიტყვა <Search />
              </div>
            )}
            {searchResults?.map((item: Product) => {
              return (
                <div
                  className="cursor-pointer py-2 hover:text-gray-700"
                  key={item.id}
                >
                  <div className="flex gap-2">
                    <h1 className="text-sm">{item.name}</h1>
                    <h1 className="text-sm">{item.description}</h1>
                  </div>
                  <hr className="mt-4" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5 ">
          <div>
            <button onClick={toggleTheme} className="text-white">
              {isDarkMode ? (
                <Sun className="cursor-pointer text-white" size={24} />
              ) : (
                <Moon className="cursor-pointer text-white" size={24} />
              )}
            </button>
          </div>
          <div className="relative">
            <Bell className="cursor-pointer text-white" size={24} />
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-medium leading-none bg-red-400 rounded-full">
              3
            </span>
          </div>
          <Link href="/wishlist" className="lex items-center">
            <Heart
              className={` text-red-600 inline ${
                wishlist && wishlist?.length !== 0 && "fill-red-600"
              } `}
              size={26}
            />
          </Link>
          <hr className="w-0 h-7 border border-solid border-gray-300 mx-2" />
          <Link
            href="/cart"
            className=" relative group flex rounded-lg h-[40px] overflow-hidden p-2 items-center hover:ring-1 ring-sky-300 transition duration-300 gap-2"
          >
            <div className="relative flex h- text-white  items-center cursor-pointer w-10 ">
              <ShoppingCart />
              <div className="absolute font-semibold text-white bg-orange-400 text-xs right-1 rounded-full  px-[0.4rem] py-1 flex -top-1 leading-none">
                {handleCartQuantity()}
              </div>
            </div>
            <p className="text-sm  font-semibold text-white">კალათა</p>
            <div className="absolute pointer-events-none inset-0 bg-white/10 w-full h-full translate-x-full opacity-0 group-hover:opacity-100 group-hover:animate-light-move"></div>
          </Link>
          <hr className="w-0 h-7 border border-solid border-gray-300 mx-3" />
          <div className="relative flex h-[40px]  hover:ring-1 p-2 ring-sky-300 transition duration-300 items-center text-white gap-2 font-semibold cursor-pointer rounded-md overflow-hidden group">
            {status === "authenticated" ? (
              <button className="flex gap-4" onClick={SignOut}>
                <UserRound />
                <LogOut className="text-gray-300" />
              </button>
            ) : (
              <Link href="/authentification">
                {status === "loading" ? (
                  <DotLoader color="#3032ae" size={12} className="w-12" />
                ) : (
                  <div className="flex gap-2">
                    <UserRound />
                    <p>შესვლა</p>
                  </div>
                )}
              </Link>
            )}
            <div className="absolute pointer-events-none inset-0 bg-white/10 w-full h-full translate-x-full opacity-0 group-hover:opacity-100 group-hover:animate-light-move"></div>
          </div>
        </div>
      </div>
      {/* <div className="absolute z-20 inset-0 bg-gray-900 bg-opacity-80"></div> */}
    </div>
  );
};

export default Navbar;
