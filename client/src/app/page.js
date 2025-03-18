'use client'
import React, { useState } from 'react';
import { Moon, Sun, Pill, Coffee } from 'lucide-react';

export default function SleepQualityPredictor() {
  const [formData, setFormData] = useState({
    Q1: '',
    Q4: '',
    Q5: '',
    Q6: ''
  });
  const [prediction, setPrediction] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
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
    </div>
  );
}
