import { Product } from "../types/globalStateTypes";
import { useAppSelector } from "../redux";
import { useSession } from "next-auth/react";

export default function useHandleQuantityIncart() {
  const { status } = useSession();
  const cart = useAppSelector(
    (state) => state.global.isCartItemUnauthentificated
  );
  const handleQuantityIncart = (product: Product) => {
    if (status === "unauthenticated") {
      if (product.selectedColor !== "" || product.selectedSize !== "") {
        const isCart = cart?.find(
          (item: Product) =>
            item.id === product.id &&
            (item.selectedColor === product.selectedColor ||
              !product.selectedColor) &&
            (item.selectedSize === product.selectedSize ||
              !product.selectedSize)
        );
        return isCart?.quantity || 0;
      } else {
        const isCart = cart?.find(
          (item: Product) => item.id === product.productId
        );
        return isCart?.quantity || 0;
      }
    } else {
      if (product.selectedColor !== 0 || product.selectedSize !== 0) {
        const isCart = cart?.find(
          (item: Product) =>
            item.productId === product.productId &&
            (item.selectedColor === product.selectedColor ||
              !product.selectedColor) &&
            (item.selectedSize === product.selectedSize ||
              !product.selectedSize)
        );
        return isCart?.quantity || 0;
      } else {
        const isCart = cart?.find(
          (item: Product) => item.productId === product.productId
        );
        return isCart?.quantity || 0;
      }
    }
  };
  return { handleQuantityIncart };
}
