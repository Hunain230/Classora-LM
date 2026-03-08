import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./Analytics.css";

export default function AnalyticsPage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));

    const stats = user.role === 'ADMIN' ? [
        { label: "Active Courses", value: "24", growth: "+12%", color: "#2196F3" },
        { label: "Total Students", value: "1,240", growth: "+5%", color: "#4caf50" },
        { label: "Faculty Members", value: "48", growth: "0%", color: "#ff9800" },
        { label: "Avg. Attendance", value: "88%", growth: "+2%", color: "#ef4444" },
    ] : [
        { label: "Enrolled Students", value: "145", growth: "+8%", color: "#2196F3" },
        { label: "Avg. Assignment Score", value: "78/100", growth: "+3%", color: "#4caf50" },
        { label: "Quiz Completion", value: "92%", growth: "+1%", color: "#ff9800" },
        { label: "Attendance Rate", value: "85%", growth: "-2%", color: "#ef4444" },
    ];

    const attendanceLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const attendanceValues = [85, 92, 78, 95, 88, 70];

    return (
        <DashboardLayout user={user}>
            <div className="analytics-container">
                <h2 className="section-title">ANALYTICS & REPORTS</h2>
                <div className="title-divider"></div>

                {/* Global Stats Cards */}
                <div className="stats-grid">
                    {stats.map((s, i) => (
                        <div key={i} className="dashboard-card stat-card">
                            <div className="stat-label">{s.label}</div>
                            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                            <div className="stat-growth" style={{ color: s.growth.startsWith('+') ? '#4caf50' : (s.growth === '0%' ? '#94a3b8' : '#ef4444') }}>
                                {s.growth} <span>vs last month</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="charts-row">
                    <div className="dashboard-card chart-card">
                        <div className="card-title">Attendance Trends (Weekly)</div>
                        <div className="bar-chart">
                            {attendanceValues.map((v, i) => (
                                <div key={i} className="bar-container">
                                    <div className="bar-label">{v}%</div>
                                    <div className="bar" style={{ height: `${v}%`, background: 'linear-gradient(to top, #2196F3, #60a5fa)' }}></div>
                                    <div className="bar-axis">{attendanceLabels[i]}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dashboard-card chart-card">
                        <div className="card-title">Performance Distribution</div>
                        <div className="performance-list">
                            {[
                                { label: "Excellent (90-100)", count: 45, color: "#4caf50" },
                                { label: "Good (75-89)", count: 120, color: "#2196F3" },
                                { label: "Average (60-74)", count: 35, color: "#ff9800" },
                                { label: "Below Avg (<60)", count: 12, color: "#ef4444" }
                            ].map((item, i) => (
                                <div key={i} className="perf-item">
                                    <div className="perf-info">
                                        <span>{item.label}</span>
                                        <span>{item.count} Students</span>
                                    </div>
                                    <div className="perf-bar-bg">
                                        <div className="perf-bar-fill" style={{ width: `${(item.count / 212) * 100}%`, background: item.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="dashboard-card" style={{ marginTop: '30px' }}>
                    <div className="card-title">Recent Teacher Performance Report</div>
                    <div className="dashboard-table-wrapper">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Instructor</th>
                                    <th>Course</th>
                                    <th>Engagement</th>
                                    <th>Completion</th>
                                    <th>Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Dr. John Smith</td>
                                    <td>Intro to Psychology</td>
                                    <td><div className="engagement-dot high"></div> High</td>
                                    <td>94%</td>
                                    <td>4.8/5</td>
                                </tr>
                                <tr>
                                    <td>Prof. Sarah Johnson</td>
                                    <td>Advanced UI/UX</td>
                                    <td><div className="engagement-dot med"></div> Medium</td>
                                    <td>82%</td>
                                    <td>4.5/5</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
