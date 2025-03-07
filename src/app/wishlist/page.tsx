"use client";

import React from "react";
import { useAppSelector } from "../redux";
import { Product } from "../types/globalStateTypes";
import axios from "axios";
import { toast } from "react-toastify";
import useGetWishlistItems from "../hooks/getWislistItems";

function WishlistPage() {
  const wishlist = useAppSelector((state) => state.global.isWishlist);

  const { getWishlistItems } = useGetWishlistItems();
  const handleDeleteWishlistItem = async (productId: number) => {
    try {
      await axios.delete("/api/wishlist", {
        data: { productId },
      });
      await getWishlistItems();
    } catch (error: unknown) {
      toast.error("something get wrong while delete wishlist item");
    }
  };

  return (
    <div className="flex justify-center p-12">
      {(!wishlist || wishlist?.length === 0) && (
        <h1 className="text-gray-500 text-6xl">სურვილების სია ცარიელია</h1>
      )}
      <div className="grid grid-cols-4 items-center justify-between gap-2">
        {wishlist?.map((item: Product) => (
          <div
            className="ring-1 p-2 rounded-lg"
            onClick={() => handleDeleteWishlistItem(item.id)}
            key={item.id}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WishlistPage;
