"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux";
import { Product } from "../types/globalStateTypes";
import useDeleteCartItem from "../hooks/useDeleteCartItem";
import useAddToCart from "../hooks/addToCart";
import { useSession } from "next-auth/react";
import { Trash, Car } from "lucide-react";
import { Select } from "antd";
import { GridLoader } from "react-spinners";
import useHandleQuantityIncart from "../hooks/useHandleQuantityInCart";
import useHandleCartquantity from "../hooks/useHandleCartQuantity";
import useAddToCartMain from "../hooks/addToCartMain";
import { useRouter } from "next/navigation";
import { useAuthModal } from "../(components)/authModal";

function Cart() {
  const { status } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { deleteCartItem } = useDeleteCartItem();
  const { handleQuantityIncart } = useHandleQuantityIncart();
  const { addToCart, loadingStates, setLoadingStates } = useAddToCart();
  const { addToCartWithVariants, loadingStates: productLoad } =
    useAddToCartMain();

  const { handleCartQuantity, handleTotalPrice } = useHandleCartquantity();
  const [sortOption, setSortOption] = useState<string>("price_low_to_high");
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuthModal();
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAuthModalOpen, dispatch]);

  const cart = useAppSelector(
    (state) => state.global.isCartItemUnauthentificated
  );
  const user = useAppSelector((state) => state.user.user);

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

  const sortCart = (sortBy: string) => {
    if (!cart) {
      return [];
    }
    const sortedCart = [...cart];

    if (sortBy === "price_low_to_high") {
      sortedCart.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high_to_low") {
      sortedCart.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name_a_to_z") {
      sortedCart.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name_z_to_a") {
      sortedCart.sort((a, b) => b.name.localeCompare(a.name));
    }

    return sortedCart;
  };

  useEffect(() => {
    sortCart(sortOption);
  }, [sortOption, cart]);

  return (
    <div className="min-h-screen relative lg:h-full pb-12">
      <div className="block lg:flex gap-2 h-full relative items-start">
        <div className="flex flex-col gap-4  bg-gray-100 h-full min-h-1/2  w-full p-4 rounded-xl">
          <h1 className="text-3xl font-bold text-black tracking-wider">
            {!cart || cart.length === 0 ? (
              <>კალათა ცარიელია</>
            ) : (
              <>თქვენი კალათა</>
            )}
          </h1>
          <div>
            <Select
              id="sort-options"
              onChange={(e) => setSortOption(e)}
              defaultValue={"ფასი (ზრდადობით)"}
              className="bg-sky-500 min-w-60 rounded-lg text-white outline-none border-0"
            >
              <Select.Option value="price_low_to_high">
                ფასი (ზრდადობით)
              </Select.Option>
              <Select.Option value="price_high_to_low">
                ფასი (კლებადობით)
              </Select.Option>
              <Select.Option value="name_a_to_z">სახელი (A - Z)</Select.Option>
              <Select.Option value="name_z_to_a">სახელი (Z - A)</Select.Option>
            </Select>
          </div>
          <hr className="border-sky-200 border-px" />
          <div className="flex flex-col gap-2">
            {(!cart || cart?.length === 0) && (
              <div className="flex items-center justify-between">
                <img
                  className="size-14 md:size-20 lg:size-40 "
                  src="/empty-box.webp"
                  alt="empty-box"
                />
                <h1
                  onClick={() => router.push("/")}
                  className="text-xl cursor-pointer text-gray-500"
                >
                  მთავარზე დაბრუნება
                </h1>
              </div>
            )}
            {sortCart(sortOption).map((item: Product, index: number) => {
              const IsUser = user ? item.productId : item.id;
              return (
                <div key={index}>
                  <div className="p-4 flex gap-2">
                    <img
                      onClick={() => router.push(`/productId/${IsUser}`)}
                      src={item.images[0].url || ""}
                      className="w-24 rounded-xl h-24 object-contaion"
                      alt="image"
                    />
                    <div className="block lg:flex justify-between w-full gap-2">
                      <div>
                        <h1 className="text-xl max-w-20 ">{item.name}</h1>
                        <p className="text-sm md:w-40">{item.description}</p>
                        <div className="flex gap-2 mt-2">
                          {(item.selectedColor || item.selectedSize) && (
                            <>
                              {item.selectedColor && (
                                <p className="bg-sky-200 rounded-lg p-2 min-w-12 text-center">
                                  {item.selectedColor}
                                </p>
                              )}
                              {item.selectedSize && (
                                <p className="bg-sky-200 rounded-lg p-2 min-w-12 text-center">
                                  {item.selectedSize}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-start my-2 lg:my-0 lg:justify-center gap-4">
                        <button
                          disabled={
                            productLoad[item.productId] ||
                            loadingStates[item.productId]
                          }
                          onClick={() => handleAddToCart(item)}
                          className="h-8 w-8 cursor-pointer hover:bg-gray-200 rounded-full border flex items-center justify-center"
                        >
                          +
                        </button>
                        {loadingStates[
                          status === "unauthenticated"
                            ? item.id
                            : item.productId
                        ] ||
                        productLoad[
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
                        <button
                          disabled={
                            productLoad[item.productId] ||
                            loadingStates[item.productId]
                          }
                          onClick={() => handleCartItemId(item)}
                          className="h-8 w-8 cursor-pointer hover:bg-gray-200 rounded-full border flex items-center justify-center"
                        >
                          -
                        </button>
                        <button
                          className="hover:text-gray-600"
                          onClick={() => deleteCartItem(item, false)}
                        >
                          <Trash />
                        </button>
                      </div>
                      <h1 className="text-xl font-bold">{item.price} ₾</h1>
                    </div>
                  </div>
                  <hr />
                </div>
              );
            })}
          </div>
        </div>
        <div className="sticky md:border top-7 mt-2 lg:mt-0  flex flex-col gap-5 w-full lg:w-1/2 rounded-lg p-6">
          <h1 className="text-2xl font-bold">შეკვეთა</h1>
          <div className="flex justify-between">
            <p className="text-sm">პროდუქტები</p>
            <p>{handleCartQuantity()}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm">ღირებულება</p>
            <p>{handleTotalPrice()} ₾</p>
          </div>
          <p className="text-green-600 flex gap-2">
            <Car /> უფასო მიწოდება თბილისის მასშტაბით{" "}
          </p>
          <div className={`w-full ${!cart || (cart.length === 0 && "hidden")}`}>
            {status === "authenticated" ? (
              <button
                onClick={() => router.push("/chackout")}
                className="flex p-4 w-full mt-8 gap-4 bg-black text-white font-semibold text-lg  tracking-wider hover:shadow-inner items-center justify-center rounded-lg"
              >
                ყიდვა
              </button>
            ) : (
              <button
                onClick={() => dispatch(setIsAuthModalOpen(true))}
                className="flex p-4 mt-8 w-full gap-4 bg-black text-white font-semibold text-lg tracking-wider hover:shadow-inner items-center justify-center rounded-lg"
              >
                ყიდვა
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
function usecallback(arg0: () => void, arg1: never[]) {
  throw new Error("Function not implemented.");
}
