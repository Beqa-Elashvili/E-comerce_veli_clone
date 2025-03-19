"use client";
import { useAppSelector } from "@/app/redux";
import React, { use, useEffect, useState } from "react";
import { UserRound, Package, Heart, MapPin, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import axios from "axios";
import { Order, Product, ShippingAddress } from "@/app/types/globalStateTypes";

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
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const handleParams = async (par: string) => {
    if (par === "addresses") {
      const resp = await axios.get("/api/shippingaddress");
      setSippingAddress(resp.data);
    }
    if (par === "wishlist") {
      const resp = await axios.get("/api/wishlist");
      setWishlist(resp.data.wishlistProducts);
    } else if (par === "orders") {
      try {
        const resp = await axios.get("/api/orders");
        console.log(resp);
        setOrders(resp.data.orders);
      } catch (error) {
        console.log(error);
      }
    }
  };
  useEffect(() => {
    handleParams(name);
  }, [name]);

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
            <>ცარიელია</>
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
                    <h1 className="text-2xl">
                      <Heart className="fill-red-500 text-red-500" />
                    </h1>
                  </div>
                  <hr />
                </div>
              ))}
            </div>
          ) : (
            <>ცარიელია</>
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
                    <h1 className="text-sm">status:{item.status}</h1>
                  </div>
                  <hr />
                </div>
              ))}
            </div>
          ) : (
            <>ცარიელია</>
          )}
        </div>
      );
    }
  };
  return (
    <div className="min-h-screen">
      <h1 className="text-2xl flex gap-2 items-center font-semibold">
        <UserRound className="size-10 bg-gray-200 p-2 rounded-full" />
        გამარჯობა, {user?.name?.toUpperCase()}
      </h1>
      <hr className="my-4" />
      <div className="flex gap-12">
        <div className="flex flex-col gap-2">
          <div
            onClick={() => router.push("/profile/orders")}
            className={`flex text-lg w-full mr-12 items-center gap-6 p-4 rounded-xl ${
              name === "orders" && "bg-gray-100 text-gray-500"
            } `}
          >
            <Package />
            <p>შეკვეთები</p>
          </div>
          <hr />
          <div
            onClick={() => router.push("/profile/wishlist")}
            className={`flex text-lg w-full mr-12 items-center gap-6 p-4 rounded-xl ${
              name === "wishlist" && "bg-gray-100 text-gray-500"
            } `}
          >
            <Heart />
            <p>სურვილები</p>
          </div>
          <hr />
          <div
            onClick={() => router.push("/profile/addresses")}
            className={`flex text-lg w-full mr-12 items-center gap-6 p-4 rounded-xl ${
              name === "addresses" && "bg-gray-100 text-gray-500"
            } `}
          >
            <MapPin />
            <p>მისამართები</p>
          </div>
          <hr />
          <div
            onClick={() => signOut()}
            className="flex text-lg w-full mr-12 items-center gap-6 p-4 rounded-xl"
          >
            <LogOut />
            <p>გამოსვლა</p>
          </div>
          <hr />
        </div>
        <div className="w-full">{handleName()}</div>
      </div>
    </div>
  );
}

export default page;
