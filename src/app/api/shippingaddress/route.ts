import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import getSession from "@/app/actions/getSession";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, address, city, postalCode, country } = body;

    if (!userId || !address || !city || !postalCode || !country || !name) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const shippingAddress = await prisma.shippingAddress.create({
      data: {
        userId,
        address,
        city,
        postalCode,
        name,
        country,
      },
    });

    return NextResponse.json(shippingAddress, { status: 201 });
  } catch (error) {
    console.error("Error creating shipping address:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const shippingAddresses = await prisma.shippingAddress.findMany({
      where: { userId: Number(user.id) },
    });

    return NextResponse.json(shippingAddresses, { status: 200 });
  } catch (error) {
    console.error("Error fetching shipping addresses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
