'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function DietRoutine() {
  const { user } = useAuth();
  const [selectedMeal, setSelectedMeal] = useState('breakfast');

  const dietPlans = {
    breakfast: {
      title: 'Breakfast (7:00 AM - 8:00 AM)',
      recommendations: [
        { food: 'Oatmeal with fruits', benefits: 'Rich in fiber, provides sustained energy' },
        { food: 'Greek yogurt with honey', benefits: 'High protein, promotes good sleep' },
        { food: 'Whole grain toast with eggs', benefits: 'Complete protein, vitamin D' },
        { food: 'Green tea', benefits: 'Antioxidants, mild caffeine for morning boost' }
      ]
    },
    morningSnack: {
      title: 'Morning Snack (10:30 AM)',
      recommendations: [
        { food: 'Mixed nuts and seeds', benefits: 'Healthy fats, protein, minerals' },
        { food: 'Fresh fruit', benefits: 'Vitamins, natural sugars for energy' },
        { food: 'Smoothie', benefits: 'Blend of nutrients, easily digestible' }
      ]
    },
    lunch: {
      title: 'Lunch (1:00 PM - 2:00 PM)',
      recommendations: [
        { food: 'Grilled chicken/tofu with vegetables', benefits: 'Lean protein, fiber' },
        { food: 'Quinoa or brown rice', benefits: 'Complex carbs, sustained energy' },
        { food: 'Mixed salad', benefits: 'Vitamins, minerals, antioxidants' }
      ]
    },
    eveningSnack: {
      title: 'Evening Snack (4:00 PM)',
      recommendations: [
        { food: 'Hummus with carrots', benefits: 'Protein, healthy fats, vitamins' },
        { food: 'Trail mix', benefits: 'Energy boost, healthy fats' },
        { food: 'Apple with almond butter', benefits: 'Fiber, protein, healthy fats' }
      ]
    },
    dinner: {
      title: 'Dinner (7:00 PM - 8:00 PM)',
      recommendations: [
        { food: 'Fish/lentils with vegetables', benefits: 'Lean protein, omega-3, tryptophan' },
        { food: 'Sweet potato', benefits: 'Complex carbs, helps with sleep' },
        { food: 'Light soup', benefits: 'Hydration, easy to digest' }
      ]
    },
    bedtimeSnack: {
      title: 'Bedtime Snack (Optional, 9:00 PM)',
      recommendations: [
        { food: 'Warm milk with turmeric', benefits: 'Promotes sleep, anti-inflammatory' },
        { food: 'Banana', benefits: 'Contains melatonin and magnesium' },
        { food: 'Chamomile tea', benefits: 'Calming, helps with sleep' }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Diet Routine Plan</h1>
          <p className="mt-2 text-gray-600">Optimize your diet for better sleep</p>
        </div>

        {/* Meal Time Navigation */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {Object.keys(dietPlans).map((meal) => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedMeal === meal
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {dietPlans[meal].title.split('(')[0]}
            </button>
          ))}
        </div>

        {/* Diet Recommendations */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {dietPlans[selectedMeal].title}
          </h2>
          <div className="grid gap-6">
            {dietPlans[selectedMeal].recommendations.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-medium text-lg text-gray-900">{item.food}</h3>
                <p className="text-gray-600">{item.benefits}</p>
              </div>
            ))}
          </div>

          {/* General Tips */}
          <div className="mt-8 bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-lg text-blue-900 mb-2">Tips for Better Sleep:</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Avoid heavy meals close to bedtime</li>
              <li>Limit caffeine intake after 2 PM</li>
              <li>Stay hydrated throughout the day</li>
              <li>Include foods rich in magnesium and tryptophan</li>
              <li>Maintain consistent meal times</li>
            </ul>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Sleep Prediction
          </Link>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Sleep Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
} 