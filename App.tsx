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
      setError("Failed to analyze image. Please check your internet connection and try again.");
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
    <div className="min-h-screen pb-12">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 mt-8">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Diagnose Your Crops</h2>
            <p className="text-gray-600">Upload a photo, add voice notes, and get instant eco-friendly advice.</p>
        </div>

        <ImageUploader 
            onImageSelected={handleImageSelected} 
            onClear={handleClear} 
        />

        {image && appState !== AppState.SUCCESS && (
          <div className="animate-fade-in-up">
            <Controls 
              notes={notes} 
              setNotes={setNotes} 
              language={language}
              setLanguage={setLanguage}
            />
            
            <button
              onClick={handleAnalyze}
              disabled={appState === AppState.ANALYZING}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3
                ${appState === AppState.ANALYZING 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-green-200'
                }`}
            >
              {appState === AppState.ANALYZING ? (
                <>
                  <Loader2 className="animate-spin" />
                  Analyzing with Gemini 3 Pro...
                </>
              ) : (
                "Analyze Plant Health"
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
           <div className="mt-8">
             <ResultsDisplay result={result} language={language} />
             <div className="mt-8 text-center">
                <button 
                  onClick={handleClear}
                  className="text-green-600 font-semibold hover:underline"
                >
                  Analyze Another Plant
                </button>
             </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;