"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Mail, Lock, ArrowRight, Shield, User } from "lucide-react";
import styles from "./page.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if redirect query for admin exists
    const isAdmin = searchParams.get("admin") === "true";
    if (isAdmin) {
      setRole("ADMIN");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if roles match
      if (data.user.role !== role) {
        throw new Error(`This account is not registered as a ${role === "ADMIN" ? "Librarian" : "Student"}.`);
      }

      // Save user to local storage
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to library branch selector
      router.push("/select-library");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.loginCard} glass animate-fade-in`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <BookOpen size={20} color="#ffffff" />
            </div>
            <span className={styles.logoText}>Aura<span className={styles.logoAccent}>Lib</span></span>
          </Link>
        </div>

        <div className={styles.header}>
          <h2>Welcome Back</h2>
          <p>Access your smart library portal</p>
        </div>

        {/* Role Toggle */}
        <div className={styles.roleToggle}>
          <button 
            type="button"
            className={`${styles.roleBtn} ${role === "STUDENT" ? styles.activeRole : ""}`}
            onClick={() => setRole("STUDENT")}
          >
            <User size={16} /> Student
          </button>
          <button 
            type="button"
            className={`${styles.roleBtn} ${role === "ADMIN" ? styles.activeRole : ""}`}
            onClick={() => setRole("ADMIN")}
          >
            <Shield size={16} /> Librarian
          </button>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password">Password</label>
              <a href="#" className={styles.forgotLink} onClick={(e) => {
                e.preventDefault();
                alert("Please contact the administrator to reset your password.");
              }}>Forgot Password?</a>
            </div>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Authenticating..." : `Sign In as ${role === "ADMIN" ? "Librarian" : "Student"}`} 
            <ArrowRight size={18} />
          </button>
        </form>

        <div className={styles.footer}>
          <span>Don&apos;t have an account? </span>
          <Link href="/register" className={styles.signupLink}>
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
