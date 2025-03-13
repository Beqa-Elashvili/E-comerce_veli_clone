import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/app/redux";
import { Category, Item, Product } from "@/app/types/globalStateTypes";
import { Heart, ShoppingCart } from "lucide-react";
import useAddinWinshilst from "../hooks/addWishlistItem";
import { useRouter } from "next/navigation";
import useGetIsWishlist from "../actions/getIswishlist";
import useAddToCartMain from "../hooks/addToCartMain";
import axios from "axios";
import { useSession } from "next-auth/react";
import CarouselComp from "../(components)/Carousel/Carousel";
import { TableOfContents, X, Flame } from "lucide-react";

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
  const [categoryChildrens, setcategoryChildrens] = useState<Item[]>([]);

  useEffect(() => {
    const product = axios.get("/api/products");
    const categoryResp = axios.get("/api/categories?name=კაცის ტანსაცმელი");
    const categoryChildren = axios.get("/api/categories?childrens=true");
    async function getProducts() {
      const resp = await Promise.all([product, categoryResp, categoryChildren]);
      setProducts(resp[0].data.products);
      setManClothes(resp[1].data.category);
      setcategoryChildrens(resp[2].data.category);
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

  const [isAllCategories, setIsAllCategories] = useState<boolean>(false);

  const [isSticky, setIsSticky] = useState(false);

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    if (scrollTop > 400) {
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

  return (
    <div className="w-full flex flex-col gap-12 mb-20">
      {isAllCategories ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-semibold h-full">ყველა კატეგორია</h1>
            <X
              onClick={() => setIsAllCategories(false)}
              className="size-10  bg-gray-200 rounded-full p-1 cursor-pointer hover:bg-gray-300 transition duration-300"
            />
          </div>
          <div className="grid grid-cols-4 gap-4 justify-between h-full w-full">
            {categories?.map((item: Category) => (
              <div
                key={item.id}
                onClick={() => router.push(`/category/${item.name}`)}
              >
                <div className="bg-gray-200 relative cursor-pointer h-full hover:bg-gray-300 overflow-hidden rounded-lg">
                  <h2 className="px-2 flex items-center text-balance py-8  tracking-wider">
                    {item.name}
                  </h2>
                  <img
                    className="h-40 object-contain absolute -right-14 -bottom-16"
                    src={item.imageUrl}
                    alt="image"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 pointer-events-none px-4 lg:px-8 xl:px-40">
            <div
              className={`bg-gray-50 z-30 sticky top-20 items-center text-center overflow-hidden w-full gap-2 transition-all duration-500 ease-in-out ${
                isSticky
                  ? "opacity-100 flex pointer-events-auto translate-y-0"
                  : "opacity-0 flex pointer-events-none"
              }`}
            >
              <div
                onClick={() => setIsAllCategories(true)}
                className="bg-black text-white cursor-pointer  flex items-center gap-2 px-2 py-3 rounded-lg"
              >
                <p className="w-36">ყველა კატეგორია</p>
                <TableOfContents />
              </div>
              <div className="relative mb-3 w-full h-full text-center overflow-hidden py-2 px-4 text-white ">
                <CarouselComp>
                  {categories?.map((item: Category) => (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/category/${item.name}`)}
                      className="text-center h-12 max-w-36"
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
          <div className="flex items-center text-center gap-4">
            <div
              onClick={() => setIsAllCategories(true)}
              className="bg-black mt-4 cursor-pointer text-white flex flex-col gap-4 items-center justify-center rounded-lg p-4 h-44 w-40"
            >
              <TableOfContents className="size-10" />
              ყველა კატეგორია
            </div>
            <div className="w-full h-full px-4 overflow-hidden">
              <CarouselComp>
                {categories?.map((item: Category) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/category/${item.name}`)}
                    className="text-center h-44 max-w-36"
                  >
                    <div className="bg-gray-200 relative cursor-pointer h-full hover:bg-gray-300 overflow-hidden rounded-lg">
                      <h2 className="px-2 text-balance h-20 py-6 font-semibold tracking-wider">
                        {item.name}
                      </h2>
                      <img
                        className="h-40 object-contain absolute -right-12 -bottom-12"
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
                <p className="absolute bg-white w-4/6 h-px top-[31px]" />
                <p className="text-5xl font-semibold text-white">
                  მხოლოდ სამი დღით
                </p>
                <p className="absolute bg-white w-4/6 h-px bottom-[10px]" />
              </div>
              <div className="bg-black text-white flex gap-2 px-2 py-1 text-3xl items-center rounded-full">
                <Flame className="text-orange-600 size-8 rounded-full bg-orange-400" />{" "}
                %
              </div>
            </div>
          </div>
          <CarouselComp SlideToShow={3}>
            {categoryChildrens?.map((item: Item) => (
              <div className="px-6" key={item.id}>
                <div
                  onClick={() => router.push(`/category/name/${item.name}`)}
                  className="bg-orange-400 flex flex-col h-40 p-4 rounded-3xl cursor-pointer"
                >
                  <div className="bg-orange-500 text-white  rounded-full flex items-center justify-between p-1">
                    <div className="ml-4">
                      <p className="text-xl">11-12</p>
                      <p className="ml-1">მარტი</p>
                    </div>
                    <div className="bg-black text-white flex gap-2 px-2 py-1 text-3xl items-center rounded-full">
                      <Flame className="text-orange-600 size-8 rounded-full bg-orange-400" />
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
            {products?.map((product: Product) => {
              const isCart = handleIsCart(product.id);
              return (
                <div key={product.id} className="px-2">
                  <div
                    onClick={() => router.push(`/productId/${product.id}`)}
                    className="rounded-lg hover:bg-gray-100 relative text-center h-full overflow-hidden cursor-pointer max-w-52"
                  >
                    <div className="absolute inset-0  opacity-0 flex  gap-2 hover:opacity-100 mt-6 justify-end transition  duration-500 hover:-translate-x-5 ">
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
                            IsWishlist(product.id) &&
                            "fill-red-500 text-red-500"
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
                          ფასი: {product.price} ₾
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
          <img src="/cover3.jpg" alt="image" className="rounded-3xl" />
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
                            IsWishlist(product.id) &&
                            "fill-red-500 text-red-500"
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
                          ფასი: {product.price} ₾;
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
        </>
      )}
    </div>
  );
}

export default Main;
