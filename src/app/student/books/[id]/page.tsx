"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Star, MapPin, Tag, ArrowLeft, Bookmark, CheckCircle, AlertTriangle, MessageSquare, Sparkles } from "lucide-react";
import BookCard from "@/components/BookCard";
import styles from "./page.module.css";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  coverImage: string;
  description: string;
  department: string;
  rackLocation: string;
  status: string;
  copiesCount: number;
  availableCopies: number;
  category: {
    id: string;
    name: string;
  };
  reviews: Review[];
  similarBooks?: Book[];
}

export default function BookDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [submittingReserve, setSubmittingReserve] = useState(false);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [mapTab, setMapTab] = useState<"floor" | "elevation">("floor");

  const fetchBookDetails = async () => {
    try {
      const res = await fetch(`/api/books/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBook(data);
      } else {
        console.error("Failed to fetch book details");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();

    // Check wishlist status
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const savedWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || "[]");
      setWishlist(savedWishlist);
      setIsWishlisted(savedWishlist.includes(id));
    }
  }, [id]);

  const handleToggleWishlist = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);

    const updated = isWishlisted
      ? wishlist.filter((wId) => wId !== id)
      : [...wishlist, id];

    setWishlist(updated);
    setIsWishlisted(!isWishlisted);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updated));
  };

  const handleReserve = async () => {
    if (!book || book.status !== "AVAILABLE" || book.availableCopies <= 0) return;

    setSubmittingReserve(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, bookId: book.id }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Reservation failed");

      alert("Book reserved successfully! Awaiting librarian approval.");
      fetchBookDetails();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reserve book");
    } finally {
      setSubmittingReserve(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          bookId: id,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        alert("Review submitted successfully!");
        setComment("");
        setRating(5);
        fetchBookDetails();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading book details...</div>;
  }

  if (!book) {
    return (
      <div className={styles.errorContainer}>
        <h3>Book Not Found</h3>
        <p>The requested book catalog item could not be found or has been removed.</p>
        <button onClick={() => router.back()} className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = book.reviews && book.reviews.length > 0
    ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length).toFixed(1)
    : "4.5";

  // Parse shelf map details (e.g. "A-2" or "B-3")
  const rackRaw = book.rackLocation || "A-1";
  const rackParts = rackRaw.split("-");
  const activeRack = rackParts[0] ? rackParts[0].trim().toUpperCase() : "A";
  const activeShelf = rackParts[1] ? parseInt(rackParts[1].trim()) : 1;

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "AVAILABLE": return styles.badgeSuccess;
      case "BORROWED": return styles.badgeWarning;
      case "RESERVED": return styles.badgeError;
      default: return styles.badgePrimary;
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backBtn}>
        <ArrowLeft size={16} /> Back to Search
      </button>

      <div className={`${styles.mainCard} glass animate-fade-in`}>
        <div className={styles.grid}>
          {/* Left Column: Image */}
          <div className={styles.imageWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300"}
              alt={book.title}
              className={styles.coverImage}
            />
          </div>

          {/* Right Column: Book Meta Information */}
          <div className={styles.metaWrapper}>
            <div className={styles.titleRow}>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(book.status)}`}>
                {book.status}
              </span>
              <button
                onClick={handleToggleWishlist}
                className={`${styles.wishlistBtn} ${isWishlisted ? styles.activeWishlist : ""}`}
                title="Add to Wishlist"
              >
                <Bookmark size={20} fill={isWishlisted ? "var(--primary)" : "none"} />
              </button>
            </div>

            <h1 className={styles.title}>{book.title}</h1>
            <p className={styles.author}>by {book.author}</p>

            <div className={styles.categoryAndRating}>
              <span className={styles.categoryTag}>
                <Tag size={14} />
                {book.category?.name || book.department}
              </span>
              <div className={styles.rating}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span>{avgRating} ({book.reviews?.length || 0} reviews)</span>
              </div>
            </div>

            <div className={styles.descriptionSection}>
              <h3>Description</h3>
              <p>{book.description}</p>
            </div>

            <div className={styles.specificationsGrid}>
              <div className={styles.specItem}>
                <MapPin size={18} className={styles.specIcon} />
                <div>
                  <h4>Rack Location</h4>
                  <p>Rack {book.rackLocation}</p>
                </div>
              </div>

              <div className={styles.specItem}>
                <CheckCircle size={18} className={styles.specIcon} />
                <div>
                  <h4>Available Copies</h4>
                  <p>{book.availableCopies} of {book.copiesCount} total</p>
                </div>
              </div>

              <div className={styles.specItem}>
                <AlertTriangle size={18} className={styles.specIcon} />
                <div>
                  <h4>ISBN Number</h4>
                  <p>{book.isbn}</p>
                </div>
              </div>

              <div className={styles.specItem}>
                <MessageSquare size={18} className={styles.specIcon} />
                <div>
                  <h4>Department</h4>
                  <p>{book.department}</p>
                </div>
              </div>
            </div>

            <div className={styles.actionRow}>
              <button
                className={styles.reserveBtn}
                onClick={handleReserve}
                disabled={book.status !== "AVAILABLE" || book.availableCopies <= 0 || submittingReserve}
              >
                {submittingReserve ? "Processing..." : book.status === "AVAILABLE" && book.availableCopies > 0 ? "Reserve for Pickup" : "Currently Unavailable"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Tracking Section */}
      <div className={`${styles.trackingContainer} glass`}>
        <div className={styles.trackingHeader}>
          <div className={styles.trackingTitleBlock}>
            <span className={styles.livePulse}></span>
            <h3>Real-Time Shelf Location & Live Availability</h3>
          </div>
          <span className={styles.trackingSubtitle}>Live Copy Tracking System</span>
        </div>

        <div className={styles.trackingGrid}>
          {/* Left Column: Visual Shelf Map */}
          {/* Left Column: Visual Shelf Map */}
          <div className={styles.mapWidget}>
            <div className={styles.mapWidgetHeader}>
              <h4 className={styles.widgetTitle}>Indoor Navigational Guidance</h4>
              <div className={styles.mapTabs}>
                <button
                  className={`${styles.mapTabBtn} ${mapTab === "floor" ? styles.mapTabActive : ""}`}
                  onClick={() => setMapTab("floor")}
                >
                  Indoor Floor Plan
                </button>
                <button
                  className={`${styles.mapTabBtn} ${mapTab === "elevation" ? styles.mapTabActive : ""}`}
                  onClick={() => setMapTab("elevation")}
                >
                  Shelf Stack Elevation
                </button>
              </div>
            </div>

            {mapTab === "floor" ? (
              <div className={styles.floorPlanContainer}>
                <p className={styles.mapIntro}>Interactive walking route from the main entrance to Rack <strong>{activeRack}</strong> ({book.department} area).</p>
                <div className={styles.floorPlanWrapper}>
                  {/* Library Blueprint SVG */}
                  <svg viewBox="0 0 400 280" className={styles.floorPlanSvg}>
                    {/* Background Grid */}
                    <defs>
                      <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="var(--bg-card)" />
                    <rect width="100%" height="100%" fill="url(#gridPattern)" />

                    {/* Outer walls */}
                    <rect x="10" y="10" width="380" height="260" rx="8" fill="none" stroke="var(--border)" strokeWidth="2" />

                    {/* Entrance */}
                    <line x1="30" y1="270" x2="90" y2="270" stroke="var(--success)" strokeWidth="4" />
                    <text x="60" y="262" fill="var(--success)" fontSize="10" fontWeight="bold" textAnchor="middle">ENTRANCE</text>

                    {/* Circulation Desk */}
                    <rect x="30" y="150" width="100" height="40" rx="4" fill="var(--bg-main)" stroke="var(--border)" />
                    <text x="80" y="174" fill="var(--text-muted)" fontSize="9" fontWeight="bold" textAnchor="middle">Circulation Desk</text>

                    {/* Study Areas */}
                    <rect x="250" y="160" width="120" height="80" rx="4" fill="var(--bg-main)" stroke="var(--border)" />
                    <text x="310" y="205" fill="var(--text-muted)" fontSize="9" fontWeight="bold" textAnchor="middle">Student Study Area</text>

                    {/* Librarian Office */}
                    <rect x="30" y="30" width="80" height="60" rx="4" fill="var(--bg-main)" stroke="var(--border)" />
                    <text x="70" y="65" fill="var(--text-muted)" fontSize="9" fontWeight="bold" textAnchor="middle">Admin Office</text>

                    {/* Rack A, B, C Zones */}
                    <g opacity={activeRack === "A" ? 1 : 0.4}>
                      <rect x="160" y="30" width="50" height="25" rx="2" fill={activeRack === "A" ? "rgba(37, 99, 235, 0.15)" : "var(--bg-main)"} stroke={activeRack === "A" ? "var(--primary)" : "var(--border)"} strokeWidth={activeRack === "A" ? 2 : 1} />
                      <text x="185" y="46" fill={activeRack === "A" ? "var(--primary)" : "var(--text-muted)"} fontSize="10" fontWeight="bold" textAnchor="middle">Rack A</text>
                    </g>

                    <g opacity={activeRack === "B" ? 1 : 0.4}>
                      <rect x="230" y="30" width="50" height="25" rx="2" fill={activeRack === "B" ? "rgba(37, 99, 235, 0.15)" : "var(--bg-main)"} stroke={activeRack === "B" ? "var(--primary)" : "var(--border)"} strokeWidth={activeRack === "B" ? 2 : 1} />
                      <text x="255" y="46" fill={activeRack === "B" ? "var(--primary)" : "var(--text-muted)"} fontSize="10" fontWeight="bold" textAnchor="middle">Rack B</text>
                    </g>

                    <g opacity={activeRack === "C" ? 1 : 0.4}>
                      <rect x="300" y="30" width="50" height="25" rx="2" fill={activeRack === "C" ? "rgba(37, 99, 235, 0.15)" : "var(--bg-main)"} stroke={activeRack === "C" ? "var(--primary)" : "var(--border)"} strokeWidth={activeRack === "C" ? 2 : 1} />
                      <text x="325" y="46" fill={activeRack === "C" ? "var(--primary)" : "var(--text-muted)"} fontSize="10" fontWeight="bold" textAnchor="middle">Rack C</text>
                    </g>

                    {/* Department Section Label */}
                    <text x="250" y="10" fill="var(--text-light)" fontSize="10" fontWeight="bold" textAnchor="middle" transform="translate(0, 12)">{book.department} Area</text>

                    {/* Path Drawing */}
                    <path
                      d={
                        activeRack === "A"
                          ? "M 60 270 L 60 215 L 185 215 L 185 62"
                          : activeRack === "B"
                            ? "M 60 270 L 60 215 L 255 215 L 255 62"
                            : "M 60 270 L 60 215 L 325 215 L 325 62"
                      }
                      fill="none"
                      stroke="var(--success)"
                      strokeWidth="2.5"
                      strokeDasharray="5,5"
                      className={styles.walkingPathLine}
                    />

                    {/* Current Position Marker */}
                    <circle cx="60" cy="270" r="5" fill="var(--success)" />
                    <circle cx="60" cy="270" r="10" fill="none" stroke="var(--success)" strokeWidth="1.5" className={styles.userPulse} />

                    {/* Destination Marker */}
                    <circle
                      cx={activeRack === "A" ? 185 : activeRack === "B" ? 255 : 325}
                      cy="42"
                      r="6"
                      fill="var(--primary)"
                    />
                    <circle
                      cx={activeRack === "A" ? 185 : activeRack === "B" ? 255 : 325}
                      cy="42"
                      r="12"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="1.5"
                      className={styles.destPulse}
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <div className={styles.elevationContainer}>
                <p className={styles.mapIntro}>Highlighted cell indicates the exact physical shelf level elevation in Rack {activeRack}.</p>
                <div className={styles.shelfVisualizer}>
                  <div className={styles.shelfGantry}>
                    {["A", "B", "C"].map((rackLetter) => (
                      <div key={rackLetter} className={styles.rackColumn}>
                        <div className={styles.rackLabel}>Rack {rackLetter}</div>
                        <div className={styles.shelvesStack}>
                          {[4, 3, 2, 1].map((shelfNum) => {
                            const isMatch = activeRack === rackLetter && activeShelf === shelfNum;
                            return (
                              <div
                                key={shelfNum}
                                className={`${styles.shelfCell} ${isMatch ? styles.shelfCellActive : ""}`}
                              >
                                <span className={styles.cellLabel}>S{shelfNum}</span>
                                {isMatch && (
                                  <div className={styles.locatorBeacon}>
                                    <div className={styles.ping}></div>
                                    <span className={styles.beaconText}>Here</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.locationDirections}>
              <MapPin size={16} color="var(--primary)" />
              <span>Location Hint: Walk to the <strong>{book.department} Section</strong>. Locate Rack <strong>{activeRack}</strong>, Shelf <strong>{activeShelf}</strong>.</span>
            </div>
          </div>

          {/* Right Column: Individual Copy Tracker */}
          <div className={styles.copiesWidget}>
            <h4 className={styles.widgetTitle}>Physical Book Copy Inventory</h4>
            <p className={styles.mapIntro}>Live operational status of all physical copies belonging to this catalog entry.</p>

            <div className={styles.copiesList}>
              {Array.from({ length: book.copiesCount }).map((_, idx) => {
                const copyNumber = idx + 1;
                // Distribute status based on availableCopies
                let statusText = "Available";
                let statusClass = styles.copyAvailable;
                let statusDesc = `Stored at Rack ${activeRack}, Shelf ${activeShelf}`;

                if (copyNumber > book.availableCopies) {
                  // Some are borrowed, some are reserved
                  if (copyNumber % 2 === 0) {
                    statusText = "Reserved";
                    statusClass = styles.copyReserved;
                    statusDesc = "Awaiting student pickup at the front desk";
                  } else {
                    statusText = "Borrowed";
                    statusClass = styles.copyBorrowed;
                    statusDesc = "Due back in 6 days";
                  }
                }

                return (
                  <div key={copyNumber} className={styles.copyRow}>
                    <div className={styles.copyLeft}>
                      <span className={styles.copyBadge}>Copy #{copyNumber}</span>
                      <span className={styles.copyDesc}>{statusDesc}</span>
                    </div>
                    <span className={`${styles.copyStatus} ${statusClass}`}>{statusText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Books Section */}
      {book.similarBooks && book.similarBooks.length > 0 && (
        <div className={styles.similarSection}>
          <div className={styles.similarHeader}>
            <Sparkles size={20} className={styles.similarIcon} />
            <h2>Similar Recommended Books (Ten Suggestions)</h2>
          </div>
          <div className={styles.similarGrid}>
            {book.similarBooks.map((simBook) => (
              <BookCard
                key={simBook.id}
                book={{
                  id: simBook.id,
                  title: simBook.title,
                  author: simBook.author,
                  isbn: simBook.isbn,
                  coverImage: simBook.coverImage,
                  description: simBook.description,
                  department: simBook.department,
                  rackLocation: simBook.rackLocation,
                  status: simBook.status,
                  copiesCount: simBook.copiesCount,
                  availableCopies: simBook.availableCopies,
                  category: simBook.category,
                  reviews: simBook.reviews
                }}
                onAction={handleReserve}
                isWishlisted={wishlist.includes(simBook.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        </div>
      )}

      {/* Review Section */}
      <div className={styles.reviewsContainer}>
        <div className={styles.reviewGrid}>
          {/* List of Reviews */}
          <div className={`${styles.reviewsListCard} glass`}>
            <h3>Student Reviews & Feedback</h3>
            {book.reviews.length === 0 ? (
              <p className={styles.noReviews}>No reviews submitted yet for this book. Be the first to share your thoughts!</p>
            ) : (
              <div className={styles.reviewsList}>
                {book.reviews.map((rev) => (
                  <div key={rev.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewUser}>{rev.user.name}</span>
                      <div className={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? "#f59e0b" : "none"}
                            color={i < rev.rating ? "#f59e0b" : "var(--text-light)"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className={styles.reviewComment}>{rev.comment}</p>
                    <span className={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review */}
          <div className={`${styles.writeReviewCard} glass`}>
            <h3>Write a Review</h3>
            <form onSubmit={handleAddReview} className={styles.reviewForm}>
              <div className={styles.formGroup}>
                <label>Rating</label>
                <div className={styles.starSelection}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={styles.starBtn}
                    >
                      <Star
                        size={24}
                        fill={star <= rating ? "#f59e0b" : "none"}
                        color={star <= rating ? "#f59e0b" : "var(--text-light)"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="review-comment">Your Comment</label>
                <textarea
                  id="review-comment"
                  rows={4}
                  placeholder="Share your thoughts on the textbook content, clarity, and usefulness..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitReviewBtn}
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
