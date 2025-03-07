import { NextResponse } from "next/server";
import getSession from "@/app/actions/getSession";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { message: "User not logged in" },
        { status: 400 }
      );
    }

    const User = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
      include: {
        orders: true,
        cart: true,
        ShippingAddress: true,
        Review: true,
      },
    });

    return NextResponse.json(
      {
        message: "Fetch User successfully",
        User,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
