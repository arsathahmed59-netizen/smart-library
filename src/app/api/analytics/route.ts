import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // 1. Total Metrics
    const totalBooks = await prisma.book.count();
    const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
    
    const activeBorrows = await prisma.borrowRecord.count({
      where: { status: { in: ["BORROWED", "OVERDUE"] } },
    });
    
    const pendingReservations = await prisma.reservation.count({
      where: { status: "PENDING" },
    });

    // 2. Most Borrowed Books
    const borrowCounts = await prisma.borrowRecord.groupBy({
      by: ["bookId"],
      _count: {
        bookId: true,
      },
      orderBy: {
        _count: {
          bookId: "desc",
        },
      },
      take: 5,
    });

    const trendingBooks = await Promise.all(
      borrowCounts.map(async (item) => {
        const book = await prisma.book.findUnique({
          where: { id: item.bookId },
          include: { category: true },
        });
        return {
          ...book,
          borrowCount: item._count.bookId,
        };
      })
    );

    // 3. Department distribution (Reading Trends)
    const departments = await prisma.book.groupBy({
      by: ["department"],
      _count: {
        id: true,
      },
    });

    const readingTrends = departments.map((d) => ({
      name: d.department,
      count: d._count.id,
    }));

    // 4. Fine stats
    const totalFinesRecord = await prisma.borrowRecord.aggregate({
      _sum: {
        fineAmount: true,
      },
      where: {
        status: "RETURNED",
      },
    });
    const outstandingFinesRecord = await prisma.borrowRecord.aggregate({
      _sum: {
        fineAmount: true,
      },
      where: {
        status: "OVERDUE",
      },
    });

    const fines = {
      collected: totalFinesRecord._sum.fineAmount || 0,
      outstanding: outstandingFinesRecord._sum.fineAmount || 0,
    };

    return NextResponse.json({
      metrics: {
        totalBooks,
        totalStudents,
        activeBorrows,
        pendingReservations,
      },
      trendingBooks,
      readingTrends,
      fines,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
