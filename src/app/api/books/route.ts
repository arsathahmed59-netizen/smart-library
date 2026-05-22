import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";
    
    // Build query conditions
    const whereClause: Record<string, unknown> = {};

    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { author: { contains: query, mode: "insensitive" } },
        { isbn: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { department: { contains: query, mode: "insensitive" } },
        { category: { name: { contains: query, mode: "insensitive" } } },
      ];
    }

    if (category && category !== "all") {
      whereClause.categoryId = category;
    }

    if (department && department !== "all") {
      whereClause.department = department;
    }

    if (status && status !== "all") {
      whereClause.status = status;
    }

    // Fetch books
    const books = await prisma.book.findMany({
      where: whereClause,
      include: {
        category: true,
        reviews: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Also fetch categories to populate filters easily
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ books, categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, author, isbn, coverImage, description, department, rackLocation, status, categoryId } = body;

    if (!title || !author || !isbn || !department || !rackLocation || !status || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if book with ISBN already exists
    const existingBook = await prisma.book.findUnique({
      where: { isbn },
    });

    if (existingBook) {
      return NextResponse.json(
        { error: "A book with this ISBN already exists" },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn,
        coverImage: coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300",
        description: description || "No description available.",
        department,
        rackLocation,
        status: status.toUpperCase(), // "AVAILABLE", "BORROWED", "RESERVED"
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
