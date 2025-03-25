import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { products } = await req.json();

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: "Invalid products data" },
        { status: 400 }
      );
    }

    const createdProducts = await Promise.all(
      products.map(async (product: any) => {
        const {
          name,
          description,
          price,
          stock,
          categoryId,
          images = [],
          variants = [],
          sizes = [],
          colors = [],
        } = product;

        const productStock = variants.length > 0 ? null : stock;

        const createdProduct = await prisma.product.create({
          data: {
            name,
            description,
            price,
            stock: productStock,
            categoryId,
            images: {
              create: images.map((url: string) => ({ url })),
            },
          },
          include: {
            images: true,
          },
        });

        if (colors.length > 0 && sizes.length > 0) {
          await Promise.all(
            variants.map(async (variant: any) => {
              const { colorName, sizeName, variantStock } = variant;

              const color = await prisma.color.upsert({
                where: { name: colorName },
                update: {},
                create: { name: colorName },
              });

              const size = await prisma.size.upsert({
                where: { name: sizeName },
                update: {},
                create: { name: sizeName },
              });

              await prisma.productVariant.create({
                data: {
                  productId: createdProduct.id,
                  colorId: color.id,
                  sizeId: size.id,
                  stock: variantStock || stock,
                },
              });
            })
          );
        } else if (colors.length > 0 && sizes.length === 0) {
          await Promise.all(
            colors.map(async (colorName: string) => {
              const { variantStock } =
                variants.find((v: any) => v.colorName === colorName) || {};
              const color = await prisma.color.upsert({
                where: { name: colorName },
                update: {},
                create: { name: colorName },
              });

              await prisma.productVariant.create({
                data: {
                  productId: createdProduct.id,
                  colorId: color.id,
                  stock: variantStock || stock,
                },
              });
            })
          );
        } else if (sizes.length > 0 && colors.length === 0) {
          await Promise.all(
            sizes.map(async (sizeName: string) => {
              const { variantStock } =
                variants.find((v: any) => v.sizeName === sizeName) || {};
              const size = await prisma.size.upsert({
                where: { name: sizeName },
                update: {},
                create: { name: sizeName },
              });

              // Create product variant for size only
              await prisma.productVariant.create({
                data: {
                  productId: createdProduct.id,
                  sizeId: size.id,
                  stock: variantStock || stock,
                },
              });
            })
          );
        }

        // Case when neither variants nor stock are provided
        if (sizes.length > 0 || colors.length > 0) {
          // Handle linking sizes to the product
          if (sizes.length > 0) {
            await Promise.all(
              sizes.map(async (sizeName: string) => {
                const size = await prisma.size.upsert({
                  where: { name: sizeName },
                  update: {},
                  create: { name: sizeName },
                });

                await prisma.product.update({
                  where: { id: createdProduct.id },
                  data: {
                    Size: {
                      connect: { id: size.id },
                    },
                  },
                });
              })
            );
          }

          // Handle linking colors to the product
          if (colors.length > 0) {
            await Promise.all(
              colors.map(async (colorName: string) => {
                const color = await prisma.color.upsert({
                  where: { name: colorName },
                  update: {},
                  create: { name: colorName },
                });

                await prisma.product.update({
                  where: { id: createdProduct.id },
                  data: {
                    Color: {
                      connect: { id: color.id },
                    },
                  },
                });
              })
            );
          }
        }

        // Fetch the fully created product with variants
        const fullCreatedProduct = await prisma.product.findUnique({
          where: { id: createdProduct.id },
          include: {
            images: true,
            Color: true,
            Size: true,
            variants: true,
          },
        });

        return fullCreatedProduct;
      })
    );

    return NextResponse.json(
      {
        message: "Products added successfully",
        products: createdProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding products:", error);
    return NextResponse.json(
      { error: error || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams.get("query");
    const id = req.nextUrl.searchParams.get("id");

    if (searchParams) {
      const products = await prisma.product.findMany({
        where: {
          name: {
            contains: searchParams,
            mode: "insensitive",
          },
        },
        include: {
          images: true,
          category: true,
          Color: true,
          Size: true,
          variants: true,
        },
      });
      return NextResponse.json(
        { message: "search results", products },
        {
          status: 200,
        }
      );
    }

    if (id) {
      const product = await prisma.product.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
          images: true,
          category: true,
          Color: true,
          Size: true,
          variants: true,
        },
      });
      return NextResponse.json(
        { message: "product", product },
        {
          status: 200,
        }
      );
    }

    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
        variants: true,
        Color: true,
        Size: true,
      },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: NextRequest) {
  try {
    await prisma.cartItem.deleteMany({});
    await prisma.wishlistItem.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});

    return NextResponse.json(
      {
        message:
          "All products and their variants have been deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting all products:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
