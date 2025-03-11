import addToCartUnauthenticated from "./addToCartUnauthenticated";
import { useAppDispatch, useAppSelector } from "../redux";
import { Product } from "../types/globalStateTypes";
import axios from "axios";
import useGetCartItems from "./getCartItems";
import { toast } from "react-toastify";
import { useState } from "react";

export default function useAddToCart() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const { GetCart } = useGetCartItems();

  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  async function addToCart(
    userId: string,
    cartItem: Product,
    quantity: number
  ) {
    console.log(cartItem)
    try {
      setLoadingStates((prev) => ({
        ...prev,
        [cartItem.id]: true,
      }));
      if (user) {
        const product = {
          productId: cartItem.id,
          quantity: quantity,
          selectedColor: cartItem.selectedColor,
          selectedSize: cartItem.selectedSize,
        };
        const { data } = await axios.post("/api/cart", {
          userId,
          product,
        });

        toast.dismiss();
        toast.success("პროდუქტი დაემატა კალათაში", {
          position: "bottom-right",
        });
        await GetCart();
        return data;
      } else {
        addToCartUnauthenticated(cartItem, 1, dispatch);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(
        `ხელმისაწვდომია ${
          cartItem.VariantStock ? cartItem.VariantStock : cartItem.stock
        } ერთეული`
      );
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [cartItem.id]: false,
      }));
    }
  }
  return { addToCart, loadingStates, setLoadingStates };
}
