"use client";

import React from "react";
import styles from "./StatsCard.module.css";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  variant?: "blue" | "indigo" | "emerald" | "amber" | "rose";
}

export default function StatsCard({ 
  title, 
  value, 
  subtext, 
  icon, 
  variant = "blue" 
}: StatsCardProps) {
  return (
    <div className={`${styles.card} glass`}>
      <div className={styles.header}>
        <div className={styles.textContainer}>
          <span className={styles.title}>{title}</span>
          <h2 className={styles.value}>{value}</h2>
        </div>
        <div className={`${styles.iconContainer} ${styles[variant]}`}>
          {icon}
        </div>
      </div>
      <div className={styles.footer}>
        <span className={styles.subtext}>{subtext}</span>
      </div>
    </div>
  );
}
