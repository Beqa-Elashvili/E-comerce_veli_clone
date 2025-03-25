"use client";

import {
  Heart,
  Moon,
  Sun,
  UserRound,
  ShoppingCart,
  SearchX,
  Search,
  X,
  Trash,
  TableOfContents,
  Settings,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import {
  setIsCartItemUnauthentificated,
  setISDarkMode,
  setIsWishlist,
} from "@/redux/globalSlice";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { DotLoader, GridLoader } from "react-spinners";
import { Category, Product } from "@/app/types/globalStateTypes";
import axios from "axios";
import { usePathname } from "next/navigation";
import { SyncLoader } from "react-spinners";
import useHandleCartquantity from "@/app/hooks/useHandleCartQuantity";
import { useRouter } from "next/navigation";
import { Triangle } from "lucide-react";
import useAddToCartMain from "@/app/hooks/addToCartMain";
import useDeleteCartItem from "@/app/hooks/useDeleteCartItem";
import useAddToCart from "@/app/hooks/addToCart";
import useHandleQuantityIncart from "@/app/hooks/useHandleQuantityInCart";
import CarouselComp from "../Carousel/Carousel";
import { setIsAllCategories } from "@/redux/categorySlice";
import { setShowResults } from "@/redux/globalSlice";
import { Package, MapPin } from "lucide-react";
import { setIsAuthModalOpen } from "@/redux/globalSlice";
import Register from "@/app/(auth)/authentification";
import { useAuthModal } from "../authModal";

const Navbar = () => {
  const { status } = useSession();
  const { AuthModal, setIsAuthModalOpen, isAuthModalOpen } = useAuthModal();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const { handleCartQuantity, handleTotalPrice } = useHandleCartquantity();
  const { handleQuantityIncart } = useHandleQuantityIncart();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const toggleTheme = () => {
    dispatch(setISDarkMode(!isDarkMode));
  };

  const SignOut = () => {
    dispatch(setIsCartItemUnauthentificated([]));
    dispatch(setIsWishlist([]));
    localStorage.removeItem("cart");
    signOut({ callbackUrl: "/" });
  };

  const [value, setValue] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCart, setShowCart] = useState<boolean>(false);
  const { addToCartWithVariants, loadingStates: Load } = useAddToCartMain();
  const { addToCart, loadingStates, setLoadingStates } = useAddToCart();
  const { deleteCartItem } = useDeleteCartItem();

  const showResults = useAppSelector((state) => state.global.isShowResults);

  const cart = useAppSelector(
    (state) => state.global.isCartItemUnauthentificated
  );

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
  const user = useAppSelector((state) => state.user.user);

  const searchRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userRef = useRef<HTMLInputElement>(null);
  const [showUser, setShowUser] = useState<boolean>(false);

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
        dispatch(setShowResults(false));
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
    if (showCart) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setShowCart(false);
        cartRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [cart, showCart]);

  useEffect(() => {
    if (showUser) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUser(false);
        userRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [showUser]);

  useEffect(() => {
    setShowCart(false);
    dispatch(setShowResults(false));
    setValue("");
    setSearchResults([]);
    setShowUser(false);
  }, [pathname]);

  const handleAddToCart = async (product: Product) => {
    if (status === "unauthenticated") {
      const productWithVariant = {
        ...product,
        selectedColor: product.selectedColor,
        selectedSize: product.selectedSize,
        VariantStock: product.VariantStock,
      };
      addToCart(user?.id as unknown as string, productWithVariant, 1);
    } else {
      addToCartWithVariants({ ...product, id: product.productId });
    }
  };
  const categories = useAppSelector((state) => state.categories.Categories);

  const handleCartItemId = async (product: Product) => {
    if (status === "unauthenticated") {
      setLoadingStates((prev) => ({
        ...prev,
        [product.id]: true,
      }));
      if (product.selectedColor !== "" || product.selectedSize !== "") {
        const isCart = cart?.find(
          (item: Product) =>
            item.id === product.id &&
            (item.selectedColor === product.selectedColor ||
              !product.selectedColor) &&
            (item.selectedSize === product.selectedSize ||
              !product.selectedSize)
        );

        isCart && (await deleteCartItem(isCart, true));
        setLoadingStates((prev) => ({
          ...prev,
          [product.id]: false,
        }));
      } else {
        const isCart = cart?.find(
          (item: Product) =>
            item.productId === product.productId &&
            (item.selectedColor === product.selectedColor ||
              !product.selectedColor) &&
            (item.selectedSize === product.selectedSize ||
              !product.selectedSize)
        );
        isCart && (await deleteCartItem(isCart, true));
        setLoadingStates((prev) => ({
          ...prev,
          [product.id]: false,
        }));
      }
    } else {
      try {
        setLoadingStates((prev) => ({
          ...prev,
          [product.productId]: true,
        }));
        const isCart = cart?.find(
          (item: Product) =>
            item.productId === product.productId &&
            (item.selectedColor === product.selectedColor ||
              !product.selectedColor) &&
            (item.selectedSize === product.selectedSize ||
              !product.selectedSize)
        );
        isCart && (await deleteCartItem(isCart, true));
        setLoadingStates((prev) => ({ ...prev, [product.productId]: false }));
      } catch (error: unknown) {}
    }
  };

  const [isSticky, setIsSticky] = useState(false);

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    if (scrollTop > 100) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleIsAllCategories = (href: string) => {
    dispatch(setIsAllCategories(false));
    router.push(href);
  };

  const handleIsAuthentificated = () => {
    user ? "/chackout" : dispatch(setIsAuthModalOpen(true));
  };

  return (
    <div
      className={`flex sticky top-0 z-40 justify-between gap-12 bg-main py-4 px-2 lg:px-8 xl:px-40 items-center w-full mb-7`}
    >
      <AuthModal />
      <div
        ref={searchRef}
        className={` ${
          showResults ? "block" : "hidden"
        } fixed bg-gray-800 inset-0 z-30 h-full bg-opacity-60`}
      ></div>
      <div
        ref={cartRef}
        className={` ${
          showCart ? "block" : "hidden"
        } fixed bg-gray-800 inset-0  z-30 h-full bg-opacity-60`}
      ></div>
      <div
        ref={userRef}
        className={` ${
          showUser ? "block" : "hidden"
        } fixed bg-gray-800 inset-0  z-30 h-full bg-opacity-60`}
      ></div>
      <div className="flex justify-between w-full items-center gap-5">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-5xl font-bold hidden lg:block font-serif">
            VELI
          </h1>
          <h1 className="text-5xl font-bold block lg:hidden font-serif">V</h1>

          <div className="flex flex-col gap-1">
            <p className="bg-black h-2 w-2 rounded-full"></p>
            <p className="bg-black h-2 w-2 rounded-full"></p>
          </div>
        </Link>
        <div className="relative z-30 w-full">
          <input
            ref={inputRef}
            onFocus={() => dispatch(setShowResults(true))}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="search"
            placeholder="რას ეძებ ?"
            className="pl-10 pr-2 z-10 font-semibold text-sm leading-6 text-gray-900 py-2 w-full   bg-white rounded-lg  focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute inset-2" />
          <div
            ref={searchRef}
            className={`${
              showResults ? "absolute" : "hidden"
            }   bg-white top-16 w-full flex  lg:max-h-96 overflow-x-auto flex-col   transition duration-300 rounded-lg p-4   scrollbar-thin scrollbar-thumb-sky-500 scrollbar-track-sky-100 snap-x snap-mandatory scroll-smooth`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <SyncLoader className="text-center py-4" color="#5c88ca" />
              </div>
            ) : (
              <>
                {value.length !== 0 && searchResults.length === 0 && (
                  <div className="flex text-sm lg:text-sm items-center justify-between ">
                    პროდუქტი ვერ მოიძებნა ! <SearchX />
                  </div>
                )}
              </>
            )}

            {value.length === 0 && searchResults.length === 0 && (
              <div className="flex items-center text-sm lg:text-lg justify-between">
                გთხოვთ შეიყვანოთ საძიებო სიტყვა <Search />
              </div>
            )}
            {searchResults?.map((item: Product) => {
              return (
                <div
                  className="cursor-pointer py-2 hover:text-gray-700"
                  key={item.id}
                >
                  <div className="block lg:flex  gap-2">
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
          <div className="flex items-center">
            <button onClick={toggleTheme} className="text-black">
              {isDarkMode ? (
                <Sun className="cursor-pointer" size={24} />
              ) : (
                <Moon className="cursor-pointer" size={24} />
              )}
            </button>
          </div>
          <hr className="w-0 h-7 border border-solid border-gray-300 mx-2" />
          <div className="relative">
            <div
              ref={cartRef}
              onClick={() => setShowCart((prev) => !prev)}
              className=" relative cursor-pointer group flex rounded-lg h-[40px] overflow-hidden p-2 items-center hover:ring-1 ring-white transition duration-300 gap-2"
            >
              <div className="relative flex  items-center cursor-pointer w-10 ">
                <ShoppingCart />
                <div className="absolute font-semibold bg-orange-400 text-xs right-1 rounded-full  px-[0.4rem] py-1 flex -top-1 leading-none">
                  {handleCartQuantity()}
                </div>
              </div>
              <p className="font-semibold">კალათა</p>
              <div className="absolute pointer-events-none inset-0 bg-white/10 w-full h-full translate-x-full opacity-0 group-hover:opacity-100 group-hover:animate-light-move"></div>
            </div>
            {showCart && (
              <div ref={cartRef} className="relative z-30 w-full">
                <div className="absolute bg-white top-7 w-96 right-2  rounded-lg">
                  <div className=" flex justify-between p-2 items-center gap-12">
                    <h1 className="text-lg font-semibold">ჩემი კალათა</h1>
                    <X
                      onClick={() => setShowCart(false)}
                      className="size-6  bg-gray-200 rounded-full p-1 cursor-pointer hover:bg-gray-300 transition duration-300"
                    />
                  </div>
                  <hr />
                  <div className="flex relative overflow-y-scroll max-h-80 flex-col gap-2">
                    {cart && cart?.length !== 0 ? (
                      <>
                        {cart?.map((item: Product, index: number) => (
                          <div key={item.id}>
                            <div className="flex items-center p-2 justify-between">
                              <div className="flex">
                                <img
                                  src={item.images[0].url}
                                  className="size-14 rounded-xl"
                                  onClick={() =>
                                    router.push(
                                      `/productId/${
                                        status === "unauthenticated"
                                          ? item.id
                                          : item.productId
                                      }`
                                    )
                                  }
                                  alt="image"
                                />
                                <div className="space-y-2 ml-2">
                                  <h1>{item.name}</h1>
                                  <p>{item.price} ₾</p>
                                </div>
                              </div>
                              <div>
                                {cart?.length !== 0 && (
                                  <>
                                    <div className="flex items-center justify-center gap-4">
                                      <div
                                        onClick={() => handleAddToCart(item)}
                                        className="h-8 w-8 cursor-pointer hover:bg-gray-200 rounded-full border flex items-center justify-center"
                                      >
                                        +
                                      </div>
                                      {loadingStates[
                                        status === "unauthenticated"
                                          ? item.id
                                          : item.productId
                                      ] ||
                                      Load[
                                        status === "unauthenticated"
                                          ? item.id
                                          : item.productId
                                      ] ? (
                                        <>
                                          <GridLoader
                                            color="#525fd16c"
                                            size={4}
                                            className="w-6"
                                          />
                                        </>
                                      ) : (
                                        <h1>{handleQuantityIncart(item)}</h1>
                                      )}
                                      <div
                                        onClick={() => handleCartItemId(item)}
                                        className="h-8 w-8 cursor-pointer hover:bg-gray-200 rounded-full border flex items-center justify-center"
                                      >
                                        -
                                      </div>
                                      <button
                                        className="hover:text-gray-600"
                                        onClick={() =>
                                          deleteCartItem(item, false)
                                        }
                                      >
                                        <Trash />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            {index !== cart.length - 1 && <hr />}
                          </div>
                        ))}
                        <div className="p-2 sticky bottom-0 bg-white flex mt-2 items-center justify-between">
                          <p>სულ: {handleTotalPrice()} ₾</p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => router.push("/cart")}
                              className="flex bg-black hover:bg-gray-900 transition duration-300 text-white p-2 justify-center items-center rounded-lg"
                            >
                              ნახვა ({cart?.length})
                            </button>
                            <button
                              onClick={() =>
                                user
                                  ? router.push("/chackout")
                                  : dispatch(setIsAuthModalOpen(true))
                              }
                              className="flex bg-green-400 hover:bg-green-500 transition duration-300 justify-center p-2 items-center rounded-lg"
                            >
                              ყიდვა
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <h1 className="p-2">შენი კალათა ცარიელია</h1>
                    )}
                  </div>
                </div>
                <span className="text-black absolute z-30  top-4 left-16">
                  <Triangle className="text-white size-4 fill-white" />
                </span>
              </div>
            )}
          </div>
          <hr className="w-0 h-7 border border-solid border-gray-300 mx-3" />
          <div className="relative flex h-[40px] z-10  w-36 justify-center hover:ring-1 p-2 ring-white transition duration-300 overflow-hidden items-center  gap-2 font-semibold cursor-pointer rounded-md group">
            {status === "authenticated" ? (
              <>
                <div
                  ref={userRef}
                  onClick={() => setShowUser((prev) => !prev)}
                  className="flex gap-4 z-40"
                >
                  <UserRound />
                  <p>ჩემი ველი</p>
                </div>
              </>
            ) : (
              <div onClick={() => dispatch(setIsAuthModalOpen(true))}>
                {status === "loading" ? (
                  <DotLoader color="#3032ae" size={12} className="w-12" />
                ) : (
                  <div className="flex gap-2">
                    <UserRound />
                    <p className="font-semibold">შესვლა</p>
                  </div>
                )}
              </div>
            )}
            <div className="absolute pointer-events-none inset-0 bg-white/10 w-full h-full translate-x-full opacity-0 group-hover:opacity-100 group-hover:animate-light-move"></div>
          </div>
          {showUser && (
            <div ref={userRef} className="relative z-30">
              <div className="absolute bg-white w-96 right-10 p-4 pb-5 top-12  rounded-lg">
                <div className="flex justify-between items-center gap-12">
                  <h1 className="text-lg font-semibold">
                    გამარჯობა, {user?.name}
                  </h1>
                  <X
                    onClick={() => setShowCart(false)}
                    className="size-6  bg-gray-200 rounded-full p-1 cursor-pointer hover:bg-gray-300 transition duration-300"
                  />
                </div>
                <hr className="my-6" />
                <div className="grid grid-cols-2 grid-rows-3 gap-y-8 items-center gap-4">
                  <div
                    onClick={() => router.push("/profile/orders")}
                    className="flex items-center gap-4 cursor-pointer"
                  >
                    <Package />
                    <p>შეკვეთები</p>
                  </div>
                  <div
                    onClick={() => router.push("/profile/addresses")}
                    className="flex cursor-pointer items-center gap-4"
                  >
                    <MapPin />
                    <p>მისამართები</p>
                  </div>
                  <div
                    onClick={() => router.push("/profile/wishlist")}
                    className="flex cursor-pointer items-center gap-4"
                  >
                    <Heart />
                    <p>სურვილები</p>
                  </div>
                  <div
                    onClick={() => router.push("/profile/settings")}
                    className="flex cursor-pointer items-center gap-4"
                  >
                    <Settings />
                    <p>პარამეტრები</p>
                  </div>
                </div>
                <hr />
                <button
                  onClick={() => SignOut()}
                  className="flex mt-4 items-center gap-4"
                >
                  <LogOut />
                  <p>გამოსვლა</p>
                </button>
              </div>
              <span className="text-black absolute z-30 right-16  top-10 ">
                <Triangle className="text-white size-4 fill-white" />
              </span>
            </div>
          )}
        </div>
        <div
          className={`absolute hidden lg:block inset-0 ${
            isSticky ? "pointer-events-auto" : "pointer-events-none"
          }  top-16 px-4 lg:px-8 xl:px-40`}
        >
          <div
            className={`bg-gray-50 z-20 sticky top-20 items-center text-center overflow-hidden w-full gap-2 transition-all duration-500 ease-in-out ${
              isSticky
                ? "opacity-100 flex pointer-events-auto translate-y-4"
                : "opacity-0 flex pointer-events-none"
            }`}
          >
            <div
              onClick={() => dispatch(setIsAllCategories(true))}
              className="bg-black text-white cursor-pointer  flex items-center gap-2 px-2 py-3 rounded-lg"
            >
              <p className="w-36">ყველა კატეგორია</p>
              <TableOfContents />
            </div>
            <div
              className={`relative mb-3 w-full h-full text-center overflow-hidden py-2 px-4 text-white ${
                isSticky ? "pointer-events-auto" : "pointer-events-none hidden"
              } `}
            >
              <CarouselComp>
                {categories?.map((item: Category) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      handleIsAllCategories(`/category/${item.name}`)
                    }
                    className={`text-center h-12 max-w-36 ${
                      isSticky ? "pointer-events-auto" : "pointer-events-none"
                    }`}
                  >
                    <div className="bg-gray-200 flex items-center justify-center  relative cursor-pointer h-full hover:bg-gray-300 rounded-lg">
                      <h2 className="px-2 text-balance text-sm font-semibold tracking-wider">
                        {item.name}
                      </h2>
                    </div>
                  </div>
                ))}
              </CarouselComp>
              <div className="absolute bottom-0 w-full shadow-lg  bg-gradient-to-b  from-gray-50 to-transparent  pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
