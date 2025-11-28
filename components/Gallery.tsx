import React from 'react';
import { GeneratedAsset, AspectRatio } from '../types';

interface GalleryProps {
  assets: GeneratedAsset[];
  aspectRatio: AspectRatio;
  modelDescription?: string;
}

const Gallery: React.FC<GalleryProps> = ({ assets, aspectRatio, modelDescription }) => {
  if (assets.length === 0) return null;

  // Determine container aspect ratio class
  const getAspectClass = (ratio: AspectRatio) => {
    switch (ratio) {
      case AspectRatio.SQUARE: return 'aspect-square';
      case AspectRatio.LANDSCAPE: return 'aspect-video';
      case AspectRatio.PORTRAIT: return 'aspect-[9/16]';
      default: return 'aspect-[9/16]';
    }
  };

  return (
    <div className="mt-16 animate-fade-in">
      <div className="flex items-center gap-4 mb-8 border-b border-stone-800 pb-4">
        <span className="w-2 h-8 bg-amber-600 rounded-sm"></span>
        <div>
          <h2 className="text-2xl font-bold text-stone-200 uppercase tracking-widest">Excavation Results</h2>
          <p className="text-sm text-stone-500 font-mono mt-1 max-w-2xl truncate">
             Model DNA: {modelDescription || 'Analyzing...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assets.map((asset) => (
          <div 
            key={asset.id} 
            className="group relative bg-stone-800 rounded-xl overflow-hidden border-2 border-stone-700 hover:border-amber-600/50 transition-colors shadow-xl"
          >
            {/* Header/Badge */}
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start">
              <span className="bg-stone-900/90 text-amber-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-stone-700">
                #{asset.id} {asset.scenarioTitle}
              </span>
              {asset.status === 'completed' && (
                <a 
                  href={asset.imageUrl || '#'} 
                  download={`ugc-asset-${asset.id}.png`}
                  className="bg-stone-900/90 hover:bg-amber-600 text-stone-300 hover:text-white p-1.5 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </a>
              )}
            </div>

            {/* Image Container */}
            <div className={`w-full ${getAspectClass(aspectRatio)} bg-stone-900 relative`}>
              {asset.imageUrl ? (
                <img 
                  src={asset.imageUrl} 
                  alt={asset.scenarioTitle} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  {asset.status === 'failed' ? (
                     <div className="text-red-500">
                       <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       <span className="text-xs uppercase font-bold">Fossil Destroyed</span>
                     </div>
                  ) : (
                    <div className="space-y-3">
                       <div className="w-8 h-8 border-4 border-stone-700 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
                       <p className="text-xs text-stone-500 uppercase tracking-widest font-bold animate-pulse">
                         {asset.status === 'generating' ? 'Carving Stone...' : 'Queued'}
                       </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-stone-700">
               <div 
                 className={`h-full bg-amber-600 transition-all duration-300 ${asset.status === 'completed' ? 'w-full' : asset.status === 'generating' ? 'w-1/2 animate-pulse' : 'w-0'}`} 
               />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;