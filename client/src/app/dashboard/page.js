'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/get-user-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">No data available yet</div>
      </div>
    );
  }

  // Prepare data for Sleep Quality Distribution Pie Chart
  const pieData = {
    labels: ['Good Sleep', 'Bad Sleep'],
    datasets: [
      {
        data: [stats.good_sleep_count, stats.bad_sleep_count],
        backgroundColor: ['#4CAF50', '#f44336'],
      },
    ],
  };

  // Prepare data for Average Scores Bar Chart
  const barData = {
    labels: ['Stress Level', 'Exercise', 'Caffeine', 'Screen Time'],
    datasets: [
      {
        label: 'Average Scores',
        data: [
          stats.avg_scores.Q1,
          stats.avg_scores.Q4,
          stats.avg_scores.Q5,
          stats.avg_scores.Q6,
        ],
        backgroundColor: '#3B82F6',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Average Scores by Category',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sleep Analysis Dashboard</h1>
          <p className="text-lg text-gray-600">Track your sleep patterns and improvements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stats Cards */}
          <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Total Predictions</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.total_predictions || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Good Sleep Nights</h3>
            <p className="text-3xl font-bold text-green-600">{stats.good_sleep_count}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Bad Sleep Nights</h3>
            <p className="text-3xl font-bold text-red-600">{stats.bad_sleep_count}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Sleep Quality Distribution</h3>
            <div className="h-64">
              <Pie data={pieData} />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Average Scores</h3>
            <div className="h-64">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 