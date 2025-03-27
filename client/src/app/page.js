'use client'
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Pill, Coffee } from 'lucide-react';
import Chatbot from '@/components/Chatbot';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { useNotification } from '@/components/NotificationProvider';
import Link from 'next/link';

export default function SleepQualityPredictor() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    Q1: '',
    Q4: '',
    Q5: '',
    Q6: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Sleep reminder notification
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();

    // Morning notification (8 AM)
    if (hours === 8) {
      addNotification("Good morning! Don't forget to record your sleep quality for last night.", 'info');
    }

    // Evening reminder (9 PM)
    if (hours === 21) {
      addNotification("It's getting late! Consider preparing for bed to ensure good sleep quality.", 'info');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    addNotification('Analyzing your sleep patterns...', 'info');

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setPrediction(data);
      
      // Personalized notifications based on form data
      provideSleepFeedback(formData);
      
      addNotification('Sleep analysis completed!', 'success');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get prediction. Please try again.');
      addNotification('Failed to analyze sleep data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const provideSleepFeedback = (data) => {
    // Sleep duration feedback
    const sleepHours = parseFloat(data.Q1);
    if (sleepHours < 6) {
      addNotification("You're getting less than 6 hours of sleep. This might affect your health and daily performance.", 'warning');
    } else if (sleepHours > 9) {
      addNotification("You're sleeping more than 9 hours. While rest is good, oversleeping might indicate other health issues.", 'warning');
    }

    // Sleep quality feedback
    if (data.Q4 === '3') {
      addNotification("Your sleep quality is very poor. Consider consulting a sleep specialist.", 'warning');
    }

    // Sleep medicine usage feedback
    if (data.Q5 === '3') {
      addNotification("Frequent use of sleep medicine might lead to dependency. Please consult your healthcare provider.", 'warning');
    }

    // Daytime sleepiness feedback
    if (data.Q6 === '3') {
      addNotification("You're having frequent trouble staying awake during the day. This might indicate poor sleep quality.", 'warning');
    }

    // Positive feedback
    if (sleepHours >= 7 && sleepHours <= 8 && data.Q4 === '0') {
      addNotification("Great job maintaining healthy sleep habits! Keep it up! 🌟", 'success');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time feedback
    if (name === 'Q1') {
      const hours = parseFloat(value);
      if (hours < 4) {
        addNotification('Very low sleep duration detected. This is concerning for your health.', 'error');
      }
    }
    
    if (name === 'Q4' && value === '3') {
      addNotification('If you consistently experience poor sleep quality, consider keeping a sleep diary and consulting a specialist.', 'warning');
    }

    if (name === 'Q5' && value === '3') {
      addNotification('Regular sleep medicine use should be monitored by a healthcare provider.', 'warning');
    }
  };

  // Sleep hygiene tips notification system
  const sleepTips = [
    "Maintain a consistent sleep schedule, even on weekends.",
    "Create a relaxing bedtime routine to help you unwind.",
    "Keep your bedroom cool, dark, and quiet for optimal sleep.",
    "Avoid screens at least 1 hour before bedtime.",
    "Limit caffeine intake, especially in the afternoon.",
    "Regular exercise can improve sleep quality, but not too close to bedtime.",
    "Consider meditation or deep breathing exercises before bed."
  ];

  useEffect(() => {
    // Show random sleep tip every 4 hours
    const interval = setInterval(() => {
      const randomTip = sleepTips[Math.floor(Math.random() * sleepTips.length)];
      addNotification(`Sleep Tip: ${randomTip}`, 'info');
    }, 4 * 60 * 60 * 1000); // 4 hours

    return () => clearInterval(interval);
  }, []);

  // Add test functions for different notification types
  const testNotifications = () => {
    // Test different types of notifications
    addNotification("This is an info notification", "info");
    setTimeout(() => {
      addNotification("This is a success notification", "success");
    }, 1000);
    setTimeout(() => {
      addNotification("This is a warning notification", "warning");
    }, 2000);
    setTimeout(() => {
      addNotification("This is an error notification", "error");
    }, 3000);
  };

  const testSleepNotifications = () => {
    // Test sleep-specific notifications
    addNotification("Time to prepare for bed!", "info");
    setTimeout(() => {
      addNotification("Great sleep habits! You slept 8 hours.", "success");
    }, 1500);
    setTimeout(() => {
      addNotification("Your sleep duration is less than recommended.", "warning");
    }, 3000);
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
      {/* Add test buttons at the top of your page */}
      <div className="fixed top-20 right-4 space-y-2">
        <button
          onClick={testNotifications}
          className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 mb-2"
        >
          Test All Notifications
        </button>
        <button
          onClick={testSleepNotifications}
          className="block w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Test Sleep Notifications
        </button>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="p-8 w-full">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">Sleep Analysis</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sleep Quality Predictor</h1>
            <p className="mt-2 text-gray-500 mb-6">Discover insights about your sleep patterns and receive personalized recommendations.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="Q1" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Moon className="mr-2 h-5 w-5 text-indigo-500" />
                  Hours of sleep per night
                </label>
                <input
                  type="number"
                  id="Q1"
                  name="Q1"
                  value={formData.Q1}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-indigo-500 sm:text-sm"
                  required
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="Q4" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Sun className="mr-2 h-5 w-5 text-indigo-500" />
                  Overall sleep quality
                </label>
                <select
                  id="Q4"
                  name="Q4"
                  value={formData.Q4}
                  onChange={handleChange}
                  className="mt-1 text-indigo-500 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select...</option>
                  <option value="0">Very good</option>
                  <option value="1">Fairly good</option>
                  <option value="2">Fairly bad</option>
                  <option value="3">Very bad</option>
                </select>
              </div>

              <div>
                <label htmlFor="Q5" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Pill className="mr-2 h-5 w-5 text-indigo-500" />
                  Frequency of sleep medicine use
                </label>
                <select
                  id="Q5"
                  name="Q5"
                  value={formData.Q5}
                  onChange={handleChange}
                  className="mt-1 text-indigo-500 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select...</option>
                  <option value="0">Not during the past month</option>
                  <option value="1">Less than once a week</option>
                  <option value="2">Once or twice a week</option>
                  <option value="3">Three or more times a week</option>
                </select>
              </div>

              <div>
                <label htmlFor="Q6" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Coffee className="mr-2 h-5 w-5 text-indigo-500" />
                  Frequency of trouble staying awake
                </label>
                <select
                  id="Q6"
                  name="Q6"
                  value={formData.Q6}
                  onChange={handleChange}
                  className="mt-1 text-indigo-500 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select...</option>
                  <option value="0">Not during the past month</option>
                  <option value="1">Less than once a week</option>
                  <option value="2">Once or twice a week</option>
                  <option value="3">Three or more times a week</option>
                </select>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Predict Sleep Quality
                </button>
              </div>
            </form>

            {prediction && (
              <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
                <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Prediction Result</h2>
                <p className="text-lg text-indigo-800 mb-4">Sleep Quality: <span className="font-bold">{prediction.sleep_quality}</span></p>
                <h3 className="text-xl font-semibold text-indigo-900 mb-2">Recommendations:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {prediction.recommendations.map((rec, index) => (
                    <li key={index} className="text-indigo-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
