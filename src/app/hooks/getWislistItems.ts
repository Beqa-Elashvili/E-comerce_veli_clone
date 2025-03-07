import { setIsWishlist } from "@/redux/globalSlice";
import { useAppDispatch } from "../redux";
import axios from "axios";

export default function useGetWishlistItems() {
  const dispatch = useAppDispatch();

  async function getWishlistItems() {
    try {
      const resp = await axios.get("/api/wishlist");
      dispatch(setIsWishlist(resp.data.wishlistProducts));
    } catch (error: unknown) {
      console.log("something get wrong while fetch wishlist items");
    }
  }
  return { getWishlistItems };
}
