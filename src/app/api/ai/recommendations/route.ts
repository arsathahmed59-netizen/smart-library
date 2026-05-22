import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      // Return general recommendations if not logged in
      const defaultBooks = await prisma.book.findMany({
        take: 4,
        include: { category: true, reviews: true },
      });
      return NextResponse.json(defaultBooks);
    }

    const branch = searchParams.get("branch");
    const interestsString = searchParams.get("interests");
    let interests: string[] = [];
    try {
      if (interestsString) interests = JSON.parse(interestsString);
    } catch {
      // ignore parse errors
    }

    // Fetch user borrow history to understand their reading profile
    const borrowHistory = await prisma.borrowRecord.findMany({
      where: { userId },
      include: {
        book: {
          select: { categoryId: true },
        },
      },
      take: 5,
    });

    const categoryIds = borrowHistory.map((bh) => bh.book.categoryId);
    const readBookIds = borrowHistory.map((bh) => bh.bookId);

    // Build advanced multi-parameter match conditions
    const orConditions: any[] = [];

    // 1. Branch Match
    if (branch) {
      orConditions.push({ department: branch });
    }

    // 2. Interest Match (against category name or description text)
    if (interests.length > 0) {
      const matchedCategories = await prisma.category.findMany({
        where: {
          name: { in: interests }
        }
      });
      if (matchedCategories.length > 0) {
        orConditions.push({ categoryId: { in: matchedCategories.map((c) => c.id) } });
      }

      interests.forEach((interest) => {
        orConditions.push({
          description: { contains: interest }
        });
        orConditions.push({
          title: { contains: interest }
        });
      });
    }

    // 3. Borrow History Category Match
    if (categoryIds.length > 0) {
      orConditions.push({ categoryId: { in: categoryIds } });
    }

    // Fetch matching available books
    const recommendations = await prisma.book.findMany({
      where: {
        status: "AVAILABLE",
        NOT: {
          id: { in: readBookIds },
        },
        OR: orConditions.length > 0 ? orConditions : undefined,
      },
      include: { category: true, reviews: true },
      take: 4,
    });

    // Pad with general books if recommendations count is small
    if (recommendations.length < 4) {
      const padding = await prisma.book.findMany({
        where: {
          status: "AVAILABLE",
          NOT: {
            id: { in: [...recommendations.map((r) => r.id), ...readBookIds] },
          },
        },
        include: { category: true, reviews: true },
        take: 4 - recommendations.length,
      });

      return NextResponse.json([...recommendations, ...padding]);
    }

    return NextResponse.json(recommendations);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
