import React from "react";
import { Home, TextSearch, UserRound, ShoppingCart } from "lucide-react";
import useHandleCartquantity from "@/app/hooks/useHandleCartQuantity";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/redux";
import { setShowResults } from "@/redux/globalSlice";

function MobileFooter() {
  const { handleCartQuantity } = useHandleCartquantity();
  const router = useRouter();
  const dispatch = useAppDispatch();
  return (
    <div className="w-full flex justify-between items-center px-4 lg:px-8 xl:px-40 bg-black text-white p-2">
      <div
        onClick={() => router.push("/")}
        className="relative cursor-pointer flex flex-col rounded-lg overflow-hidden items-center  ring-white transition duration-300"
      >
        <Home className="h-5" />
        <p className="font-semibold text-sm">მთავარი</p>
      </div>
      <div
        onClick={() => dispatch(setShowResults(true))}
        className=" flex-col cursor-pointer group flex rounded-lg overflow-hidden items-center  ring-white transition duration-300"
      >
        <TextSearch className="h-5" />
        <p className="font-semibold text-sm">ძიება</p>
      </div>
      <div
        onClick={() => router.push("/cart")}
        className="cursor-pointer flex flex-col rounded-lg items-center ring-white transition duration-300"
      >
        <div className="relative flex  items-center cursor-pointer w-10 ">
          <ShoppingCart className="h-5" />
          <div className="absolute font-semibold bg-orange-400 text-xs right-1 rounded-full  px-[0.4rem] py-1 flex -top-1 leading-none">
            {handleCartQuantity()}
          </div>
        </div>
        <p className="font-semibold text-sm">კალათა</p>
      </div>
      <div
        onClick={() => {}}
        className=" flex-col cursor-pointer group flex rounded-lg overflow-hidden items-center  ring-white transition duration-300"
      >
        <UserRound className="h-5" />
        <p className="font-semibold text-sm">ჩემი ველი</p>
      </div>
    </div>
  );
}

export default MobileFooter;
