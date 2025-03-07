import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    console.log("Database connection established");

    const { name, email, password, phoneNumber } = await req.json();
    console.log("Request data received:", {
      name,
      email,
      password,
      phoneNumber,
    });

    if (!name || !email || !password || !phoneNumber) {
      console.error("Missing required fields:", {
        name,
        email,
        password,
        phoneNumber,
      });
      return NextResponse.json(
        { message: "Please compile all options" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    console.log("Checked if user exists:", existingUser);

    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already taken" },
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
