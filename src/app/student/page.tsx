"use client";

import React, { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import BookCard, { BookType } from "@/components/BookCard";
import { BookOpen, AlertCircle, Bookmark, Sparkles, Trophy, Calendar, Award, QrCode, CreditCard, X, Check } from "lucide-react";
import styles from "./page.module.css";

interface DashboardData {
  stats: {
    activeBorrows: number;
    pendingReservations: number;
    totalFines: number;
    readingGoal: string;
  };
  recommendations: BookType[];
  trending: BookType[];
  recentlyAdded: BookType[];
  activeBorrowsList: {
    id: string;
    book: BookType;
    dueDate: string;
    status: string;
  }[];
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);

        // Fetch borrows, reservations, recommendations, and library analytics
        const savedBranch = localStorage.getItem("userBranch") || "Computer Science";
        const savedInterests = localStorage.getItem("userInterests") || "[]";

        const [borrowsRes, recsRes, booksRes, analyticsRes] = await Promise.all([
          fetch(`/api/borrow?userId=${user.id}`),
          fetch(`/api/ai/recommendations?userId=${user.id}&branch=${encodeURIComponent(savedBranch)}&interests=${encodeURIComponent(savedInterests)}`),
          fetch(`/api/books`),
          fetch(`/api/analytics`),
        ]);

        const borrows = await borrowsRes.json();
        const recs = await recsRes.json();
        const booksData = await booksRes.json();
        const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;

        // Calculate custom stats
        const activeBorrows = borrows.filter((b: { status: string }) => b.status === "BORROWED" || b.status === "OVERDUE");
        const totalFines = activeBorrows.reduce((sum: number, b: { fineAmount: number }) => sum + b.fineAmount, 0);

        // Mock pending reservations fetch
        const resListRes = await fetch(`/api/reservations?userId=${user.id}`);
        const reservations = resListRes.ok ? await resListRes.json() : [];
        const pendingReservationsCount = Array.isArray(reservations) ? reservations.filter((r) => r.status === "PENDING").length : 0;

        // Get saved wishlist
        const savedWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || "[]");
        setWishlist(savedWishlist);

        // Calculate trending books from actual checkout volumes
        const trendingList: BookType[] = [];
        if (analyticsData && Array.isArray(analyticsData.trendingBooks)) {
          analyticsData.trendingBooks.forEach((tb: { id: string }) => {
            const found = booksData.books.find((b: BookType) => b.id === tb.id);
            if (found) trendingList.push(found);
          });
        }

        // Fillers for trending if empty
        if (trendingList.length < 4) {
          const existingIds = new Set(trendingList.map((b) => b.id));
          const fillers = booksData.books.filter((b: BookType) => !existingIds.has(b.id));
          trendingList.push(...fillers.slice(0, 4 - trendingList.length));
        }

        setData({
          stats: {
            activeBorrows: activeBorrows.length,
            pendingReservations: pendingReservationsCount,
            totalFines,
            readingGoal: "5 / 12 books",
          },
          recommendations: recs,
          trending: trendingList.slice(0, 4),
          recentlyAdded: booksData.books.slice(0, 4),
          activeBorrowsList: activeBorrows,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleToggleWishlist = (bookId: string) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);

    const updated = wishlist.includes(bookId)
      ? wishlist.filter((id) => id !== bookId)
      : [...wishlist, bookId];
    
    setWishlist(updated);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updated));
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

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Reservation failed");

      alert("Book reserved successfully! Awaiting librarian approval.");
      // Reload page to reflect updated status
      window.location.reload();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reserve book");
    }
  };

  const handlePayment = async () => {
    setSubmittingPayment(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const res = await fetch("/api/fines/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        alert("Payment processed successfully! Your library fines have been cleared.");
        setShowPaymentModal(false);
        window.location.reload();
      } else {
        const errData = await res.json();
        alert(errData.error || "Payment processing failed.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during payment simulation.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading || !data) {
    return <div className={styles.loading}>Loading Dashboard Overview...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Stats Cards Section */}
      <section className={styles.statsGrid}>
        <StatsCard 
          title="Active Borrows" 
          value={data.stats.activeBorrows} 
          subtext="Issued items currently with you"
          icon={<BookOpen size={22} />}
          variant="blue"
        />
        <StatsCard 
          title="Reservations" 
          value={data.stats.pendingReservations} 
          subtext="Requests awaiting pickup"
          icon={<Bookmark size={22} />}
          variant="indigo"
        />
        <StatsCard 
          title="Fines Due" 
          value={`₹${data.stats.totalFines.toFixed(2)}`} 
          subtext="Accrued overdue penalties"
          icon={<AlertCircle size={22} />}
          variant="rose"
        />
        <StatsCard 
          title="Reading Goal" 
          value={data.stats.readingGoal} 
          subtext="Target reading for this semester"
          icon={<Trophy size={22} />}
          variant="emerald"
        />
      </section>

      {/* Main Grid split: Main Area, Sidebar Widgets */}
      <div className={styles.mainGrid}>
        <div className={styles.mainPanel}>
          {/* AI Recommendations */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Sparkles size={20} className={styles.sectionIcon} />
              <h2>AI Personalized Recommendations</h2>
            </div>
            <div className={styles.bookGrid}>
              {data.recommendations.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onAction={handleReserve}
                  isWishlisted={wishlist.includes(book.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          </section>

          {/* Most Borrowed Books */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Award size={20} className={styles.sectionIcon} />
              <h2>Most Borrowed Books</h2>
            </div>
            <div className={styles.bookGrid}>
              {data.trending.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onAction={handleReserve}
                  isWishlisted={wishlist.includes(book.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          </section>

          {/* Recently Added Books */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Calendar size={20} className={styles.sectionIcon} />
              <h2>Recently Added Books</h2>
            </div>
            <div className={styles.bookGrid}>
              {data.recentlyAdded.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onAction={handleReserve}
                  isWishlisted={wishlist.includes(book.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Panel widgets */}
        <div className={styles.sidePanel}>
          {/* Active Borrows */}
          <div className={`${styles.widget} glass`}>
            <h3>Active Book Dues</h3>
            {data.activeBorrowsList.length === 0 ? (
              <p className={styles.emptyText}>No books checked out currently.</p>
            ) : (
              <div className={styles.borrowList}>
                {data.activeBorrowsList.map((item) => (
                  <div key={item.id} className={styles.borrowItem}>
                    <div className={styles.borrowMeta}>
                      <span className={styles.borrowTitle}>{item.book.title}</span>
                      <span className={styles.borrowAuthor}>by {item.book.author}</span>
                    </div>
                    <div className={styles.borrowDateRow}>
                      <Calendar size={14} />
                      <span className={`${styles.dueDate} ${item.status === "OVERDUE" ? styles.overdue : ""}`}>
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outstanding Fines & Payments Widget */}
          <div className={`${styles.widget} glass`}>
            <h3>Penalties & Payments</h3>
            {data.stats.totalFines === 0 ? (
              <div className={styles.fineAllClear}>
                <Check size={18} color="var(--success)" />
                <span>All clear! No outstanding fines.</span>
              </div>
            ) : (
              <div className={styles.finePaymentBlock}>
                <div className={styles.fineDetailRow}>
                  <span>Overdue Penalty:</span>
                  <strong className={styles.fineAmountText}>₹{data.stats.totalFines.toFixed(2)}</strong>
                </div>
                <p className={styles.fineWarningText}>Unpaid fines may restrict future catalog hold reservations.</p>
                <button 
                  className={styles.payFinesBtn} 
                  onClick={() => setShowPaymentModal(true)}
                >
                  <QrCode size={16} /> Pay via UPI / QR
                </button>
              </div>
            )}
          </div>

          {/* Gamification Badges */}
          <div className={`${styles.widget} glass`}>
            <h3>Achievements</h3>
            <div className={styles.badgeGrid}>
              <div className={styles.achievementBadge}>
                <div className={styles.badgeIconGold}>
                  <Trophy size={20} />
                </div>
                <div>
                  <h4>Avid Reader</h4>
                  <p>Read 5+ books</p>
                </div>
              </div>
              <div className={styles.achievementBadge}>
                <div className={styles.badgeIconSilver}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4>Bookworm</h4>
                  <p>Check out 3 departments</p>
                </div>
              </div>
              <div className={styles.achievementBadge}>
                <div className={styles.badgeIconBronze}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4>Early Bird</h4>
                  <p>Reserve a book online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UPI DIGITAL PAYMENT OVERLAY */}
      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.paymentCard} glass animate-fade-in`}>
            <div className={styles.paymentHeader}>
              <div className={styles.paymentTitleBlock}>
                <CreditCard size={20} color="var(--primary)" />
                <h4>AuraLib UPI Payment Gateway</h4>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowPaymentModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.paymentBody}>
              <div className={styles.paymentQRBlock}>
                <div className={styles.qrCodeWrapper}>
                  {/* Simulated QR Code SVG */}
                  <svg width="180" height="180" viewBox="0 0 100 100" className={styles.qrCodeSvg}>
                    <rect width="100" height="100" fill="#fff" />
                    {/* Corners */}
                    <rect x="5" y="5" width="20" height="20" fill="#000" />
                    <rect x="8" y="8" width="14" height="14" fill="#fff" />
                    <rect x="10" y="10" width="10" height="10" fill="#000" />
                    
                    <rect x="75" y="5" width="20" height="20" fill="#000" />
                    <rect x="78" y="8" width="14" height="14" fill="#fff" />
                    <rect x="80" y="10" width="10" height="10" fill="#000" />

                    <rect x="5" y="75" width="20" height="20" fill="#000" />
                    <rect x="8" y="78" width="14" height="14" fill="#fff" />
                    <rect x="10" y="80" width="10" height="10" fill="#000" />

                    {/* Random bits simulating QR code */}
                    <rect x="35" y="15" width="8" height="8" fill="#000" />
                    <rect x="50" y="25" width="12" height="6" fill="#000" />
                    <rect x="15" y="45" width="6" height="12" fill="#000" />
                    <rect x="40" y="45" width="15" height="15" fill="#000" />
                    <rect x="65" y="40" width="10" height="10" fill="#000" />
                    <rect x="60" y="65" width="15" height="10" fill="#000" />
                    <rect x="35" y="75" width="8" height="12" fill="#000" />
                    <rect x="15" y="60" width="8" height="8" fill="#000" />
                    <rect x="75" y="60" width="12" height="12" fill="#000" />
                    <rect x="50" y="75" width="6" height="18" fill="#000" />

                    {/* Mini Center Logo */}
                    <rect x="42" y="42" width="16" height="16" fill="#fff" />
                    <rect x="44" y="44" width="12" height="12" fill="var(--primary)" />
                  </svg>
                  {/* Sweep Line */}
                  <div className={styles.qrScannerSweep}></div>
                </div>
                <span className={styles.qrHelpText}>Scan QR Code with GPay, PhonePe, Paytm, or BHIM</span>
              </div>

              <div className={styles.paymentDetails}>
                <div className={styles.detailItem}>
                  <span>Merchant:</span>
                  <strong>AuraLib Branch Kiosk</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Total Due:</span>
                  <strong className={styles.payAmountText}>₹{data.stats.totalFines.toFixed(2)}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Transaction ID:</span>
                  <span className={styles.txnId}>TXN-{(Math.random() * 1000000000000000).toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div className={styles.paymentFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
              <button 
                className={styles.simPayBtn} 
                onClick={handlePayment}
                disabled={submittingPayment}
              >
                {submittingPayment ? "Authorizing..." : "Simulate Payment Success"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
