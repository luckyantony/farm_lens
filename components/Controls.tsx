import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Edit3 } from 'lucide-react';
import { Language } from '../types';

// Add global declaration for webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface ControlsProps {
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  language: Language;
}

const Controls: React.FC<ControlsProps> = ({ notes, setNotes, language }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const t = {
    [Language.ENGLISH]: {
      label: "Symptoms & Weather Notes",
      optional: "Optional",
      placeholder: "Describe symptoms, weather (e.g. 'Yellow spots, dry season')...",
      voiceError: "Voice input not supported in this browser. Please use Chrome or Edge."
    },
    [Language.SWAHILI]: {
      label: "Maelezo ya Dalili na Hali ya Hewa",
      optional: "Hiari",
      placeholder: "Elezea dalili, hali ya hewa (k.m. 'Madoa manjano, jua kali')...",
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

  const toggleListening = () => {
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
      } catch (e) {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100 mb-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Edit3 size={16} className="text-green-600" />
          {t.label}
        </label>
        <span className="text-xs text-gray-400">{t.optional}</span>
      </div>

      <div className="relative">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.placeholder}
          className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none min-h-[100px] text-gray-700 pr-12 resize-none bg-gray-50/50"
        />
        <button
          onClick={toggleListening}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'}`}
          title="Voice Input"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Controls;