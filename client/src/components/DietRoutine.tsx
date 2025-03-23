import React from 'react';
import { Clock, Utensils, Leaf, Coffee, Moon } from 'lucide-react';

interface DietSection {
  title: string;
  icon: React.ReactNode;
  content: string[];
}

const dietSections: DietSection[] = [
  {
    title: "Meal Timing",
    icon: <Clock className="w-6 h-6 text-blue-500" />,
    content: [
      "Breakfast: 7-8 AM",
      "Lunch: 12-1 PM",
      "Dinner: 6-7 PM",
      "Last meal: 3-4 hours before bedtime",
      "Avoid heavy meals close to sleep"
    ]
  },
  {
    title: "Sleep-Friendly Foods",
    icon: <Moon className="w-6 h-6 text-indigo-500" />,
    content: [
      "Tryptophan-rich foods: Turkey, chicken, fish",
      "Complex carbohydrates: Whole grains, sweet potatoes",
      "Magnesium-rich foods: Leafy greens, nuts, seeds",
      "Calcium-rich foods: Dairy, fortified plant milk",
      "Foods to avoid: Caffeine, alcohol, spicy foods"
    ]
  },
  {
    title: "Daily Hydration",
    icon: <Coffee className="w-6 h-6 text-green-500" />,
    content: [
      "Morning: 2-3 glasses of water",
      "Throughout day: 6-8 glasses",
      "Evening: 1-2 glasses (2 hours before bed)",
      "Limit fluids close to bedtime",
      "Avoid caffeine after mid-day"
    ]
  },
  {
    title: "Nutrient-Rich Foods",
    icon: <Leaf className="w-6 h-6 text-emerald-500" />,
    content: [
      "Proteins: Lean meats, fish, eggs, legumes",
      "Healthy fats: Avocados, nuts, olive oil",
      "Complex carbs: Whole grains, vegetables",
      "Vitamins: Fruits, vegetables, dairy",
      "Minerals: Leafy greens, nuts, seeds"
    ]
  }
];

export default function DietRoutine() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Sleep-Friendly Diet Routine</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dietSections.map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              {section.icon}
              <h2 className="text-xl font-semibold text-gray-800 ml-2">{section.title}</h2>
            </div>
            <ul className="space-y-2">
              {section.content.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Tips</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• Keep a food diary to track sleep patterns</li>
          <li>• Eat mindfully and avoid overeating</li>
          <li>• Stay consistent with meal times</li>
          <li>• Consider portion sizes for better digestion</li>
          <li>• Listen to your body's hunger signals</li>
        </ul>
      </div>
    </div>
  );
}