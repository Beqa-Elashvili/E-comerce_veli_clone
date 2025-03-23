"use client";
import { useAppSelector } from "@/app/redux";
import React, { use, useEffect, useState } from "react";
import {
  UserRound,
  Package,
  Heart,
  MapPin,
  LogOut,
  Settings,
  MoveLeftIcon,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import axios from "axios";
import useGetWishlistItems from "@/app/hooks/getWislistItems";
import { Order, ShippingAddress } from "@/app/types/globalStateTypes";

type ProfileProps = {
  params: Promise<{
    params: string[];
  }>;
};
function page({ params }: ProfileProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);
  const { params: routeParams } = use(params);
  const [name] = routeParams || [];
  const [shippingAddress, setSippingAddress] = useState<ShippingAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { getWishlistItems } = useGetWishlistItems();
  const wishlist = useAppSelector((state) => state.global.isWishlist);
  const handleParams = async (par: string) => {
    if (par === "addresses") {
      const resp = await axios.get("/api/shippingaddress");
      setSippingAddress(resp.data);
    } else if (par === "orders") {
      const resp = await axios.get("/api/orders");
      setOrders(resp.data.orders);
    }
  };
  useEffect(() => {
    handleParams(name);
  }, [name]);

  const deleteWishlistItem = async (id: number) => {
    try {
      await axios.delete("/api/wishlist", {
        data: {
          productId: id,
        },
      });
      await getWishlistItems();
    } catch (error) {
      console.log(error);
    }
  };
  const deleteOrder = async (id: number) => {
    try {
      await axios.delete("/api/orders", {
        data: {
          orderId: id,
        },
      });
      await handleParams(name);
      console.log("delete succesfuly");
    } catch (error) {
      console.log(error);
    }
  };

  const SignOut = () => {
    signOut();
    router.push("/");
  };

  const handleName = () => {
    if (name === "addresses") {
      return (
        <>
          {shippingAddress && shippingAddress.length !== 0 ? (
            <div className="w-full flex flex-col gap-4">
              <h1 className="text-2xl font-semibold">მისამართები</h1>
              {shippingAddress.map((item) => (
                <div
                  className="flex justify-between border p-2 rounded-lg items-center w-full"
                  key={item.id}
                >
                  <div className="flex items-center gap-4">
                    <MapPin className="bg-gray-400 p-2 size-12 rounded-lg" />
                    <div>
                      <h1 className="font-semibold">{item.address}</h1>
                      <p className="text-gray-600">{item.city}</p>
                    </div>
                  </div>
                  <h1 className="text-2xl">{">"}</h1>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center flex-col gap-6 justify-center">
              <MapPin className="size-18" />
              <p className="text-xl font-semibold">მისამართების სია ცარიელია</p>
            </div>
          )}
        </>
      );
    } else if (name === "wishlist") {
      return (
        <div>
          {wishlist && wishlist.length !== 0 ? (
            <div className="w-full flex flex-col gap-4">
              <h1 className="text-2xl font-semibold">სურვილები</h1>
              {wishlist.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between p-2 items-center w-full">
                    <div className="flex items-center gap-4">
                      <img
                        className="size-14"
                        src={item.images[0].url}
                        alt="image"
                      />
                      <div>
                        <div>
                          <h1 className="text-sm font-semiboold">
                            {item.name}
                          </h1>
                          <p className="font-semibold">{item.price} ₾</p>
                        </div>
                        <button
                          onClick={() =>
                            router.push(`/productId/${item.productId}`)
                          }
                          className="p-2 rounded-lg mt-2 text-black bg-green-300 font-semibold"
                        >
                          ნახვა
                        </button>
                      </div>
                    </div>
                    <h1
                      onClick={() => deleteWishlistItem(item.id)}
                      className="text-2xl"
                    >
                      <Heart className="fill-red-500 text-red-500" />
                    </h1>
                  </div>
                  <hr />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center flex-col gap-6 justify-center">
              <h1 className="text-2xl font-semibold">სურვილები</h1>
              <p className="text-xl font-semibold">სურვილების სია ცარიელია</p>
              <p className="text-sm  items-center gap-2  text-center justify-center">
                <Heart className="text-center w-full" />
                დააჭირე ნიშანს სასურველ პროდუქტზე და შეინახე სურვილების სიაში.
              </p>
              <button
                onClick={() => router.push("/")}
                className="bg-black text-white font-semibold rounded-lg p-4 "
              >
                დაამატე პროდუტები
              </button>
            </div>
          )}
        </div>
      );
    } else if (name === "orders") {
      return (
        <div>
          {orders && orders.length !== 0 ? (
            <div className="w-full flex flex-col gap-4">
              <h1 className="text-2xl font-semibold">შეკვეთები</h1>
              {orders.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between p-2 items-center w-full">
                    <div className="flex items-center gap-4">
                      <div>
                        <div>
                          <h1 className="text-sm font-semiboold">
                            id: {item.orderNumber}
                          </h1>
                          <div className="font-semibold flex gap-2">
                            <p className="text-sm">სულ გადახდილი:</p>
                            {item.totalAmount} ₾
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => deleteOrder(item.id)}
                        className="border text-white bg-red-500 w-full rounded-lg"
                      >
                        წაშლა
                      </button>
                      <h1 className="text-sm">status:{item.status}</h1>
                    </div>
                  </div>
                  <hr />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 p-4 w-full rounded-xl flex justify-between items-center">
              <img
                className="h-40 object-contain"
                src="/empty-box.webp"
                alt="emtpyBox"
              />
              <div className="space-y-4">
                <h1 className="text-xl font-semibold">
                  აქტიური შეკვეთა არ იძებნება
                </h1>
                <p className="text-gray-5000">
                  როგორც ჩანს, ჯერ არაფერი შეგიკვეთავს.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-black text-white p-2 rounded-xl"
                >
                  დაიწყე სერფინგი
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    if (name === "settings") {
      return (
        <>
          <h1 className="text-2xl font-semibold">პარამეტრები</h1>
          <div className="flex mt-6 flex-col font-semibold gap-6">
            <div className="space-y-2">
              <p>მეილი</p>
              <p>{user?.email}</p>
            </div>
            <hr />
            <div className="space-y-2">
              <p>სახელი, გვარი</p>
              <p>{user?.name}</p>
            </div>
            <hr />
            <div className="space-y-2">
              <p>მობილურის ნომერი</p>
              <p>{user?.phoneNumber}</p>
            </div>
          </div>
        </>
      );
    }
  };
  return (
    <div className="min-h-screen pb-6">
      <div
        className={`${name === "name" && "hidden"}
         flex md:hidden justify-between w-full items-center`}
      >
        <ChevronLeft onClick={() => router.back()} className="cursor-pointer" />
        <h1 className="text-xl font-semibold">{name}</h1>
      </div>
      <h1
        className={`${
          name === "wishlist" ||
          name === "addresses" ||
          name === "orders" ||
          name === "settings"
            ? "hidden md:flex"
            : "flex"
        }  text-2xl flex gap-2 items-center font-semibold`}
      >
        <UserRound className="size-10 bg-gray-200 p-2 rounded-full" />
        გამარჯობა, {user?.name?.toUpperCase()}
      </h1>

      <hr className="my-4" />
      <div className="md:flex gap-12">
        <div
          className={`${
            name === "wishlist" ||
            name === "addresses" ||
            name === "orders" ||
            name === "orders" ||
            name === "settings"
              ? "hidden md:flex"
              : "flex"
          }  flex flex-col gap-2`}
        >
          <div
            onClick={() => router.push("/profile/orders")}
            className={`flex  cursor-pointer text-lg w-full mr-12 items-center gap-6 p-4 rounded-xl ${
              name === "orders" && "bg-gray-100 text-gray-500"
            } `}
          >
            <Package />
            <p>შეკვეთები</p>
          </div>
          <hr />
          <div
            onClick={() => router.push("/profile/wishlist")}
            className={`flex cursor-pointer text-lg w-full mr-12 items-center gap-6 p-4 rounded-xl ${
              name === "wishlist" && "bg-gray-100 text-gray-500"
            } `}
          >
            <Heart />
            <p>სურვილები</p>
          </div>
          <hr />
          <div
            onClick={() => router.push("/profile/addresses")}
            className={`flex cursor-pointer text-lg w-full mr-12 items-center gap-6 p-4 rounded-xl ${
              name === "addresses" && "bg-gray-100 text-gray-500"
            } `}
          >
            <MapPin />
            <p>მისამართები</p>
          </div>
          <hr />
          <div
            onClick={() => router.push("/profile/settings")}
            className={`flex cursor-pointer text-lg w-full mr-12 items-center gap-6 p-4 rounded-xl ${
              name === "settings" && "bg-gray-100 text-gray-500"
            } `}
          >
            <Settings />
            <p>პარამეტრები</p>
          </div>
          <hr />
          <div
            onClick={() => SignOut()}
            className="flex text-lg cursor-pointer w-full mr-12 items-center gap-6 p-4 rounded-xl"
          >
            <LogOut />
            <p>გამოსვლა</p>
          </div>
          <hr />
        </div>
        <div className="w-full mt-6 md:mt-0">{handleName()}</div>
      </div>
    </div>
  );
}

export default page;
