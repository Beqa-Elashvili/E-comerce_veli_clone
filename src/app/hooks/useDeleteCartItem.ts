import axios from "axios";
import useGetCartItems from "./getCartItems";
import { useAppSelector, useAppDispatch } from "../redux";
import { Product } from "../types/globalStateTypes";
import { setIsCartItemUnauthentificated } from "@/redux/globalSlice";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

export default function useDeleteCartItem() {
  const { status } = useSession();
  const dispatch = useAppDispatch();
  const { GetCart } = useGetCartItems();
  const cart = useAppSelector(
    (state) => state.global.isCartItemUnauthentificated
  );

  const handleRemoveItem = (cartItem: Product, decrease: boolean) => {
    const storedCart = localStorage.getItem("cart");
    const data = storedCart ? JSON.parse(storedCart) : [];
    if (decrease) {
      const itemIndex = data.findIndex(
        (item: Product) =>
          item.id === cartItem.id &&
          item.selectedColor === cartItem.selectedColor &&
          item.selectedSize === cartItem.selectedSize
      );
      if (itemIndex !== -1) {
        if (data[itemIndex].quantity > 1) {
          data[itemIndex].quantity -= 1;
        } else {
          data.splice(itemIndex, 1);
        }

        localStorage.setItem("cart", JSON.stringify(data));
        dispatch(setIsCartItemUnauthentificated(data));
      }
    } else {
      const indexToRemove = data.findIndex(
        (item: Product) =>
          item.id === cartItem.id &&
          item.selectedColor === cartItem.selectedColor &&
          item.selectedSize === cartItem.selectedSize
      );

      if (indexToRemove !== -1) {
        data.splice(indexToRemove, 1);
        localStorage.setItem("cart", JSON.stringify(data));
      }
      dispatch(setIsCartItemUnauthentificated(data));
    }
  };

  async function deleteCartItem(cartItem: Product, decrease: boolean) {
    try {
      if (status === "unauthenticated") {
        handleRemoveItem(cartItem, decrease);
        return;
      }
      if (decrease) {
        await axios.delete("/api/cart", {
          data: {
            productId: cartItem.productId,
            selectedSize: cartItem.selectedSize,
            selectedColor: cartItem.selectedColor,
            decrease: true,
          },
        });
        await GetCart();
        return;
      }
      await axios.delete("/api/cart", {
        data: {
          productId: cartItem.productId,
          selectedSize: cartItem.selectedSize,
          selectedColor: cartItem.selectedColor,
        },
      });
      await GetCart();
    } catch (error: unknown) {
      toast.dismiss();
      toast.error("დაფიქსირდა შეცდომა");
    }
  }
  return { deleteCartItem };
}
