/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
"use client"
import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart,
  Bar,
  Legend,
  CartesianGrid
} from "recharts";
import { 
  Activity, 
  Users, 
  CheckCircle, 
  Clock, 
  // FileText, 
  // Layers, 
  TrendingUp, 
  ShieldCheck, 
  TrendingDown, 
  // UserPlus,
  RefreshCw
} from "lucide-react";
import { WEEKLY_ANALYSIS_DATA, INITIAL_RECENT_LOGS } from "../_components/data";

export default function DashboardView() {
  // Toggle state to switch between which weekly trend to plot
  const [metricKey, setMetricKey] = useState<"activeUsers" | "attempts" | "completed" | "pending">("activeUsers");
  const [simulationLogs, setSimulationLogs] = useState(INITIAL_RECENT_LOGS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Computed total stats across the active analytics workspace
  const totalActiveUsersThisWeek = 11800; // Peak value
  const totalAttemptsThisWeek = WEEKLY_ANALYSIS_DATA.reduce((sum, d) => sum + d.attempts, 0);
  const totalCompletionsThisWeek = WEEKLY_ANALYSIS_DATA.reduce((sum, d) => sum + d.completed, 0);
  const averagePendingThisWeek = Math.round(WEEKLY_ANALYSIS_DATA.reduce((sum, d) => sum + d.pending, 0) / 7);

  // Success rate percentage
  const overallSuccessRate = Math.round((totalCompletionsThisWeek / totalAttemptsThisWeek) * 100);

  // Simulate an admin action to refresh logs
  const handleReloadLogs = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // shuffle timestamps or just show real-time synchronization
      setSimulationLogs(prev => {
        const shuffled = [...prev];
        const first = shuffled.shift();
        if (first) shuffled.push(first);
        return shuffled;
      });
      setIsRefreshing(false);
    }, 600);
  };

  const getMetricColor = () => {
    switch (metricKey) {
      case "activeUsers": return "#10b981"; // Emerald
      case "attempts": return "#3b82f6"; // Blue
      case "completed": return "#8b5cf6"; // Purple
      case "pending": return "#f59e0b"; // Amber
    }
  };

  const getMetricLabel = () => {
    switch (metricKey) {
      case "activeUsers": return "Active Users Trend";
      case "attempts": return "Total Questions Attempts";
      case "completed": return "Syllabus Completed Actions";
      case "pending": return "Outstanding Student Pending Items";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-800 uppercase font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Admin Telemetry & Evaluation Board
          </div>
          <h1 className="text-xl md:text-2xl font-black font-sans text-slate-800 tracking-tight mt-1.5">
            Syllabus Analytics Dashboard
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Read-only examination metrics. Monitor overall student usage of SkillBytes across UPSC, SSC, and Tech.
          </p>
        </div>

        <button
          onClick={handleReloadLogs}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Sync Live Datastream
        </button>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Users */}
        <div 
          onClick={() => setMetricKey("activeUsers")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            metricKey === "activeUsers" 
              ? "bg-emerald-950 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/10" 
              : "bg-white text-slate-800 border-slate-100 hover:border-emerald-200 shadow-2xs"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-xs font-medium ${metricKey === "activeUsers" ? "text-emerald-300" : "text-slate-500"}`}>
                Weekly Peak Active Users
              </p>
              <h3 className="text-2xl font-black font-sans mt-2 tracking-tight">
                {totalActiveUsersThisWeek.toLocaleString()}
              </h3>
            </div>
            <div className={`p-2 rounded-xl ${metricKey === "activeUsers" ? "bg-emerald-800 text-emerald-200" : "bg-emerald-50 text-emerald-600"}`}>
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-medium">
            <TrendingUp className={`w-3.5 h-3.5 ${metricKey === "activeUsers" ? "text-emerald-300" : "text-emerald-600"}`} />
            <span className={metricKey === "activeUsers" ? "text-emerald-200" : "text-slate-500"}>
              +14.2% up from last week
            </span>
          </div>
        </div>

        {/* Total Attempts */}
        <div 
          onClick={() => setMetricKey("attempts")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            metricKey === "attempts" 
              ? "bg-[#0b3c66] text-white border-blue-900 shadow-md ring-2 ring-blue-500/10" 
              : "bg-white text-slate-800 border-slate-100 hover:border-blue-200 shadow-2xs"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-xs font-medium ${metricKey === "attempts" ? "text-blue-200" : "text-slate-500"}`}>
                Weekly Questions Attempts
              </p>
              <h3 className="text-2xl font-black font-sans mt-2 tracking-tight">
                {totalAttemptsThisWeek.toLocaleString()}
              </h3>
            </div>
            <div className={`p-2 rounded-xl ${metricKey === "attempts" ? "bg-blue-800 text-blue-200" : "bg-blue-50 text-blue-600"}`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-medium">
            <TrendingUp className={`w-3.5 h-3.5 ${metricKey === "attempts" ? "text-blue-200" : "text-blue-600"}`} />
            <span className={metricKey === "attempts" ? "text-blue-200" : "text-slate-500"}>
              56,720 queries pre-loaded
            </span>
          </div>
        </div>

        {/* Completed syllabus tasks */}
        <div 
          onClick={() => setMetricKey("completed")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            metricKey === "completed" 
              ? "bg-[#3c1d63] text-white border-purple-900 shadow-md ring-2 ring-purple-500/10" 
              : "bg-white text-slate-800 border-slate-100 hover:border-purple-200 shadow-2xs"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-xs font-medium ${metricKey === "completed" ? "text-purple-200" : "text-slate-500"}`}>
                Completed Chapter Syllabi
              </p>
              <h3 className="text-2xl font-black font-sans mt-2 tracking-tight">
                {totalCompletionsThisWeek.toLocaleString()}
              </h3>
            </div>
            <div className={`p-2 rounded-xl ${metricKey === "completed" ? "bg-purple-800 text-purple-200" : "bg-purple-50 text-purple-600"}`}>
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-medium">
            <TrendingUp className={`w-3.5 h-3.5 ${metricKey === "completed" ? "text-purple-200" : "text-purple-600"}`} />
            <span className={metricKey === "completed" ? "text-purple-200" : "text-slate-500"}>
              {overallSuccessRate}% high accuracy index
            </span>
          </div>
        </div>

        {/* Outstanding Pending Items */}
        <div 
          onClick={() => setMetricKey("pending")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            metricKey === "pending" 
              ? "bg-[#663d0b] text-white border-amber-950 shadow-md ring-2 ring-amber-500/10" 
              : "bg-white text-slate-800 border-slate-100 hover:border-amber-200 shadow-2xs"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-xs font-medium ${metricKey === "pending" ? "text-amber-200" : "text-slate-500"}`}>
                Pending Evaluations Remaining
              </p>
              <h3 className="text-2xl font-black font-sans mt-2 tracking-tight">
                {averagePendingThisWeek}
              </h3>
            </div>
            <div className={`p-2 rounded-xl ${metricKey === "pending" ? "bg-amber-800 text-amber-200" : "bg-amber-50 text-amber-600"}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-medium">
            <TrendingDown className={`w-3.5 h-3.5 ${metricKey === "pending" ? "text-amber-300" : "text-emerald-600"}`} />
            <span className={metricKey === "pending" ? "text-amber-200" : "text-slate-500"}>
              -9.2% speedup in chapter submissions
            </span>
          </div>
        </div>

      </div>

      {/* Main Weekly Line & Bar Trend Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Metric Graph Plot */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold uppercase">Weekly Activity Curve</span>
              <h4 className="text-sm font-bold font-sans text-slate-800 mt-0.5">{getMetricLabel()}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getMetricColor() }}></span>
              <span className="text-xs font-mono font-semibold text-slate-600 uppercase">{metricKey}</span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_ANALYSIS_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="selectedMetricColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dayName" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                  labelStyle={{ fontWeight: "bold", color: "#34d399" }}
                />
                <Area 
                  type="monotone" 
                  dataKey={metricKey} 
                  stroke={getMetricColor()} 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#selectedMetricColor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Bar Comparison Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold uppercase">Exam Stream Distribution</span>
            <h4 className="text-sm font-bold font-sans text-slate-800 mt-0.5">Attempt Load Comparison</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Displays standard daily activity parameters across primary streams.
            </p>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_ANALYSIS_DATA.slice(3)} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="dayName" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                <Bar dataKey="completed" name="Completions" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending Items" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Primary Host:</span>
              <span className="font-mono font-semibold text-slate-700">Production Cloud</span>
            </div>
            <div className="flex justify-between">
              <span>Syllabus Sync:</span>
              <span className="font-mono font-semibold text-slate-700">Every 4 Secs</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activity Table of Generic Users */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold uppercase">Active Verification Stream</span>
            <h4 className="text-sm font-bold text-slate-800 mt-0.5">Automated Student Progress Logbook</h4>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono px-3.5 py-1 rounded-full font-bold">
            Generic User IDs Only
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/70">
                <th className="py-3 px-4">User ID Number</th>
                <th className="py-3 px-4">Exam Stream</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Chapter Title</th>
                <th className="py-3 px-4">Execution Status</th>
                <th className="py-3 px-4">Time Elapsed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
              {simulationLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold  text-emerald-600">
                    #{log.userId}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{log.examName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{log.subjectName}</td>
                  <td className="py-3.5 px-4 truncate max-w-45 font-medium">{log.chapterTitle}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-sans text-[10px] font-bold ${
                      log.status === "Completed" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                        : log.status === "In Progress"
                        ? "bg-blue-50 text-blue-700 border border-blue-200/50"
                        : "bg-amber-50 text-amber-700 border border-amber-200/50"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
