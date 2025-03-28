import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";

export default async function getSession() {
  return await getServerSession(authOptions);
}
