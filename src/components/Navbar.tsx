"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Bell, User as UserIcon, Check } from "lucide-react";
import { useTheme } from "@/app/theme-context";
import styles from "./Navbar.module.css";

interface NotificationItem {
  id: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [libraryCode, setLibraryCode] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Fetch logged in user details
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const code = localStorage.getItem("libraryCode");
    if (code) {
      setLibraryCode(code);
    }

    // Fetch user notifications
    const fetchNotifications = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        const parsed = JSON.parse(storedUser);
        const res = await fetch(`/api/notifications?userId=${parsed.id}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();

    // Check notifications every 10 seconds (mock real-time updates)
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const parsed = JSON.parse(storedUser);
      const res = await fetch(`/api/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: parsed.id }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className={`${styles.navbar} glass`}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>{title}</h1>
        {libraryCode && (
          <span className={styles.libraryBadge} title="Active Library Access Code">
            Branch: {libraryCode}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        {/* Theme Toggle */}
        <button 
          className={styles.iconBtn} 
          onClick={toggleTheme} 
          aria-label="Toggle Theme"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications */}
        <div className={styles.notifyWrapper}>
          <button 
            className={`${styles.iconBtn} ${unreadCount > 0 ? styles.pulse : ""}`} 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className={`${styles.dropdown} glass`}>
              <div className={styles.dropdownHeader}>
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className={styles.markReadBtn} onClick={markAllRead}>
                    <Check size={14} /> Mark all read
                  </button>
                )}
              </div>
              <div className={styles.notificationList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotifications}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`${styles.notificationItem} ${!notif.read ? styles.unread : ""}`}
                    >
                      <p className={styles.notifyMsg}>{notif.message}</p>
                      <span className={styles.notifyTime}>
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        {user && (
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              <UserIcon size={18} color="var(--primary)" />
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
