import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/app/types/globalStateTypes";

export interface initialStateTypes {
  isSideBarCollapsed: boolean;
  isDarkMode: boolean;
  isShowResults: boolean;
  isRegisterForm: boolean;
  isCartItemUnauthentificated: Product[] | null;
  isProducts: Product[] | null;
  isWishlist: Product[] | null;
  isAuthModalOpen: boolean;
}

const initialState: initialStateTypes = {
  isSideBarCollapsed: true,
  isProducts: null,
  isShowResults: false,
  isDarkMode: false,
  isAuthModalOpen: false,
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
    setShowResults: (state, action: PayloadAction<boolean>) => {
      state.isShowResults = action.payload;
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
    setIsAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
    },
  },
});

export const {
  setIsSideBarCollapsed,
  setIsAuthModalOpen,
  setISDarkMode,
  setShowResults,
  setIsRegisterForm,
  setIsCartItemUnauthentificated,
  setIsProducts,
  setIsWishlist,
} = globalSlice.actions;

export default globalSlice.reducer;
