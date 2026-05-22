import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type ParamsType = Promise<{ id: string }> | { id: string };

export async function GET(
  request: Request,
  props: { params: ParamsType }
) {
  try {
    const resolvedParams = 'then' in props.params ? await props.params : props.params;
    const id = resolvedParams.id;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Fetch up to 10 similar books (matching category or department, excluding current book)
    let similarBooks = await prisma.book.findMany({
      where: {
        id: { not: id },
        OR: [
          { categoryId: book.categoryId },
          { department: book.department }
        ]
      },
      include: {
        category: true,
        reviews: true
      },
      take: 10
    });

    // If less than 10 similar books, fetch general fillers to complete the list of 10
    if (similarBooks.length < 10) {
      const excludedIds = [id, ...similarBooks.map((b) => b.id)];
      const fillers = await prisma.book.findMany({
        where: {
          id: { notIn: excludedIds }
        },
        include: {
          category: true,
          reviews: true
        },
        take: 10 - similarBooks.length
      });
      similarBooks = [...similarBooks, ...fillers];
    }

    return NextResponse.json({
      ...book,
      similarBooks
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: ParamsType }
) {
  try {
    const resolvedParams = 'then' in props.params ? await props.params : props.params;
    const id = resolvedParams.id;
    const body = await request.json();

    const book = await prisma.book.update({
      where: { id },
      data: {
        title: body.title,
        author: body.author,
        isbn: body.isbn,
        coverImage: body.coverImage,
        description: body.description,
        department: body.department,
        rackLocation: body.rackLocation,
        status: body.status?.toUpperCase(),
        categoryId: body.categoryId,
      },
    });

    return NextResponse.json(book);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: ParamsType }
) {
  try {
    const resolvedParams = 'then' in props.params ? await props.params : props.params;
    const id = resolvedParams.id;

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Book deleted successfully" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
