import getSession from "@/app/actions/getSession";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: userId },
      include: { items: true },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
        include: { items: true },
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { message: `Product with id ${productId} not found` },
        { status: 404 }
      );
    }

    const existingWishlistItem = wishlist.items.find(
      (item) => item.productId === productId
    );

    if (existingWishlistItem) {
      return NextResponse.json({
        error: "Product already in wishlist",
      });
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return NextResponse.json(
      { message: "Product successfully added to wishlist", product },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred during wishlist update:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: parseInt(user.id as unknown as string) },
      include: {
        items: { include: { product: { include: { images: true } } } },
      },
    });

    if (!wishlist) {
      return NextResponse.json(
        { message: "Wishlist not found for this user" },
        { status: 404 }
      );
    }

    const wishlistProducts = wishlist.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      productId: item.product.id,
      description: item.product.description,
      price: item.product.price,
      stock: item.product.stock,
      categoryId: item.product.categoryId,
      images: item.product.images,
    }));

    return NextResponse.json({ wishlistProducts }, { status: 200 });
  } catch (error) {
    console.error("Error occurred while retrieving wishlist:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { productId } = await req.json();
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

    if (!user.id || !productId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: user.id },
    });

    if (!wishlist) {
      return NextResponse.json(
        { message: "Wishlist not found for this user" },
        { status: 404 }
      );
    }

    const existingWishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        id: productId,
      },
    });

    if (!existingWishlistItem) {
      return NextResponse.json(
        { message: "Product not found in wishlist" },
        { status: 404 }
      );
    }

    await prisma.wishlistItem.delete({
      where: {
        id: existingWishlistItem.id,
      },
    });

    return NextResponse.json(
      { message: "Product successfully removed from wishlist" },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Error occurred while deleting product from wishlist:",
      error
    );
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
