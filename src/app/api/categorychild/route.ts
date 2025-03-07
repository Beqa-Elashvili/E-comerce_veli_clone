import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { categories } = await req.json();

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { message: "Invalid categories data" },
        { status: 400 }
      );
    }

    const createdCategories = await prisma.category.createMany({
      data: categories.map(
        (category: { name: string; parentId: number | null }) => ({
          name: category.name,
          parentId: category.parentId || null,
        })
      ),
    });

    return NextResponse.json(
      { createdCategories, message: "Categories created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating categories with children:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
