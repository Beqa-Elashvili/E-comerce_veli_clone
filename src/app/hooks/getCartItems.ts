"use client";

import { useAppDispatch } from "../redux";
import { setIsCartItemUnauthentificated } from "@/redux/globalSlice";
import axios from "axios";
import { useState } from "react";

export default function useGetCartItems() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const GetCart = async () => {
    try {
      setLoading(true);
      const resp = await axios.get("/api/cart");
      dispatch(setIsCartItemUnauthentificated(resp.data));
      setLoading(false);
    } catch (error) {
      dispatch(setIsCartItemUnauthentificated([]));
    } finally {
      setLoading(false);
    }
  };
  return { GetCart, loading };
}
