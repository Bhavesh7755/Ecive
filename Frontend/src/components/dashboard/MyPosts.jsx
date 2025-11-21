// // src/components/dashboard/MyPosts.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, Eye, MessageCircle } from 'lucide-react';
import { postAPI } from '../../services/authService';

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        setError('');
        const data = await postAPI.getMyPosts(); // already returns array now
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'negotiation':
        return 'bg-orange-100 text-orange-700';
      case 'waitingRecycler':
        return 'bg-blue-100 text-blue-700';
      case 'finalized':
        return 'bg-purple-100 text-purple-700';
      case 'collected':
        return 'bg-indigo-100 text-indigo-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateAiTotal = (post) =>
    (post.products || []).reduce(
      (sum, p) => sum + (Number(p.aiSuggestedPrice) || 0),
      0
    );

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading your posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="text-green-600" />
          My Posts
        </h2>
        <p className="text-sm text-gray-500">
          Total posts: <span className="font-semibold">{posts.length}</span>
        </p>
      </div>

      {posts.length === 0 && (
        <div className="bg-white border rounded-xl p-6 text-gray-600">
          You haven&apos;t created any posts yet.
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => {
          const product = (post.products && post.products[0]) || {};
          const title =
            (product.brand || '') +
            (product.model ? ' ' + product.model : '') ||
            product.wasteType ||
            'E-waste item';

          const aiTotal = calculateAiTotal(post);

          return (
            <motion.div
              key={post._id}
              className="bg-white border rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-4 cursor-pointer hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.01 }}
              onClick={() => navigate(`/dashboard/post/${post._id}`)}
            >
              {/* Left icon */}
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-green-50 rounded-lg">
                <Package className="text-green-600" size={26} />
              </div>

              {/* Middle content */}
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {title}
                  </h3>
                  <span
                    className={
                      'text-xs px-2 py-1 rounded-full capitalize ' +
                      getStatusBadgeClasses(post.status)
                    }
                  >
                    {post.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  {product.category || product.wasteType || 'General e-waste'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
                  <div>
                    <span className="text-gray-500">AI Price: </span>
                    <span className="font-semibold text-green-700">
                      {aiTotal > 0 ? `₹${aiTotal.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                  {post.negotiatedPrice && (
                    <div>
                      <span className="text-gray-500">Final Price: </span>
                      <span className="font-semibold text-indigo-700">
                        ₹{Number(post.negotiatedPrice).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-500">
                    <Clock size={14} className="mr-1" />
                    {new Date(post.createdAt).toLocaleString()}
                  </div>
                </div>

                {post.recycler && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected recycler:{' '}
                    <span className="font-medium">
                      {post.recycler.shopName} ({post.recycler.city})
                    </span>
                  </p>
                )}
              </div>

              {/* Right actions */}
              <div className="flex md:flex-col gap-2 items-end md:items-stretch">
                <button
                  className="inline-flex items-center justify-center px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/post/${post._id}`);
                  }}
                >
                  <Eye size={14} className="mr-1" />
                  View Details
                </button>
                <button
                  className="inline-flex items-center justify-center px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/post/${post._id}`);
                  }}
                >
                  <MessageCircle size={14} className="mr-1" />
                  Chat / Negotiate
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}