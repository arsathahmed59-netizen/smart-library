"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Bot, Sparkles, Shield, ArrowRight, Zap, GraduationCap } from "lucide-react";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={`${styles.navbar} glass`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <BookOpen size={22} color="#ffffff" />
          </div>
          <span className={styles.logoText}>Aura<span className={styles.logoAccent}>Lib</span></span>
        </div>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navLink}>Student Portal</Link>
          <Link href="/login?admin=true" className={styles.navLink}>Librarian Sign In</Link>
          <Link href="/login" className={`${styles.primaryBtn} ${styles.btnSmall}`}>
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badgeWrapper}>
            <span className={styles.heroBadge}>
              <Sparkles size={14} className={styles.sparkleIcon} />
              AI-Powered Library Management
            </span>
          </div>
          <h1 className={styles.heroTitle}>
            The Smart Digital Hub for <span className="gradient-text">Modern Libraries</span>
          </h1>
          <p className={styles.heroDesc}>
            Elevate your academic journey. Explore instant catalog searches, manage reservations online, and get personalized reading recommendations from our 24/7 AI-assistant chatbot.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/login" className={styles.primaryBtn}>
              Student Log In <ArrowRight size={18} />
            </Link>
            <Link href="/login?admin=true" className={styles.secondaryBtn}>
              Librarian Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div className={styles.heroVisual}>
          <div className={`${styles.visualCard} glass ${styles.card1}`}>
            <div className={styles.cardIconBlue}>
              <Bot size={24} />
            </div>
            <h4>24/7 AI Assistant</h4>
            <p>Get instant recommendations and due-date alerts from our chatbot.</p>
          </div>
          <div className={`${styles.visualCard} glass ${styles.card2}`}>
            <div className={styles.cardIconPurple}>
              <Sparkles size={24} />
            </div>
            <h4>Smart Recommendations</h4>
            <p>Discover your next read based on custom borrowing history.</p>
          </div>
          <div className={`${styles.visualCard} glass ${styles.card3}`}>
            <div className={styles.cardIconGreen}>
              <Zap size={24} />
            </div>
            <h4>Real-time Tracking</h4>
            <p>Instantly check rack locations and real-time availability.</p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={`${styles.stats} glass`}>
        <div className={styles.statItem}>
          <h2>10,000+</h2>
          <p>Digital & Physical Books</p>
        </div>
        <div className={styles.statItem}>
          <h2>2,500+</h2>
          <p>Active Student Users</p>
        </div>
        <div className={styles.statItem}>
          <h2>99.4%</h2>
          <p>On-Time Returns</p>
        </div>
        <div className={styles.statItem}>
          <h2>&lt; 1s</h2>
          <p>Instant Search Speeds</p>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Designed for Students & Librarians</h2>
          <p className={styles.sectionDesc}>
            Everything you need to automate library management, organize inventory, and enhance student engagement.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.featureCard} glass`}>
            <Bot size={36} color="var(--primary)" />
            <h3>Virtual Library Assistant</h3>
            <p>A floating chat assistant help students find book racks, calculate overdue fees, and check active due dates instantly.</p>
          </div>
          <div className={`${styles.featureCard} glass`}>
            <GraduationCap size={36} color="var(--secondary)" />
            <h3>Personalized Recommendations</h3>
            <p>Our intelligent matching engine suggests academic resources and trending titles suited to individual reading habits.</p>
          </div>
          <div className={`${styles.featureCard} glass`}>
            <Shield size={36} color="var(--success)" />
            <h3>Automated Inventory</h3>
            <p>Librarians can easily manage books, track active issues, approve reservations, and monitor analytics charts dynamically.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} AuraLib Platform. Designed for modern higher education institutions.</p>
      </footer>
    </div>
  );
}
