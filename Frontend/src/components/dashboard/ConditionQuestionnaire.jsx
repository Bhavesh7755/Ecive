// src/components/dashboard/ConditionQuestionnaire.jsx
import React, { useState, useEffect } from 'react';

export default function ConditionQuestionnaire({ wasteType, category, brand, model, initialData, onUpdate }) {
  const [answers, setAnswers] = useState(initialData || {});

  useEffect(() => {
  if (onUpdate) onUpdate(answers);
}, [answers, onUpdate]);


  // Example questions for electronics
  const questions = [
    { id: 'working', label: 'Is the item working?', options: ['Yes', 'No'] },
    { id: 'battery', label: 'Battery Condition', options: ['Good', 'Average', 'Bad', 'No Battery'] },
    { id: 'display', label: 'Display Condition', options: ['Good', 'Scratched', 'Broken', 'No Display'] }
  ];

  if (wasteType !== 'electronics') {
    return <p>No condition questions for this waste type currently.</p>;
  }

  return (
    <div>
      {questions.map((q) => (
        <div key={q.id} className="mb-4">
          <label className="block font-medium mb-1">{q.label}</label>
          <select
            value={answers[q.id] || ''}
            onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>Select</option>
            {q.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}