import { useAppSelector } from "../redux";

export default function useGetIsWishlist() {
  const wishlist = useAppSelector((state) => state.global.isWishlist);
  const IsWishlist = (id: number) => {
    return wishlist?.some((item) => item.productId === id) || false;
  };
  return { IsWishlist };
}
