"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  LayoutDashboard, 
  Search, 
  History, 
  Bookmark, 
  User, 
  Database, 
  Users, 
  RefreshCw, 
  BarChart2, 
  LogOut,
  MapPin,
  Globe
} from "lucide-react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  role: "STUDENT" | "ADMIN";
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const studentLinks = [
    { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    { name: "Search Books", href: "/student/search", icon: Search },
    { name: "Digital Hub", href: "/student/digital", icon: Globe },
    { name: "My Borrows", href: "/student/borrows", icon: History },
    { name: "Wishlist", href: "/student/wishlist", icon: Bookmark },
    { name: "My Profile", href: "/student/profile", icon: User },
  ];

  const adminLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Inventory", href: "/admin/books", icon: Database },
    { name: "Circulation", href: "/admin/circulation", icon: RefreshCw },
    { name: "Book Locations", href: "/admin/locations", icon: MapPin },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  ];

  const links = role === "ADMIN" ? adminLinks : studentLinks;

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <aside className={`${styles.sidebar} glass`}>
      <div className={styles.brand}>
        <div className={styles.logoIcon}>
          <BookOpen size={24} color="#ffffff" />
        </div>
        <span className={styles.brandName}>Aura<span className={styles.brandAccent}>Lib</span></span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.sectionTitle}>
          {role === "ADMIN" ? "Librarian Panel" : "Student Hub"}
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <Icon size={20} className={styles.linkIcon} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
