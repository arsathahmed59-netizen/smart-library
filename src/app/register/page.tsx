"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, Lock, ArrowRight, User, Shield } from "lucide-react";
import styles from "../login/page.module.css"; // Reuse login styles

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess("Account created successfully! Redirecting to login...");
      
      setTimeout(() => {
        router.push(`/login?admin=${role === "ADMIN"}`);
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
          <h2>Create Account</h2>
          <p>Register a new library account</p>
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
        {success && <div className={`${styles.errorAlert} ${styles.successAlert}`} style={{ color: "var(--success)", borderColor: "rgba(16, 185, 129, 0.15)", background: "rgba(16, 185, 129, 0.08)" }}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Full Name</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={styles.input}
              />
            </div>
          </div>

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
            <label htmlFor="password">Password</label>
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
            {loading ? "Registering..." : `Register as ${role === "ADMIN" ? "Librarian" : "Student"}`} 
            <ArrowRight size={18} />
          </button>
        </form>

        <div className={styles.footer}>
          <span>Already have an account? </span>
          <Link href="/login" className={styles.signupLink}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
