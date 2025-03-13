import { useAppDispatch, useAppSelector } from "@/app/redux";
import React from "react";
import { Category } from "@/app/types/globalStateTypes";
import { setIsAllCategories } from "@/redux/categorySlice";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

function AllCategories() {
  const router = useRouter();
  const categories = useAppSelector((state) => state.categories.Categories);
  const dipatch = useAppDispatch();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold h-full">ყველა კატეგორია</h1>
        <div
          onClick={() => dipatch(setIsAllCategories(false))}
          className="bg-gray-200 rounded-full p-1 w-12 h-12 z-30 flex items-center justify-center  overflow-hidden hover:bg-gray-300 cursor-pointer transition duration-300"
        >
          <X className="size-5" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 justify-between h-full w-full">
        {categories?.map((item: Category) => (
          <div
            key={item.id}
            onClick={() => {
              router.push(`/category/${item.name}`);
              const timeout = setTimeout(() => {
                dipatch(setIsAllCategories(false));
              }, 300);
              return () => clearTimeout(timeout);
            }}
          >
            <div className="bg-gray-200 relative cursor-pointer h-full hover:bg-gray-300 overflow-hidden rounded-lg">
              <h2 className="px-2 flex items-center text-balance py-8  tracking-wider">
                {item.name}
              </h2>
              <img
                className="h-40 object-contain absolute -right-14 -bottom-16"
                src={item.imageUrl}
                alt="image"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllCategories;
