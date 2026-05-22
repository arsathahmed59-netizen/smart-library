"use client";

import React from "react";
import Link from "next/link";
import { Star, MapPin, Tag, Bookmark } from "lucide-react";
import styles from "./BookCard.module.css";

export interface BookType {
  id: string;
  title: string;
  author: string;
  isbn: string;
  coverImage: string;
  description: string;
  department: string;
  rackLocation: string;
  status: string; // "AVAILABLE", "BORROWED", "RESERVED"
  copiesCount?: number;
  availableCopies?: number;
  category?: { name: string } | string;
  reviews?: { rating: number }[];
  _count?: { borrows: number };
}

interface BookCardProps {
  book: BookType;
  actionLabel?: string;
  onAction?: (bookId: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (bookId: string) => void;
}

export default function BookCard({ 
  book, 
  actionLabel = "Reserve", 
  onAction,
  isWishlisted = false,
  onToggleWishlist
}: BookCardProps) {
  // Calculate average rating
  const avgRating = book.reviews && book.reviews.length > 0
    ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length).toFixed(1)
    : "4.5"; // default template rating if none exists

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "AVAILABLE": return "badge-success";
      case "BORROWED": return "badge-warning";
      case "RESERVED": return "badge-error";
      default: return "badge-primary";
    }
  };

  const getCategoryName = () => {
    if (typeof book.category === "string") return book.category;
    if (book.category && typeof book.category === "object") return book.category.name;
    return book.department || "General";
  };

  return (
    <div className={`${styles.card} glass animate-fade-in`}>
      <div className={styles.imageContainer}>
        <Link href={`/student/books/${book.id}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={book.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300"} 
            alt={book.title} 
            className={styles.coverImage} 
          />
        </Link>
        <span className={`badge ${getStatusClass(book.status)} ${styles.statusBadge}`}>
          {book.status}
        </span>
        {onToggleWishlist && (
          <button 
            className={`${styles.wishlistBtn} ${isWishlisted ? styles.activeWishlist : ""}`}
            onClick={() => onToggleWishlist(book.id)}
            aria-label="Add to wishlist"
          >
            <Bookmark size={16} fill={isWishlisted ? "var(--primary)" : "none"} />
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.metaRow}>
          <span className={styles.categoryBadge}>
            <Tag size={12} />
            {getCategoryName()}
          </span>
          <div className={styles.rating}>
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{avgRating}</span>
          </div>
        </div>

        <h3 className={styles.title} title={book.title}>
          <Link href={`/student/books/${book.id}`} className={styles.titleLink}>
            {book.title}
          </Link>
        </h3>
        <p className={styles.author}>by {book.author}</p>
        <p className={styles.desc}>{book.description}</p>

        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <MapPin size={14} className={styles.detailIcon} />
            <span>Rack {book.rackLocation}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.isbn}>ISBN: {book.isbn}</span>
          </div>
        </div>

        <div className={styles.cardActions}>
          <Link href={`/student/books/${book.id}`} className={styles.detailsBtn}>
            View Details
          </Link>
          {onAction && (
            <button 
              className={styles.actionBtn}
              onClick={() => onAction(book.id)}
              disabled={book.status !== "AVAILABLE" && actionLabel === "Reserve"}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
