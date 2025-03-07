import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/app/types/globalStateTypes";

export interface initialStateTypes {
  isSideBarCollapsed: boolean;
  isDarkMode: boolean;
  isRegisterForm: boolean;
  isCartItemUnauthentificated: Product[] | null;
  isProducts: Product[] | null;
  isWishlist: Product[] | null;
}

const initialState: initialStateTypes = {
  isSideBarCollapsed: true,
  isProducts: null,
  isDarkMode: false,
  isRegisterForm: false,
  isCartItemUnauthentificated: null,
  isWishlist: null,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsCartItemUnauthentificated: (
      state,
      action: PayloadAction<Product[] | null>
    ) => {
      state.isCartItemUnauthentificated = action.payload;
    },
    setIsProducts: (state, action: PayloadAction<Product[] | null>) => {
      state.isProducts = action.payload;
    },
    setIsWishlist: (state, action: PayloadAction<Product[] | null>) => {
      state.isWishlist = action.payload;
    },
    setIsRegisterForm: (state, action: PayloadAction<boolean>) => {
      state.isRegisterForm = action.payload;
    },
    setIsSideBarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSideBarCollapsed = action.payload;
    },
    setISDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const {
  setIsSideBarCollapsed,
  setISDarkMode,
  setIsRegisterForm,
  setIsCartItemUnauthentificated,
  setIsProducts,
  setIsWishlist,
} = globalSlice.actions;

export default globalSlice.reducer;
