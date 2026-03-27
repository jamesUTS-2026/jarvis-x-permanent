import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  averageResponseTime: number;
  memoriesStored: number;
  topTopics: { topic: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
  userSatisfaction: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalConversations: 0,
    totalMessages: 0,
    averageResponseTime: 0,
    memoriesStored: 0,
    topTopics: [],
    dailyActivity: [],
    userSatisfaction: 0,
  });

  useEffect(() => {
    // Simulate loading analytics data
    setAnalytics({
      totalConversations: 42,
      totalMessages: 287,
      averageResponseTime: 1.2,
      memoriesStored: 6,
      topTopics: [
        { topic: 'Technology', count: 15 },
        { topic: 'Science', count: 12 },
        { topic: 'Philosophy', count: 10 },
        { topic: 'Weather', count: 5 },
      ],
      dailyActivity: [
        { date: 'Mon', count: 8 },
        { date: 'Tue', count: 12 },
        { date: 'Wed', count: 6 },
        { date: 'Thu', count: 14 },
        { date: 'Fri', count: 2 },
        { date: 'Sat', count: 0 },
        { date: 'Sun', count: 0 },
      ],
      userSatisfaction: 92,
    });
  }, [timeRange]);

  if (!user) {
    setLocation('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">Track your JARVIS X usage and performance</p>
          </div>
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-cyan-500/30 rounded text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="p-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Conversations',
              value: analytics.totalConversations,
              icon: '💬',
              trend: '+12%',
            },
            {
              label: 'Total Messages',
              value: analytics.totalMessages,
              icon: '📝',
              trend: '+8%',
            },
            {
              label: 'Avg Response Time',
              value: `${analytics.averageResponseTime}s`,
              icon: '⚡',
              trend: '-2%',
            },
            {
              label: 'Memories Stored',
              value: analytics.memoriesStored,
              icon: '🧠',
              trend: '+3',
            },
          ].map((metric, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{metric.icon}</span>
                <span className="text-sm text-green-400">{metric.trend}</span>
              </div>
              <p className="text-gray-400 text-sm mb-1">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Activity Chart */}
          <div className="p-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
            <h3 className="text-xl font-bold mb-6">Daily Activity</h3>
            <div className="flex items-end gap-2 h-48">
              {analytics.dailyActivity.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-cyan-500 to-purple-600 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${(day.count / 14) * 100}%` || '5px' }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{day.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Topics */}
          <div className="p-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
            <h3 className="text-xl font-bold mb-6">Top Conversation Topics</h3>
            <div className="space-y-4">
              {analytics.topTopics.map((topic, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{topic.topic}</span>
                    <span className="text-xs text-gray-500">{topic.count} conversations</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(topic.count / 15) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Satisfaction */}
        <div className="p-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
          <h3 className="text-xl font-bold mb-6">User Satisfaction</h3>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(0, 243, 255, 0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeDasharray={`${(analytics.userSatisfaction / 100) * 283} 283`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00f3ff" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{analytics.userSatisfaction}%</span>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-gray-400">
                Based on your recent interactions, JARVIS X has achieved a {analytics.userSatisfaction}% satisfaction rating.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-sm">Fast response times</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-sm">Accurate information</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-sm">Personalized responses</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Data */}
        <div className="mt-8 flex gap-4">
          <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded transition-colors">
            Export as CSV
          </button>
          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded transition-colors">
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
