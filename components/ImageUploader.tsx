import React, { useRef, useState } from 'react';
import { Camera, Upload, Image as ImageIcon, X } from 'lucide-react';
import { resizeImage } from '../services/utils';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  onClear: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, onClear }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    try {
      const resizedBase64 = await resizeImage(file);
      const displayUrl = URL.createObjectURL(file);
      setPreview(displayUrl);
      onImageSelected(resizedBase64);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try again.");
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClear();
  };

  return (
    <div className="w-full mb-6">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden shadow-md border-2 border-green-100 max-h-96 w-full flex justify-center bg-gray-50">
          <img src={preview} alt="Plant preview" className="object-contain h-full w-full max-h-80" />
          <button 
            onClick={handleClear}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600 transition"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-green-300 rounded-xl p-8 flex flex-col items-center justify-center text-green-600 cursor-pointer hover:bg-green-50 transition min-h-[200px]"
        >
          <div className="flex gap-4 mb-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Camera size={32} />
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Upload size={32} />
            </div>
          </div>
          <p className="font-medium text-lg">Tap to take photo or upload</p>
          <p className="text-sm text-green-500 mt-2">Supports JPG, PNG (Max 5MB)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;