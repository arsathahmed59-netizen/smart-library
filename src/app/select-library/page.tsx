"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Key, ArrowRight, Server, Globe } from "lucide-react";
import styles from "./page.module.css";

const PRESET_CODES = [
  { code: "AURA-MAIN", name: "Aura University Main Library" },
  { code: "MIT-ENG", name: "MIT Engineering Department Library" },
  { code: "STANFORD-CS", name: "Stanford Computer Science Library" },
  { code: "OXFORD-LIT", name: "Oxford English Literature Library" }
];

export default function SelectLibraryPage() {
  const router = useRouter();
  const [libraryCode, setLibraryCode] = useState("");
  const [userRole, setUserRole] = useState("STUDENT");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(storedUser);
    setUserRole(user.role);
    
    // Autofill if already has a code
    const existingCode = localStorage.getItem("libraryCode");
    if (existingCode) {
      setLibraryCode(existingCode);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!libraryCode.trim()) {
      setError("Please enter a valid library code.");
      return;
    }

    const code = libraryCode.trim().toUpperCase();
    localStorage.setItem("libraryCode", code);

    // Redirect to appropriate dashboard
    if (userRole === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/student");
    }
  };

  const handleSelectPreset = (code: string) => {
    setLibraryCode(code);
    setError("");
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} glass animate-fade-in`}>
        {/* Brand Logo */}
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <BookOpen size={20} color="#ffffff" />
          </div>
          <span className={styles.logoText}>Aura<span className={styles.logoAccent}>Lib</span></span>
        </div>

        <div className={styles.header}>
          <h2>Connect Library</h2>
          <p>This is an open-source deployment. Please enter your institution's library code to connect to the correct catalog.</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="library-code">Library Access Code</label>
            <div className={styles.inputWrapper}>
              <Key size={18} className={styles.inputIcon} />
              <input
                id="library-code"
                type="text"
                placeholder="e.g. AURA-MAIN"
                value={libraryCode}
                onChange={(e) => {
                  setLibraryCode(e.target.value);
                  setError("");
                }}
                required
                className={styles.input}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Access Library Branch
            <ArrowRight size={18} />
          </button>
        </form>

        <div className={styles.presetSection}>
          <h3>Quick Presets (Demo Branches)</h3>
          <div className={styles.presetsList}>
            {PRESET_CODES.map((preset) => (
              <button
                key={preset.code}
                type="button"
                className={`${styles.presetBtn} ${libraryCode.toUpperCase() === preset.code ? styles.presetActive : ""}`}
                onClick={() => handleSelectPreset(preset.code)}
              >
                <div className={styles.presetHeader}>
                  <Globe size={12} className={styles.presetIcon} />
                  <span>{preset.code}</span>
                </div>
                <p className={styles.presetDesc}>{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <span>Logged in as <strong>{userRole === "ADMIN" ? "Librarian" : "Student"}</strong>. </span>
          <a href="#" className={styles.logoutLink} onClick={(e) => {
            e.preventDefault();
            localStorage.removeItem("user");
            localStorage.removeItem("libraryCode");
            router.push("/login");
          }}>
            Log Out
          </a>
        </div>
      </div>
    </div>
  );
}
