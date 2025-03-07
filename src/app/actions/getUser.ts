import axios from "axios";
import { setUser } from "@/redux/userSlice";
import { useAppDispatch } from "../redux";


export default function useGetUser() {
  const dispatch = useAppDispatch();

  async function getUser() {
    try {
      const resp = await axios.get("/api/user");
      dispatch(setUser(resp.data.User));
      return resp.data.User;
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  return { getUser };
}
