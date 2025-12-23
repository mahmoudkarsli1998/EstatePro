import React from 'react';
import { ENABLE_3D } from '../../config/performance';

const MaadiScene = () => {
  if (!ENABLE_3D) {
    return (
        <div className="w-full h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-80 z-0"></div>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
             <div className="w-20 h-20 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm animate-pulse">
                <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/10"></div>
             </div>
          </div>
        </div>
    );
  }
  return <div>3D Map</div>; 
};

export default MaadiScene;
