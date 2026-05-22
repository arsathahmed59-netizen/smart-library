"use client";

import React, { useEffect, useState } from "react";
import { Users, Search, AlertCircle, Calendar, IndianRupee, BookOpen, Clock } from "lucide-react";
import styles from "./page.module.css";

interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  totalBorrows: number;
  activeBorrowsCount: number;
  unpaidFines: number;
  activeBorrowsList: {
    id: string;
    bookTitle: string;
    dueDate: string;
    status: string;
    fineAmount: number;
  }[];
}

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Student Account Directory</h2>
          <p>Monitor registered library students, active borrowings, loan history, and outstanding fines.</p>
        </div>
      </div>

      {/* Controls */}
      <div className={`${styles.searchBarRow} glass`}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search students by name or college email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.counterBadge}>
          <Users size={16} />
          <span>{filteredStudents.length} Students</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Retrieving student directory...</div>
      ) : filteredStudents.length === 0 ? (
        <div className={`${styles.emptyState} glass`}>
          <Users size={48} color="var(--text-light)" />
          <h3>No Students Found</h3>
          <p>We couldn&apos;t find any students matching your criteria. Try adjusting your search query.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredStudents.map((student) => (
            <div key={student.id} className={`${styles.card} glass animate-fade-in`}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {student.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className={styles.studentMeta}>
                  <h3>{student.name}</h3>
                  <p>{student.email}</p>
                </div>
              </div>

              {/* Quick stats row */}
              <div className={styles.statsRow}>
                <div className={styles.statBox}>
                  <BookOpen size={16} color="var(--primary)" />
                  <div>
                    <span>Total Borrowed</span>
                    <strong>{student.totalBorrows} Books</strong>
                  </div>
                </div>

                <div className={styles.statBox}>
                  <Clock size={16} color="var(--amber)" />
                  <div>
                    <span>Active Loans</span>
                    <strong>{student.activeBorrowsCount} Books</strong>
                  </div>
                </div>

                <div className={styles.statBox}>
                  <IndianRupee size={16} color={student.unpaidFines > 0 ? "var(--error)" : "var(--success)"} />
                  <div>
                    <span>Late Fines</span>
                    <strong className={student.unpaidFines > 0 ? styles.fineActive : ""}>
                      ₹{student.unpaidFines.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Active Dues Sub-Section */}
              <div className={styles.activeBorrowsSection}>
                <h4>Active Book Loans</h4>
                {student.activeBorrowsList.length === 0 ? (
                  <p className={styles.noBorrowsText}>No books checked out currently.</p>
                ) : (
                  <div className={styles.borrowList}>
                    {student.activeBorrowsList.map((loan) => (
                      <div key={loan.id} className={styles.borrowItem}>
                        <div className={styles.borrowDetails}>
                          <span className={styles.bookTitle} title={loan.bookTitle}>{loan.bookTitle}</span>
                          <span className={`${styles.dueDate} ${loan.status === "OVERDUE" ? styles.overdue : ""}`}>
                            <Calendar size={12} />
                            Due: {new Date(loan.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        {loan.status === "OVERDUE" && (
                          <span className={styles.overdueBadge}>
                            <AlertCircle size={10} /> Overdue
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
