import { Product } from "../types/globalStateTypes";
import useAddToCart from "./addToCart";
import { useAppSelector } from "../redux";

interface variantDetailsProps {
  colorName: string | null;
  sizeName: string | null;
  VariantStock: number;
}

export default function useAddToCartMain() {
  const user = useAppSelector((state) => state.user.user);
  const { addToCart, loadingStates, setLoadingStates } = useAddToCart();

  const addToCartWithVariants = async (cartItem: Product) => {
    setLoadingStates((prev) => ({
      ...prev,
      [cartItem.id]: true,
    }));

    if (cartItem.variants.length !== 0) {
      const variantDetails: variantDetailsProps[] = cartItem.variants.map(
        (variant) => {
          const color = cartItem.Color.find(
            (color) => color.id === variant.colorId
          );
          const size = cartItem.Size.find((item) => item.id === variant.sizeId);
          return {
            colorName: color ? color.name : null,
            sizeName: size ? size.name : null,
            VariantStock: variant.stock,
          };
        }
      );
      const variantStock = variantDetails.find(
        (item) =>
          (cartItem.selectedColor === item.colorName &&
            cartItem.selectedSize === item.sizeName) ||
          (cartItem.selectedColor === item.colorName &&
            !cartItem.selectedSize) ||
          (cartItem.selectedSize === item.sizeName && !cartItem.selectedColor)
      );

      const product: Product = {
        ...cartItem,
        selectedColor:
          cartItem.selectedColor || variantDetails[0].colorName || null,
        selectedSize:
          cartItem.selectedSize || variantDetails[0].sizeName || null,
        VariantStock:
          variantStock?.VariantStock ||
          variantDetails[0].VariantStock ||
          cartItem.stock,
      };

      if (product) {
        await addToCart(user?.id as unknown as string, product, 1);
      }
    } else {
      addToCart(user?.id as unknown as string, cartItem, 1);
    }
    setLoadingStates((prev) => ({
      ...prev,
      [cartItem.id]: false,
    }));
  };
  return { addToCartWithVariants, loadingStates };
}
