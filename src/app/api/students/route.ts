import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        borrows: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
              }
            }
          },
          orderBy: { borrowDate: "desc" }
        },
        _count: {
          select: { borrows: true }
        }
      },
      orderBy: { name: "asc" },
    });

    // Format students with custom computed details like active borrowings and accumulated fines
    const formattedStudents = students.map((std) => {
      const activeBorrows = std.borrows.filter((b) => b.status === "BORROWED" || b.status === "OVERDUE");
      const unpaidFines = std.borrows
        .filter((b) => b.status === "OVERDUE")
        .reduce((sum, b) => sum + b.fineAmount, 0);

      return {
        id: std.id,
        name: std.name,
        email: std.email,
        createdAt: std.createdAt,
        totalBorrows: std._count.borrows,
        activeBorrowsCount: activeBorrows.length,
        activeBorrowsList: activeBorrows.map((b) => ({
          id: b.id,
          bookTitle: b.book.title,
          dueDate: b.dueDate,
          status: b.status,
          fineAmount: b.fineAmount
        })),
        unpaidFines
      };
    });

    return NextResponse.json(formattedStudents);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
