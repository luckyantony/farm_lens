import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Language } from '../types';

// Add global declaration for webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

// Internal types for SpeechRecognition to avoid conflicts with global types if they exist
interface ISpeechRecognitionResult {
  [index: number]: {
    transcript: string;
  };
}

interface ISpeechRecognitionEvent {
  results: {
    [index: number]: ISpeechRecognitionResult;
  };
}

interface ControlsProps {
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Controls: React.FC<ControlsProps> = ({ notes, setNotes, language, setLanguage }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const speech = new window.webkitSpeechRecognition();
      speech.continuous = false;
      speech.interimResults = false;
      speech.lang = language === Language.SWAHILI ? 'sw-KE' : 'en-US';

      speech.onresult = (event: ISpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setNotes((prev) => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      speech.onerror = () => setIsListening(false);
      speech.onend = () => setIsListening(false);

      setRecognition(speech);
    }
  }, [language, setNotes]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Voice input not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 mb-6">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-semibold text-gray-700 block">Symptoms / Weather Notes</label>
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setLanguage(Language.ENGLISH)}
            className={`px-3 py-1 text-xs rounded-md transition ${language === Language.ENGLISH ? 'bg-white shadow text-green-700 font-bold' : 'text-gray-500'}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage(Language.SWAHILI)}
            className={`px-3 py-1 text-xs rounded-md transition ${language === Language.SWAHILI ? 'bg-white shadow text-green-700 font-bold' : 'text-gray-500'}`}
          >
            Swahili
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={language === Language.SWAHILI ? "Elezea dalili au hali ya hewa..." : "Describe symptoms, weather (e.g. 'Dry season, yellow spots')..."}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none min-h-[80px] text-gray-700 pr-12 resize-none"
        />
        <button
          onClick={toggleListening}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
          title="Voice Input"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Controls;