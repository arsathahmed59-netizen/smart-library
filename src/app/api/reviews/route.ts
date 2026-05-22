import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, bookId, rating, comment } = body;

    if (!userId || !bookId || !rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields: userId, bookId, rating, comment" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify user and book exist
    const [userExists, bookExists] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.book.findUnique({ where: { id: bookId } })
    ]);

    if (!userExists) {
      return NextResponse.json({ error: "Student user not found" }, { status: 400 });
    }

    if (!bookExists) {
      return NextResponse.json({ error: "Book not found" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        bookId,
        rating: parseInt(rating),
        comment,
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
