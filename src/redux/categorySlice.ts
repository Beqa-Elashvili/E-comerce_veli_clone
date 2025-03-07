import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Category } from "@/app/types/globalStateTypes";

export interface initialStateTypes {
  Categories: Category[] | null;
}

const initialState: initialStateTypes = {
  Categories: null,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[] | null>) => {
      state.Categories = action.payload;
    },
  },
});

export const { setCategories } = categorySlice.actions;

export default categorySlice.reducer;
