import { useSession } from "next-auth/react";
import { useAppSelector } from "../redux";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useGetWishlistItems from "./getWislistItems";

export default function useAddinWinshilst() {
  const router = useRouter();
  const { getWishlistItems } = useGetWishlistItems();
  const { status } = useSession();

  const addWishlistItem = async (userId: string, productId: string) => {
    try {
      if (status === "unauthenticated") {
        router.push("/authentification");
        return;
      }
      const resp = await axios.post("/api/wishlist", {
        userId,
        productId,
      });
      if (resp.data.error) {
        toast.warn("პროდუქტი უკვე არსებობს სურვილების სიაში", {
          position: "bottom-right",
        });
      } else {
        toast.success("პროდუქტი დაემატა სურვილების სიაში", {
          position: "bottom-right",
        });
      }
      await getWishlistItems();
    } catch (error) {
      toast.dismiss();
      toast.error("პროდუქტის დამატება სურვილების სიაში ვერ განხორციელდა");
    }
  };
  return { addWishlistItem };
}
