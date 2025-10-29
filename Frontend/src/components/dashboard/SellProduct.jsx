// src/components/dashboard/SellProduct.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ImageUpload from '../common/ImageUpload';
import ConditionQuestionnaire from './ConditionQuestionnaire';
import { postAPI, userAPI } from '../../services/authService';
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
  const navigate = useNavigate();

  // step wizard is for the current product being edited
  const [step, setStep] = useState(1);

  // single product form; when saved it will be pushed into products
  const [form, setForm] = useState({
    wasteType: '',
    category: '',
    brand: '',
    model: '',
    quantity: 1,
    description: '',
    images: [], // File objects or already-uploaded URL strings
    conditionDetails: {},
  });

  // list of products to include in the post
  const [products, setProducts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1); // -1 = creating new; >=0 = editing that product

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResults, setAiResults] = useState([]); // results after post creation

  const [createdPost, setCreatedPost] = useState(null);

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

  // Save current product into products[], and reset form for new product
  const saveCurrentProduct = () => {
    // basic validation before saving
    if (!form.wasteType) { setError('Please select a waste type'); return; }
    if (form.wasteType === 'electronics' && !form.category) { setError('Please select category'); return; }
    if (form.wasteType === 'electronics' && !form.brand) { setError('Please select brand'); return; }
    if (!form.images || form.images.length === 0) { setError('Please upload at least one image'); return; }

    const productToSave = {
      wasteType: form.wasteType,
      category: form.category,
      brand: form.brand,
      model: form.model,
      quantity: form.quantity,
      description: form.description,
      images: form.images,
      conditionDetails: form.conditionDetails,
    };

    if (editingIndex >= 0) {
      // replace existing
      setProducts(prev => prev.map((p, idx) => idx === editingIndex ? productToSave : p));
      setEditingIndex(-1);
    } else {
      setProducts(prev => [...prev, productToSave]);
    }

    // reset form for new product
    setForm({
      wasteType: '',
      category: '',
      brand: '',
      model: '',
      quantity: 1,
      description: '',
      images: [],
      conditionDetails: {},
    });
    setStep(1);
    setError('');
  };

  const editProduct = (index) => {
    const p = products[index];
    // load into form for editing
    setForm({
      wasteType: p.wasteType || '',
      category: p.category || '',
      brand: p.brand || '',
      model: p.model || '',
      quantity: p.quantity || 1,
      description: p.description || '',
      images: p.images || [],
      conditionDetails: p.conditionDetails || {},
    });
    setEditingIndex(index);
    setStep(1); // start editing from step 1
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeProduct = (index) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
    // if editing this product, cancel edit
    if (editingIndex === index) {
      setEditingIndex(-1);
      setForm({
        wasteType: '',
        category: '',
        brand: '',
        model: '',
        quantity: 1,
        description: '',
        images: [],
        conditionDetails: {},
      });
    }
  };

  // helper to upload images for each product that has File objects
  const uploadImagesForProducts = async (productsList) => {
    // returns newProducts with images replaced by uploaded urls (if needed)
    const newProducts = [];

    for (const prod of productsList) {
      let imgs = prod.images || [];
      // if first item is a File (not string), upload them
      if (imgs.length && typeof imgs[0] !== 'string') {
        // postAPI.uploadImages expects an array of File objects
        const uploadRes = await postAPI.uploadImages(imgs);
        // Try to extract urls from common shapes:
        const urls = uploadRes?.data?.urls || uploadRes?.urls || (uploadRes?.data) || (uploadRes?.urls) || [];
        // Ensure array
        const extracted = Array.isArray(urls) ? urls : (Array.isArray(uploadRes?.data) ? uploadRes.data : []);
        imgs = extracted;
      }
      // otherwise imgs is already array of strings (urls)
      newProducts.push({ ...prod, images: imgs });
    }
    return newProducts;
  };

  // Build address string from user profile object
  const buildUserAddressFromProfile = (maybeUser) => {
    // Accept various shapes: maybeUser.data.user, maybeUser.data, maybeUser.user, or plain object from localStorage
    const user = maybeUser?.data?.user || maybeUser?.data || maybeUser?.user || maybeUser;
    if (!user) return null;

    const addr1 = user.AddressLine1 || user.addressLine1 || user.address || '';
    const addr2 = user.AddressLine2 || user.addressLine2 || '';
    const city = user.city || '';
    const state = user.state || '';
    const pincode = user.pincode || user.zip || '';

    const parts = [addr1, addr2, city, state, pincode].map(s => (s || '').toString().trim()).filter(Boolean);
    if (!parts.length) return null;
    return parts.join(', ');
  };

  // Robust extractor for API response shape -> post object
  const extractPostFromResponse = (resp) => {
    // resp might be:
    // 1) post object directly
    // 2) ApiResponse { statusCode, message, data: post }
    // 3) axios response wrapper { data: ApiResponse }
    // 4) other nested shapes
    if (!resp) return null;
    // axios response shape where actual payload is in resp.data
    const a = resp;
    if (a.data && (a.data.user || a.data.products || a.data._id)) return a.data; // resp.data === post
    if (a.data && a.data.data && (a.data.data.products || a.data.data._id)) return a.data.data; // resp.data.data === post
    // sometimes server returns { products: [...], ... } directly
    if (a.products || a._id) return a;
    // fallback: return resp.data if exists
    return a.data || a;
  };

  // Submit all products (products[] plus possibly current unsaved product)
  const handleSubmitAll = async () => {
    setLoading(true);
    setError('');

    try {
      // If user hasn't saved current product but has data in form, include it
      let allProducts = [...products];
      const hasCurrent = form.wasteType || (form.images && form.images.length > 0);
      if (hasCurrent) {
        // validate current product before adding
        if (!form.wasteType) { setError('Please select a waste type'); setLoading(false); return; }
        if (form.wasteType === 'electronics' && !form.category) { setError('Please select category'); setLoading(false); return; }
        if (form.wasteType === 'electronics' && !form.brand) { setError('Please select brand'); setLoading(false); return; }
        if (!form.images || form.images.length === 0) { setError('Please upload at least one image'); setLoading(false); return; }

        const temp = {
          wasteType: form.wasteType,
          category: form.category,
          brand: form.brand,
          model: form.model,
          quantity: form.quantity,
          description: form.description,
          images: form.images,
          conditionDetails: form.conditionDetails,
        };
        allProducts.push(temp);
      }

      if (!allProducts.length) {
        setError('Please add at least one product before submitting.');
        setLoading(false);
        return;
      }

      // 1) Upload images per product when needed
      const productsWithUploadedImages = await uploadImagesForProducts(allProducts);

      // 2) Get user address from profile (no map, no coordinates)
      let currentUserResp = null;
      try {
        currentUserResp = await userAPI.getCurrentUser();
      } catch (e) {
        // ignore - we will attempt localStorage fallback
        currentUserResp = null;
      }
      const maybeUser = currentUserResp?.data?.user || currentUserResp?.data || currentUserResp || JSON.parse(localStorage.getItem('user') || 'null');

      const userAddress = buildUserAddressFromProfile(maybeUser);
      if (!userAddress) {
        setError('Please fill address in your profile (AddressLine1 / city / state / pincode) before creating a post.');
        setLoading(false);
        return;
      }

      // 3) Build payload as backend expects (userAddress instead of userLocation)
      const payload = {
        products: productsWithUploadedImages.map(p => ({
          wasteType: p.wasteType,
          category: p.category,
          brand: p.brand,
          model: p.model,
          quantity: p.quantity,
          description: p.description,
          images: p.images,
          conditionDetails: p.conditionDetails
        })),
        userAddress
      };

      // 4) Call backend createPost
      const response = await postAPI.createPost(payload);

      // Extract robustly
      const postObj = extractPostFromResponse(response);
      if (!postObj) {
        // If we couldn't extract, keep the response for debugging and show a helpful message
        console.error('Could not extract post object from createPost response:', response);
        setError('Post created but response shape unexpected. Check console.');
        setLoading(false);
        return;
      }

      // 5) AI results are attached server-side to products - show them
      const returnedProducts = postObj.products || [];
      setAiResults(returnedProducts);

      // store created post so UI shows prices
      setCreatedPost(postObj);

      // scroll to ai section after short delay
      setTimeout(() => {
        document.getElementById('ai-prices-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

      // Reset local product builder
      setProducts([]);
      setForm({
        wasteType: '',
        category: '',
        brand: '',
        model: '',
        quantity: 1,
        description: '',
        images: [],
        conditionDetails: {},
      });
      setEditingIndex(-1);
      setStep(6);

      // IMPORTANT: Do NOT call onSubmitSuccess here to avoid immediate parent navigation.
      // If you still want to notify parent, call onSubmitSuccess from parent after user confirms/selects recycler.
      // (This prevents automatic redirect to dashboard and allows user to see AI prices & choose recycler.)

    } catch (err) {
      console.error(err);
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // For now: "Find recyclers" will attempt to call postAPI.getNearbyRecyclers() (if implemented),
  // otherwise will just console.log a helpful message. You requested console.log for now.
  const handleFindRecyclers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const city = user?.city;
      console.log("Current user city:", city);


      if (!user || !user.city) {
        alert("Please update your profile with your city before finding recyclers.");
        return;
      }
      if (!city) {
        console.error('User city not found');
        return;
      }

      const res = await postAPI.getNearbyRecyclers(city);
      console.log('Nearby recyclers in your city:', res?.data || res);

      if (!createdPost) {
        console.error("No created post found while navigating to recycler list.");
        alert("Please create a post before finding recyclers.");
        return;
      }

      // Navigate to RecyclerList component and pass both recyclers + createdPost
      navigate('/dashboard/recycler-list', {
        state: { recyclers: res?.data || [], currentPost: createdPost }
      });


    } catch (err) {
      console.error('Error fetching nearby recyclers (client):', err);
    }
  };



  return (
    // <div className="bg-white rounded-xl p-8 shadow-md max-w-3xl mx-auto">
    //   <h2 className="text-3xl font-semibold mb-6">Sell Your Product</h2>

    //   {error && <p className="text-red-500 mb-4">{error}</p>}

    //   {/* List of already added products with edit/remove */}
    //   {products.length > 0 && (
    //     <div className="mb-6 border rounded-lg p-4 bg-gray-50">
    //       <div className="flex items-center justify-between mb-3">
    //         <strong className="text-gray-800">Products added ({products.length})</strong>
    //         <div className="text-sm text-gray-600">You can edit or remove before final submission</div>
    //       </div>
    //       <div className="space-y-3">
    //         {products.map((p, idx) => (
    //           <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded">
    //             <div>
    //               <div className="font-medium">{p.brand || p.wasteType} {p.model ? `- ${p.model}` : ''}</div>
    //               <div className="text-sm text-gray-500">{p.category || p.wasteType} • Qty: {p.quantity}</div>
    //             </div>
    //             <div className="flex items-center space-x-2">
    //               <button
    //                 onClick={() => editProduct(idx)}
    //                 className="px-3 py-1 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
    //                 type="button"
    //               >
    //                 Edit
    //               </button>
    //               <button
    //                 onClick={() => removeProduct(idx)}
    //                 className="px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
    //                 type="button"
    //               >
    //                 Remove
    //               </button>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   )}

    //   <AnimatePresence mode="wait">
    //     {step === 1 && (
    //       <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
    //         <h3 className="text-xl font-semibold mb-4">Step 1: Select Waste Type</h3>
    //         <div className="grid grid-cols-2 gap-4">
    //           {wasteTypes.map(wt => (
    //             <button
    //               key={wt.id}
    //               onClick={() => handleChange('wasteType', wt.id)}
    //               className={`p-4 rounded-lg border ${form.wasteType === wt.id ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
    //             >
    //               <h4 className="font-semibold">{wt.label}</h4>
    //               <p className="text-gray-600 text-sm">{wt.description}</p>
    //             </button>
    //           ))}
    //         </div>
    //       </motion.div>
    //     )}

    //     {step === 2 && (
    //       <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
    //         {form.wasteType === 'electronics' ? (
    //           <>
    //             <h3 className="text-xl font-semibold mb-4">Step 2: Select Category</h3>
    //             <div className="grid grid-cols-2 gap-4">
    //               {electronicsCategories.map(cat => (
    //                 <button key={cat} onClick={() => handleChange('category', cat)}
    //                   className={`p-4 rounded-lg border ${form.category === cat ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
    //                   {cat.charAt(0).toUpperCase() + cat.slice(1)}
    //                 </button>
    //               ))}
    //             </div>
    //           </>
    //         ) : (
    //           <>
    //             <h3 className="text-xl font-semibold mb-4">Step 2: Enter Quantity (kg)</h3>
    //             <input
    //               type="number" min="1" value={form.quantity}
    //               onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
    //               className="w-full rounded-lg border p-3"
    //             />
    //           </>
    //         )}
    //       </motion.div>
    //     )}

    //     {step === 3 && (
    //       <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
    //         {form.wasteType === 'electronics' && form.category ? (
    //           <>
    //             <h3 className="text-xl font-semibold mb-4">Step 3: Select Brand</h3>
    //             <div className="grid grid-cols-2 gap-4">
    //               {(brands[form.category] || []).map(brand => (
    //                 <button key={brand} onClick={() => handleChange('brand', brand)}
    //                   className={`p-4 rounded-lg border ${form.brand === brand ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
    //                   {brand}
    //                 </button>
    //               ))}
    //             </div>
    //             <div className="mt-4">
    //               <label className="block mb-2">Model (Optional)</label>
    //               <input type="text" value={form.model} onChange={(e) => handleChange('model', e.target.value)}
    //                 className="w-full border rounded-lg p-3" />
    //             </div>
    //           </>
    //         ) : (
    //           <>
    //             <h3 className="text-xl font-semibold mb-4">Step 3: Additional Details (Optional)</h3>
    //             <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)}
    //               placeholder="Describe your item for better pricing"
    //               className="w-full border rounded-lg p-3 min-h-[80px]" />
    //           </>
    //         )}
    //       </motion.div>
    //     )}

    //     {step === 4 && (
    //       <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
    //         <h3 className="text-xl font-semibold mb-4">Step 4: Upload Images</h3>
    //         <ImageUpload
    //           images={form.images}
    //           onImagesChange={(imgs) => handleChange('images', imgs)}
    //           maxImages={5}
    //         />
    //       </motion.div>
    //     )}

    //     {step === 5 && (
    //       <motion.div key="step5" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
    //         <h3 className="text-xl font-semibold mb-4">Step 5: Answer Condition Questions</h3>
    //         <ConditionQuestionnaire
    //           wasteType={form.wasteType}
    //           category={form.category}
    //           brand={form.brand}
    //           model={form.model}
    //           onUpdate={(cond) => handleChange('conditionDetails', cond)}
    //           initialData={form.conditionDetails}
    //         />
    //       </motion.div>
    //     )}

    //     {step === 6 && (
    //       <motion.div key="step6" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
    //         <h3 className="text-xl font-semibold mb-4">Step 6: Review & AI Results</h3>
    //         <div className="border rounded-lg p-6 bg-gray-50 mb-4">
    //           <p><strong>Waste Type:</strong> {form.wasteType}</p>
    //           {form.category && <p><strong>Category:</strong> {form.category}</p>}
    //           {form.brand && <p><strong>Brand:</strong> {form.brand}</p>}
    //           {form.model && <p><strong>Model:</strong> {form.model}</p>}
    //           <p><strong>Quantity:</strong> {form.quantity}</p>
    //           {form.description && <p><strong>Description:</strong> {form.description}</p>}
    //           <p><strong>Number of images:</strong> {form.images.length}</p>
    //           <p><strong>Condition Details:</strong> {JSON.stringify(form.conditionDetails)}</p>
    //         </div>

    //         <div className="flex gap-3 mb-4">
    //           <button
    //             onClick={saveCurrentProduct}
    //             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    //             type="button"
    //           >
    //             {editingIndex >= 0 ? 'Save Changes' : 'Save Product'}
    //           </button>

    //           <button
    //             onClick={() => { saveCurrentProduct(); /* leave user on Step 1 to add another */ }}
    //             className="px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
    //             type="button"
    //           >
    //             Save & Add Another
    //           </button>

    //           <button
    //             onClick={() => { /* quick preview of all products before final submit */ window.scrollTo({ top: 0, behavior: 'smooth' }); }}
    //             className="px-4 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
    //             type="button"
    //           >
    //             Preview All Products
    //           </button>
    //         </div>

    //         {aiResults.length > 0 && (
    //           <div className="border rounded-lg p-4 bg-green-50">
    //             <h4 className="font-semibold mb-2 text-green-700">AI Suggested Prices:</h4>
    //             {aiResults.map((p, idx) => (
    //               <div key={idx} className="border p-3 mb-3 rounded bg-white">
    //                 <p><strong>Product {idx + 1}:</strong> {p.wasteType || p.brand} {p.category ? `- ${p.category}` : ''} {p.brand ? `- ${p.brand}` : ''}</p>
    //                 <p><strong>Quantity:</strong> {p.quantity}</p>
    //                 {p.aiSuggestedPrice !== undefined && <p><strong>AI Suggested Price:</strong> ₹{p.aiSuggestedPrice}</p>}
    //                 {p.aiConditionScore !== undefined && <p><strong>Condition Score:</strong> {p.aiConditionScore}</p>}
    //                 {p.aiConfidence !== undefined && <p><strong>Confidence:</strong> {p.aiConfidence}</p>}
    //                 {p.aiExplanation && <p><strong>Explanation:</strong> {p.aiExplanation}</p>}
    //               </div>
    //             ))}
    //           </div>
    //         )}
    //       </motion.div>
    //     )}
    //   </AnimatePresence>

    //   {/* Navigation */}
    //   <div className="flex justify-between mt-8 pt-4 border-t">
    //     <button type="button" onClick={prevStep} disabled={step === 1}
    //       className={`py-3 px-6 rounded-lg font-semibold ${step === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}>
    //       <ArrowLeft size={20} className="inline mr-2" /> Previous
    //     </button>

    //     <div className="flex items-center gap-3">
    //       {/* Submit all (uploads images for all products and create post) */}
    //       <button
    //         onClick={handleSubmitAll}
    //         disabled={loading || (products.length === 0 && !form.wasteType)}
    //         className={`py-3 px-6 rounded-lg font-semibold text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
    //         type="button"
    //       >
    //         {loading ? 'Processing...' : 'Submit All Products'}
    //       </button>

    //       {/* Next/Finish product wizard */}
    //       <button type="button" onClick={step === 6 ? saveCurrentProduct : nextStep} disabled={!isStepValid() || loading}
    //         className={`py-3 px-6 rounded-lg font-semibold text-white ${!isStepValid() || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
    //         {step === 6 ? (editingIndex >= 0 ? 'Save' : 'Save & Continue') : 'Next'}
    //         <ArrowRight size={20} className="inline ml-2" />
    //       </button>
    //     </div>
    //   </div>

    //   {createdPost && createdPost.products && (
    //     <div id="ai-prices-section" className="mt-8 border-t pt-6">
    //       <h2 className="text-xl font-semibold mb-4 text-green-700">AI Suggested Prices for This Post</h2>
    //       {createdPost.products.map((p, idx) => (
    //         <div key={idx} className="p-4 mb-3 border rounded-lg bg-green-50">
    //           <p><strong>Product:</strong> {p.brand || p.wasteType} {p.model}</p>
    //           <p><strong>AI Suggested Price:</strong> ₹{(p.aiSuggestedPrice !== undefined && p.aiSuggestedPrice !== null) ? p.aiSuggestedPrice : 'N/A'}</p>
    //         </div>
    //       ))}

    //       {/* New: Find recyclers (console.log for now) and Cancel */}
    //       <div className="mt-4 flex gap-3">
    //         <button
    //           onClick={handleFindRecyclers}
    //           className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
    //           type="button"
    //         >
    //           Find Recyclers in My City
    //         </button>
    //       </div>
    //     </div>
    //   )}
    // </div>














    <motion.div
      className="bg-gradient-to-br from-green-100 via-green-50 to-blue-100 min-h-screen flex items-center justify-center px-3 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative max-w-3xl w-full rounded-3xl shadow-2xl bg-white/90 backdrop-blur border border-gray-200 px-8 py-10"
        initial={{ scale: 0.94, y: 36 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 17 }}
        style={{ overflow: "visible" }}
      >
        <h2 className="text-3xl font-extrabold text-center mb-8 text-green-700 tracking-wide 
          bg-gradient-to-l from-emerald-500 via-green-500 to-blue-500 bg-clip-text text-transparent"
        >
          Sell Your Product
        </h2>

        {error && (
          <motion.div
            className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 mb-5"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Product Summary */}
        {products.length > 0 && (
          <motion.div
            className="mb-7 border rounded-2xl p-4 bg-emerald-50/50 shadow space-y-2"
            layout
          >
            <div className="flex items-center justify-between mb-1">
              <strong className="text-gray-800 text-lg">Products added ({products.length})</strong>
              <div className="text-sm text-gray-600">Add, Edit, or Remove before submitting</div>
            </div>
            <AnimatePresence>
              {products.map((p, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ delay: idx * 0.03 + 0.11, type: "spring", stiffness: 180, damping: 15 }}
                  className="flex items-center justify-between p-3 bg-white border rounded-xl shadow hover:shadow-md transition-shadow"
                  key={idx}
                  layout
                >
                  <div>
                    <div className="font-medium">{p.brand || p.wasteType} {p.model ? `- ${p.model}` : ''}</div>
                    <div className="text-sm text-gray-500">{p.category || p.wasteType} • Qty: {p.quantity}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      className="px-3 py-1 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                      onClick={() => editProduct(idx)}
                      type="button"
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      className="px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
                      onClick={() => removeProduct(idx)}
                      type="button"
                    >
                      Remove
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 110, damping: 18 }}
              className="mb-7"
            >
              <h3 className="text-xl font-bold border-l-4 border-emerald-500 pl-4 mb-5">Step 1: Select Waste Type</h3>
              <div className="grid grid-cols-2 gap-4">
                {wasteTypes.map(wt => (
                  <motion.button
                    whileHover={{ scale: 1.06, boxShadow: "0 6px 16px rgba(16,180,111,.10)" }}
                    whileTap={{ scale: 0.96 }}
                    key={wt.id}
                    onClick={() => handleChange('wasteType', wt.id)}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-start transition ${form.wasteType === wt.id
                      ? 'border-green-500 bg-emerald-50 shadow-lg scale-[1.01]'
                      : 'border-gray-300 hover:border-green-400'}`}
                  >
                    <div className="text-lg font-bold">{wt.label}</div>
                    <div className="text-gray-500 text-sm">{wt.description}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 110, damping: 18 }}
              className="mb-7"
            >
              {form.wasteType === 'electronics' ? (
                <>
                  <h3 className="text-xl font-bold border-l-4 border-blue-500 pl-4 mb-5">Step 2: Select Category</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {electronicsCategories.map(cat => (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        key={cat}
                        onClick={() => handleChange('category', cat)}
                        className={`p-4 rounded-lg border ${form.category === cat ? 'border-blue-500 bg-blue-50 shadow' : 'border-gray-300'}`}
                      >{cat.charAt(0).toUpperCase() + cat.slice(1)}</motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold border-l-4 border-pink-500 pl-4 mb-5">Step 2: Enter Quantity (kg)</h3>
                  <motion.input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
                    className="w-full rounded-xl border-2 border-gray-200 p-4 outline-none focus:ring-2 focus:ring-green-400 transition"
                    whileFocus={{ scale: 1.03 }}
                  />
                </>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.96 }}
              className="mb-7"
            >
              {form.wasteType === 'electronics' && form.category ? (
                <>
                  <h3 className="text-xl font-bold border-l-4 border-orange-500 pl-4 mb-5">Step 3: Select Brand</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(brands[form.category] || []).map(brand => (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        key={brand}
                        onClick={() => handleChange('brand', brand)}
                        className={`p-4 rounded-lg border ${form.brand === brand ? 'border-orange-500 bg-orange-50 shadow' : 'border-gray-300'}`}
                      >{brand}</motion.button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="block mb-2 font-semibold">Model (Optional)</label>
                    <motion.input
                      type="text"
                      value={form.model}
                      onChange={(e) => handleChange('model', e.target.value)}
                      className="w-full border rounded-xl p-3 border-gray-300 focus:ring-2 focus:ring-orange-400"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold border-l-4 border-purple-500 pl-4 mb-5">Step 3: Additional Details (Optional)</h3>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe your item for better pricing"
                    className="w-full border rounded-xl p-3 min-h-[80px] focus:ring-2 focus:ring-purple-400 transition"
                  />
                </>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.96 }}
              className="mb-7"
            >
              <h3 className="text-xl font-bold border-l-4 border-green-400 pl-4 mb-5">Step 4: Upload Images</h3>
              {/* Add a subtle animation to the image upload area if you wish */}
              <ImageUpload
                images={form.images}
                onImagesChange={(imgs) => handleChange('images', imgs)}
                maxImages={5}
              />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.96 }}
              className="mb-7"
            >
              <h3 className="text-xl font-bold border-l-4 border-indigo-400 pl-4 mb-5">Step 5: Answer Condition Questions</h3>
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
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.96 }}
            >
              <h3 className="text-xl font-bold border-l-4 border-blue-400 pl-4 mb-5">Step 6: Review & AI Results</h3>
              <div className="border rounded-xl p-6 bg-gray-50 mb-4">
                <p><strong>Waste Type:</strong> {form.wasteType}</p>
                {form.category && <p><strong>Category:</strong> {form.category}</p>}
                {form.brand && <p><strong>Brand:</strong> {form.brand}</p>}
                {form.model && <p><strong>Model:</strong> {form.model}</p>}
                <p><strong>Quantity:</strong> {form.quantity}</p>
                {form.description && <p><strong>Description:</strong> {form.description}</p>}
                <p><strong>Number of images:</strong> {form.images.length}</p>
                <p><strong>Condition Details:</strong> {JSON.stringify(form.conditionDetails)}</p>
              </div>
              <div className="flex gap-3 mb-4">
                <motion.button
                  whileHover={{ scale: 1.04, backgroundColor: "#bbf7d0" }}
                  whileTap={{ scale: 0.99 }}
                  onClick={saveCurrentProduct}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                  type="button"
                >
                  {editingIndex >= 0 ? 'Save Changes' : 'Save Product'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04, backgroundColor: "#dbeafe" }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => { saveCurrentProduct(); }}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-semibold"
                  type="button"
                >
                  Save & Add Another
                </motion.button>
              </div>

              {aiResults.length > 0 && (
                <motion.div
                  className="border rounded-lg p-4 bg-green-50"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.08, type: "spring", damping: 16 }}
                >
                  <h4 className="font-semibold mb-2 text-green-700">AI Suggested Prices:</h4>
                  {aiResults.map((p, idx) => (
                    <div key={idx} className="border p-3 mb-3 rounded bg-white">
                      <p><strong>Product {idx + 1}:</strong> {p.wasteType || p.brand} {p.category ? `- ${p.category}` : ''} {p.brand ? `- ${p.brand}` : ''}</p>
                      <p><strong>Quantity:</strong> {p.quantity}</p>
                      {p.aiSuggestedPrice !== undefined && <p><strong>AI Suggested Price:</strong> ₹{p.aiSuggestedPrice}</p>}
                      {p.aiConditionScore !== undefined && <p><strong>Condition Score:</strong> {p.aiConditionScore}</p>}
                      {p.aiConfidence !== undefined && <p><strong>Confidence:</strong> {p.aiConfidence}</p>}
                      {p.aiExplanation && <p><strong>Explanation:</strong> {p.aiExplanation}</p>}
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-10 pt-6 border-t-2 border-gray-100 bg-gradient-to-t from-white via-emerald-50 to-white">
          <motion.button
            whileHover={{ scale: step === 1 ? 1 : 1.04 }}
            whileTap={{ scale: 0.98 }}
            type="button" onClick={prevStep} disabled={step === 1}
            className={`py-3 px-6 rounded-lg font-semibold transition-all duration-200
              ${step === 1 ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-gray-700 bg-green-50 hover:bg-green-100'}`}
          >
            <ArrowLeft size={20} className="inline mr-2" /> Previous
          </motion.button>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: loading || (products.length === 0 && !form.wasteType) ? 1 : 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmitAll}
              disabled={loading || (products.length === 0 && !form.wasteType)}
              className={`py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl'}`}
              type="button"
            >
              {loading ? 'Processing...' : 'Submit All Products'}
            </motion.button>

            <motion.button
              whileHover={{ scale: !isStepValid() || loading ? 1 : 1.04 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={step === 6 ? saveCurrentProduct : nextStep}
              disabled={!isStepValid() || loading}
              className={`py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200
                ${!isStepValid() || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 shadow-xl'}`}
            >
              {step === 6 ? (editingIndex >= 0 ? 'Save' : 'Save & Continue') : 'Next'}
              <ArrowRight size={20} className="inline ml-2" />
            </motion.button>
          </div>
        </div>

        {createdPost && createdPost.products && (
          <motion.div
            id="ai-prices-section"
            className="mt-10 border-t pt-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 130, damping: 15 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-green-700">AI Suggested Prices for This Post</h2>
            {createdPost.products.map((p, idx) => (
              <div key={idx} className="p-4 mb-3 border rounded-lg bg-green-50">
                <p><strong>Product:</strong> {p.brand || p.wasteType} {p.model}</p>
                <p><strong>AI Suggested Price:</strong> ₹{(p.aiSuggestedPrice !== undefined && p.aiSuggestedPrice !== null) ? p.aiSuggestedPrice : 'N/A'}</p>
              </div>
            ))}
            <div className="mt-4 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFindRecyclers}
                className="px-4 py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 transition"
                type="button"
              >
                Find Recyclers in My City
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onBack}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200"
              >
                Cancel & Go Back
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}