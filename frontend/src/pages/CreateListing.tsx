import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import api from '../lib/api';
import getCroppedImg from '../lib/cropImage';

const AUCTION_DURATION_OPTIONS = [
  { value: '1h', label: '1 hour', hours: 1 },
  { value: '3h', label: '3 hours', hours: 3 },
  { value: '12h', label: '12 hours', hours: 12 },
  { value: '1d', label: '1 day', hours: 24 },
  { value: '2d', label: '2 days', hours: 48 },
  { value: '1w', label: '1 week', hours: 168 },
];

export default function CreateListing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    listing_type: '',
    market_type: 'general',
    auction_duration: '1d',
  });
  const [image, setImage] = useState<File | null>(null);
  
  // Cropping state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageBlob) {
        const file = new File([croppedImageBlob], "listing-image.jpg", { type: "image/jpeg" });
        setImage(file);
        setIsCropping(false);
      }
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels]);

  const handleCancelCrop = () => {
    setIsCropping(false);
    setImageSrc(null);
    setImage(null);
    // Reset file input if possible, but React state handles the image value
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert('Image is required');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('listing_type', formData.listing_type);
      data.append('market_type', formData.market_type);
      if (formData.listing_type === 'auction') {
        const selectedDuration = AUCTION_DURATION_OPTIONS.find(
          (option) => option.value === formData.auction_duration,
        );
        const hoursToAdd = selectedDuration ? selectedDuration.hours : 24;
        const expiresAt = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
        data.append('expires_at', expiresAt.toISOString());
      }
      data.append('image', image);

      await api.post('/listings', data);
      navigate('/');
    } catch (err: any) {
      console.error('Error creating listing:', err);
      const message = err.response?.data?.message || err.message || 'Failed to create listing';
      alert(`Failed to create listing: ${message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow py-1 px-4 sm:px-6 lg:px-8 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="min-w-0 text-left">
          <h2 className="text-[26px] font-bold leading-none text-[#C8102E] sm:text-[32px] sm:truncate font-nebraska py-1 mt-1">
            Create Listing
          </h2>
        </div>
      </div>
      <div className="max-w-2xl mx-auto">
      
      {isCropping && imageSrc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg w-full max-w-md">
            <div className="relative h-64 w-full bg-gray-200 mb-4">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="w-1/2 pr-2">
                <label className="block text-xs text-gray-500 mb-1">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleCancelCrop}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={showCroppedImage}
                  className="px-3 py-1 bg-[#C8102E] text-white rounded text-sm hover:bg-[#a00d25]"
                >
                  Crop & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            required
            maxLength={100}
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            required
            rows={3}
            maxLength={2000}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Market Type</label>
          <select
            name="market_type"
            value={formData.market_type}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm"
          >
            <option value="general">Dorm Market</option>
            <option value="university">Husker Gear</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Listing Type</label>
          <select
            name="listing_type"
            value={formData.listing_type}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm"
          >
            <option value="" disabled>Select Listing Type</option>
            <option value="fixed">Fixed Price</option>
            <option value="auction">Auction</option>
          </select>
        </div>

        {formData.listing_type && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {formData.listing_type === 'auction' ? 'Starting Bid' : 'Price'}
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm"
              />
            </div>

            {formData.listing_type === 'auction' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Auction Duration</label>
                <select
                  name="auction_duration"
                  required
                  value={formData.auction_duration}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm"
                >
                  {AUCTION_DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <input
                type="file"
                accept="image/*"
                required={!image} // Only required if no image is set
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#fdf2f4] file:text-[#C8102E]
                  hover:file:bg-[#fce7eb]"
              />
              {image && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">Image selected: {image.name}</p>
                  <button 
                    type="button" 
                    onClick={() => setImage(null)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#C8102E] hover:bg-[#a00d25] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C8102E]"
          >
            Create Listing
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
