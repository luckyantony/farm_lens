import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Download, AlertTriangle, CheckCircle, Droplet, Sun, Sprout, BarChart3, Info } from 'lucide-react';
import { AnalysisResult, Language } from '../types';
import { generateAudio } from '../services/gemini';
import { downloadTextFile } from '../services/utils';

interface ResultsDisplayProps {
  result: AnalysisResult;
  language: Language;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, language }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const t = {
    [Language.ENGLISH]: {
      diagnosis: "AI Diagnosis by FarmLens",
      explanation: "Diagnosis Explanation",
      remedies: "Eco-Friendly Remedies",
      maintenance: "Maintenance Tips",
      prevention: "Prevention",
      forecast: "Growth Forecast",
      impactContext: "Global Impact Context (FAO)",
      impactQuote: "\"Pests & diseases cause $220–300 billion in annual global crop losses.\"",
      disclaimer: "DISCLAIMER: AI-generated insights for informational purposes only. Not a substitute for professional agricultural advice. Consult local experts.",
      notPlant: "Not a Plant Detected",
      notPlantMsg: "Please upload a clear photo of a crop or plant to get an analysis.",
      blurry: "Image Too Blurry",
      blurryMsg: "The image is not clear enough for an accurate diagnosis. Please try getting closer and steadying your camera.",
      narrate: "Narrate Results",
      export: "Export Report"
    },
    [Language.SWAHILI]: {
      diagnosis: "Uchunguzi wa AI na FarmLens",
      explanation: "Ufafanuzi wa Uchunguzi",
      remedies: "Tiba Rafiki wa Mazingira",
      maintenance: "Vidokezo vya Utunzaji",
      prevention: "Kinga",
      forecast: "Utabiri wa Ukuaji",
      impactContext: "Muktadha wa Athari za Kimataifa (FAO)",
      impactQuote: "\"Wadudu na magonjwa husababisha upotevu wa mazao wa $220–300 bilioni kila mwaka duniani.\"",
      disclaimer: "KANUSHO: Maoni yanayotolewa na AI ni kwa madhumuni ya habari pekee. Sio badala ya ushauri wa kitaalamu wa kilimo. Wasiliana na wataalamu wa eneo lako.",
      notPlant: "Mmea Haujatambuliwa",
      notPlantMsg: "Tafadhali pakia picha wazi ya zao au mmea ili kupata uchambuzi.",
      blurry: "Picha Haiako Wazi",
      blurryMsg: "Picha haiko wazi kutosha kwa uchunguzi sahihi. Tafadhali jaribu kusogea karibu na utulie.",
      narrate: "Soma Matokeo",
      export: "Pakua Ripoti"
    }
  }[language];

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const handleNarrate = async () => {
    if (isPlaying) {
      if (sourceRef.current) sourceRef.current.stop();
      setIsPlaying(false);
      return;
    }

    try {
      const summary = `
        ${language === Language.ENGLISH ? 'Analysis for' : 'Uchambuzi wa'} ${result.issue}. 
        ${result.explanation}. 
        ${language === Language.ENGLISH ? 'Recommended actions:' : 'Hatua zilizopendekezwa:'} ${result.remedies.join('. ')}. 
        ${result.forecast}
      `;

      // Use Gemini TTS
      const audioBuffer = await generateAudio(summary, language);
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      
      const buffer = await ctx.decodeAudioData(audioBuffer);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      source.onended = () => setIsPlaying(false);
      
      sourceRef.current = source;
      source.start(0);
      setIsPlaying(true);

    } catch (e) {
      console.error("Audio generation error", e);
      // Fallback to browser speech synthesis
      const utterance = new SpeechSynthesisUtterance(
         `Analysis: ${result.issue}. ${result.explanation}`
      );
      window.speechSynthesis.speak(utterance);
      utterance.onend = () => setIsPlaying(false);
      setIsPlaying(true);
    }
  };

  const handleExport = () => {
    const textContent = `
FARMLENS REPORT
Date: ${new Date().toLocaleDateString()}
Language: ${language}

ISSUE: ${result.issue}

${t.explanation.toUpperCase()}:
${result.explanation}

${t.remedies.toUpperCase()}:
${result.remedies.map(r => `- ${r}`).join('\n')}

${t.prevention.toUpperCase()}:
${result.prevention.map(p => `- ${p}`).join('\n')}

${t.forecast.toUpperCase()}:
${result.forecast}

IMPACT (SDG 2):
${result.impactStats}

${t.disclaimer}
    `;
    
    downloadTextFile(textContent, `FarmLens_Report_${Date.now()}.txt`);
  };

  if (!result.isValidPlant) {
    return (
      <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 text-center animate-fade-in">
        <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-orange-800 mb-2">{t.notPlant}</h3>
        <p className="text-orange-700">{t.notPlantMsg}</p>
      </div>
    );
  }

  if (result.isBlurry) {
    return (
      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-center animate-fade-in">
        <Sun className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-yellow-800 mb-2">{t.blurry}</h3>
        <p className="text-yellow-700">{t.blurryMsg}</p>
      </div>
    );
  }

  const isHealthy = result.issue.toLowerCase().includes('healthy');

  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className={`${isHealthy ? 'bg-green-600' : 'bg-amber-600'} p-5 text-white flex justify-between items-start transition-colors`}>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {isHealthy ? <CheckCircle className="text-green-200" /> : <AlertTriangle className="text-amber-200" />}
            {result.issue}
          </h2>
          <p className="text-white/80 text-sm mt-1">{t.diagnosis}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleNarrate}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition backdrop-blur-sm"
            title={t.narrate}
          >
            {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button 
            onClick={handleExport}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition backdrop-blur-sm"
            title={t.export}
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Explanation */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.explanation}</h3>
          <p className="text-gray-800 leading-relaxed text-lg">{result.explanation}</p>
        </section>

        {/* Remedies / Actions */}
        <section className={`${isHealthy ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'} p-5 rounded-xl border`}>
          <h3 className={`text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2 ${isHealthy ? 'text-green-800' : 'text-amber-800'}`}>
            <Droplet size={18} /> 
            {isHealthy ? t.maintenance : t.remedies}
          </h3>
          <ul className="space-y-3">
            {result.remedies.map((remedy, idx) => (
              <li key={idx} className={`flex gap-3 text-sm font-medium ${isHealthy ? 'text-green-900' : 'text-amber-900'}`}>
                <span className={`block w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${isHealthy ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                {remedy}
              </li>
            ))}
          </ul>
        </section>

        {/* Forecast & Prevention Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sprout size={16} /> {t.prevention}
                </h3>
                <ul className="space-y-2">
                    {result.prevention.map((item, idx) => (
                        <li key={idx} className="text-blue-900 text-sm flex gap-2">
                           <span className="text-blue-400">•</span> {item}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BarChart3 size={16} /> {t.forecast}
                </h3>
                <p className="text-purple-900 text-sm font-medium leading-relaxed">{result.forecast}</p>
            </section>
        </div>

        {/* Global Impact Context */}
        <section className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex gap-3">
             <Info className="text-gray-400 flex-shrink-0" size={20} />
             <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t.impactContext}</p>
                <p className="text-sm text-gray-600 italic">{t.impactQuote}</p>
                <p className="text-sm text-gray-800 mt-2 font-medium">{result.impactStats}</p>
             </div>
        </section>

        {/* Legal Disclaimer */}
        <div className="border-t border-gray-100 pt-6 mt-2">
            <p className="text-[10px] text-gray-400 text-center leading-relaxed max-w-lg mx-auto">
                {t.disclaimer}
            </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
