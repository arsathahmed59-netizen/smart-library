"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Layers, Info, Edit, Trash2, Save, RefreshCw, AlertCircle, Database, CheckCircle } from "lucide-react";
import styles from "./page.module.css";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  department: string;
  rackLocation: string;
  copiesCount: number;
  availableCopies: number;
  category?: {
    id: string;
    name: string;
  } | string;
}

export default function BookLocationsManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Filter & Edit states
  const [selectedRack, setSelectedRack] = useState<"A" | "B" | "C">("A");
  const [selectedShelf, setSelectedShelf] = useState<number>(1);
  const [editingBookId, setEditingBookId] = useState("");
  const [editRack, setEditRack] = useState("A");
  const [editShelf, setEditShelf] = useState("1");
  const [libraryCode, setLibraryCode] = useState("");

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to fetch library inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    const code = localStorage.getItem("libraryCode") || "AURA-MAIN";
    setLibraryCode(code);
  }, []);

  // Parse location and group books
  const getBooksOnShelf = (rack: string, shelf: number) => {
    return books.filter((b) => {
      const loc = b.rackLocation || "A-1";
      const parts = loc.split("-");
      const r = parts[0]?.trim().toUpperCase();
      const s = parseInt(parts[1]?.trim()) || 1;
      return r === rack && s === shelf;
    });
  };

  const getUnallocatedBooks = () => {
    return books.filter((b) => {
      if (!b.rackLocation) return true;
      const parts = b.rackLocation.split("-");
      const r = parts[0]?.trim().toUpperCase();
      return !["A", "B", "C"].includes(r);
    });
  };

  // Calculate Rack Occupancy (Assume each shelf holds up to 8 books, max capacity 32 per Rack)
  const getRackOccupancy = (rack: string) => {
    const totalOnRack = books.filter((b) => {
      const loc = b.rackLocation || "A-1";
      const r = loc.split("-")[0]?.trim().toUpperCase();
      return r === rack;
    }).length;
    const capacity = 32;
    const percentage = Math.min(Math.round((totalOnRack / capacity) * 100), 100);
    return { count: totalOnRack, capacity, percentage };
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBookId) {
      setErrorMsg("Please select a book to locate.");
      return;
    }

    setUpdating(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const targetBook = books.find((b) => b.id === editingBookId);
      if (!targetBook) throw new Error("Selected book not found.");

      const newLocation = `${editRack.toUpperCase()}-${editShelf}`;

      // Update book on backend API
      const res = await fetch(`/api/books/${editingBookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...targetBook,
          categoryId: typeof targetBook.category === "object" ? targetBook.category?.id : undefined,
          rackLocation: newLocation,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update shelf location.");
      }

      setSuccessMsg(`Successfully allocated "${targetBook.title}" to Rack ${editRack}, Shelf ${editShelf}`);
      setEditingBookId("");
      await fetchBooks();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while updating the book's location.");
    } finally {
      setUpdating(false);
    }
  };

  const booksFiltered = getBooksOnShelf(selectedRack, selectedShelf);
  const unallocatedCount = getUnallocatedBooks().length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Real-Time Shelf Space & Book Location Tracker</h2>
          <p>Manage physical storage configurations, monitor shelf capacities, and locate textbooks for branch <strong>{libraryCode}</strong>.</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchBooks} disabled={loading}>
          <RefreshCw size={16} className={loading ? styles.spinning : ""} />
          Refresh Status
        </button>
      </div>

      {successMsg && (
        <div className={`${styles.alert} ${styles.alertSuccess} animate-fade-in`}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className={`${styles.alert} ${styles.alertError} animate-fade-in`}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className={styles.grid}>
        {/* Left Side: Interactive Floor Map & Shelf Occupancy */}
        <div className={styles.leftColumn}>
          <div className={`${styles.widget} glass`}>
            <div className={styles.widgetHeader}>
              <Layers size={20} color="var(--primary)" />
              <h3>Physical Rack Occupancy & Capacities</h3>
            </div>
            <p className={styles.widgetDesc}>
              Click on any shelf segment below to view books currently assigned to that coordinate.
            </p>

            <div className={styles.occupancyCards}>
              {["A", "B", "C"].map((rackLetter) => {
                const occupancy = getRackOccupancy(rackLetter);
                return (
                  <div key={rackLetter} className={styles.rackOverview}>
                    <div className={styles.rackSummaryHeader}>
                      <span className={styles.rackTitle}>Rack {rackLetter}</span>
                      <span className={styles.rackCapacity}>
                        {occupancy.count} / {occupancy.capacity} Slots ({occupancy.percentage}%)
                      </span>
                    </div>
                    <div className={styles.progressBarBg}>
                      <div 
                        className={styles.progressBar} 
                        style={{ 
                          width: `${occupancy.percentage}%`,
                          backgroundColor: occupancy.percentage > 85 ? "var(--error)" : occupancy.percentage > 60 ? "var(--amber)" : "var(--success)" 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Grid Map */}
            <div className={styles.shelfVisualizer}>
              <div className={styles.shelfGantry}>
                {["A", "B", "C"].map((rackLetter) => (
                  <div key={rackLetter} className={styles.rackColumn}>
                    <div className={styles.rackLabel}>Rack {rackLetter}</div>
                    <div className={styles.shelvesStack}>
                      {[4, 3, 2, 1].map((shelfNum) => {
                        const isFiltered = selectedRack === rackLetter && selectedShelf === shelfNum;
                        const booksCount = getBooksOnShelf(rackLetter, shelfNum).length;
                        return (
                          <button
                            key={shelfNum}
                            type="button"
                            className={`${styles.shelfCell} ${isFiltered ? styles.shelfCellActive : ""}`}
                            onClick={() => {
                              setSelectedRack(rackLetter as "A" | "B" | "C");
                              setSelectedShelf(shelfNum);
                            }}
                          >
                            <span className={styles.cellLabel}>Shelf {shelfNum}</span>
                            <span className={styles.cellCountBadge}>{booksCount} Books</span>
                            {isFiltered && <div className={styles.selectedMarker}></div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {unallocatedCount > 0 && (
              <div className={styles.unallocatedBanner}>
                <Info size={16} />
                <span>
                  <strong>{unallocatedCount} Books</strong> currently have unallocated shelf coordinates.
                </span>
                <button 
                  className={styles.unallocatedBtn}
                  onClick={() => {
                    // Set editor to first unallocated book
                    const unallocated = getUnallocatedBooks();
                    if (unallocated.length > 0) {
                      setEditingBookId(unallocated[0].id);
                    }
                  }}
                >
                  Locate Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Shelf Contents & Location Editor */}
        <div className={styles.rightColumn}>
          {/* Location Editor Form */}
          <div className={`${styles.widget} glass`}>
            <div className={styles.widgetHeader}>
              <MapPin size={20} color="var(--primary)" />
              <h3>Allocate Shelf Coordinate</h3>
            </div>
            <p className={styles.widgetDesc}>Update or re-allocate shelf coordinates for any textbook in catalog.</p>

            <form onSubmit={handleUpdateLocation} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="book-select">Select Textbook</label>
                <select
                  id="book-select"
                  value={editingBookId}
                  onChange={(e) => {
                    setEditingBookId(e.target.value);
                    const book = books.find((b) => b.id === e.target.value);
                    if (book && book.rackLocation) {
                      const parts = book.rackLocation.split("-");
                      setEditRack(parts[0] || "A");
                      setEditShelf(parts[1] || "1");
                    }
                  }}
                  required
                  className={styles.selectInput}
                >
                  <option value="">-- Choose Book --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.rackLocation ? `Shelf ${b.rackLocation}` : "Unallocated"})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.rowFields}>
                <div className={styles.formGroup}>
                  <label htmlFor="rack-select">Target Rack</label>
                  <select
                    id="rack-select"
                    value={editRack}
                    onChange={(e) => setEditRack(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="A">Rack A (Tech & Science)</option>
                    <option value="B">Rack B (Maths & Electronics)</option>
                    <option value="C">Rack C (Arts & Humanities)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="shelf-select">Target Shelf</label>
                  <select
                    id="shelf-select"
                    value={editShelf}
                    onChange={(e) => setEditShelf(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="1">Shelf 1 (Bottom)</option>
                    <option value="2">Shelf 2</option>
                    <option value="3">Shelf 3</option>
                    <option value="4">Shelf 4 (Top)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={updating || !editingBookId}>
                <Save size={16} />
                {updating ? "Saving Location..." : "Update Shelf Location"}
              </button>
            </form>
          </div>

          {/* Books on Selected Shelf Segment */}
          <div className={`${styles.widget} glass`}>
            <div className={styles.widgetHeader}>
              <Database size={20} color="var(--primary)" />
              <h3>Books on Rack {selectedRack}, Shelf {selectedShelf}</h3>
            </div>
            <p className={styles.widgetDesc}>
              Showing list of physical copy records stored under coordinates <strong>{selectedRack}-{selectedShelf}</strong>.
            </p>

            {loading ? (
              <div className={styles.loadingSmall}>Reading physical shelf segments...</div>
            ) : booksFiltered.length === 0 ? (
              <div className={styles.emptyShelfState}>
                <Info size={24} color="var(--text-light)" />
                <p>No books are stored on this shelf segment.</p>
              </div>
            ) : (
              <div className={styles.booksShelfList}>
                {booksFiltered.map((book) => (
                  <div key={book.id} className={styles.bookListItem}>
                    <div className={styles.bookItemDetails}>
                      <h4>{book.title}</h4>
                      <p>by {book.author}</p>
                      <span className={styles.bookDeptTag}>{book.department}</span>
                    </div>
                    <div className={styles.bookItemStats}>
                      <span>Copies: <strong>{book.availableCopies}/{book.copiesCount}</strong></span>
                      <button
                        className={styles.rowEditBtn}
                        onClick={() => {
                          setEditingBookId(book.id);
                          setEditRack(selectedRack);
                          setEditShelf(selectedShelf.toString());
                        }}
                      >
                        <Edit size={14} />
                      </button>
                    </div>
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
