"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  HelpCircle,
  TrendingUp,
  ChevronRight
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

// Strictly define allowed color keys
type ColorType = 'emerald' | 'blue' | 'indigo' | 'purple' | 'amber';
type MetricKey = 'activeUsers' | 'totalExams' | 'totalSubjects' | 'totalChapters' | 'totalQuestions';
// Static trend data for graphs when a card is selected
const mockGraphData = {
  activeUsers: [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 700 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 900 },
    { name: 'Fri', value: 800 },
    { name: 'Sat', value: 1100 },
    { name: 'Sun', value: 1200 },
  ],
  totalExams: [
    { name: 'Mon', value: 100 },
    { name: 'Tue', value: 105 },
    { name: 'Wed', value: 110 },
    { name: 'Thu', value: 115 },
    { name: 'Fri', value: 118 },
    { name: 'Sat', value: 120 },
    { name: 'Sun', value: 120 },
  ],
  totalSubjects: [
    { name: 'Week 1', value: 8 },
    { name: 'Week 2', value: 9 },
    { name: 'Week 3', value: 10 },
    { name: 'Week 4', value: 10 },
  ],
  totalChapters: [
    { name: 'Week 1', value: 35 },
    { name: 'Week 2', value: 42 },
    { name: 'Week 3', value: 48 },
    { name: 'Week 4', value: 50 },
  ],
  totalQuestions: [
    { name: 'Mon', value: 2100 },
    { name: 'Tue', value: 2250 },
    { name: 'Wed', value: 2300 },
    { name: 'Thu', value: 2410 },
    { name: 'Fri', value: 2450 },
    { name: 'Sat', value: 2480 },
    { name: 'Sun', value: 2500 },
  ],
}

const ManageDashboard = () => {
  // State to track which card's graph to display
  const [activeMetric, setActiveMetric] = useState<keyof typeof mockGraphData>('activeUsers')

  // Main dashboard metrics data array with explicit color typed fields
  const metrics = [
    {
      key: 'activeUsers' as const,
      label: 'Active Users',
      value: '1,200',
      subtext: 'Weekly peak active users',
      icon: Users,
      color: 'emerald' as ColorType,
    },
    {
      key: 'totalExams' as const,
      label: 'Total Exams',
      value: '120',
      subtext: 'Live examinations',
      icon: GraduationCap,
      color: 'blue' as ColorType,
    },
    {
      key: 'totalSubjects' as const,
      label: 'Total Subjects',
      value: '10',
      subtext: 'Mapped streams',
      icon: BookOpen,
      color: 'indigo' as ColorType,
    },
    {
      key: 'totalChapters' as const,
      label: 'Total Chapters',
      value: '50',
      subtext: 'Syllabus modules',
      icon: FileText,
      color: 'purple' as ColorType,
    },
    {
      key: 'totalQuestions' as const,
      label: 'Total Questions',
      value: '2,500',
      subtext: 'In question bank',
      icon: HelpCircle,
      color: 'amber' as ColorType,
    },
  ]

  // Add Type annotation to the config object using Record mapping
  const colorConfigs: Record<ColorType, { stroke: string; fill: string; text: string; bg: string; border: string }> = {
    emerald: { stroke: '#10b981', fill: '#ecfdf5', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    blue: { stroke: '#3b82f6', fill: '#eff6ff', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    indigo: { stroke: '#6366f1', fill: '#e0e7ff', text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    purple: { stroke: '#a855f7', fill: '#f3e8ff', text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    amber: { stroke: '#f59e0b', fill: '#fef3c7', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  }

  // Define structural flow steps to display in the header pipeline
  const structuralFlow = [
    { label: 'Exam', targetKey: 'totalExams', color: 'blue' },
    { label: 'Subject', targetKey: 'totalSubjects', color: 'indigo' },
    { label: 'Chapter', targetKey: 'totalChapters', color: 'purple' },
    { label: 'Quiz', targetKey: 'totalChapters', color: 'purple' }, // Shares chapter context here
    { label: 'Question', targetKey: 'totalQuestions', color: 'amber' }
  ]

  const activeColor = metrics.find(m => m.key === activeMetric)?.color || 'emerald';
  const currentConfig = colorConfigs[activeColor];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto bg-slate-50/50 min-h-screen">
      
       {/* Header section with interactive architecture flow pipeline */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-800 uppercase font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Admin Management
          </div>
          <h1 className="text-xl md:text-2xl font-black font-sans text-slate-800 tracking-tight mt-1.5">
            Exam Dashboard
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Read-only examination metrics. Monitor system layer operations below.
          </p>
        </div>

        {/* Dynamic Architectural Pipeline Progress Indicator */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-50/80 p-2 border border-slate-100 rounded-xl max-w-full">
          {structuralFlow.map((step, index) => {
            const isStepActive = activeMetric === step.targetKey;
            const stepColorConfig = colorConfigs[step.color as ColorType];

            return (
              <React.Fragment key={step.label}>
                <button
                  onClick={() => setActiveMetric(step.targetKey as MetricKey)}
                  className={`px-3 py-1 text-xs font-bold font-sans rounded-lg border transition-all duration-200 relative ${
                    isStepActive
                      ? `${stepColorConfig.bg} ${stepColorConfig.text} ${stepColorConfig.border} shadow-2xs scale-[1.02]`
                      : 'bg-white text-slate-400 border-slate-200/60 hover:text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {step.label}
                  {isStepActive && (
                    <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${stepColorConfig.text.replace('text-', 'bg-')}`} />
                  )}
                </button>
                {index < structuralFlow.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Metrics Cards Layout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const isActive = activeMetric === metric.key
          
          // Explicit casting to ColorType fixes the loop indexing error
          const config = colorConfigs[metric.color as ColorType]

          return (
            <button
              key={metric.key}
              onClick={() => setActiveMetric(metric.key)}
              className={`text-left p-5 bg-white rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                isActive 
                  ? `shadow-md ${config.border} ring-1 ring-offset-0 ring-opacity-50` 
                  : 'border-slate-100 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Active state indicator background animation */}
              {isActive && (
                <motion.div 
                  layoutId="activeIndicator"
                  className={`absolute inset-0 opacity-[0.02] ${config.bg}`}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2">
                  <p className="text-slate-400 font-medium text-xs tracking-wide">
                    {metric.label}
                  </p>
                  <h3 className="text-2xl font-black font-sans tracking-tight text-slate-800">
                    {metric.value}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium truncate max-w-35">
                    {metric.subtext}
                  </p>
                </div>
                <div className={`p-2 rounded-xl transition-colors duration-200 ${isActive ? `${config.bg} ${config.text}` : 'bg-slate-50 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Dynamic Chart Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider inline-flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${currentConfig.text}`} />
              {metrics.find(m => m.key === activeMetric)?.label} Trend Analysis
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Visual representation of selected entity volume.</p>
          </div>
        </div>

        <div className="h-75 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mockGraphData[activeMetric]}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentConfig.stroke} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={currentConfig.stroke} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                labelStyle={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}
                itemStyle={{ color: '#1e293b', fontSize: '13px', fontWeight: 700 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={currentConfig.stroke}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}

export default ManageDashboard
