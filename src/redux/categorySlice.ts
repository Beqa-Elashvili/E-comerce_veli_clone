import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Category, Item } from "@/app/types/globalStateTypes";

export interface initialStateTypes {
  Categories: Category[] | null;
  categoryChildren: Item[] | null;
  isAllCategories: boolean;
}

const initialState: initialStateTypes = {
  Categories: null,
  categoryChildren: null,
  isAllCategories: false,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[] | null>) => {
      state.Categories = action.payload;
    },

    setIsAllCategories: (state, action: PayloadAction<boolean>) => {
      state.isAllCategories = action.payload;
    },
    setCategoryChildren: (state, action: PayloadAction<Item[] | null>) => {
      state.categoryChildren = action.payload;
    },
  },
});

export const { setCategories, setIsAllCategories, setCategoryChildren } =
  categorySlice.actions;

export default categorySlice.reducer;
