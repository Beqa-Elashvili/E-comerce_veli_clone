"use client";

import { useAppDispatch } from "../redux";
import { setIsCartItemUnauthentificated } from "@/redux/globalSlice";
import axios from "axios";
import { useState } from "react";

export default function useGetCartItems() {
  const dispatch = useAppDispatch();
  const GetCart = async () => {
    try {
      const resp = await axios.get("/api/cart");
      dispatch(setIsCartItemUnauthentificated(resp.data));
    } catch (error) {
      dispatch(setIsCartItemUnauthentificated([]));
    }
  };
  return { GetCart };
}
