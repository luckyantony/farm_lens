import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Download, AlertTriangle, CheckCircle, Droplet, Sun, Sprout, BarChart3 } from 'lucide-react';
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
        ${language === Language.ENGLISH ? 'Recommended remedies:' : 'Matibabu yaliyopendekezwa:'} ${result.remedies.join('. ')}. 
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

EXPLANATION:
${result.explanation}

REMEDIES (Eco-Friendly):
${result.remedies.map(r => `- ${r}`).join('\n')}

PREVENTION:
${result.prevention.map(p => `- ${p}`).join('\n')}

FORECAST:
${result.forecast}

IMPACT (SDG 2):
${result.impactStats}

DISCLAIMER:
${result.disclaimer}
    `;
    
    downloadTextFile(textContent, `FarmLens_Report_${Date.now()}.txt`);
  };

  if (!result.isValidPlant) {
    return (
      <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 text-center">
        <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-orange-800 mb-2">Not a Plant Detected</h3>
        <p className="text-orange-700">Please upload a clear photo of a crop or plant to get an analysis.</p>
      </div>
    );
  }

  if (result.isBlurry) {
    return (
      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-center">
        <Sun className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-yellow-800 mb-2">Image Too Blurry</h3>
        <p className="text-yellow-700">The image is not clear enough for an accurate diagnosis. Please try getting closer and steadying your camera.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-green-600 p-4 text-white flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {result.issue === 'Healthy Plant' ? <CheckCircle className="text-green-200" /> : <AlertTriangle className="text-yellow-300" />}
            {result.issue}
          </h2>
          <p className="text-green-100 text-sm mt-1 opacity-90">AI Diagnosis by FarmLens</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleNarrate}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
            title="Narrate Results"
          >
            {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button 
            onClick={handleExport}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
            title="Export Report"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Explanation */}
        <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Explanation</h3>
          <p className="text-gray-800 leading-relaxed">{result.explanation}</p>
        </section>

        {/* Remedies */}
        <section className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Droplet size={16} /> Eco-Friendly Remedies
          </h3>
          <ul className="space-y-2">
            {result.remedies.map((remedy, idx) => (
              <li key={idx} className="flex gap-2 text-green-900 text-sm">
                <span className="font-bold">•</span>
                {remedy}
              </li>
            ))}
          </ul>
        </section>

        {/* Forecast */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Sprout size={16} /> Prevention
                </h3>
                <ul className="space-y-1">
                    {result.prevention.map((item, idx) => (
                        <li key={idx} className="text-blue-900 text-sm text-xs">• {item}</li>
                    ))}
                </ul>
            </section>

            <section className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <BarChart3 size={16} /> Forecast
                </h3>
                <p className="text-purple-900 text-sm">{result.forecast}</p>
            </section>
        </div>

        {/* Impact */}
        <section className="border-t pt-4">
             <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded">{result.impactStats}</p>
        </section>

        {/* Disclaimer */}
        <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest mt-4">
            {result.disclaimer}
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;