"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import styles from "../student/student-layout.module.css"; // Reuse dashboard layouts

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTitle, setActiveTitle] = useState("Librarian Admin Panel");

  useEffect(() => {
    // Client-side authentication check
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login?admin=true");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== "ADMIN") {
      router.push("/login?admin=true");
      return;
    }

    const libraryCode = localStorage.getItem("libraryCode");
    if (!libraryCode) {
      router.push("/select-library");
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Librarian Administration Portal...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Sidebar role="ADMIN" />
      <div className={styles.mainContent}>
        <Navbar title={activeTitle} />
        <main className={styles.pageBody}>
          {children}
        </main>
      </div>
    </div>
  );
}
