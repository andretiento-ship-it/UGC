import React, { useState, useRef, useEffect } from 'react';
import { Copywriting, VOICES, VoiceOption } from '../types';
import { generateSpeech } from '../services/geminiService';

interface CopywritingSectionProps {
  copywriting: Copywriting;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const CopywritingSection: React.FC<CopywritingSectionProps> = ({ copywriting, onRegenerate, isRegenerating }) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICES[0]);
  const [speed, setSpeed] = useState(1.0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  // Local editable state
  const [hook, setHook] = useState(copywriting.hook);
  const [intro, setIntro] = useState(copywriting.intro);
  const [cta, setCta] = useState(copywriting.cta);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync state when props change (e.g. after regeneration)
  useEffect(() => {
    setHook(copywriting.hook);
    setIntro(copywriting.intro);
    setCta(copywriting.cta);
    // Reset audio if text changes from source
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [copywriting]);

  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    // Construct full text from current edits
    const currentFullText = `${hook}\n\n${intro}\n\n${cta}`;
    
    try {
      const audioBlob = await generateSpeech(currentFullText, selectedVoice.name, speed);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Auto play
      setTimeout(() => {
          if(audioRef.current) audioRef.current.play();
      }, 100);

    } catch (e) {
      console.error("Failed to generate audio", e);
      alert("Could not generate audio. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="mt-16 bg-stone-800/60 rounded-xl border border-stone-700 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-stone-700 flex items-center justify-between gap-3">
         <div className="flex items-center gap-3">
            <span className="text-3xl">📜</span>
            <h2 className="text-2xl font-bold text-stone-200 uppercase tracking-widest">Stone Tablet Strategy</h2>
         </div>
         <button 
           onClick={onRegenerate}
           disabled={isRegenerating}
           className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs font-bold uppercase rounded-lg transition-colors border border-stone-600 flex items-center gap-2"
         >
            {isRegenerating ? (
              <span className="w-4 h-4 border-2 border-stone-400 border-t-amber-500 rounded-full animate-spin"></span>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            )}
            Regenerate Script
         </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2">
        {/* Editable Text Content */}
        <div className="p-8 space-y-6 border-b xl:border-b-0 xl:border-r border-stone-700">
           <div className="space-y-2 group">
             <div className="flex justify-between">
                <span className="text-amber-600 font-bold uppercase tracking-wider text-xs">The Problem (Hook)</span>
                <span className="text-stone-600 text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Editable</span>
             </div>
             <textarea 
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                className="w-full bg-stone-900/50 text-stone-300 font-serif text-lg leading-relaxed border border-stone-700 rounded-lg p-3 focus:border-amber-600 focus:outline-none transition-colors min-h-[100px] resize-y"
             />
           </div>
           
           <div className="space-y-2 group">
             <div className="flex justify-between">
                <span className="text-amber-600 font-bold uppercase tracking-wider text-xs">The Solution (Intro)</span>
                <span className="text-stone-600 text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Editable</span>
             </div>
             <textarea 
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                className="w-full bg-stone-900/50 text-stone-300 font-serif text-lg leading-relaxed border border-stone-700 rounded-lg p-3 focus:border-amber-600 focus:outline-none transition-colors min-h-[100px] resize-y"
             />
           </div>
           
           <div className="space-y-2 group">
             <div className="flex justify-between">
                <span className="text-amber-600 font-bold uppercase tracking-wider text-xs">The Action (CTA)</span>
                <span className="text-stone-600 text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Editable</span>
             </div>
             <textarea 
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full bg-stone-900/50 text-stone-300 font-serif text-lg leading-relaxed border border-stone-700 rounded-lg p-3 focus:border-amber-600 focus:outline-none transition-colors min-h-[80px] resize-y"
             />
           </div>
        </div>

        {/* Audio Controls */}
        <div className="p-8 flex flex-col justify-between bg-stone-900/40">
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <label className="text-stone-500 font-bold uppercase text-xs">Select Voice Persona</label>
                 <span className="text-amber-600 text-xs font-bold">{selectedVoice.label}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3">
                 {VOICES.map((voice, idx) => (
                   <button
                     key={idx}
                     onClick={() => setSelectedVoice(voice)}
                     className={`
                       flex flex-col items-start p-2.5 rounded-lg border transition-all text-left
                       ${selectedVoice === voice 
                         ? 'border-amber-600 bg-amber-900/20 text-white shadow-[0_0_10px_rgba(217,119,6,0.3)]' 
                         : 'border-stone-700 bg-stone-800 text-stone-500 hover:border-stone-500 hover:bg-stone-700'}
                     `}
                   >
                     <span className="font-bold text-xs mb-0.5">{voice.label}</span>
                     <span className="text-[10px] uppercase opacity-70 leading-tight">{voice.gender} • {voice.style}</span>
                   </button>
                 ))}
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between">
                    <label className="text-stone-500 font-bold uppercase text-xs">Tempo Bicara</label>
                    <span className="text-stone-300 font-mono text-xs">{speed}x</span>
                 </div>
                 <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                 />
                 <div className="flex justify-between text-[10px] text-stone-600 font-bold uppercase">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                 </div>
              </div>
           </div>

           <div className="pt-6 border-t border-stone-700 mt-6">
             {!audioUrl ? (
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                  className={`
                    w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3
                    ${isGeneratingAudio 
                      ? 'bg-stone-800 text-stone-600 border border-stone-700' 
                      : 'bg-stone-200 text-stone-900 hover:bg-white border border-white hover:shadow-lg'}
                  `}
                >
                  {isGeneratingAudio ? (
                    <span className="animate-pulse">Synthesizing Voice...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                      Generate Audio
                    </>
                  )}
                </button>
             ) : (
               <div className="space-y-4 animate-fade-in">
                  <div className="bg-stone-950 p-2 rounded-lg border border-stone-800">
                      <audio 
                        ref={audioRef}
                        controls 
                        src={audioUrl} 
                        className="w-full h-8"
                      />
                  </div>
                  <div className="flex gap-4">
                     <button
                       onClick={handleGenerateAudio}
                       className="flex-1 py-3 text-xs font-bold uppercase text-stone-400 hover:text-stone-200 border border-stone-700 rounded-lg hover:border-stone-500 hover:bg-stone-800 transition-colors"
                     >
                       Regenerate Voice
                     </button>
                     <a
                       href={audioUrl}
                       download={`ugc-voiceover-${selectedVoice.label.replace(/\s+/g, '-').toLowerCase()}.mp3`}
                       className="flex-1 py-3 text-xs font-bold uppercase text-center text-amber-500 hover:text-amber-400 border border-amber-900/50 rounded-lg hover:border-amber-700 bg-amber-900/10 hover:bg-amber-900/20 transition-colors"
                     >
                       Download MP3
                     </a>
                  </div>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CopywritingSection;