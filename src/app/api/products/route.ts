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
          variants = [], // Expect a variants array with color-size combinations
          sizes = [], // Sizes array passed for direct creation
          colors = [], // Colors array passed for direct creation
        } = product;

        // Create the product without variants relations for now
        const createdProduct = await prisma.product.create({
          data: {
            name,
            description,
            price,
            stock,
            categoryId,
            images: {
              create: images.map((url: string) => ({ url })), // Store the images
            },
          },
          include: {
            images: true,
          },
        });

        // Handle product variants (Color-Size combinations)
        if (variants.length > 0) {
          await Promise.all(
            variants.map(async (variant: any) => {
              const { colorName, sizeName, variantStock } = variant;

              // Upsert color and size (create if not exists, or do nothing if already exists)
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

              // Create the product variant that associates color and size with the product
              await prisma.productVariant.create({
                data: {
                  productId: createdProduct.id, // Link the variant to the product
                  colorId: color.id, // Link the variant to the color
                  sizeId: size.id, // Link the variant to the size
                  stock: variantStock, // Use the provided stock for this variant
                },
              });
            })
          );
        }

        // If no specific variants are provided, link the product directly to sizes and colors
        if (sizes.length > 0 || colors.length > 0) {
          // Link sizes to product if sizes are provided
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

          // Link colors to product if colors are provided
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

        // Fetch the full product with variants, colors, sizes, and images
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
      { error: "Internal Server Error" },
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
    // Delete all product variants
    await prisma.productVariant.deleteMany({});

    // Delete all products
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
