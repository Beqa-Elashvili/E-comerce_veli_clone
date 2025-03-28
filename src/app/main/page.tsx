"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { Category, Item, Product } from "@/app/types/globalStateTypes";
import { Heart, ShoppingCart } from "lucide-react";
import useAddinWinshilst from "../hooks/addWishlistItem";
import { useRouter } from "next/navigation";
import useGetIsWishlist from "../actions/getIswishlist";
import useAddToCartMain from "../hooks/addToCartMain";
import axios from "axios";
import { useSession } from "next-auth/react";
import CarouselComp from "../(components)/Carousel/Carousel";
import { TableOfContents, Flame } from "lucide-react";
import { setIsAllCategories } from "@/redux/categorySlice";
import { GridLoader } from "react-spinners";
import { setCategoryChildren } from "@/redux/categorySlice";

function Main() {
  const router = useRouter();
  const categories = useAppSelector((state) => state.categories.Categories);

  const { addWishlistItem } = useAddinWinshilst();
  const { IsWishlist } = useGetIsWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const dispatch = useAppDispatch();
  const { addToCartWithVariants, loadingStates } = useAddToCartMain();
  const user = useAppSelector((state) => state.user.user);
  const { status } = useSession();

  type childrenCategory = {
    Product: Product[];
    children: Category;
    id: number;
    imageUrl: string[];
    name: string;
    parentId: number;
  };
  const categoryChildrens = useAppSelector(
    (state) => state.categories.categoryChildren
  );

  useEffect(() => {
    const product = axios.get("/api/products");
    const categoryChildren = axios.get("/api/categories?childrens=true");

    async function getProducts() {
      const resp = await Promise.all([product, categoryChildren]);
      setProducts(resp[0].data.products);
      dispatch(setCategoryChildren(resp[1].data.category));
    }
    getProducts();
  }, []);

  const isCart = useAppSelector(
    (state) => state.global.isCartItemUnauthentificated
  );

  const handleIsCart = (id: number) => {
    return (
      isCart?.some((item: Product) =>
        status === "authenticated" ? item.productId === id : item.id === id
      ) || false
    );
  };

  return (
    <div className="w-full flex flex-col gap-12 mb-20">
      <div className="flex items-center text-center gap-1  md:gap-4">
        <div
          onClick={() => dispatch(setIsAllCategories(true))}
          className="bg-black mt-4 cursor-pointer text-white flex flex-col gap-4 items-center justify-center rounded-lg p-4 w-24 h-36 lg:h-44 lg:w-40"
        >
          <TableOfContents className="size-10" />
          ყველა კატეგორია
        </div>
        <div className="w-full h-full  px-0 md:px-4 overflow-hidden">
          <CarouselComp>
            {categories?.map((item: Category) => (
              <div
                key={item.id}
                onClick={() => router.push(`/category/${item.name}`)}
                className="text-center max-w-[75px] md:max-w-[120px] h-36 lg:h-44 lg:max-w-36"
              >
                <div className="bg-gray-200 relative cursor-pointer h-full md:hover:bg-gray-300 overflow-hidden rounded-lg">
                  <h2 className="text-balance h-20 py-6 text-[10px] md:text-sm lg:font-semibold tracking-wider">
                    {item.name}
                  </h2>
                  <img
                    className="h-40 object-contain absolute -right-5 md:-right-12 -bottom-12"
                    src={item.imageUrl}
                    alt="image"
                  />
                </div>
              </div>
            ))}
          </CarouselComp>
        </div>
      </div>
      <img src="/cover1.jpg" alt="image" className="rounded-3xl" />
      <div className="relative p-5 bg-orange-400 rounded-3xl">
        <hr className="h-2 border-dotted" />
        <div className="flex justify-between items-center">
          <div>
            <p className="absolute bg-white w-1/2 md:w-4/6 h-px top-[41px] md:top-[31px]" />
            <p className="text-lg md:text-5xl font-semibold text-white">
              მხოლოდ სამი დღით
            </p>
            <p className="absolute bg-white w-1/2 md:w-4/6 h-px bottom-[30px] md:bottom-[10px]" />
          </div>
          <div className="bg-black text-white flex gap-2 px-2 py-1 text-3xl items-center rounded-full">
            <Flame className="text-orange-600 size-8 rounded-full bg-orange-400" />{" "}
            %
          </div>
        </div>
      </div>
      <CarouselComp SlideToShow={3}>
        {categoryChildrens?.map((item: Item) => (
          <div className="px-1 md:px-6" key={item.id}>
            <div
              onClick={() => router.push(`/category/name/${item.name}`)}
              className="bg-orange-400 flex flex-col h-40 p-2 md:p-4 rounded-3xl cursor-pointer"
            >
              <div className="bg-orange-500 text-white  rounded-full block md:flex items-center justify-between p-1">
                <div className="text-center md:ml-4">
                  <p className="text-sm md:text-xl">11-12</p>
                  <p className="ml-1">მარტი</p>
                </div>
                <div className="bg-black text-white flex gap-2 px-2 py-1 text-3xl items-center rounded-full">
                  <Flame className="text-orange-600 size-8 rounded-full bg-orange-400 hidden md:block" />
                  {Math.floor(Math.random() * 100)}%
                </div>
              </div>
              <h1 className="h-full text-sm font-semibold flex items-end">
                {item.name}
              </h1>
            </div>
          </div>
        ))}
      </CarouselComp>

      <CarouselComp MainTitle="განახლებული კოლექცია">
        {products?.slice(0, 12).map((product: Product) => {
          const isCart = handleIsCart(product.id);
          return (
            <div key={product.id} className="px-2 w-full md:px-4">
              <div
                onClick={() => router.push(`/productId/${product.id}`)}
                className="rounded-lg h-[270px] md:h-[320px] md:hover:bg-gray-100 relative text-center overflow-hidden cursor-pointer max-w-52"
              >
                <div className="absolute hidden md:flex inset-0  opacity-0   gap-2 md:hover:opacity-100 mt-6 justify-end transition  duration-500 hover:-translate-x-5 ">
                  <div className="flex flex-col items-center gap-2 ">
                    <Heart
                      onClick={(e) => {
                        e.stopPropagation();
                        addWishlistItem(
                          user?.id as unknown as string,
                          product.id as unknown as string
                        );
                      }}
                      className={`w-8 h-8  ${
                        IsWishlist(product.id) && "fill-red-500 text-red-500"
                      }  cursor-pointer hover:text-red-500  border rounded-lg bg-white p-1`}
                    />
                    {loadingStates[product.id] ? (
                      <div className="bg-white w-8 h-8 border rounded-lg p-1">
                        <GridLoader
                          color="#525fd16c"
                          size={4}
                          className="w-6"
                        />
                      </div>
                    ) : (
                      <ShoppingCart
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCartWithVariants(product);
                        }}
                        className="w-8 h-8 border cursor-pointer hover:text-gray-500 rounded-lg bg-white p-1"
                      />
                    )}
                  </div>
                </div>
                <div className="md:hover:bg-gray-100 p-2 overflow-hidden rounded-lg">
                  <p className="text-balance h-16 py-2 text-sm font-semibold text-gray-900">
                    {product.name}
                  </p>
                  <img
                    className="h-20 rounded-xl md:h-40 m-auto object-contain"
                    src={product.images[0].url}
                    alt="image"
                  />
                  {isCart && (
                    <div className="hidden md:flex gap-2">
                      <ShoppingCart className="text-green-500 fill-green-200" />
                      <p className="text-sm">დამატებულია</p>
                    </div>
                  )}
                  <div className="text-start md:h-20 mt-2">
                    <p className="font-semibold text-sm">{product.price} ₾</p>
                    <p className="text-sm h-10 w-28 hidde md:block mt-2">
                      {product.description?.slice(0, 20)}...
                    </p>
                  </div>
                </div>
                <div className="flex w-full justify-between md:hidden">
                  <Heart
                    onClick={(e) => {
                      e.stopPropagation();
                      addWishlistItem(
                        user?.id as unknown as string,
                        product.id as unknown as string
                      );
                    }}
                    className={`w-8 h-8  ${
                      IsWishlist(product.id) && "fill-red-500 text-red-500"
                    }  cursor-pointer hover:text-red-500  border rounded-lg bg-white p-1`}
                  />

                  {loadingStates[product.id] ? (
                    <div className="bg-white w-1/2 h-8 border rounded-lg p-1">
                      <GridLoader color="#525fd16c" size={4} className="w-6" />
                    </div>
                  ) : (
                    <ShoppingCart
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCartWithVariants(product);
                      }}
                      className=" h-8 w-1/2 border cursor-pointer hover:text-gray-500 rounded-lg bg-white p-1"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CarouselComp>
      <img src="/cover-2.jpg" alt="image" className="rounded-3xl" />
      <CarouselComp MainTitle="Best Price">
        {products?.slice(12, 22).map((product: Product) => {
          const isCart = handleIsCart(product.id);
          return (
            <div key={product.id} className="px-2 w-full md:px-4">
              <div
                onClick={() => router.push(`/productId/${product.id}`)}
                className="rounded-lg h-[270px] md:h-[300px] md:hover:bg-gray-100 relative text-center overflow-hidden cursor-pointer max-w-52"
              >
                <div className="absolute hidden md:flex inset-0  opacity-0   gap-2 md:hover:opacity-100 mt-6 justify-end transition  duration-500 hover:-translate-x-5 ">
                  <div className="flex flex-col items-center gap-2 ">
                    <Heart
                      onClick={(e) => {
                        e.stopPropagation();
                        addWishlistItem(
                          user?.id as unknown as string,
                          product.id as unknown as string
                        );
                      }}
                      className={`w-8 h-8  ${
                        IsWishlist(product.id) && "fill-red-500 text-red-500"
                      }  cursor-pointer hover:text-red-500  border rounded-lg bg-white p-1`}
                    />
                    {loadingStates[product.id] ? (
                      <div className="bg-white w-8 h-8 border rounded-lg p-1">
                        <GridLoader
                          color="#525fd16c"
                          size={4}
                          className="w-6"
                        />
                      </div>
                    ) : (
                      <ShoppingCart
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCartWithVariants(product);
                        }}
                        className="w-8 h-8 border cursor-pointer hover:text-gray-500 rounded-lg bg-white p-1"
                      />
                    )}
                  </div>
                </div>
                <div className="md:hover:bg-gray-100 p-2 overflow-hidden rounded-lg">
                  <p className="text-balance h-14 py-2 text-sm font-semibold text-gray-900">
                    {product.name}
                  </p>
                  <img
                    className="h-20 rounded-xl md:h-40 m-auto object-contain"
                    src={product.images[0].url}
                    alt="image"
                  />
                  {isCart && (
                    <div className="hidden md:flex gap-2">
                      <ShoppingCart className="text-green-500 fill-green-200" />
                      <p className="text-sm">დამატებულია</p>
                    </div>
                  )}
                  <div className="text-start md:h-20 mt-2">
                    <p className="font-semibold text-sm">{product.price} ₾</p>
                    <p className="text-sm h-10 w-28 hidde md:block mt-2">
                      {product.description?.slice(0, 20)}...
                    </p>
                  </div>
                </div>
                <div className="flex w-full justify-between md:hidden">
                  <Heart
                    onClick={(e) => {
                      e.stopPropagation();
                      addWishlistItem(
                        user?.id as unknown as string,
                        product.id as unknown as string
                      );
                    }}
                    className={`w-8 h-8  ${
                      IsWishlist(product.id) && "fill-red-500 text-red-500"
                    }  cursor-pointer hover:text-red-500  border rounded-lg bg-white p-1`}
                  />

                  {loadingStates[product.id] ? (
                    <div className="bg-white w-1/2 h-8 border rounded-lg p-1">
                      <GridLoader color="#525fd16c" size={4} className="w-6" />
                    </div>
                  ) : (
                    <ShoppingCart
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCartWithVariants(product);
                      }}
                      className=" h-8 w-1/2 border cursor-pointer hover:text-gray-500 rounded-lg bg-white p-1"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CarouselComp>
    </div>
  );
}

export default Main;
