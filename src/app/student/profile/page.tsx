"use client";

import React, { useEffect, useState } from "react";
import { User, Mail, Award, Clock, Star, Edit, Shield } from "lucide-react";
import styles from "./page.module.css";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  joined: string;
}

export default function StudentProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goal, setGoal] = useState(12); // Semesterly book goal
  const [currentRead, setCurrentRead] = useState(5);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState("12");
  
  const [branch, setBranch] = useState("Computer Science");
  const [interests, setInterests] = useState<string[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setProfile({
        name: user.name,
        email: user.email,
        role: user.role === "STUDENT" ? "Student" : "Admin",
        joined: "May 2026", // Mock join date
      });
      
      const savedBranch = localStorage.getItem("userBranch") || "Computer Science";
      const savedInterests = JSON.parse(localStorage.getItem("userInterests") || "[]");
      setBranch(savedBranch);
      setInterests(savedInterests);
    }
  }, []);

  const handleSaveGoal = () => {
    const parsed = parseInt(newGoal);
    if (!isNaN(parsed) && parsed > 0) {
      setGoal(parsed);
      setEditingGoal(false);
    }
  };

  const handleToggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSaveProfile = () => {
    localStorage.setItem("userBranch", branch);
    localStorage.setItem("userInterests", JSON.stringify(interests));
    setEditingProfile(false);
    alert("Academic profile updated successfully! Recommendations are now tailored to your branch.");
  };

  const progressPercentage = Math.min(100, Math.round((currentRead / goal) * 100));

  if (!profile) {
    return <div className={styles.loading}>Loading student profile...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Profile Header Card */}
      <div className={`${styles.profileCard} glass animate-fade-in`}>
        <div className={styles.avatarBig}>
          <User size={48} color="var(--primary)" />
        </div>
        <div className={styles.profileDetails}>
          <h2>{profile.name}</h2>
          <div className={styles.metaRow}>
            <span className={styles.roleTag}>
              <Shield size={12} /> {profile.role}
            </span>
            <span className={styles.joinedTag}>
              <Clock size={12} /> Joined {profile.joined}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Account Details */}
        <div className={`${styles.panel} glass`}>
          <div className={styles.panelHeader}>
            <h3>Academic Branch & Interests</h3>
            {!editingProfile ? (
              <button className={styles.editBtn} onClick={() => setEditingProfile(true)}>
                <Edit size={14} /> Edit Profile
              </button>
            ) : (
              <button className={styles.saveBtn} onClick={handleSaveProfile}>
                Save Profile
              </button>
            )}
          </div>

          {editingProfile ? (
            <div className={styles.editProfileForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Academic Branch / Department</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className={styles.profileSelect}
                >
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Electronics">Electronics & Communication</option>
                  <option value="Electrical">Electrical & Electronics</option>
                  <option value="Mathematics">Mathematics & Stats</option>
                  <option value="Science & Humanities">Science & Humanities</option>
                  <option value="Placement Cells">Placement & Career Cells</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Reading Interests</label>
                <div className={styles.interestCheckboxes}>
                  {[
                    "Artificial Intelligence",
                    "Programming",
                    "Digital Design",
                    "Calculus & Mathematics",
                    "Physics & Science",
                  ].map((interest) => (
                    <label key={interest} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={interests.includes(interest)}
                        onChange={() => handleToggleInterest(interest)}
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <User size={18} className={styles.infoIcon} />
                <div>
                  <span>Full Name</span>
                  <p>{profile.name}</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Mail size={18} className={styles.infoIcon} />
                <div>
                  <span>Email Address</span>
                  <p>{profile.email}</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Shield size={18} className={styles.infoIcon} />
                <div>
                  <span>Academic Branch</span>
                  <p><strong>{branch}</strong></p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Star size={18} className={styles.infoIcon} />
                <div>
                  <span>Reading Interests</span>
                  <p>
                    {interests.length === 0
                      ? "None declared yet. Edit profile to configure."
                      : interests.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reading Goal Widget */}
        <div className={`${styles.panel} glass`}>
          <div className={styles.panelHeader}>
            <h3>Reading Goals</h3>
            <button 
              className={styles.editBtn} 
              onClick={() => {
                setEditingGoal(true);
                setNewGoal(goal.toString());
              }}
            >
              <Edit size={14} /> Edit Target
            </button>
          </div>

          <div className={styles.goalContent}>
            {editingGoal ? (
              <div className={styles.editForm}>
                <input 
                  type="number" 
                  value={newGoal} 
                  onChange={(e) => setNewGoal(e.target.value)}
                  className={styles.goalInput}
                />
                <button className={styles.saveBtn} onClick={handleSaveGoal}>Save</button>
              </div>
            ) : (
              <div className={styles.goalStats}>
                <span className={styles.goalText}>
                  Progress: <strong>{currentRead}</strong> of <strong>{goal}</strong> books read this semester
                </span>
                <div className={styles.progressBarWrapper}>
                  <div 
                    className={styles.progressBar} 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <span className={styles.percentageText}>{progressPercentage}% Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gamification Achievements Section */}
      <div className={`${styles.achievementsPanel} glass`}>
        <h3>Library Achievements & Badges</h3>
        <div className={styles.badgeGrid}>
          <div className={styles.achievementBadge}>
            <div className={styles.badgeIconGold}>
              <Award size={24} />
            </div>
            <div>
              <h4>Avid Reader</h4>
              <p>Completed your first reading goal of the semester.</p>
              <span className={styles.badgeUnlocked}>Unlocked</span>
            </div>
          </div>

          <div className={styles.achievementBadge}>
            <div className={styles.badgeIconSilver}>
              <Star size={24} />
            </div>
            <div>
              <h4>Punctual Scholar</h4>
              <p>Returned 5 consecutive books without any accrued fines.</p>
              <span className={styles.badgeUnlocked}>Unlocked</span>
            </div>
          </div>

          <div className={styles.achievementBadge}>
            <div className={styles.badgeIconBronze}>
              <Clock size={24} />
            </div>
            <div>
              <h4>Night Owl</h4>
              <p>Checked out digital books after library operating hours.</p>
              <span className={styles.badgeUnlocked}>Unlocked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
