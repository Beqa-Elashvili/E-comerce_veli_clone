"use client";

import React, { use, useEffect, useState } from "react";
import { ColorSize, Product } from "@/app/types/globalStateTypes";
import axios from "axios";
import Link from "next/link";
import { Heart, IdCard } from "lucide-react";
import useAddinWinshilst from "@/app/hooks/addWishlistItem";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import useGetIsWishlist from "@/app/actions/getIswishlist";
import { Truck, ShoppingCart } from "lucide-react";
import useAddToCart from "@/app/hooks/addToCart";
import useDeleteCartItem from "@/app/hooks/useDeleteCartItem";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { GridLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import CarouselComp from "@/app/(components)/Carousel/Carousel";
import useAddToCartMain from "@/app/hooks/addToCartMain";
import { setIsAuthModalOpen } from "@/redux/globalSlice";

type ProductIdProps = {
  params: Promise<{
    params: string[];
  }>;
};

function ProductId({ params }: ProductIdProps) {
  const [imgUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const { addWishlistItem } = useAddinWinshilst();
  const { IsWishlist } = useGetIsWishlist();
  const { addToCart, loadingStates, setLoadingStates } = useAddToCart();
  const { deleteCartItem } = useDeleteCartItem();
  const { status } = useSession();
  const [product, setProduct] = useState<Product>();
  const [supportProducts, setSupportProducts] = useState<Product[]>([]);
  const user = useAppSelector((state) => state.user.user);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { params: routeParams } = React.use(params);
  const [id] = routeParams || [];

  const { addToCartWithVariants } = useAddToCartMain();
  const cart = useAppSelector(
    (state) => state.global.isCartItemUnauthentificated
  );

  const [avaliable, setAvalible] = useState({
    selectedColor: "",
    selectedSize: "",
  });

  useEffect(() => {
    async function getProduct() {
      try {
        if (id) {
          const resp = await axios.get(`/api/products?id=${id}`);
          const respCart = await axios.get(
            `/api/categories?name=${resp.data.product.category.name}`
          );
          setSupportProducts(respCart.data.category.Product);
          setProduct(resp.data.product);
          setImageUrl(resp.data.product?.images[0].url);
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    getProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen">..Loading</div>;
  if (!product) return <div>laod product</div>;

  const variantDetails = product.variants.map((variant) => {
    const color = product.Color.find((color) => color.id === variant.colorId);
    const size = product.Size.find((size) => size.id === variant.sizeId);
    return {
      colorName: color ? color.name : null,
      sizeName: size ? size.name : null,
      stock: variant.stock,
    };
  });
  const stock = variantDetails?.find(
    (item) =>
      (item.colorName === avaliable.selectedColor ||
        !avaliable.selectedColor) &&
      (item.sizeName === avaliable.selectedSize || !avaliable.selectedSize)
  );

  const handleQuantityIncart = (id: number) => {
    if (status === "unauthenticated") {
      if (stock) {
        const isCart = cart?.find(
          (item: Product) =>
            item.id === id &&
            (item.selectedColor === stock.colorName || !item.selectedColor) &&
            (item.selectedSize === stock.sizeName || !item.selectedSize)
        );
        return isCart?.quantity || 0;
      } else {
        const isCart = cart?.find((item: Product) => item.id === id);
        return isCart?.quantity || 0;
      }
    } else {
      if (stock) {
        const isCart = cart?.find(
          (item: Product) =>
            item.productId === id &&
            (item.selectedColor === stock.colorName || !item.selectedColor) &&
            (item.selectedSize === stock.sizeName || !item.selectedSize)
        );
        return isCart?.quantity || 0;
      } else {
        const isCart = cart?.find((item: Product) => item.productId === id);
        return isCart?.quantity || 0;
      }
    }
  };

  const handleCartItemId = async (id: number) => {
    if (status === "unauthenticated") {
      setLoadingStates((prev) => ({
        ...prev,
        [product.id]: true,
      }));
      if (stock) {
        const isCart = cart?.find(
          (item: Product) =>
            item.id === id &&
            (item.selectedColor === stock.colorName || !item.selectedColor) &&
            (item.selectedSize === stock.sizeName || !item.selectedSize)
        );
        isCart && (await deleteCartItem(isCart, true));
        setLoadingStates((prev) => ({
          ...prev,
          [product.id]: false,
        }));
      } else {
        const isCart = cart?.find((item: Product) => item.id === id);
        isCart && (await deleteCartItem(isCart, true));
        setLoadingStates((prev) => ({
          ...prev,
          [product.id]: false,
        }));
      }
    } else {
      setLoadingStates((prev) => ({
        ...prev,
        [product.id]: true,
      }));
      if (stock) {
        const isCart = cart?.find(
          (item: Product) =>
            item.productId === id &&
            (item.selectedColor === stock.colorName || !item.selectedColor) &&
            (item.selectedSize === stock.sizeName || !item.selectedSize)
        );
        isCart && (await deleteCartItem(isCart, true));
        setLoadingStates((prev) => ({
          ...prev,
          [product.id]: false,
        }));
      } else {
        const isCart = cart?.find((item: Product) => item.productId === id);
        isCart && (await deleteCartItem(isCart, true));
        setLoadingStates((prev) => ({
          ...prev,
          [product.id]: false,
        }));
      }
    }
  };

  const variant = variantDetails.find(
    (v) =>
      (v.colorName?.toLowerCase() === avaliable.selectedColor.toLowerCase() ||
        !v.colorName) &&
      (v.sizeName?.toLowerCase() === avaliable.selectedSize.toLowerCase() ||
        !v.sizeName)
  );
  const isVariantAvailable = (desiredQuantity: number = 1): boolean => {
    return !!variant && variant.stock >= desiredQuantity;
  };

  const handleAvalibilitiesValue = (updates: Partial<typeof avaliable>) => {
    setAvalible((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleAddToCart = () => {
    if (product.Color.length !== 0 || product.Size.length !== 0) {
      if (
        (product.Color.length !== 0 && !avaliable.selectedColor) ||
        (product.Size.length !== 0 && !avaliable.selectedSize)
      ) {
        toast.warning("გთხოვთ აირჩიოთ ზომა და ფერი სანამ დაამატებთ კალათაში");
        return;
      }

      if (!isVariantAvailable(1)) {
        toast.dismiss();
        toast.error("ამ ფერის ან ზომის პროდუქტი აღარ არის მარაგში");
        return;
      }

      const selectedVariant = variantDetails.find(
        (v) =>
          (v.colorName?.toLowerCase() ===
            avaliable.selectedColor.toLowerCase() ||
            !v.colorName) &&
          (v.sizeName?.toLowerCase() === avaliable.selectedSize.toLowerCase() ||
            !v.sizeName)
      );

      if (selectedVariant) {
        const productWithVariant = {
          ...product,
          selectedColor: avaliable.selectedColor,
          selectedSize: avaliable.selectedSize,
          VariantStock: selectedVariant.stock,
        };
        addToCart(user?.id as unknown as string, productWithVariant, 1);
      }
    } else {
      addToCart(user?.id as unknown as string, product, 1);
    }
  };

  const buy = () => {
    if (status === "authenticated") {
      if (cart?.length === 0) {
        handleAddToCart();
      }
      router.push("/chackout");
    } else {
      dispatch(setIsAuthModalOpen(true));
    }
  };

  const handleIsCart = (id: number) => {
    return (
      cart?.some((item: Product) =>
        status === "authenticated" ? item.productId === id : item.id === id
      ) || false
    );
  };

  return (
    <div className="w-full pb-12">
      <div className="w-full flex justify-end">
        <div
          onClick={() =>
            addWishlistItem(
              user?.id as unknown as string,
              product.id as unknown as string
            )
          }
          className="ring-1 inline-flex justify-end mt-2 md:mt-0 hover:ring-2 transition hover:text-sky-800 cursor-pointer duration-300  p-2 rounded-lg  gap-2 ring-sky-700"
        >
          <Heart
            className={`${
              IsWishlist(product?.id) ? "fill-red-500 text-red-500" : ""
            }`}
          />
          <p>
            {IsWishlist(product.id)
              ? "პროდუქტი დამატებულია სურვილების სიაში"
              : "დაამატე სურვილების სიაში"}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center w-full py-8">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <h1>ID: {product.id}</h1>
      </div>
      <div className="md:flex justify-between gap-12">
        <div className="block md:flex w-full gap-10">
          <div className="block md:flex items-start w-full">
            <div className="flex md:flex-col w-full min-w-14 gap-4">
              {product?.images.map((item) => (
                <img
                  className={`h-14 w-14 object-contain ${
                    imgUrl === item.url && "ring-4"
                  } ring-1 p-1 rounded-lg`}
                  onClick={() => setImageUrl(item.url)}
                  key={item.id}
                  src={item.url}
                  alt="product-Image"
                />
              ))}
            </div>
            {imgUrl && (
              <img
                className="min-w-80 rounded-xl ml-2 mt-2 md:mt-0 object-cover"
                src={imgUrl}
                alt="image"
              />
            )}
          </div>
          <div className="flex flex-col w-full gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              {product.name}
            </h1>
            <hr />
            <h2 className="text-sky-700 flex gap-2">
              კატეგორია
              <Link
                className="hover:underline-offset-8 hover:underline"
                href={`/category/${product.categoryId}/${product.category.name}`}
              >
                {product.category.name}
              </Link>
            </h2>
            <hr />
            <div>
              {(product.variants.length > 0 && !stock) ||
              (product.stock && product.stock === 0) ? (
                <h1 className="text-red-500">მარაგი ამოიწურა</h1>
              ) : (
                <h1 className="text-sky-700">მარაგშია</h1>
              )}
            </div>
            <hr />
            <h1>{product.description}</h1>
            {product.Size.length !== 0 && (
              <>
                <hr />
                <div className="flex gap-4">
                  {product.Size.map((item: ColorSize) => (
                    <div
                      onClick={() =>
                        handleAvalibilitiesValue({ selectedSize: item.name })
                      }
                      className={`ring-1 ${
                        avaliable.selectedSize === item.name ? "ring-4" : ""
                      }  w-10 h-10 flex items-center hover:ring-2 transition duration-300 hover:bg-sky-100 cursor-pointer justify-center rounded-lg`}
                      key={item.id}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </>
            )}
            {product.Color.length !== 0 && (
              <div className="flex gap-4">
                {product.Color.map((item: ColorSize) => (
                  <div
                    onClick={() =>
                      handleAvalibilitiesValue({ selectedColor: item.name })
                    }
                    className={`ring-1 ${
                      avaliable.selectedColor === item.name ? "ring-4" : ""
                    }  min-w-10 h-10 px-2 flex items-center hover:ring-2 transition duration-300 hover:bg-sky-100 cursor-pointer justify-center rounded-lg`}
                    key={item.id}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
            {variantDetails.length !== 0 && (
              <div className="flex flex-col flex-wrap gap-2">
                <hr />

                <h1>ვარიანტები</h1>
                <div className="flex gap-2">
                  {variantDetails.map((item, index) => (
                    <div key={index}>
                      <div className="ring-1 p-2 min-w-20 inline-flex items-center justify-center rounded-lg md:gap-2">
                        {item.colorName && <div>{item.colorName}</div>}
                        {item.sizeName && <div>{item.sizeName}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <hr className="block mt-5 md:hidden" />

        <div className="my-4 md:my-0 md:shadow-custom-light p-4 rounded-lg flex flex-col gap-2 min-w-80">
          <h1 className="flex gap-2  font-semibold text-3xl">
            {product.price} ₾
          </h1>
          <p className="text-sm font-semibold flex gap-2">
            <Truck />
            უფასო მიწოდება თბილისში
          </p>
          <hr />
          <p className="flex items-center gap-2">
            გადაიხადე
            <img
              className="h-10 object-contaion"
              src="/Credit-Card-Icons.png"
              alt="credit-cards"
            />
          </p>
          <hr />
          <h1 className="flex gap-2">
            მარაგშია
            <p className="font-semibold">
              {product.variants.length > 0 && !stock && 0}
              {stock ? stock.stock || 0 : product.stock}
            </p>
            ცალი
          </h1>
          <hr />
          {cart?.length !== 0 && (
            <div className="flex items-center justify-center gap-4">
              <div
                onClick={handleAddToCart}
                className="h-8 w-8 cursor-pointer hover:bg-gray-200 rounded-full border flex items-center justify-center"
              >
                +
              </div>
              {loadingStates[product.id] ? (
                <>
                  <GridLoader color="#525fd16c" size={4} className="w-6" />
                </>
              ) : (
                <h1>{handleQuantityIncart(product.id)}</h1>
              )}
              <div
                onClick={() => handleCartItemId(product.id)}
                className="h-8 w-8 cursor-pointer hover:bg-gray-200 rounded-full border flex items-center justify-center"
              >
                -
              </div>
            </div>
          )}
          <button
            onClick={handleAddToCart}
            className="flex p-4 mt-8 gap-4 bg-green-600 font-semibold text-white tracking-wider hover:shadow-inner items-center justify-center ring-1 rounded-lg"
          >
            <ShoppingCart />
            კალათაში დამატება
          </button>
          <button
            onClick={() => buy()}
            className="flex p-4 mt-2 gap-4 bg-black font-semibold text-white tracking-wider hover:shadow-inner items-center justify-center ring-1 rounded-lg"
          >
            ყიდვა
          </button>
        </div>
      </div>
      <div
        className={`${
          supportProducts && supportProducts.length !== 0 ? "block" : "hidden"
        } my-2 `}
      >
        <h1 className="py-2 text-2xl font-semibold">
          მასთან ერთად გამოგადგება
        </h1>
        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          {supportProducts?.map((product: Product) => {
            const isCart = handleIsCart(product.id);
            return (
              <div key={product.id} className="px-2 min-w-40 md:px-4">
                <div
                  onClick={() => router.push(`/productId/${product.id}`)}
                  className="rounded-lg h-[240px] md:h-[300px] md:hover:bg-gray-100 relative text-center overflow-hidden cursor-pointer max-w-52"
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
                      <ShoppingCart
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCartWithVariants(product);
                        }}
                        className="w-8 h-8 border cursor-pointer hover:text-gray-500 rounded-lg bg-white p-1"
                      />
                    </div>
                  </div>
                  <div className="md:hover:bg-gray-100 p-2 overflow-hidden rounded-lg">
                    <p className="text-balance py-2 text-sm font-semibold text-gray-900">
                      {product.name}
                    </p>
                    <img
                      className="h-20 md:h-40 m-auto object-cover"
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
                      <p className="text-sm h-10 mt-2">
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
                    <ShoppingCart
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCartWithVariants(product);
                      }}
                      className=" h-8 w-1/2 border cursor-pointer hover:text-gray-500 rounded-lg bg-white p-1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProductId;
