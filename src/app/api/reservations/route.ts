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

    const reservations = await prisma.reservation.findMany({
      where: query,
      include: {
        user: { select: { name: true, email: true } },
        book: true,
      },
      orderBy: { reservationDate: "desc" },
    });

    return NextResponse.json(reservations);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, bookId } = await request.json();

    if (!userId || !bookId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if book is available
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.status !== "AVAILABLE") {
      return NextResponse.json({ error: "Book is not available for reservation" }, { status: 400 });
    }

    // Update book status to RESERVED
    await prisma.book.update({
      where: { id: bookId },
      data: { status: "RESERVED" },
    });

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        bookId,
        status: "PENDING",
      },
      include: {
        book: true,
      },
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId,
        message: `Your reservation request for "${book.title}" was submitted successfully. Waiting for librarian approval.`,
        type: "RESERVATION_APPROVED",
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { reservationId, status } = await request.json(); // status: APPROVED, REJECTED

    if (!reservationId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { book: true, user: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    // Update reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status },
    });

    if (status === "APPROVED") {
      // Approve: create a borrow record automatically or mark as approved reservation
      // The student must come collect the book. Book remains RESERVED until issued.
      await prisma.notification.create({
        data: {
          userId: reservation.userId,
          message: `Your reservation for "${reservation.book.title}" has been APPROVED. Please collect it from Rack ${reservation.book.rackLocation} within 48 hours.`,
          type: "RESERVATION_APPROVED",
        },
      });
    } else if (status === "REJECTED") {
      // Reject: make the book AVAILABLE again
      await prisma.book.update({
        where: { id: reservation.bookId },
        data: { status: "AVAILABLE" },
      });

      await prisma.notification.create({
        data: {
          userId: reservation.userId,
          message: `Your reservation for "${reservation.book.title}" was rejected. Please contact the librarian for more details.`,
          type: "RESERVATION_REJECTED",
        },
      });
    } else if (status === "COMPLETED") {
      // Checked out: reservation completes. Book is now BORROWED
      await prisma.book.update({
        where: { id: reservation.bookId },
        data: { status: "BORROWED" },
      });
    }

    return NextResponse.json(updatedReservation);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
