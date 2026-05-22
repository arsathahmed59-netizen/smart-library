"use client";

import React, { useEffect, useState } from "react";
import BookCard, { BookType } from "@/components/BookCard";
import { Bookmark, BookOpen } from "lucide-react";
import styles from "./page.module.css";

export default function WishlistPage() {
  const [wishlistBooks, setWishlistBooks] = useState<BookType[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const savedIds = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || "[]");
      setWishlistIds(savedIds);

      const res = await fetch("/api/books");
      if (res.ok) {
        const data = await res.json();
        // Filter only books that are in the user's wishlist
        const filtered = data.books.filter((book: BookType) => savedIds.includes(book.id));
        setWishlistBooks(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleToggleWishlist = (bookId: string) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);

    const updated = wishlistIds.filter((id) => id !== bookId);
    setWishlistIds(updated);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updated));

    // Update displayed books immediately
    setWishlistBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  const handleReserve = async (bookId: string) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, bookId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reservation failed");

      alert("Book reserved successfully! Pending librarian approval.");
      fetchWishlist();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reserve book");
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.headerCard} glass animate-fade-in`}>
        <Bookmark size={32} color="var(--primary)" />
        <div>
          <h2>My Favorite Books</h2>
          <p>Manage your library wishlist and reserve titles for later.</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading Wishlist...</div>
      ) : wishlistBooks.length === 0 ? (
        <div className={`${styles.emptyState} glass`}>
          <BookOpen size={48} color="var(--text-light)" />
          <h3>Wishlist is Empty</h3>
          <p>You haven&apos;t added any books to your favorites yet. Head over to the Book Search page and click the bookmark button on any book card!</p>
        </div>
      ) : (
        <div className={styles.bookGrid}>
          {wishlistBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onAction={handleReserve}
              isWishlisted={true}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
