import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Reset fine amounts to 0 for all active borrowings for this student
    await prisma.borrowRecord.updateMany({
      where: {
        userId,
        status: { in: ["BORROWED", "OVERDUE"] },
      },
      data: {
        fineAmount: 0,
      },
    });

    // Generate notification to document payment
    await prisma.notification.create({
      data: {
        userId,
        message: "Your outstanding library fines have been fully cleared via UPI digital payment success.",
        type: "NEW_ARRIVAL",
      },
    });

    return NextResponse.json({ success: true, message: "Payment processed and fines cleared successfully." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
