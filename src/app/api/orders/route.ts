import getSession from "@/app/actions/getSession";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const { userId, cartItems, shippingAddress, paymentMethod } =
      await req.json();

    // Check for missing fields
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

    // Step 1: Calculate total amount for the order and prepare order items
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

      if (item.selectedColor || item.selectedSize) {
        // Fetch the Color and Size by name
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
            `Not enough stock for variant of product ${item.productId}, this is variant = ${productVariant}`
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
      }
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
      },
    });

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

    // Step 4: Process the payment
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        method: paymentMethod, // E.g., CREDIT_CARD, PAYPAL, etc.
        status: "PENDING", // Initially set to pending
      },
    });

    // Step 5: Mock payment success (Replace with real payment gateway logic)
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS", // After payment is successful
      },
    });

    // Step 6: Update Order status to COMPLETED after payment
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
      },
    });

    // Step 7: Return payment and order details
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
  const session = await getSession(); // Get session data

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
    // Fetch orders with related order items
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
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

    if (orders.length === 0) {
      return NextResponse.json({ message: "No orders found" }, { status: 404 });
    }

    // Now, map through the orders and add selectedColor, selectedSize, and quantity
    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        const formattedItems = await Promise.all(
          order.items.map(async (item) => {
            // Fetch the corresponding cart item to get selectedColor, selectedSize, and quantity
            const cartItem = await prisma.cartItem.findFirst({
              where: {
                productId: item.productId,
                cart: {
                  userId: user.id,
                },
              },
            });

            return {
              ...item,
              selectedColor: cartItem?.selectedColor || null,
              selectedSize: cartItem?.selectedSize || null,
              quantity: cartItem?.quantity || 0,
            };
          })
        );

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
