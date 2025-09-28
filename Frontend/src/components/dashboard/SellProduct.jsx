// src/components/dashboard/SellProduct.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';

import ImageUpload from '../common/ImageUpload';
import ConditionQuestionnaire from './ConditionQuestionnaire';
import { postAPI } from '../../services/authService';
import { userAPI } from '../../services/authService';
import { handleAuthError } from '../../utils/authUtils';

const wasteTypes = [
  { id: 'plastic', label: 'Plastic', description: 'Plastic bottles, containers, etc.' },
  { id: 'metal', label: 'Metal', description: 'Steel, aluminum, copper, etc.' },
  { id: 'paper', label: 'Paper', description: 'Newspapers, cardboard, books' },
  { id: 'electronics', label: 'Electronics', description: 'Mobile, Laptop, etc.' },
];

const electronicsCategories = [
  'mobile', 'laptop', 'desktop', 'washing_machine', 'fan', 'water_motor'
];

const brands = {
  mobile: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Other'],
  laptop: ['Dell', 'HP', 'Lenovo', 'Apple', 'Other'],
  washing_machine: ['LG', 'Samsung', 'IFB', 'Other'],
};

export default function SellProduct({ onBack, onSubmitSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    wasteType: '',
    category: '',
    brand: '',
    model: '',
    quantity: 1,
    description: '',
    images: [],
    conditionDetails: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResults, setAiResults] = useState([]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const isStepValid = () => {
    switch (step) {
      case 1: return form.wasteType !== '';
      case 2:
        if (form.wasteType === 'electronics') return form.category !== '';
        return form.quantity > 0;
      case 3:
        if (form.wasteType === 'electronics') return form.brand !== '';
        return true;
      case 4: return form.images.length > 0;
      case 5: return Object.keys(form.conditionDetails).length > 0;
      case 6: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // 1️⃣ Upload images first
      let imageUrls = form.images;

      // If images are File objects, upload them
      if (form.images.length && typeof form.images[0] !== 'string') {
        const formData = new FormData();
        form.images.forEach(img => formData.append("images", img));

        const uploadRes = await postAPI.uploadImages(formData); // <-- new API call
        imageUrls = uploadRes.data.urls; // ✅ Cloudinary URLs only
      }

      // 2️⃣ Get current user location
      const currentUser = await userAPI.getCurrentUser();
      const userLocation = currentUser?.location || { lat: 0, lng: 0 };

      // 3️⃣ Create final payload
      const payload = {
        products: [
          {
            wasteType: form.wasteType,
            category: form.category,
            brand: form.brand,
            model: form.model,
            quantity: form.quantity,
            description: form.description,
            images: imageUrls, // ✅ Now only Cloudinary URLs
            conditionDetails: form.conditionDetails,
          }
        ],
        userLocation
      };

      // 4️⃣ Call backend
      const response = await postAPI.createPost(payload);
      setAiResults(response.data.products || []);
      onSubmitSuccess && onSubmitSuccess(response.data);
      setStep(6);
    } catch (err) {
      console.error(err);
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white rounded-xl p-8 shadow-md max-w-3xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6">Sell Your Product</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <h3 className="text-xl font-semibold mb-4">Step 1: Select Waste Type</h3>
            <div className="grid grid-cols-2 gap-4">
              {wasteTypes.map(wt => (
                <button
                  key={wt.id}
                  onClick={() => handleChange('wasteType', wt.id)}
                  className={`p-4 rounded-lg border ${form.wasteType === wt.id ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                >
                  <h4 className="font-semibold">{wt.label}</h4>
                  <p className="text-gray-600 text-sm">{wt.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            {form.wasteType === 'electronics' ? (
              <>
                <h3 className="text-xl font-semibold mb-4">Step 2: Select Category</h3>
                <div className="grid grid-cols-2 gap-4">
                  {electronicsCategories.map(cat => (
                    <button key={cat} onClick={() => handleChange('category', cat)}
                      className={`p-4 rounded-lg border ${form.category === cat ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4">Step 2: Enter Quantity (kg)</h3>
                <input
                  type="number" min="1" value={form.quantity}
                  onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
                  className="w-full rounded-lg border p-3"
                />
              </>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            {form.wasteType === 'electronics' && form.category ? (
              <>
                <h3 className="text-xl font-semibold mb-4">Step 3: Select Brand</h3>
                <div className="grid grid-cols-2 gap-4">
                  {(brands[form.category] || []).map(brand => (
                    <button key={brand} onClick={() => handleChange('brand', brand)}
                      className={`p-4 rounded-lg border ${form.brand === brand ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                      {brand}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block mb-2">Model (Optional)</label>
                  <input type="text" value={form.model} onChange={(e) => handleChange('model', e.target.value)}
                    className="w-full border rounded-lg p-3" />
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4">Step 3: Additional Details (Optional)</h3>
                <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your item for better pricing"
                  className="w-full border rounded-lg p-3 min-h-[80px]" />
              </>
            )}
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <h3 className="text-xl font-semibold mb-4">Step 4: Upload Images</h3>
            <ImageUpload
              images={form.images}
              onImagesChange={(imgs) => handleChange('images', imgs)}
              maxImages={5}
            />
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <h3 className="text-xl font-semibold mb-4">Step 5: Answer Condition Questions</h3>
            <ConditionQuestionnaire
              wasteType={form.wasteType}
              category={form.category}
              brand={form.brand}
              model={form.model}
              onUpdate={(cond) => handleChange('conditionDetails', cond)}
              initialData={form.conditionDetails}
            />
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <h3 className="text-xl font-semibold mb-4">Step 6: Review & AI Results</h3>
            <div className="border rounded-lg p-6 bg-gray-50 mb-4">
              <p><strong>Waste Type:</strong> {form.wasteType}</p>
              {form.category && <p><strong>Category:</strong> {form.category}</p>}
              {form.brand && <p><strong>Brand:</strong> {form.brand}</p>}
              {form.model && <p><strong>Model:</strong> {form.model}</p>}
              <p><strong>Quantity:</strong> {form.quantity}</p>
              {form.description && <p><strong>Description:</strong> {form.description}</p>}
              <p><strong>Number of images:</strong> {form.images.length}</p>
              <p><strong>Condition Details:</strong> {JSON.stringify(form.conditionDetails)}</p>
            </div>

            {aiResults.length > 0 && (
              <div className="border rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold mb-2 text-green-700">AI Suggested Prices:</h4>
                {aiResults.map((p, idx) => (
                  <div key={idx} className="border p-3 mb-3 rounded bg-white">
                    <p><strong>Product {idx + 1}:</strong> {p.wasteType} {p.category ? `- ${p.category}` : ''} {p.brand ? `- ${p.brand}` : ''}</p>
                    <p><strong>Quantity:</strong> {p.quantity}</p>
                    {p.aiSuggestedPrice && <p><strong>AI Suggested Price:</strong> ₹{p.aiSuggestedPrice}</p>}
                    {p.aiConditionScore && <p><strong>Condition Score:</strong> {p.aiConditionScore}</p>}
                    {p.aiConfidence && <p><strong>Confidence:</strong> {p.aiConfidence}</p>}
                    {p.aiExplanation && <p><strong>Explanation:</strong> {p.aiExplanation}</p>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        <button type="button" onClick={prevStep} disabled={step === 1}
          className={`py-3 px-6 rounded-lg font-semibold ${step === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}>
          <ArrowLeft size={20} className="inline mr-2" /> Previous
        </button>

        <button type="button" onClick={step === 6 ? handleSubmit : nextStep} disabled={!isStepValid() || loading}
          className={`py-3 px-6 rounded-lg font-semibold text-white ${!isStepValid() || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
          {loading ? 'Processing...' : step === 6 ? 'Get AI Price' : 'Next'}
          <ArrowRight size={20} className="inline ml-2" />
        </button>
      </div>
    </div>
  );
}