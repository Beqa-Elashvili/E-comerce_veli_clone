import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentMethod } = await req.json();

    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 1: Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }, // Include order items
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Step 2: Create the payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        method: paymentMethod, // E.g., CREDIT_CARD, PAYPAL, etc.
        status: "PENDING", // Initially set to pending
      },
    });

    // Step 3: Mock payment success (Replace with real payment gateway logic)
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS", // After payment is successful
      },
    });

    // Step 4: Update Order status to COMPLETED after payment
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
      },
    });

    // Step 5: Return payment and order details
    return NextResponse.json(
      { message: "Payment processed successfully", payment, order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred during payment processing:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
