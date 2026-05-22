import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Missing query message" }, { status: 400 });
    }

    const cleanMsg = message.toLowerCase();
    let responseText = "";

    // 1. Check if user is asking for recommendations or books on specific topics
    if (cleanMsg.includes("recommend") || cleanMsg.includes("suggest") || cleanMsg.includes("find me") || cleanMsg.includes("search for")) {
      // Extract keywords
      let searchKeyword = "";
      if (cleanMsg.includes("recommend books on")) {
        searchKeyword = cleanMsg.split("recommend books on")[1]?.trim();
      } else if (cleanMsg.includes("recommend")) {
        searchKeyword = cleanMsg.split("recommend")[1]?.trim();
      } else if (cleanMsg.includes("suggest")) {
        searchKeyword = cleanMsg.split("suggest")[1]?.trim();
      } else if (cleanMsg.includes("find me")) {
        searchKeyword = cleanMsg.split("find me")[1]?.trim();
      } else {
        searchKeyword = cleanMsg.replace("search for", "").trim();
      }

      // Clean search keyword
      searchKeyword = searchKeyword.replace(/[?.!]/g, "").trim();

      if (searchKeyword && searchKeyword.length > 2) {
        // Query database for books matching keyword
        const matchingBooks = await prisma.book.findMany({
          where: {
            OR: [
              { title: { contains: searchKeyword } },
              { author: { contains: searchKeyword } },
              { description: { contains: searchKeyword } },
              { department: { contains: searchKeyword } },
            ],
          },
          take: 3,
        });

        if (matchingBooks.length > 0) {
          responseText = `Based on your request for "${searchKeyword}", here are some top matches from our catalog:\n\n` +
            matchingBooks.map((b, i) => `${i + 1}. **${b.title}** by ${b.author} (Rack: ${b.rackLocation}, Status: ${b.status})`).join("\n") +
            `\n\nWould you like me to reserve any of these for you?`;
        } else {
          // Suggest trending books if no exact keyword match
          const trendingBooks = await prisma.book.findMany({ take: 2 });
          responseText = `I couldn't find any books matching "${searchKeyword}" in our library database. However, here are some trending books students are reading:\n\n` +
            trendingBooks.map((b, i) => `${i + 1}. **${b.title}** by ${b.author}`).join("\n") +
            `\n\nFeel free to try search terms like "Python", "Science", or "Fiction"!`;
        }
      } else {
        // General recommendations based on history
        if (userId) {
          const userBorrows = await prisma.borrowRecord.findMany({
            where: { userId },
            include: { book: { include: { category: true } } },
            take: 3,
          });

          if (userBorrows.length > 0) {
            // Get category IDs borrowed
            const categoryIds = userBorrows.map((b) => b.book.categoryId);
            // Suggest other books in those categories
            const recommended = await prisma.book.findMany({
              where: {
                categoryId: { in: categoryIds },
                status: "AVAILABLE",
                NOT: {
                  id: { in: userBorrows.map((b) => b.bookId) },
                },
              },
              take: 3,
            });

            if (recommended.length > 0) {
              responseText = `Based on your reading history (you recently read books in ${userBorrows[0].book.category.name}), I recommend checking out:\n\n` +
                recommended.map((b, i) => `${i + 1}. **${b.title}** by ${b.author} (Rack: ${b.rackLocation})`).join("\n") +
                `\n\nEnjoy your reading journey!`;
            }
          }
        }

        if (!responseText) {
          const defaultBooks = await prisma.book.findMany({ take: 3 });
          responseText = `I'd recommend checking out these popular books in our catalog:\n\n` +
            defaultBooks.map((b, i) => `${i + 1}. **${b.title}** by ${b.author} (Rack: ${b.rackLocation})`).join("\n");
        }
      }
    } 
    // 2. Check if user is asking about active borrows/dues
    else if (cleanMsg.includes("my books") || cleanMsg.includes("due date") || cleanMsg.includes("borrowed")) {
      if (!userId) {
        responseText = "You need to be logged in to view your borrowed books. Please log in and check your Student Dashboard.";
      } else {
        const activeBorrows = await prisma.borrowRecord.findMany({
          where: { userId, status: { in: ["BORROWED", "OVERDUE"] } },
          include: { book: true },
        });

        if (activeBorrows.length > 0) {
          responseText = `You currently have ${activeBorrows.length} borrowed book(s):\n\n` +
            activeBorrows.map((rec, i) => `${i + 1}. **${rec.book.title}**\n   - Due: ${new Date(rec.dueDate).toLocaleDateString()} ${rec.status === "OVERDUE" ? "⚠️ (OVERDUE)" : ""}`).join("\n");
        } else {
          responseText = "You don't have any actively borrowed books right now. Let me know if you need help finding something to read!";
        }
      }
    }
    // 3. General queries / Q&A
    else if (cleanMsg.includes("hello") || cleanMsg.includes("hi ") || cleanMsg.includes("hey")) {
      responseText = "Hello there! I'm your digital library assistant. How can I help you today? You can ask me to 'recommend books' or search for specific subjects!";
    } else if (cleanMsg.includes("hours") || cleanMsg.includes("timing") || cleanMsg.includes("open")) {
      responseText = "AuraLib is open Monday through Friday from 8:00 AM to 8:00 PM, and Saturdays from 9:00 AM to 5:00 PM. We are closed on Sundays.";
    } else if (cleanMsg.includes("fine") || cleanMsg.includes("charge") || cleanMsg.includes("late")) {
      responseText = "If you return a book past its due date, the late fine is **$1.50 per day**. Fines can be paid at the main library counter.";
    } else {
      // Default fallback
      responseText = "I'm here to assist you with everything AuraLib has to offer! You can ask me to:\n- 'Recommend books' based on your interest\n- Find books (e.g., 'find me Python books')\n- Check your active borrows (e.g., 'when are my books due?')\n- Tell you our library hours.";
    }

    return NextResponse.json({ response: responseText });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
