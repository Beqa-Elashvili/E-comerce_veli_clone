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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }, 
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        method: paymentMethod, 
        status: "PENDING", 
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS", 
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
      },
    });

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
