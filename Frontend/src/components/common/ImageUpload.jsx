// src/components/common/ImageUpload.jsx
import React from 'react';

export default function ImageUpload({ images, onImagesChange, maxImages = 5 }) {
  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > maxImages) {
      alert(`Maximum of ${maxImages} images allowed.`);
      return;
    }
    const newImages = [...images, ...files];
    onImagesChange(newImages);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="mb-4"
      />
      <div className="flex space-x-4 overflow-x-auto">
        {images.map((image, i) => (
          <div key={i} className="relative">
            <img
              src={typeof image === 'string' ? image : URL.createObjectURL(image)}
              alt={`upload-${i}`}
              className="h-24 w-24 object-cover rounded"
            />
            <button
              onClick={() => removeImage(i)}
              className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 hover:bg-red-700"
              type="button"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}