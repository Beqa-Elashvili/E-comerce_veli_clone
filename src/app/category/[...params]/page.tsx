"use client";

import React, { useEffect, use, useState } from "react";
import axios from "axios";
import { Product, Item } from "@/app/types/globalStateTypes";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import useAddinWinshilst from "@/app/hooks/addWishlistItem";
import { useAppSelector } from "@/app/redux";
import useAddToCartMain from "@/app/hooks/addToCartMain";
import { Frown } from "lucide-react";

type CategorysProps = {
  params: Promise<{
    params: string[];
  }>;
};

function Categorys({ params }: CategorysProps) {
  const { params: routeParams } = use(params);
  const [name, name2] = routeParams || [];
  const [products, setProducts] = useState<Item>();
  const { addWishlistItem } = useAddinWinshilst();
  const { addToCartWithVariants } = useAddToCartMain();

  const wishlist = useAppSelector((state) => state.global.isWishlist);
  const user = useAppSelector((state) => state.user.user);

  const router = useRouter();

  const categoryName = decodeURIComponent(name);
  const categoryName2 = name2 ? decodeURIComponent(name2) : "";

  async function getCategorysProducts() {
    try {
      const resp = await axios.get(
        `/api/categories?name=${encodeURIComponent(
          categoryName
        )}&name2=${encodeURIComponent(categoryName2)}`
      );
      setProducts(resp.data.category);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getCategorysProducts();
  }, []);

  const handleCategoryClick = (itemName: string) => {
    router.push(
      `/category/${encodeURIComponent(categoryName)}/${encodeURIComponent(
        itemName
      )}`
    );
  };

  const productsList =
    products?.children?.flatMap((child) => child.Product) || [];
  const productsListfull =
    products?.children?.flatMap((child) =>
      child?.children?.flatMap((item) => item.Product)
    ) || [];

  return (
    <div className="w-full">
      <div className="flex gap-20">
        <div className="pr-2 border-r-2 h-full min-h-screen">
          <h1 className="font-bold text-2xl mb-4">{products?.name}</h1>
          <div className="flex flex-col gap-6">
            {products?.children.map((item: Item) => (
              <div
                onClick={() => handleCategoryClick(item.name)}
                className=" hover:text-sky-700 text-gray-800 cursor-pointer"
                key={item.id}
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full">
          <div className="grid grid-cols-3 gap-12">
            {products?.children.map((item: Item) => (
              <div
                key={item.id}
                onClick={() => handleCategoryClick(item.name)}
                className="w-full flex bg-gray-200 hover:bg-gray-300 transition duration-300 cursor-pointer rounded-3xl h-20 items-center justify-center"
              >
                <h1 className="text-xl">{item.name}</h1>
              </div>
            ))}
          </div>
          {productsList.length !== 0 ? (
            <div className="grid grid-cols-4 mt-12 pb-4 w-full gap-2 gap-y-4">
              {productsList.map((Product) => (
                <div key={Product.id} className="px-2 z-0 flex justify-center">
                  <div
                    onClick={() => router.push(`/productId/${Product.id}`)}
                    className="rounded-lg p-2 hover:bg-gray-100 relative text-center h-full overflow-hidden cursor-pointer max-w-52"
                  >
                    <div className="absolute inset-0 opacity-0 flex  gap-2 hover:opacity-100 mt-6 justify-end transition  duration-500 hover:-translate-x-5">
                      <div className="flex flex-col items-center gap-2">
                        <Heart
                          onClick={(e) => {
                            e.stopPropagation();
                            addWishlistItem(
                              user?.id as unknown as string,
                              Product.id as unknown as string
                            );
                          }}
                          className={`w-8 h-8  ${
                            wishlist?.find(
                              (item) => item.productId === Product.id
                            ) && "fill-red-500 text-red-500"
                          }  cursor-pointer hover:text-red-500  border rounded-lg bg-white p-1`}
                        />
                        <ShoppingCart
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCartWithVariants(Product);
                          }}
                          className="w-8 h-8 border cursor-pointer hover:text-gray-500 rounded-lg bg-white p-1"
                        />
                      </div>
                    </div>
                    <div className="hover:bg-gray-100 overflow-hidden rounded-lg">
                      <p className="text-balance py-2 font-semibold">
                        {Product.name}
                      </p>
                      <img
                        className="h-40 m-auto object-cover"
                        src={Product.images[0].url}
                        alt="image"
                      />
                      <div className="text-start">
                        <p className="font-semibold">
                          ფასი: {Product.price} &#8382;
                        </p>
                        <p className="text-sm mt-2">
                          {Product.description?.slice(0, 20)}...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {products?.Product.length === 0 &&
                productsListfull.length === 0 && (
                  <div className="w-full flex mt-12 items-center justify-center gap-2">
                    <h1 className="font-semibold text-3xl">
                      პროდუქტები ვერ მოიძებნა
                    </h1>
                    <Frown className="text-yellow-600 size-12 fill-yellow-300" />
                  </div>
                )}
              <div className="grid grid-cols-4 mt-12 pb-4 w-full justify-between gap-2 gap-y-4">
                {name && !name2 && (
                  <>
                    {productsListfull.length !== 0 && (
                      <>
                        {productsListfull.map((product: Product) => {
                          return (
                            <div key={product.id} className="px-2 z-0">
                              <div
                                onClick={() =>
                                  router.push(`/productId/${product.id}`)
                                }
                                className="rounded-lg p-2 hover:bg-gray-100 relative text-center h-full overflow-hidden cursor-pointer max-w-52"
                              >
                                <div className="absolute inset-0 opacity-0 flex  gap-2 hover:opacity-100 items-center justify-end transition  duration-500 hover:-translate-x-5">
                                  <div className="flex flex-col items-center gap-2">
                                    <Heart
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addWishlistItem(
                                          user?.id as unknown as string,
                                          product.id as unknown as string
                                        );
                                      }}
                                      className={`w-8 h-8  ${
                                        wishlist?.find(
                                          (item) =>
                                            item.productId === product.id
                                        ) && "fill-red-500 text-red-500"
                                      }  cursor-pointer hover:text-red-500  border rounded-lg bg-white p-1`}
                                    />
                                    <ShoppingCart
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToCartWithVariants(product);
                                      }}
                                      className="w-8 h-8 border cursor-pointer hover:text-gray-500 rounded-lg bg-white p-1"
                                    />
                                  </div>
                                </div>
                                <div className="hover:bg-gray-100 overflow-hidden rounded-lg">
                                  <p className="text-balance py-2">
                                    {product.name}
                                  </p>
                                  <img
                                    className="h-40 m-auto object-cover"
                                    src={product.images[0].url}
                                    alt="image"
                                  />
                                  <div className="text-start">
                                    <p className="font-semibold">
                                      {product.price} &#8382;
                                    </p>
                                    <p className="text-sm mt-2">
                                      {product.description?.slice(0, 20)}...
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </>
                )}
                {name2 && (
                  <>
                    {products?.Product.map((Product: Product) => {
                      return (
                        <div key={Product.id} className="px-2 z-0">
                          <div
                            onClick={() =>
                              router.push(`/productId/${Product.id}`)
                            }
                            className="rounded-lg p-2 hover:bg-gray-100 relative text-center h-full overflow-hidden cursor-pointer max-w-52"
                          >
                            <div className="absolute inset-0 opacity-0 flex  gap-2 hover:opacity-100 mt-6 justify-end transition  duration-500 hover:-translate-x-5">
                              <div className="flex flex-col items-center gap-2">
                                <Heart
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addWishlistItem(
                                      user?.id as unknown as string,
                                      Product.id as unknown as string
                                    );
                                  }}
                                  className={`w-8 h-8  ${
                                    wishlist?.find(
                                      (item) => item.productId === Product.id
                                    ) && "fill-red-500 text-red-500"
                                  }  cursor-pointer hover:text-red-500  border rounded-lg bg-white p-1`}
                                />
                                <ShoppingCart
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCartWithVariants(Product);
                                  }}
                                  className="w-8 h-8 border cursor-pointer hover:text-gray-500 rounded-lg bg-white p-1"
                                />
                              </div>
                            </div>
                            <div className="hover:bg-gray-100 overflow-hidden rounded-lg">
                              <p className="text-balance py-2 font-semibold">
                                {Product.name}
                              </p>
                              <img
                                className="h-40 m-auto object-cover"
                                src={Product.images[0].url}
                                alt="image"
                              />
                              <div className="text-start">
                                <p className="font-semibold">
                                  ფასი: {Product.price} &#8382;
                                </p>
                                <p className="text-sm mt-2">
                                  {Product.description?.slice(0, 20)}...
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Categorys;
