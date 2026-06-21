import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div id="loader-container" className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <div id="loader-spinner" className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-amber-500/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-amber-400 border-r-amber-400 rounded-full animate-spin"></div>
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-amber-600/10 rounded-full"></div>
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-b-yellow-300 border-l-yellow-300 rounded-full animate-spin [animation-duration:1s]"></div>
      </div>
      <p id="loader-text" className="mt-4 font-serif text-amber-400/80 tracking-wide text-sm animate-pulse">
        GOLDEN ARENA LOGGING IN...
      </p>
    </div>
  );
};
