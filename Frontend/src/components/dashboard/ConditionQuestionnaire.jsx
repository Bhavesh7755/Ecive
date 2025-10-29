// // src/components/dashboard/ConditionQuestionnaire.jsx
// import React, { useState, useEffect, useRef } from 'react';

// export default function ConditionQuestionnaire({ wasteType, category, brand, model, initialData, onUpdate }) {
//   const [answers, setAnswers] = useState(initialData || {});
//   const firstRun = useRef(true);

//   useEffect(() => {
//     // Skip running on first render
//     if (firstRun.current) {
//       firstRun.current = false;
//       return;
//     }

//     if (onUpdate) {
//       onUpdate(answers);
//     }
//   }, [answers]); // only track answers
  

//   // Example questions for electronics
//   const questions = [
//     { id: 'working', label: 'Is the item working?', options: ['Yes', 'No'] },
//     { id: 'battery', label: 'Battery Condition', options: ['Good', 'Average', 'Bad', 'No Battery'] },
//     { id: 'display', label: 'Display Condition', options: ['Good', 'Scratched', 'Broken', 'No Display'] }
//   ];

//   if (wasteType !== 'electronics') {
//     return <p>No condition questions for this waste type currently.</p>;
//   }

//   return (
//     <div>
//       {questions.map((q) => (
//         <div key={q.id} className="mb-4">
//           <label className="block font-medium mb-1">{q.label}</label>
//           <select
//             value={answers[q.id] || ''}
//             onChange={(e) =>
//               setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
//             }
//             className="w-full p-2 border rounded"
//           >
//             <option value="" disabled>
//               Select
//             </option>
//             {q.options.map((opt) => (
//               <option key={opt} value={opt}>
//                 {opt}
//               </option>
//             ))}
//           </select>
//         </div>
//       ))}
//     </div>
//   );
// }











// src/components/dashboard/ConditionQuestionnaire.jsx
import React, { useState, useEffect, useRef } from "react";

export default function ConditionQuestionnaire({
  wasteType,
  category,
  brand,
  model,
  initialData,
  onUpdate,
}) {
  const [answers, setAnswers] = useState(initialData || {});
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (onUpdate) {
      onUpdate(answers);
    }
  }, [answers]);

  // Helper: Detect subcategory for electronics
  const getElectronicsType = () => {
    const name = `${category} ${model} ${brand}`.toLowerCase();
    if (name.includes("phone") || name.includes("mobile")) return "mobile";
    if (name.includes("laptop") || name.includes("notebook")) return "laptop";
    if (name.includes("desktop") || name.includes("cpu")) return "desktop";
    if (name.includes("tv") || name.includes("television")) return "tv";
    if (name.includes("refrigerator") || name.includes("fridge")) return "refrigerator";
    if (name.includes("ac") || name.includes("air conditioner")) return "ac";
    if (name.includes("earphone") || name.includes("headphone")) return "headphone";
    return "generic";
  };

  const electronicsType = getElectronicsType();

  // ✅ All category-wise questions
  const questionsByType = {
    mobile: [
      { id: "working", label: "Is the phone working?", options: ["Yes", "No"], explain: "If 'No', price drops by 60–80%" },
      { id: "displayCondition", label: "Display Condition", options: ["Flawless", "Minor Scratches", "Cracked", "No Display"], explain: "Cracked screen reduces price heavily" },
      { id: "batteryHealth", label: "Battery Health", options: ["Excellent", "Average", "Poor", "Swollen/Not Working"], explain: "Low battery health reduces price 30–40%" },
      { id: "bodyCondition", label: "Body Condition", options: ["Like New", "Slightly Scratched", "Major Dents", "Broken Frame"], explain: "Physical damage affects appearance & resale" },
      { id: "camera", label: "Camera Condition", options: ["Perfect", "Blurry", "Cracked Lens", "Not Working"], explain: "Non-working camera reduces price 15–25%" },
      { id: "chargingPort", label: "Charging Port Working?", options: ["Yes", "Sometimes", "No"], explain: "Charging issues reduce price 20–30%" },
      { id: "micSpeaker", label: "Microphone and Speaker Working?", options: ["Yes", "Partially", "No"], explain: "Defects reduce price 10–20%" },
      { id: "network", label: "Network Functionality", options: ["All SIMs Working", "Only 1 SIM", "No Network"], explain: "Network issue is major, drops price 50%" },
      { id: "originalAccessories", label: "Original Accessories (Charger, Box, Bill)?", options: ["All", "Some", "None"], explain: "Original box increases resale value 5–10%" },
    ],

    laptop: [
      { id: "booting", label: "Does the laptop boot properly?", options: ["Yes", "No"], explain: "No boot means motherboard issue, price cut 70%" },
      { id: "screen", label: "Screen Condition", options: ["Perfect", "Flickering", "Cracked", "No Display"], explain: "Cracked/flickering screen majorly impacts price" },
      { id: "battery", label: "Battery Backup", options: ["3+ hrs", "1–2 hrs", "Less than 1 hr", "No Battery"], explain: "Low battery backup reduces price 20–30%" },
      { id: "keyboard", label: "Keyboard Functionality", options: ["All Keys Working", "Few Keys Faulty", "Not Working"], explain: "Faulty keyboard reduces usability" },
      { id: "bodyCondition", label: "Body Condition", options: ["Like New", "Scratched", "Cracked"], explain: "Good condition adds 5–10% value" },
      { id: "ports", label: "USB/HDMI Ports Working?", options: ["All Working", "Some Not Working", "None Working"], explain: "Faulty ports reduce price 10–15%" },
      { id: "cameraMic", label: "Webcam & Mic Working?", options: ["Yes", "No"], explain: "No webcam or mic reduces price slightly" },
    ],

    desktop: [
      { id: "working", label: "Is it turning on?", options: ["Yes", "No"], explain: "No boot means motherboard or PSU issue" },
      { id: "monitor", label: "Monitor Condition", options: ["Good", "Flickering", "Cracked", "No Display"], explain: "Bad monitor reduces resale drastically" },
      { id: "cpuCondition", label: "CPU Cabinet Condition", options: ["Good", "Scratched", "Rusty"], explain: "Rusty or dented cabinets lower value" },
    ],

    tv: [
      { id: "powerOn", label: "Does it power on?", options: ["Yes", "No"], explain: "Non-working TV reduces value 80%" },
      { id: "display", label: "Display Condition", options: ["Perfect", "Minor Spots", "Cracked"], explain: "Cracked display = scrap value" },
      { id: "remote", label: "Remote Working?", options: ["Yes", "No"], explain: "Minor impact on resale" },
    ],

    refrigerator: [
      { id: "cooling", label: "Cooling Performance", options: ["Excellent", "Average", "Weak", "No Cooling"], explain: "Weak cooling reduces value 50%" },
      { id: "bodyCondition", label: "Body Condition", options: ["Like New", "Dented", "Rusty"], explain: "Rust reduces price 30%" },
      { id: "compressor", label: "Compressor Working?", options: ["Yes", "No"], explain: "No compressor = scrap" },
    ],

    ac: [
      { id: "cooling", label: "Cooling Efficiency", options: ["Chills Fast", "Average", "Low", "No Cooling"], explain: "Weak cooling lowers value" },
      { id: "bodyCondition", label: "Outer Body Condition", options: ["Good", "Rusty", "Broken"], explain: "Rust = 20–30% drop" },
      { id: "remoteWorking", label: "Remote Working?", options: ["Yes", "No"], explain: "Minor effect" },
    ],

    headphone: [
      { id: "working", label: "Is sound output clear?", options: ["Yes", "Distorted", "No Sound"], explain: "No sound = 80% drop" },
      { id: "wireless", label: "Bluetooth Pairing?", options: ["Working Fine", "Laggy", "Not Connecting"], explain: "Poor Bluetooth lowers resale" },
      { id: "bodyCondition", label: "Body Condition", options: ["Clean", "Scratched", "Broken"], explain: "Physical wear affects price" },
    ],

    generic: [
      { id: "working", label: "Is the item functional?", options: ["Yes", "No"], explain: "Non-working items lose 70% value" },
      { id: "bodyCondition", label: "Physical Condition", options: ["Good", "Average", "Broken"], explain: "Broken lowers price 50%" },
    ],

    // ♻️ Non-electronic waste types
    plastic: [
      { id: "cleanliness", label: "Cleanliness of Plastic", options: ["Clean", "Slightly Dirty", "Heavily Contaminated"], explain: "Cleaner plastic fetches higher recycling price" },
      { id: "type", label: "Type of Plastic", options: ["PET", "HDPE", "LDPE", "PVC", "Other"], explain: "PET and HDPE are high-value recyclable plastics" },
    ],

    metal: [
      { id: "metalType", label: "Type of Metal", options: ["Aluminum", "Copper", "Iron", "Steel", "Mixed"], explain: "Copper and Aluminum fetch better scrap rates" },
      { id: "rustLevel", label: "Rust Level", options: ["No Rust", "Slight Rust", "Heavily Rusted"], explain: "Rust lowers scrap price" },
    ],

    paper: [
      { id: "paperType", label: "Type of Paper Waste", options: ["Newspaper", "Cardboard", "Office Paper", "Mixed"], explain: "Cardboard & white paper get better prices" },
      { id: "wetness", label: "Condition of Paper", options: ["Dry", "Slightly Wet", "Wet"], explain: "Wet paper lowers weight & price" },
    ],
  };

  // Select correct question set
  const selectedQuestions =
    wasteType === "electronics"
      ? questionsByType[electronicsType] || questionsByType.generic
      : questionsByType[wasteType] || [];

  if (!selectedQuestions.length) {
    return <p>No condition questions for this product.</p>;
  }

  return (
    <div>
      {selectedQuestions.map((q) => (
        <div key={q.id} className="mb-4">
          <label className="block font-medium mb-1">{q.label}</label>
          <select
            value={answers[q.id] || ""}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
            }
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>
              Select
            </option>
            {q.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">{q.explain}</p>
        </div>
      ))}
    </div>
  );
}