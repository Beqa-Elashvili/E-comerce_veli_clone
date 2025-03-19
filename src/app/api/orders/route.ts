import getSession from "@/app/actions/getSession";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const { userId, cartItems, shippingAddress } = await req.json();

    if (!userId || !cartItems || cartItems.length === 0 || !shippingAddress) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 1: Calculate total amount for the order
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        console.error(`Product with ID ${item.productId} not found`);
        return NextResponse.json(
          { message: `Product with ID ${item.productId} not found` },
          { status: 404 }
        );
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Step 2: Create the Order
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`, // Generate unique order number
        totalAmount,
        userId,
        status: "PENDING", // Initial order status
        items: {
          create: orderItems,
        },
      },
    });

    // Step 3: Create Shipping Address for the order
    await prisma.shippingAddress.create({
      data: {
        userId: userId,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        name: shippingAddress.name,
      },
    });

    // Step 4: Return Order details
    return NextResponse.json(
      { message: "Order created successfully", order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred during order creation:", error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  const session = await getSession(); // Get session data

  // Check if the session exists
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Find the user from the database using the session email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // Check if the user exists
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (!user.id) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch all orders for the authenticated user
    const orders = await prisma.order.findMany({
      where: { userId: user.id }, // Filter orders by user ID
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true, // Include product images
              },
            },
          },
        },
      },
    });

    // If no orders are found for the user
    if (orders.length === 0) {
      return NextResponse.json({ message: "No orders found" }, { status: 404 });
    }

    // Return the orders for the authenticated user
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error occurred while retrieving orders:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
