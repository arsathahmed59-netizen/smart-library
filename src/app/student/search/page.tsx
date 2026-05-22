"use client";

import React, { useEffect, useState } from "react";
import BookCard, { BookType } from "@/components/BookCard";
import { Search, Mic, QrCode, SlidersHorizontal, BookOpen } from "lucide-react";
import styles from "./page.module.css";

interface Category {
  id: string;
  name: string;
}

export default function BookSearch() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<{ text: string; type: string }[]>([]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        query: search,
        category: selectedCategory,
        department: selectedDepartment,
        status: selectedStatus,
      });

      const res = await fetch(`/api/books?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books);
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search input
    const timer = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory, selectedDepartment, selectedStatus]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setWishlist(JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || "[]"));
    }
  }, []);

  // Compute search suggestions instantly
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    const query = search.toLowerCase();
    const matches: { text: string; type: string }[] = [];

    // Match categories
    categories.forEach((cat) => {
      if (cat.name.toLowerCase().includes(query) && !matches.some((m) => m.text === cat.name)) {
        matches.push({ text: cat.name, type: "Category" });
      }
    });

    // Match departments
    const departments = ["Computer Science", "Engineering", "Mathematics", "Science", "Literature"];
    departments.forEach((dept) => {
      if (dept.toLowerCase().includes(query) && !matches.some((m) => m.text === dept)) {
        matches.push({ text: dept, type: "Department" });
      }
    });

    // Match book titles/authors
    books.forEach((book) => {
      if (book.title.toLowerCase().includes(query) && !matches.some((m) => m.text === book.title)) {
        matches.push({ text: book.title, type: "Book Title" });
      }
      if (book.author.toLowerCase().includes(query) && !matches.some((m) => m.text === book.author)) {
        matches.push({ text: book.author, type: "Author" });
      }
    });

    setSuggestions(matches.slice(0, 5));
  }, [search, books, categories]);

  const handleSelectSuggestion = (suggestion: { text: string; type: string }) => {
    setSearch(suggestion.text);
    setSuggestions([]);
  };

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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reservation failed");

      alert("Book reserved successfully! Pending librarian approval.");
      fetchBooks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reserve book");
    }
  };

  // Voice Search Handler
  const startVoiceSearch = () => {
    // Check Speech Recognition API support
    const SpeechRecognition = 
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition || 
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;

    rec.onstart = () => {
      setListening(true);
    };

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setSearch(transcript);
      setListening(false);
    };

    rec.onerror = () => {
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
    };

    rec.start();
  };

  // Simulate barcode scanner
  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      // Simulate finding a matching ISBN book after 2 seconds
      setScanning(false);
      if (books.length > 0) {
        // Pick a random book and simulate barcode scan of its ISBN
        const randomBook = books[Math.floor(Math.random() * books.length)];
        setSearch(randomBook.isbn);
        alert(`Scan Complete! Found ISBN: ${randomBook.isbn} (${randomBook.title})`);
      } else {
        alert("Barcode scanner failed: catalog is currently empty.");
      }
    }, 2000);
  };

  return (
    <div className={styles.container}>
      {/* Search Header Controls */}
      <div className={`${styles.searchPanel} glass animate-fade-in`}>
        <div className={styles.searchBarRow}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search by Title, Author, ISBN, or Category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => setTimeout(() => setSuggestions([]), 200)}
              className={styles.searchInput}
            />
            {listening && <span className={styles.listeningText}>Listening...</span>}
            
            {suggestions.length > 0 && (
              <ul className={styles.suggestionsDropdown}>
                {suggestions.map((sug, idx) => (
                  <li 
                    key={idx} 
                    onClick={() => handleSelectSuggestion(sug)}
                    className={styles.suggestionItem}
                  >
                    <span className={styles.suggestionText}>{sug.text}</span>
                    <span className={styles.suggestionType}>{sug.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.btnRow}>
            <button 
              className={`${styles.actionIconBtn} ${listening ? styles.activeIcon : ""}`}
              onClick={startVoiceSearch}
              title="Voice Search"
            >
              <Mic size={20} />
            </button>
            <button 
              className={styles.actionIconBtn}
              onClick={simulateScan}
              title="Scan QR/Barcode"
            >
              <QrCode size={20} />
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <SlidersHorizontal size={16} color="var(--primary)" />
            <span className={styles.filterTitle}>Filters:</span>
          </div>

          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Literature">Literature</option>
            <option value="Science">Science</option>
          </select>

          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="BORROWED">Borrowed</option>
            <option value="RESERVED">Reserved</option>
          </select>
        </div>
      </div>

      {/* Simulator Scan Overlay */}
      {scanning && (
        <div className={styles.scanOverlay}>
          <div className={`${styles.scanBox} glass`}>
            <QrCode size={64} className={styles.scanBarcode} />
            <p>Scanning QR / Barcode...</p>
            <div className={styles.laserLine}></div>
          </div>
        </div>
      )}

      {/* Book Grid results */}
      {loading ? (
        <div className={styles.loading}>Searching AuraLib catalog...</div>
      ) : books.length === 0 ? (
        <div className={`${styles.emptyState} glass`}>
          <BookOpen size={48} color="var(--text-light)" />
          <h3>No Books Found</h3>
          <p>We couldn&apos;t find any books matching your criteria. Try adjusting your filters or clearing your search.</p>
        </div>
      ) : (
        <div className={styles.bookGrid}>
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onAction={handleReserve}
              isWishlisted={wishlist.includes(book.id)}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Add types for Web Speech API
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition {
  lang: string;
  interimResults: boolean;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
}
