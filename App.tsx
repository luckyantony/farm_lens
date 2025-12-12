import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Controls from './components/Controls';
import ResultsDisplay from './components/ResultsDisplay';
import { analyzePlantImage } from './services/gemini';
import { AnalysisResult, AppState, Language } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [image, setImage] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = {
    [Language.ENGLISH]: {
      title: "Diagnose Your Crops",
      subtitle: "Upload a photo, record voice notes about symptoms, and get instant eco-friendly advice using Gemini 3 Pro.",
      analyzeBtn: "Analyze Plant Health",
      analyzing: "Analyzing with Gemini 3 Pro...",
      fusing: "Fusing Vision & Voice Data...",
      error: "Failed to analyze image. Please check your internet connection and try again.",
      analyzeAnother: "Analyze Another Plant"
    },
    [Language.SWAHILI]: {
      title: "Chunguza Mazao Yako",
      subtitle: "Pakia picha, rekodi maelezo ya sauti, na upate ushauri wa kirafiki wa mazingira ukitumia Gemini 3 Pro.",
      analyzeBtn: "Chambua Afya ya Mmea",
      analyzing: "Inachambua na Gemini 3 Pro...",
      fusing: "Inaunganisha Data ya Picha na Sauti...",
      error: "Imeshindwa kuchambua picha. Tafadhali angalia mtandao wako na jaribu tena.",
      analyzeAnother: "Chambua Mmea Mwingine"
    }
  }[language];

  const handleImageSelected = (base64: string) => {
    setImage(base64);
    setAppState(AppState.IDLE);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      const analysis = await analyzePlantImage(image, notes, language);
      setResult(analysis);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setError(t.error);
      setAppState(AppState.ERROR);
    }
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setAppState(AppState.IDLE);
    setNotes("");
  };

  return (
    <div className="min-h-screen pb-12 bg-green-50/50">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="max-w-2xl mx-auto px-4 mt-8">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3 tracking-tight">{t.title}</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {t.subtitle}
            </p>
        </div>

        <ImageUploader 
            onImageSelected={handleImageSelected} 
            onClear={handleClear}
            setNotes={setNotes}
            language={language}
        />

        {image && appState !== AppState.SUCCESS && (
          <div className="animate-fade-in-up">
            <Controls 
              notes={notes} 
              setNotes={setNotes} 
              language={language}
            />
            
            <button
              onClick={handleAnalyze}
              disabled={appState === AppState.ANALYZING}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition transform active:scale-[0.99] flex items-center justify-center gap-3
                ${appState === AppState.ANALYZING 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-green-200'
                }`}
            >
              {appState === AppState.ANALYZING ? (
                <>
                  <Loader2 className="animate-spin" />
                  <div className="flex flex-col items-start text-sm">
                    <span>{t.analyzing}</span>
                    <span className="text-xs font-normal opacity-80">{t.fusing}</span>
                  </div>
                </>
              ) : (
                t.analyzeBtn
              )}
            </button>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center">
            {error}
          </div>
        )}

        {appState === AppState.SUCCESS && result && (
           <div className="mt-8 animate-fade-in">
             <ResultsDisplay result={result} language={language} />
             <div className="mt-8 text-center">
                <button 
                  onClick={handleClear}
                  className="text-green-600 font-semibold hover:underline hover:text-green-700 transition"
                >
                  {t.analyzeAnother}
                </button>
             </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
