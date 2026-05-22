"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, RefreshCw, Check, X, Calendar, AlertCircle } from "lucide-react";
import styles from "./page.module.css";

interface Reservation {
  id: string;
  reservationDate: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
  };
}

interface BorrowRecord {
  id: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
  fineAmount: number;
  user: {
    name: string;
    email: string;
  };
  book: {
    title: string;
    author: string;
  };
}

interface OptionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface OptionBook {
  id: string;
  title: string;
  status: string;
}

export default function CirculationDesk() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  
  // Checkout form options
  const [users, setUsers] = useState<OptionUser[]>([]);
  const [books, setBooks] = useState<OptionBook[]>([]);

  // Checkout form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [durationDays, setDurationDays] = useState("14");

  const [loadingRes, setLoadingRes] = useState(true);
  const [loadingBorrows, setLoadingBorrows] = useState(true);

  const fetchReservations = async () => {
    setLoadingRes(true);
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRes(false);
    }
  };

  const fetchBorrows = async () => {
    setLoadingBorrows(true);
    try {
      const res = await fetch("/api/borrow");
      if (res.ok) {
        const data = await res.json();
        setBorrows(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBorrows(false);
    }
  };

  // Fetch initial checkout form data (users and books)
  const fetchFormOptions = async () => {
    try {
      const resBooks = await fetch("/api/books");
      const booksData = await resBooks.json();
      setBooks(booksData.books.filter((b: OptionBook) => b.status === "AVAILABLE"));
      if (booksData.books.length > 0) {
        setSelectedBookId(booksData.books.filter((b: OptionBook) => b.status === "AVAILABLE")[0]?.id || "");
      }

      // Hardcode/simulate fetching users list for simplicity (we'll fetch registration history or simple mock list)
      const resHistory = await fetch("/api/borrow");
      const borrowHistoryData = await resHistory.json();
      const extractedUsersMap: Record<string, OptionUser> = {};
      
      borrowHistoryData.forEach((rec: { user: { name: string; email: string }; userId: string }) => {
        extractedUsersMap[rec.userId] = {
          id: rec.userId,
          name: rec.user.name,
          email: rec.user.email,
          role: "STUDENT",
        };
      });

      // Always populate with a fallback user if empty
      const userList = Object.values(extractedUsersMap);
      if (userList.length === 0) {
        userList.push({
          id: "student-fallback-id",
          name: "Sample Student (Borrow)",
          email: "student@aura.edu",
          role: "STUDENT",
        });
      }
      
      setUsers(userList);
      setSelectedUserId(userList[0]?.id || "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchBorrows();
    fetchFormOptions();
  }, []);

  const handleReservationAction = async (reservationId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId, status }),
      });

      if (res.ok) {
        alert(`Reservation request was ${status.toLowerCase()} successfully.`);
        fetchReservations();
        fetchBorrows();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to update reservation.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error processing request.");
    }
  };

  const handleReturnBook = async (borrowId: string) => {
    try {
      const res = await fetch("/api/borrow", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ borrowId }),
      });

      if (res.ok) {
        alert("Book returned successfully!");
        fetchBorrows();
        fetchReservations();
        fetchFormOptions();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to process return.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error returning book.");
    }
  };

  const handleManualCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedBookId) {
      alert("Please select both a student and a book to issue.");
      return;
    }

    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          bookId: selectedBookId,
          days: parseInt(durationDays),
        }),
      });

      if (res.ok) {
        alert("Book checkout transaction recorded successfully!");
        fetchBorrows();
        fetchReservations();
        fetchFormOptions();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to record checkout transaction.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error recording checkout.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.gridTop}>
        {/* Reservation Requests Drawer */}
        <div className={`${styles.panel} glass`}>
          <h3>Pending Reservations Awaiting Pickup</h3>
          {loadingRes ? (
            <div className={styles.loading}>Loading reservations...</div>
          ) : reservations.filter((r) => r.status === "PENDING").length === 0 ? (
            <p className={styles.emptyText}>No pending reservation requests found.</p>
          ) : (
            <div className={styles.reqList}>
              {reservations.filter((r) => r.status === "PENDING").map((res) => (
                <div key={res.id} className={styles.reqItem}>
                  <div className={styles.reqMeta}>
                    <span className={styles.reqTitle}>{res.book.title}</span>
                    <span className={styles.reqStudent}>Requested by: {res.user.name} ({res.user.email})</span>
                  </div>
                  <div className={styles.actionRow}>
                    <button 
                      className={styles.approveBtn} 
                      onClick={() => handleReservationAction(res.id, "APPROVED")}
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button 
                      className={styles.rejectBtn} 
                      onClick={() => handleReservationAction(res.id, "REJECTED")}
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Checkout Form */}
        <div className={`${styles.panel} glass`}>
          <h3>Record Manual Issue (Checkout)</h3>
          <form onSubmit={handleManualCheckout} className={styles.checkoutForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="student-select">Select Student</label>
              <select 
                id="student-select"
                value={selectedUserId} 
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="book-select">Select Available Book</label>
              {books.length === 0 ? (
                <select id="book-select" disabled>
                  <option>No available books in inventory</option>
                </select>
              ) : (
                <select 
                  id="book-select"
                  value={selectedBookId} 
                  onChange={(e) => setSelectedBookId(e.target.value)}
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="duration-select">Borrow Duration (Days)</label>
              <select 
                id="duration-select"
                value={durationDays} 
                onChange={(e) => setDurationDays(e.target.value)}
              >
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>

            <button type="submit" className={styles.submitCheckoutBtn} disabled={books.length === 0}>
              <BookOpen size={16} /> Issue Book
            </button>
          </form>
        </div>
      </div>

      {/* Active Borrow Records Table */}
      <div className={`${styles.bottomPanel} glass`}>
        <h3>Active Loans & Fines Log</h3>
        {loadingBorrows ? (
          <div className={styles.loading}>Retrieving active records...</div>
        ) : borrows.filter((b) => b.status !== "RETURNED").length === 0 ? (
          <p className={styles.emptyText} style={{ padding: "3rem" }}>No active borrows or overdue records found.</p>
        ) : (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Book Title</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Late Fee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrows.filter((b) => b.status !== "RETURNED").map((record) => (
                  <tr key={record.id}>
                    <td>{record.user.name}</td>
                    <td className={styles.bookTitleCell}>{record.book.title}</td>
                    <td>{new Date(record.borrowDate).toLocaleDateString()}</td>
                    <td>{new Date(record.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${record.status === "OVERDUE" ? "badge-error" : "badge-primary"}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className={record.fineAmount > 0 ? styles.fineActive : ""}>
                      {record.fineAmount > 0 ? `$${record.fineAmount.toFixed(2)}` : "$0.00"}
                    </td>
                    <td>
                      <button 
                        className={styles.returnBtn} 
                        onClick={() => handleReturnBook(record.id)}
                      >
                        Record Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
