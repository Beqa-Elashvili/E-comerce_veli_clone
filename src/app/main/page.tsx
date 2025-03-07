import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/app/redux";
import { Category, Product } from "@/app/types/globalStateTypes";
import { Heart, ShoppingCart } from "lucide-react";
import useAddinWinshilst from "../hooks/addWishlistItem";
import { useRouter } from "next/navigation";
import useGetIsWishlist from "../actions/getIswishlist";
import useAddToCartMain from "../hooks/addToCartMain";
import axios from "axios";
import { useSession } from "next-auth/react";
import CarouselComp from "../(components)/Carousel/Carousel";

function Main() {
  const router = useRouter();
  const categories = useAppSelector((state) => state.categories.Categories);
  const { addWishlistItem } = useAddinWinshilst();
  const { IsWishlist } = useGetIsWishlist();
  const [products, setProducts] = useState<Product[]>([]);

  const { addToCartWithVariants } = useAddToCartMain();
  const user = useAppSelector((state) => state.user.user);
  const { status } = useSession();
  const [manClothes, setManClothes] = useState<childrenCategory>();

  type childrenCategory = {
    Product: Product[];
    children: Category;
    id: number;
    imageUrl: string[];
    name: string;
    parentId: number;
  };

  useEffect(() => {
    async function getProducts() {
      const resp = await axios.get("/api/products");
      setProducts(resp.data.products);
      const categoryResp = await axios.get(
        "/api/categories?name=მამაკაცის ტანსაცმელი"
      );
      setManClothes(categoryResp.data.category);
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
      <img className="rounded-lg" src="/cover.png" alt="cover-img" />
      <CarouselComp>
        {categories?.map((item: Category) => (
          <div
            key={item.id}
            onClick={() => router.push(`/category/${item.name}`)}
            className="px-2  text-center h-full overflow-hidden max-w-52"
          >
            <div className="bg-gray-200  cursor-pointer hover:bg-gray-300 overflow-hidden rounded-lg">
              <h2 className="px-2 text-balance h-20 py-6 font-semibold tracking-wider">
                {item.name}
              </h2>
              <img
                className="h-40 object-cover"
                src={item.imageUrl}
                alt="image"
              />
            </div>
          </div>
        ))}
      </CarouselComp>
      <img src="/cover2.png" className="rounded-lg" alt="cover-two" />
      <CarouselComp MainTitle="განახლებული კოლექცია">
        {products?.map((product: Product) => {
          const isCart = handleIsCart(product.id);
          return (
            <div key={product.id} className="px-2">
              <div
                onClick={() => router.push(`/productId/${product.id}`)}
                className="rounded-lg hover:bg-gray-100 relative text-center h-full overflow-hidden cursor-pointer max-w-52"
              >
                <div className="absolute inset-0  opacity-0 flex  gap-2 hover:opacity-100 items-center justify-end transition  duration-500 hover:-translate-x-5 ">
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
                    <ShoppingCart
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCartWithVariants(product);
                      }}
                      className="w-8 h-8 border cursor-pointer hover:text-gray-500 rounded-lg bg-white p-1"
                    />
                  </div>
                </div>
                <div className="hover:bg-gray-100 p-2 overflow-hidden rounded-lg">
                  <p className="text-balance py-2 text-sm font-semibold text-gray-900">
                    {product.name}
                  </p>
                  <img
                    className="h-40 m-auto object-cover"
                    src={product.images[0].url}
                    alt="image"
                  />
                  {isCart && (
                    <div className="flex gap-2">
                      <ShoppingCart className="text-green-500 fill-green-200" />
                      <p className="text-sm">დამატებულია</p>
                    </div>
                  )}
                  <div className="text-start mt-2">
                    <p className="font-semibold text-sm">
                      ფასი: {product.price} &#8382;
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
      </CarouselComp>
      <CarouselComp
        Cover={
          <div className="bg-sky-400 rounded-lg py-12">
            {manClothes && (
              <h1 className="text-6xl font-semibold text-sky-200">
                {manClothes.name}
              </h1>
            )}
          </div>
        }
      >
        {manClothes?.Product?.map((product: Product) => {
          const isCart = handleIsCart(product.id);
          return (
            <div key={product.id} className="px-2">
              <div
                onClick={() => router.push(`/productId/${product.id}`)}
                className="rounded-lg hover:bg-gray-100 relative text-center h-full overflow-hidden cursor-pointer max-w-52"
              >
                <div className="absolute inset-0  opacity-0 flex  gap-2 hover:opacity-100 items-center justify-end transition  duration-500 hover:-translate-x-5 ">
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
                    <ShoppingCart
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCartWithVariants(product);
                      }}
                      className="w-8 h-8 border cursor-pointer hover:text-gray-500 rounded-lg bg-white p-1"
                    />
                  </div>
                </div>
                <div className="hover:bg-gray-100 p-2 overflow-hidden rounded-lg">
                  <p className="text-balance py-2 text-sm font-semibold text-gray-900">
                    {product.name}
                  </p>
                  <img
                    className="h-40 m-auto object-cover"
                    src={product.images[0].url}
                    alt="image"
                  />
                  {isCart && (
                    <div className="flex gap-2">
                      <ShoppingCart className="text-green-500 fill-green-200" />
                      <p className="text-sm">დამატებულია</p>
                    </div>
                  )}
                  <div className="text-start mt-2">
                    <p className="font-semibold text-sm">
                      ფასი: {product.price} &#8382;
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
      </CarouselComp>
    </div>
  );
}

export default Main;
