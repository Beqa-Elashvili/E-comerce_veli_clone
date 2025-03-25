import getSession from "@/app/actions/getSession";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, cartItems, shippingAddress, paymentMethod } =
      await req.json();

    if (
      !userId ||
      !cartItems ||
      cartItems.length === 0 ||
      !shippingAddress ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

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
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        totalAmount,
        userId,
        status: "PENDING",
        items: {
          create: orderItems,
        },
        shippingAddressId: shippingAddress.id,
      },
    });

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

    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (item.selectedColor || item.selectedSize) {
        let colorId = null;
        if (item.selectedColor) {
          const color = await prisma.color.findUnique({
            where: { name: item.selectedColor },
          });
          if (!color) {
            console.error(`Color "${item.selectedColor}" not found`);
            return NextResponse.json(
              { message: `Color "${item.selectedColor}" not found` },
              { status: 404 }
            );
          }
          colorId = color.id;
        }

        let sizeId = null;
        if (item.selectedSize) {
          const size = await prisma.size.findUnique({
            where: { name: item.selectedSize },
          });
          if (!size) {
            console.error(`Size "${item.selectedSize}" not found`);
            return NextResponse.json(
              { message: `Size "${item.selectedSize}" not found` },
              { status: 404 }
            );
          }
          sizeId = size.id;
        }

        const productVariant = await prisma.productVariant.findFirst({
          where: {
            productId: item.productId,
            colorId: colorId,
            sizeId: sizeId,
          },
        });

        if (!productVariant || productVariant.stock < item.quantity) {
          console.error(
            `Not enough stock for variant of product ${item.productId}`
          );
          return NextResponse.json(
            {
              message: `Not enough stock for selected variant of product ${item.productId}`,
            },
            { status: 400 }
          );
        }

        await prisma.productVariant.update({
          where: { id: productVariant.id },
          data: {
            stock: productVariant.stock - item.quantity,
          },
        });
      } else {
        if (product?.stock && product.stock < item.quantity) {
          console.error(
            `Not enough stock for product ${item.productId}, this is base product`
          );
          return NextResponse.json(
            {
              message: `Not enough stock for product ${item.productId}`,
            },
            { status: 400 }
          );
        }
        if (product)
          await prisma.product.update({
            where: { id: product.id },
            data: {
              stock: product.stock && product.stock - item.quantity,
            },
          });
      }
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
      },
    });

    return NextResponse.json(
      {
        message: "Order created and payment processed successfully",
        payment,
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Error occurred during order creation and payment processing:",
      error
    );
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                Color: true,
                Size: true,
              },
            },
          },
        },
      },
    });

    if (orders.length === 0) {
      return NextResponse.json({ message: "No orders found" }, { status: 404 });
    }

    const formattedOrders = await Promise.all(
      orders.map(async (order: any) => {
        const formattedItems = order.items.map((item: any) => {
          return {
            ...item,
            selectedColor: item.selectedColor || null,
            selectedSize: item.selectedSize || null,
            quantity: item.quantity || 0,
          };
        });

        return {
          ...order,
          items: formattedItems,
        };
      })
    );

    return NextResponse.json({ orders: formattedOrders }, { status: 200 });
  } catch (error) {
    console.error("Error occurred while retrieving orders:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json(
      { message: "Order ID is required" },
      { status: 400 }
    );
  }

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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true,
        shippingAddress: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json(
        { message: "You are not authorized to delete this order" },
        { status: 403 }
      );
    }

    await prisma.orderItem.deleteMany({
      where: { orderId: orderId },
    });

    if (order.payment) {
      await prisma.payment.delete({
        where: { id: order.payment.id },
      });
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred during order deletion:", error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}
