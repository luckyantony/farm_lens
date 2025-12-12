import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Mic, MicOff, X } from 'lucide-react';
import { resizeImage } from '../services/utils';
import { Language } from '../types';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  onClear: () => void;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  language: Language;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, onClear, setNotes, language }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    [Language.ENGLISH]: {
      camera: "Camera",
      voice: "Voice Note",
      recording: "Recording...",
      upload: "Upload",
      tap: "Tap to diagnose plant",
      formats: "Supports JPG, PNG • Max 5MB",
      voiceError: "Voice input not supported in this browser. Please use Chrome or Edge."
    },
    [Language.SWAHILI]: {
      camera: "Kamera",
      voice: "Sauti",
      recording: "Inarekodi...",
      upload: "Pakia",
      tap: "Gusa kutambua mmea",
      formats: "Inasaidia JPG, PNG • Upeo 5MB",
      voiceError: "Ingizo la sauti halitumiki katika kivinjari hiki. Tafadhali tumia Chrome au Edge."
    }
  }[language];

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const speech = new window.webkitSpeechRecognition();
      speech.continuous = false;
      speech.interimResults = false;
      speech.lang = language === Language.SWAHILI ? 'sw-KE' : 'en-US';

      speech.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNotes((prev) => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      speech.onerror = () => setIsListening(false);
      speech.onend = () => setIsListening(false);

      setRecognition(speech);
    }
  }, [language, setNotes]);

  const toggleListening = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering file upload
    if (!recognition) {
      alert(t.voiceError);
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech error", err);
        setIsListening(false);
      }
    }
  };

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
        <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-green-100 max-h-96 w-full flex justify-center bg-gray-900 group">
          <img src={preview} alt="Plant preview" className="object-contain h-full w-full max-h-80" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
            <button 
              onClick={handleClear}
              className="bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600 transition transform hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative border-3 border-dashed border-green-300 rounded-2xl p-10 flex flex-col items-center justify-center text-green-700 cursor-pointer hover:bg-green-50/80 hover:border-green-400 transition-all duration-300 min-h-[240px] shadow-sm hover:shadow-md bg-white"
        >
          <div className="flex gap-6 mb-4 items-center z-10">
            <div className="flex flex-col items-center gap-1 group">
                <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-200 transition">
                    <Camera size={32} className="text-green-600" />
                </div>
                <span className="text-xs font-semibold">{t.camera}</span>
            </div>
            
            <div className="w-px h-12 bg-green-200 mx-2"></div>

            <button 
              onClick={toggleListening}
              className={`flex flex-col items-center gap-1 group transition-all duration-300 ${isListening ? 'scale-110' : ''}`}
            >
                <div className={`p-4 rounded-full transition shadow-sm ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                    {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                </div>
                <span className={`text-xs font-semibold ${isListening ? 'text-red-500' : 'text-blue-600'}`}>
                    {isListening ? t.recording : t.voice}
                </span>
            </button>
            
            <div className="w-px h-12 bg-green-200 mx-2"></div>

            <div className="flex flex-col items-center gap-1 group">
                <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-200 transition">
                    <Upload size={32} className="text-green-600" />
                </div>
                 <span className="text-xs font-semibold">{t.upload}</span>
            </div>
          </div>
          
          <p className="font-medium text-lg mt-2">{t.tap}</p>
          <p className="text-sm text-green-500/80 mt-1">{t.formats}</p>
          
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