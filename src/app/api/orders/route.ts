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

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId);

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch the order by ID
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Return order details
    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Error occurred while retrieving order:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
