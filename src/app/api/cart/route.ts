import getSession from "@/app/actions/getSession";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, product } = await req.json();

    if (!userId || !product) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const productsArray = Array.isArray(product) ? product : [product];

    let cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: { cartItems: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { cartItems: true },
      });
    }

    for (const {
      productId,
      quantity,
      selectedColor,
      selectedSize,
    } of productsArray) {
      const foundProduct = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!foundProduct) {
        return NextResponse.json(
          { message: `Product with id ${productId} not found` },
          { status: 404 }
        );
      }

      let availableStock = foundProduct.stock;

      if (selectedColor && selectedSize) {
        const color = await prisma.color.findFirst({
          where: { name: selectedColor },
        });

        const size = await prisma.size.findFirst({
          where: { name: selectedSize },
        });

        if (!color || !size) {
          return NextResponse.json(
            { message: "Invalid color or size selected" },
            { status: 400 }
          );
        }

        const variant = await prisma.productVariant.findFirst({
          where: {
            productId: productId,
            colorId: color.id,
            sizeId: size.id,
          },
        });

        if (!variant) {
          return NextResponse.json(
            { message: "Variant not found for selected options" },
            { status: 404 }
          );
        }

        availableStock = variant.stock;
      }

      const existingCartItem = cart.cartItems.find(
        (item) =>
          item.productId === productId &&
          (item.selectedColor === selectedColor || !selectedColor) &&
          (item.selectedSize === selectedSize || !selectedSize)
      );

      if (existingCartItem) {
        const newQuantity = existingCartItem.quantity + quantity;

        if (availableStock < newQuantity) {
          return NextResponse.json(
            { message: `Not enough stock for the selected variant` },
            { status: 400 }
          );
        }

        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: newQuantity,
          },
        });
      } else {
        if (availableStock < quantity) {
          return NextResponse.json(
            { message: `Not enough stock for the selected variant` },
            { status: 400 }
          );
        }

        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
            selectedColor: selectedColor || null,
            selectedSize: selectedSize || null,
          },
        });
      }
    }

    return NextResponse.json(
      { message: "Products successfully added to cart", product },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred during cart update:", error);
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

    const cart = await prisma.cart.findUnique({
      where: { userId: parseInt(user.id as unknown as string) },
      include: {
        cartItems: {
          include: {
            product: {
              include: {
                Color: true,
                Size: true,
                images: true,
                variants: {
                  include: { color: true, size: true },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }
    if (!cart || cart.cartItems.length === 0) {
      return NextResponse.json(
        { message: "No products in cart" },
        { status: 404 }
      );
    }

    const cartProducts = cart.cartItems.map((item) => ({
      id: item.id,
      name: item.product.name,
      productId: item.product.id,
      description: item.product.description,
      price: item.product.price,
      stock: item.product.stock,
      categoryId: item.product.categoryId,
      images: item.product.images,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      Color: item.product.Color,
      Size: item.product.Size,
      variants: item.product.variants.map((variant) => ({
        id: variant.id,
        colorId: variant.color ? variant.color.id : null,
        sizeId: variant.size ? variant.size.id : null,
        stock: variant.stock || null,
      })),
    }));

    return NextResponse.json(cartProducts, { status: 200 });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const {
      productId,
      selectedColor,
      selectedSize,
      decrease = false,
    } = await req.json();

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

    if (!productId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { cartItems: true },
    });

    if (!cart) {
      return NextResponse.json(
        { message: "Cart not found for this user" },
        { status: 404 }
      );
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
        selectedColor: selectedColor || null,
        selectedSize: selectedSize || null,
      },
    });

    if (!existingCartItem) {
      return NextResponse.json(
        { message: "Product not found in cart" },
        { status: 404 }
      );
    }

    if (decrease) {
      if (existingCartItem.quantity > 1) {
        await prisma.cartItem.update({
          where: {
            id: existingCartItem.id,
            selectedColor: selectedColor || null,
            selectedSize: selectedSize || null,
          },
          data: {
            quantity: existingCartItem.quantity - 1,
          },
        });

        return NextResponse.json(
          { message: "Product quantity decreased by 1" },
          { status: 200 }
        );
      }
    }

    await prisma.cartItem.delete({
      where: {
        id: existingCartItem.id,
        selectedColor: selectedColor || null,
        selectedSize: selectedSize || null,
      },
    });

    return NextResponse.json(
      { message: "Cart item successfully deleted", existingCartItem },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
