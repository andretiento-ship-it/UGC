import React, { useState, useRef, useEffect } from 'react';
import { GenerationSettings, ModelType, AspectRatio } from '../types';

interface InputSectionProps {
  onGenerate: (file: File, settings: GenerationSettings) => void;
  isProcessing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isProcessing }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>({
    productName: '',
    productDescription: '',
    modelType: ModelType.ADULT,
    aspectRatio: AspectRatio.PORTRAIT,
    customModelDescription: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Paste handler
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      // Use standard for loop for better compatibility with DataTransferItemList
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleFileSelect(blob);
            break; // Stop after finding the first image
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    // CRITICAL FIX: Guard against undefined/null files or invalid objects
    if (!selectedFile) return;
    
    // Ensure it is actually a Blob/File object to prevent FileReader errors
    if (!(selectedFile instanceof Blob)) {
      console.error("Selected item is not a valid File or Blob object.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setPreview(reader.result as string);
        // Only set file state if read was successful
        setFile(selectedFile);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    } else if (e.dataTransfer.items) {
      // Fallback for some drag types
      const items = e.dataTransfer.items;
      for (let i = 0; i < items.length; i++) {
         if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
            const f = items[i].getAsFile();
            if (f) {
                handleFileSelect(f);
                break;
            }
         }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && settings.productName && settings.productDescription) {
      onGenerate(file, settings);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in-up">
      {/* Left: Image Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-bold text-stone-300 uppercase tracking-widest flex items-center gap-2">
             <span className="w-2 h-8 bg-amber-600 rounded-sm"></span>
             1. The Artifact
           </h2>
           <span className="text-xs text-stone-500 uppercase font-bold bg-stone-800 px-2 py-1 rounded">Paste Supported</span>
        </div>
        
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative w-full aspect-video rounded-xl border-4 border-dashed transition-all duration-300 cursor-pointer overflow-hidden group
            ${preview ? 'border-amber-600/50 bg-stone-900' : 'border-stone-700 hover:border-stone-500 bg-stone-800/50'}
          `}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500 group-hover:text-stone-300">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="font-bold uppercase tracking-wide">Drop Product Here</p>
              <p className="text-sm opacity-60 mt-1">or Click to Upload</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              // CRITICAL FIX: Check if files exist and has length
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            className="hidden"
            accept="image/*"
          />
        </div>
      </div>

      {/* Right: Settings */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-stone-800/40 p-6 rounded-xl border border-stone-700 shadow-inner">
         <div className="flex items-center gap-2 mb-4">
             <span className="w-2 h-8 bg-amber-600 rounded-sm"></span>
             <h2 className="text-xl font-bold text-stone-300 uppercase tracking-widest">2. The Strategy</h2>
         </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Product Name</label>
            <input
              type="text"
              value={settings.productName}
              onChange={(e) => setSettings({ ...settings, productName: e.target.value })}
              className="w-full bg-stone-900 border-2 border-stone-700 rounded-lg p-3 text-stone-200 focus:border-amber-600 focus:outline-none transition-colors placeholder-stone-600"
              placeholder="e.g. Raptor Running Shoes"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Description</label>
            <textarea
              value={settings.productDescription}
              onChange={(e) => setSettings({ ...settings, productDescription: e.target.value })}
              className="w-full bg-stone-900 border-2 border-stone-700 rounded-lg p-3 text-stone-200 focus:border-amber-600 focus:outline-none transition-colors h-24 placeholder-stone-600"
              placeholder="Describe what it is, key features, and the vibe..."
              required
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Model Archetype</label>
             <select 
               value={settings.modelType}
               onChange={(e) => setSettings({...settings, modelType: e.target.value as ModelType})}
               className="w-full bg-stone-900 border-2 border-stone-700 rounded-lg p-3 text-stone-200 focus:border-amber-600 focus:outline-none appearance-none"
             >
                {Object.values(ModelType).map(t => <option key={t} value={t}>{t}</option>)}
             </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Aspect Ratio</label>
             <div className="grid grid-cols-3 gap-2">
                {Object.values(AspectRatio).map(ratio => (
                  <button
                    type="button"
                    key={ratio}
                    onClick={() => setSettings({...settings, aspectRatio: ratio})}
                    className={`
                      text-xs font-bold py-3 rounded-lg border-2 transition-all
                      ${settings.aspectRatio === ratio 
                        ? 'bg-amber-700 border-amber-500 text-white' 
                        : 'bg-stone-900 border-stone-700 text-stone-500 hover:border-stone-500'}
                    `}
                  >
                    {ratio}
                  </button>
                ))}
             </div>
          </div>

          {settings.modelType === ModelType.CUSTOM && (
            <div className="md:col-span-2 animate-fade-in">
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Custom Model Details</label>
              <input
                type="text"
                value={settings.customModelDescription || ''}
                onChange={(e) => setSettings({ ...settings, customModelDescription: e.target.value })}
                className="w-full bg-stone-900 border-2 border-stone-700 rounded-lg p-3 text-stone-200 focus:border-amber-600 focus:outline-none"
                placeholder="e.g. A senior mechanic with a rugged beard..."
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isProcessing || !file}
          className={`
            w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest shadow-lg transform transition-all active:scale-95
            ${isProcessing || !file 
              ? 'bg-stone-800 text-stone-600 cursor-not-allowed' 
              : 'bg-amber-600 hover:bg-amber-500 text-stone-900 shadow-amber-900/20 hover:shadow-amber-900/40'}
          `}
        >
          {isProcessing ? 'Excavating Fossils...' : 'Generate 9 Assets'}
        </button>
      </form>
    </div>
  );
};

export default InputSection;