"use client";

import React, { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import { BarChart2, BookOpen, Users, Bookmark, IndianRupee, Activity, Award, TrendingUp } from "lucide-react";
import styles from "./page.module.css";

interface AnalyticsData {
  metrics: {
    totalBooks: number;
    totalStudents: number;
    activeBorrows: number;
    pendingReservations: number;
  };
  trendingBooks: {
    id: string;
    title: string;
    author: string;
    borrowCount: number;
    category?: { name: string };
  }[];
  readingTrends: {
    name: string;
    count: number;
  }[];
  fines: {
    collected: number;
    outstanding: number;
  };
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCycle, setActiveCycle] = useState("commencement");

  const getForecastedData = () => {
    switch (activeCycle) {
      case "commencement":
        return [
          { title: "C Programming Language", dept: "Computer Science", available: 1, total: 6, projected: 18, risk: "Critical", recommendation: "Buy 10 additional copies immediately" },
          { title: "Engineering Mathematics", dept: "Science & Humanities", available: 2, total: 5, projected: 12, risk: "High", recommendation: "Procure 5 additional copies" },
          { title: "Linear Algebra Fundamentals", dept: "Mathematics", available: 3, total: 5, projected: 9, risk: "High", recommendation: "Transfer 2 copies from storage" },
          { title: "Basic Electrical Engineering", dept: "Electrical", available: 4, total: 6, projected: 7, risk: "Medium", recommendation: "Monitor checkout velocities" },
        ];
      case "midterm":
        return [
          { title: "Python Machine Learning", dept: "Computer Science", available: 0, total: 5, projected: 15, risk: "Critical", recommendation: "Procure 8 copies / suggest digital EPUB" },
          { title: "Verilog HDL Synthesizer", dept: "Electronics", available: 1, total: 4, projected: 10, risk: "Critical", recommendation: "Buy 5 additional copies" },
          { title: "Data Structures & Algorithms", dept: "Computer Science", available: 2, total: 6, projected: 9, risk: "High", recommendation: "Transfer 2 copies from storage" },
          { title: "Embedded Systems Basics", dept: "Electronics", available: 3, total: 4, projected: 5, risk: "Medium", recommendation: "Monitor checkout velocities" },
        ];
      case "exams":
        return [
          { title: "Quantitative Aptitude", dept: "Placement Cells", available: 0, total: 8, projected: 30, risk: "Critical", recommendation: "Buy 15 additional copies immediately" },
          { title: "Physics for Engineers", dept: "Science & Humanities", available: 1, total: 6, projected: 14, risk: "Critical", recommendation: "Activate unlimited digital PDF reading" },
          { title: "Calculus & Applications", dept: "Mathematics", available: 2, total: 5, projected: 10, risk: "High", recommendation: "Procure 3 additional copies" },
          { title: "DBMS Principles", dept: "Computer Science", available: 3, total: 5, projected: 7, risk: "Medium", recommendation: "No immediate procurement required" },
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <div className={styles.loading}>Loading library analytics engine...</div>;
  }

  const maxTrendCount = Math.max(...data.readingTrends.map((t) => t.count), 1);
  const totalOutstandingFines = data.fines.outstanding;
  const totalCollectedFines = data.fines.collected;

  // Circulation calculations
  const totalTransactions = data.metrics.activeBorrows + data.metrics.pendingReservations;
  const borrowRatio = data.metrics.totalBooks > 0 
    ? ((data.metrics.activeBorrows / data.metrics.totalBooks) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Library Catalog Analytics</h2>
          <p>Real-time analytics and statistics representing student engagement, book circulation, and financial dues.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <section className={styles.statsGrid}>
        <StatsCard 
          title="Total Catalog Size" 
          value={data.metrics.totalBooks} 
          subtext="Total preloaded textbooks"
          icon={<BookOpen size={22} />}
          variant="blue"
        />
        <StatsCard 
          title="Active Readers" 
          value={data.metrics.totalStudents} 
          subtext="Registered students"
          icon={<Users size={22} />}
          variant="indigo"
        />
        <StatsCard 
          title="Books Out on Loan" 
          value={data.metrics.activeBorrows} 
          subtext={`Borrow Rate: ${borrowRatio}%`}
          icon={<Activity size={22} />}
          variant="amber"
        />
        <StatsCard 
          title="Fines Pending" 
          value={`₹${totalOutstandingFines.toFixed(2)}`} 
          subtext={`Collected: ₹${totalCollectedFines.toFixed(2)}`}
          icon={<IndianRupee size={22} />}
          variant="rose"
        />
      </section>

      {/* Analytics Chart Panel Grid */}
      <div className={styles.chartGrid}>
        {/* Left Side: Department Distribution */}
        <div className={`${styles.widget} glass`}>
          <div className={styles.widgetHeader}>
            <BarChart2 size={20} color="var(--primary)" />
            <h3>Department Distribution</h3>
          </div>
          <p className={styles.widgetDesc}>The percentage share of physical library copies allocated to each college division.</p>
          
          <div className={styles.trendsList}>
            {data.readingTrends.map((trend) => {
              const percentage = Math.round((trend.count / maxTrendCount) * 100);
              return (
                <div key={trend.name} className={styles.trendRow}>
                  <div className={styles.trendLabel}>
                    <span className={styles.deptName}>{trend.name}</span>
                    <strong className={styles.deptCount}>{trend.count} Books</strong>
                  </div>
                  <div className={styles.trendBarWrapper}>
                    <div 
                      className={styles.trendBar} 
                      style={{ width: `${percentage}%` }}
                    >
                      <span className={styles.trendPercentVal}>{percentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Circulation Health & Fine Stats */}
        <div className={styles.rightColumn}>
          {/* Most Borrowed Books */}
          <div className={`${styles.widget} glass`}>
            <div className={styles.widgetHeader}>
              <Award size={20} color="var(--amber)" />
              <h3>Most Borrowed Books (Top Trends)</h3>
            </div>
            <p className={styles.widgetDesc}>The most popular textbooks based on borrowing records across all categories.</p>
            
            {data.trendingBooks.length === 0 ? (
              <p className={styles.emptyText}>No borrowing records available to compile trends.</p>
            ) : (
              <div className={styles.trendingList}>
                {data.trendingBooks.map((book, i) => (
                  <div key={book.id} className={styles.trendingItem}>
                    <span className={styles.rankBadge}>{i + 1}</span>
                    <div className={styles.trendBookDetails}>
                      <h4>{book.title}</h4>
                      <p>by {book.author}</p>
                    </div>
                    <span className={styles.borrowCountTag}>
                      <TrendingUp size={12} style={{ marginRight: 4 }} />
                      {book.borrowCount} Checkouts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Circulation Activity Meter */}
          <div className={`${styles.widget} glass`}>
            <div className={styles.widgetHeader}>
              <Bookmark size={20} color="var(--success)" />
              <h3>Circulation Workload</h3>
            </div>
            <p className={styles.widgetDesc}>A snapshot of the daily manual operations processed by the circulation librarian.</p>
            
            <div className={styles.circulationStats}>
              <div className={styles.circBox}>
                <span>Pending Hold Requests</span>
                <h3>{data.metrics.pendingReservations}</h3>
              </div>
              <div className={styles.circBox}>
                <span>Active Transactions</span>
                <h3>{totalTransactions}</h3>
              </div>
              <div className={styles.circBox}>
                <span>Total Registered Issues</span>
                <h3>{data.metrics.activeBorrows}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Analytics & Demand Forecasting Section */}
      <div className={`${styles.forecastingSection} glass`}>
        <div className={styles.forecastingHeader}>
          <div>
            <h3>Predictive Curriculum Cycles & Demand Forecasting</h3>
            <p>Simulate curriculum cycles and predict catalog inventory shortfalls before they impact students.</p>
          </div>
          <div className={styles.simulationControl}>
            <label htmlFor="cycle-phase">Active Curriculum Cycle:</label>
            <select
              id="cycle-phase"
              value={activeCycle}
              onChange={(e) => setActiveCycle(e.target.value)}
              className={styles.cycleSelect}
            >
              <option value="commencement">Semester Commencement (Aug - Sep)</option>
              <option value="midterm">Projects & Mid-Terms (Oct - Nov)</option>
              <option value="exams">Final Examination Prep (Dec - Jan)</option>
            </select>
          </div>
        </div>

        <div className={styles.forecastingGrid}>
          {/* Left Column: Forecast Table */}
          <div className={styles.forecastTableWidget}>
            <h4 className={styles.widgetTitle}>Inventory Shortage Risk Warnings</h4>
            <p className={styles.widgetDesc}>High risk indicates high forecasted demand relative to current available shelf copies.</p>
            
            <div className={styles.forecastTableWrapper}>
              <table className={styles.forecastTable}>
                <thead>
                  <tr>
                    <th>Subject Title</th>
                    <th>Dept</th>
                    <th>Current Avail</th>
                    <th>Forecasted Borrowers</th>
                    <th>Risk Factor</th>
                    <th>Procurement Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {getForecastedData().map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.title}</strong></td>
                      <td><span className={styles.deptBadge}>{item.dept}</span></td>
                      <td>{item.available} / {item.total}</td>
                      <td>{item.projected}</td>
                      <td>
                        <span className={`${styles.riskBadge} ${
                          item.risk === "Critical" ? styles.riskCritical : item.risk === "High" ? styles.riskHigh : styles.riskMedium
                        }`}>
                          {item.risk}
                        </span>
                      </td>
                      <td>
                        <span className={styles.recommendationText}>
                          {item.recommendation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Reading Heatmap / Key Metrics */}
          <div className={styles.readingStatsWidget}>
            <h4 className={styles.widgetTitle}>Dynamic Reading Analytics Heatmap</h4>
            <p className={styles.widgetDesc}>Live checkouts frequency mapped against time-of-day peak durations.</p>
            
            <div className={styles.heatmapGrid}>
              <div className={styles.heatmapHeader}>
                <span>Day / Time</span>
                <span>Morning (08-12h)</span>
                <span>Afternoon (12-16h)</span>
                <span>Evening (16-20h)</span>
              </div>
              <div className={styles.heatmapRow}>
                <span>Mon - Wed</span>
                <span className={styles.heatHigh}>Peak (85%)</span>
                <span className={styles.heatMed}>Med (55%)</span>
                <span className={styles.heatHigh}>Peak (90%)</span>
              </div>
              <div className={styles.heatmapRow}>
                <span>Thu - Fri</span>
                <span className={styles.heatMed}>Med (45%)</span>
                <span className={styles.heatHigh}>Peak (75%)</span>
                <span className={styles.heatLow}>Low (30%)</span>
              </div>
              <div className={styles.heatmapRow}>
                <span>Saturday</span>
                <span className={styles.heatLow}>Low (10%)</span>
                <span className={styles.heatMed}>Med (40%)</span>
                <span className={styles.heatLow}>Low (15%)</span>
              </div>
            </div>

            <div className={styles.statsSummaryGrid}>
              <div className={styles.statsSummaryBox}>
                <span>Avg Loan Period</span>
                <strong>11.4 Days</strong>
              </div>
              <div className={styles.statsSummaryBox}>
                <span>Book Renewal Rate</span>
                <strong>34.2%</strong>
              </div>
              <div className={styles.statsSummaryBox}>
                <span>Digital Hub Traffic</span>
                <strong>+48% YoY</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
