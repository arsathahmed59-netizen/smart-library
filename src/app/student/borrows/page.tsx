"use client";

import React, { useEffect, useState } from "react";
import { History, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import styles from "./page.module.css";

interface BorrowRecord {
  id: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
  fineAmount: number;
  book: {
    title: string;
    author: string;
    coverImage: string;
  };
}

export default function MyBorrows() {
  const [history, setHistory] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);

        const res = await fetch(`/api/borrow?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "RETURNED":
        return <span className="badge badge-success"><CheckCircle size={12} style={{ marginRight: '4px' }} /> Returned</span>;
      case "BORROWED":
        return <span className="badge badge-primary"><Calendar size={12} style={{ marginRight: '4px' }} /> Borrowed</span>;
      case "OVERDUE":
        return <span className="badge badge-error"><AlertCircle size={12} style={{ marginRight: '4px' }} /> Overdue</span>;
      default:
        return <span className="badge badge-primary">{status}</span>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.headerCard} glass animate-fade-in`}>
        <History size={32} color="var(--primary)" />
        <div>
          <h2>Reading History & Borrows</h2>
          <p>Track your active loans, past reading logs, and outstanding library fines.</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Retrieving records...</div>
      ) : history.length === 0 ? (
        <div className={`${styles.emptyState} glass`}>
          <h3>No Borrow Records</h3>
          <p>You haven&apos;t borrowed any books from AuraLib yet. Visit the search page to reserve your first book!</p>
        </div>
      ) : (
        <div className="table-container glass animate-fade-in">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Accrued Fine</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className={styles.bookCell}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={record.book.coverImage} 
                        alt={record.book.title} 
                        className={styles.coverImage}
                      />
                      <span className={styles.bookTitle}>{record.book.title}</span>
                    </div>
                  </td>
                  <td>{record.book.author}</td>
                  <td>{new Date(record.borrowDate).toLocaleDateString()}</td>
                  <td>{new Date(record.dueDate).toLocaleDateString()}</td>
                  <td>
                    {record.returnDate 
                      ? new Date(record.returnDate).toLocaleDateString() 
                      : <span style={{ color: "var(--text-light)" }}>--</span>
                    }
                  </td>
                  <td>{getStatusBadge(record.status)}</td>
                  <td className={record.fineAmount > 0 ? styles.fineActive : ""}>
                    {record.fineAmount > 0 ? `₹${record.fineAmount.toFixed(2)}` : "₹0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
