import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const categories = await req.json();

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { message: "Invalid categories data" },
        { status: 400 }
      );
    }

    const createdCategories = await prisma.$transaction(
      categories.map((category) =>
        prisma.category.create({
          data: {
            name: category.name,
            imageUrl: category.imageUrl,
            children: {
              create: category.children?.map(
                (child: { name: string; children?: any[] }) => ({
                  name: child.name,
                  children: child.children?.length
                    ? {
                        create: child.children.map(
                          (grandchild: { name: string; imageUrl: string }) => ({
                            name: grandchild.name,
                          })
                        ),
                      }
                    : undefined,
                })
              ),
            },
          },
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        })
      )
    );

    return NextResponse.json(
      { createdCategories, message: "Categories created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating categories with children:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const top = searchParams.get("top") === "true";
    const childrens = searchParams.get("childrens") === "true";
    const name = searchParams.get("name");
    const name2 = searchParams.get("name2");

    if (top) {
      const categories = await prisma.category.findMany({
        where: {
          parentId: null,
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      });
      return NextResponse.json({ categories }, { status: 200 });
    }

    if (childrens) {
      const category = await prisma.category.findMany({
        include: {
          children: true,
        },
      });

      if (!category) {
        return NextResponse.json(
          { message: "CategoryChildren not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ category }, { status: 200 });
    }

    if (name && !name2) {
      const category = await prisma.category.findFirst({
        where: { name: decodeURIComponent(name) },
        include: {
          Product: {
            include: {
              images: true,
              Color: true,
              Size: true,
              variants: true,
            },
          },
          children: {
            include: {
              Product: {
                include: {
                  images: true,
                  Color: true,
                  Size: true,
                  variants: true,
                },
              },
              children: {
                include: {
                  Product: {
                    include: {
                      Color: true,
                      Size: true,
                      variants: true,
                      images: true,
                    },
                  },
                  children: {
                    include: {
                      Product: {
                        include: {
                          Color: true,
                          Size: true,
                          variants: true,
                          images: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!category) {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ category }, { status: 200 });
    }
    if (name2) {
      const category = await prisma.category.findFirst({
        where: { name: decodeURIComponent(name2) },
        include: {
          Product: {
            include: {
              images: true,
              Color: true,
              Size: true,
              variants: true,
            },
          },
          children: {
            include: {
              Product: {
                include: {
                  images: true,
                  Color: true,
                  Size: true,
                  variants: true,
                },
              },
            },
          },
        },
      });

      if (!category) {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ category }, { status: 200 });
    }

    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        Product: true,
        children: {
          include: {
            Product: true,
            children: {
              include: {
                children: true,
                Product: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.category.deleteMany({});

    return NextResponse.json(
      { message: "Categories deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting categories:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
