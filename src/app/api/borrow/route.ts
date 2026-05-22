import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const query: Record<string, unknown> = {};
    if (userId) {
      query.userId = userId;
    }

    const borrows = await prisma.borrowRecord.findMany({
      where: query,
      include: {
        user: { select: { name: true, email: true } },
        book: true,
      },
      orderBy: { borrowDate: "desc" },
    });

    // Update overdue status and fine amounts on the fly for active borrows
    const today = new Date();
    const updatedBorrows = await Promise.all(
      borrows.map(async (record) => {
        if (record.status === "BORROWED" && today > new Date(record.dueDate)) {
          const diffTime = Math.abs(today.getTime() - new Date(record.dueDate).getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const fine = diffDays * 1.5; // $1.50 fine per day

          // Update database record dynamically if overdue status changed or fine increased
          return await prisma.borrowRecord.update({
            where: { id: record.id },
            data: { 
              status: "OVERDUE",
              fineAmount: fine 
            },
            include: {
              user: { select: { name: true, email: true } },
              book: true,
            }
          });
        }
        return record;
      })
    );

    return NextResponse.json(updatedBorrows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Issue Book
export async function POST(request: Request) {
  try {
    const { userId, bookId, days = 14 } = await request.json();

    if (!userId || !bookId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check book status
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || (book.status !== "AVAILABLE" && book.status !== "RESERVED")) {
      return NextResponse.json({ error: "Book is not available for issue" }, { status: 400 });
    }

    // Create due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    // Create Borrow record
    const borrow = await prisma.borrowRecord.create({
      data: {
        userId,
        bookId,
        dueDate,
        status: "BORROWED",
      },
      include: { book: true },
    });

    // Update book status
    await prisma.book.update({
      where: { id: bookId },
      data: { status: "BORROWED" },
    });

    // If reservation exists, mark it as completed
    const reservation = await prisma.reservation.findFirst({
      where: { userId, bookId, status: "APPROVED" },
    });
    if (reservation) {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: "COMPLETED" },
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        message: `Book "${book.title}" has been issued to you. Due date: ${dueDate.toLocaleDateString()}.`,
        type: "DUE_DATE",
      },
    });

    return NextResponse.json(borrow, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Return Book
export async function PUT(request: Request) {
  try {
    const { borrowId } = await request.json();

    if (!borrowId) {
      return NextResponse.json({ error: "Missing borrow ID" }, { status: 400 });
    }

    const record = await prisma.borrowRecord.findUnique({
      where: { id: borrowId },
      include: { book: true, user: true },
    });

    if (!record || record.status === "RETURNED") {
      return NextResponse.json({ error: "Active borrow record not found" }, { status: 404 });
    }

    const returnDate = new Date();
    let status = "RETURNED";
    let fineAmount = record.fineAmount;

    // Recalculate final fine if overdue at return
    if (returnDate > new Date(record.dueDate)) {
      const diffTime = Math.abs(returnDate.getTime() - new Date(record.dueDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * 1.5;
      status = "RETURNED";
    }

    // Update borrow record
    const updatedRecord = await prisma.borrowRecord.update({
      where: { id: borrowId },
      data: {
        returnDate,
        status,
        fineAmount,
      },
    });

    // Mark book AVAILABLE again
    await prisma.book.update({
      where: { id: record.bookId },
      data: { status: "AVAILABLE" },
    });

    // Notification
    await prisma.notification.create({
      data: {
        userId: record.userId,
        message: `Thank you! Book "${record.book.title}" was returned. ${fineAmount > 0 ? `Paid fine of $${fineAmount.toFixed(2)}.` : ""}`,
        type: "NEW_ARRIVAL",
      },
    });

    return NextResponse.json(updatedRecord);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
