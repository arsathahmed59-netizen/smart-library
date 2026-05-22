"use client";

import React, { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import Link from "next/link";
import { BookOpen, Users, AlertCircle, Bookmark, Plus, RefreshCw, BarChart2, DollarSign } from "lucide-react";
import styles from "./page.module.css";

interface AnalyticsData {
  metrics: {
    totalBooks: number;
    totalStudents: number;
    activeBorrows: number;
    pendingReservations: number;
  };
  trendingBooks: {
    id: string;
    title: string;
    author: string;
    borrowCount: number;
  }[];
  readingTrends: {
    name: string;
    count: number;
  }[];
  fines: {
    collected: number;
    outstanding: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <div className={styles.loading}>Loading Analytics Panel...</div>;
  }

  // Calculate highest count for department trends to scale the percentage bars
  const maxTrendCount = Math.max(...data.readingTrends.map((t) => t.count), 1);

  return (
    <div className={styles.container}>
      {/* Quick Stats Grid */}
      <section className={styles.statsGrid}>
        <StatsCard 
          title="Total Books" 
          value={data.metrics.totalBooks} 
          subtext="Catalog inventory count"
          icon={<BookOpen size={22} />}
          variant="blue"
        />
        <StatsCard 
          title="Registered Students" 
          value={data.metrics.totalStudents} 
          subtext="Active student accounts"
          icon={<Users size={22} />}
          variant="indigo"
        />
        <StatsCard 
          title="Active Borrows" 
          value={data.metrics.activeBorrows} 
          subtext="Circulation volume active"
          icon={<RefreshCw size={22} />}
          variant="amber"
        />
        <StatsCard 
          title="Pending Reservations" 
          value={data.metrics.pendingReservations} 
          subtext="Book pickup reservations pending"
          icon={<Bookmark size={22} />}
          variant="emerald"
        />
      </section>

      {/* Main Double Column Panels */}
      <div className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          {/* Department Distribution (Dynamic CSS Progress Bars) */}
          <div className={`${styles.widget} glass`}>
            <div className={styles.widgetHeader}>
              <BarChart2 size={20} color="var(--primary)" />
              <h3>Department Inventory Distribution</h3>
            </div>
            <div className={styles.trendsList}>
              {data.readingTrends.map((trend) => {
                const percentage = Math.round((trend.count / maxTrendCount) * 100);
                return (
                  <div key={trend.name} className={styles.trendRow}>
                    <div className={styles.trendLabel}>
                      <span>{trend.name}</span>
                      <strong>{trend.count} books</strong>
                    </div>
                    <div className={styles.trendBarWrapper}>
                      <div 
                        className={styles.trendBar} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fines Panel */}
          <div className={`${styles.widget} glass`}>
            <div className={styles.widgetHeader}>
              <DollarSign size={20} color="var(--success)" />
              <h3>Library Fines & Penalties</h3>
            </div>
            <div className={styles.finesMetrics}>
              <div className={styles.fineBox}>
                <span>Collected Fines</span>
                <h4 style={{ color: "var(--success)" }}>${data.fines.collected.toFixed(2)}</h4>
              </div>
              <div className={styles.fineBox}>
                <span>Outstanding Fines</span>
                <h4 style={{ color: "var(--error)" }}>${data.fines.outstanding.toFixed(2)}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          {/* Quick Librarian Action Buttons */}
          <div className={`${styles.widget} glass`}>
            <h3>Librarian Shortcuts</h3>
            <div className={styles.shortcutsGrid}>
              <Link href="/admin/books" className={styles.shortcutBtn}>
                <Plus size={16} /> Add New Catalog Book
              </Link>
              <Link href="/admin/circulation" className={styles.shortcutBtn}>
                <RefreshCw size={16} /> Circulation Desk
              </Link>
            </div>
          </div>

          {/* Trending books */}
          <div className={`${styles.widget} glass`}>
            <h3>Most Borrowed Titles</h3>
            {data.trendingBooks.length === 0 ? (
              <p className={styles.emptyText}>No borrow history recorded yet.</p>
            ) : (
              <div className={styles.trendingList}>
                {data.trendingBooks.map((book, i) => (
                  <div key={book.id} className={styles.trendingItem}>
                    <span className={styles.rankBadge}>{i + 1}</span>
                    <div className={styles.trendBookDetails}>
                      <h4>{book.title}</h4>
                      <p>by {book.author}</p>
                    </div>
                    <span className={styles.borrowCountTag}>
                      {book.borrowCount} issues
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
