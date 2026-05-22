"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ChatbotWidget from "@/components/ChatbotWidget";
import styles from "./student-layout.module.css";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTitle, setActiveTitle] = useState("Student Portal");

  useEffect(() => {
    // Client-side authentication check
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== "STUDENT") {
      router.push("/login");
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
        <p>Loading AuraLib...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Sidebar role="STUDENT" />
      <div className={styles.mainContent}>
        <Navbar title={activeTitle} />
        <main className={styles.pageBody}>
          {children}
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
