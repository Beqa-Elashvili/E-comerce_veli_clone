import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { message } from "antd";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phoneNumber } = await req.json();
    console.log("Request data received:", {
      name,
      email,
      password,
      phoneNumber,
    });

    if (!name || !email || !password || !phoneNumber) {
      console.error("ყველა ოფცია შევსებული უნდა იყოს", {
        name,
        email,
        password,
        phoneNumber,
      });
      return NextResponse.json(
        { message: "გთხოვთ შეავსოთ ყველა გრაფა" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    console.log("Checked if user exists:", existingUser);

    if (existingUser) {
      return NextResponse.json(
        { message: "მეილი უკვე გამოყენებულია" },
        { status: 400 }
      );
    }
    const existingPhoneNumber = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (existingPhoneNumber) {
      return NextResponse.json(
        { message: "მობილურის ნომერი უკვე გამოყენებულია" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
      },
    });
    console.log("New user created:", newUser);

    return NextResponse.json(
      {
        message: "User registered successfully",
        newUser,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error occurred during registration:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await prisma.wishlistItem.deleteMany({});
    await prisma.wishlist.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.user.deleteMany({});
    return NextResponse.json(
      { message: "all user delete succesfuly" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "internal Server Error", error },
      {
        status: 500,
      }
    );
  }
}
