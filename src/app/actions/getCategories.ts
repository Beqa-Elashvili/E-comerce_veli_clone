import axios from "axios";
import { setCategories } from "@/redux/categorySlice";
import { useAppDispatch } from "../redux";

async function getCategories() {
  const dispatch = useAppDispatch();
  try {
    const resp = await axios.get("/api/categoris?top=true");
    dispatch(setCategories(resp.data.categories));
  } catch (error: unknown) {
    console.log("Error while get categoryes");
  }
}

export default getCategories;
