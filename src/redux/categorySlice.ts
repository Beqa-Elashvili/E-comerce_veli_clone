import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Category } from "@/app/types/globalStateTypes";

export interface initialStateTypes {
  Categories: Category[] | null;
  isAllCategories: boolean;
}

const initialState: initialStateTypes = {
  Categories: null,
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
  },
});

export const { setCategories, setIsAllCategories } = categorySlice.actions;

export default categorySlice.reducer;
