import { Product } from "../types/globalStateTypes";
import { useAppDispatch } from "../redux";
import { setIsCartItemUnauthentificated } from "@/redux/globalSlice";
import { toast } from "react-toastify";

export default function addToCartUnauthenticated(
  product: Product,
  quantity: number,
  dispatch: ReturnType<typeof useAppDispatch>
) {
  let cart: Product[] = [];
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cart = JSON.parse(storedCart);
  }

  const existingCartItem = cart.find(
    (item) =>
      item.id === product.id &&
      item.selectedColor === product.selectedColor &&
      item.selectedSize === product.selectedSize
  );

  const currentQuantity = existingCartItem ? existingCartItem.quantity || 0 : 0;
  const totalQuantity = currentQuantity + quantity;

  if (product.VariantStock)
    if (totalQuantity > product.VariantStock) {
      toast.dismiss();
      toast.error(
        `ხელმისაწვდომია ${
          product.VariantStock ? product.VariantStock : product.stock
        } ერთეული`,
        {
          position: "bottom-right",
        }
      );
      return;
    }

  if (existingCartItem) {
    existingCartItem.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  dispatch(setIsCartItemUnauthentificated(cart));
  toast.dismiss();
  toast.success("პროდუქტი წარმატებით დაემატა კალათაში", {
    position: "bottom-right",
  });
}
