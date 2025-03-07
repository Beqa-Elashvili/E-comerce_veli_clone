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
  const { addToCart } = useAddToCart();

  const addToCartWithVariants = async (cartItem: Product) => {
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
      const product: Product = {
        ...cartItem,
        selectedColor: variantDetails[0].colorName,
        selectedSize: variantDetails[0].sizeName,
        VariantStock: variantDetails[0].VariantStock,
      };

      if (product) {
        await addToCart(user?.id as unknown as string, product, 1);
      }
    } else {
      addToCart(user?.id as unknown as string, cartItem, 1);
    }
  };
  return { addToCartWithVariants };
}
