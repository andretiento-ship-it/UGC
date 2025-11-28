import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 prehistoric-bg selection:bg-amber-700 selection:text-white pb-20">
      <header className="sticky top-0 z-50 bg-stone-900/80 backdrop-blur-md border-b-4 border-stone-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-600 rounded-lg rotate-3 flex items-center justify-center border-2 border-stone-400 shadow-[4px_4px_0px_0px_rgba(87,83,78,1)]">
                <span className="text-2xl">🦖</span>
             </div>
             <h1 className="text-2xl font-black text-amber-500 tracking-wider uppercase drop-shadow-md">
                UGC <span className="text-stone-300">Jurassic</span>
             </h1>
          </div>
          <div className="hidden md:block text-stone-400 text-sm font-bold tracking-widest bg-black/30 px-3 py-1 rounded-full border border-stone-700">
            EST. STONE AGE
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

      <footer className="fixed bottom-0 w-full bg-stone-950/90 backdrop-blur border-t border-stone-800 py-2 text-center text-xs text-stone-500 z-40">
        POWERED BY GEMINI 2.5 FLASH & 3 PRO IMAGE
      </footer>
    </div>
  );
};

export default Layout;