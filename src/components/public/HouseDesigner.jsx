import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Float, Stars, Sky } from '@react-three/drei';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Cloud, Layout, Box as BoxIcon } from 'lucide-react';

const HouseModel = ({ floors, color, hasRoofGarden, hasPool, style }) => {
  const floorHeight = style === 'industrial' ? 1.5 : 1.2;
  
  return (
    <group>
      {/* Base / Ground Floor */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 1, 4]} />
        <meshStandardMaterial color={style === 'industrial' ? '#555' : '#333'} />
      </mesh>
      
      {/* Entrance */}
      <mesh position={[0, 0.5, 2.1]}>
        <boxGeometry args={[1, 0.8, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Dynamic Floors */}
      {Array.from({ length: floors }).map((_, i) => (
        <group key={i} position={[0, 1.5 + i * floorHeight, 0]}>
          {/* Main Floor Body */}
          <mesh>
            {style === 'modern' && <boxGeometry args={[3.5, floorHeight, 3.5]} />}
            {style === 'classic' && <cylinderGeometry args={[2, 2, floorHeight, 32]} />}
            {style === 'industrial' && <boxGeometry args={[3.2, floorHeight, 3.2]} />}
            <meshStandardMaterial 
              color={color} 
              roughness={style === 'industrial' ? 0.7 : 0.2} 
              metalness={style === 'modern' ? 0.5 : 0.1} 
            />
          </mesh>
          
          {/* Windows/Details based on style */}
          {style === 'modern' && (
            <mesh position={[0, 0, 1.76]}>
              <planeGeometry args={[2, floorHeight * 0.8]} />
              <meshStandardMaterial color="#88ccff" metalness={0.9} roughness={0.0} emissive="#001133" />
            </mesh>
          )}
          
          {style === 'classic' && (
             <group>
                {[0, 90, 180, 270].map((rot) => (
                  <mesh key={rot} rotation={[0, (rot * Math.PI) / 180, 0]} position={[0, 0, 1.9]}>
                    <boxGeometry args={[0.8, floorHeight * 0.6, 0.1]} />
                    <meshStandardMaterial color="#222" />
                  </mesh>
                ))}
             </group>
          )}

          {style === 'industrial' && (
             <group>
                <mesh position={[1.61, 0, 0]}>
                  <boxGeometry args={[0.1, floorHeight, 0.1]} />
                  <meshStandardMaterial color="#333" />
                </mesh>
                <mesh position={[-1.61, 0, 0]}>
                  <boxGeometry args={[0.1, floorHeight, 0.1]} />
                  <meshStandardMaterial color="#333" />
                </mesh>
                 <mesh position={[0, 0, 1.61]}>
                  <planeGeometry args={[2.5, floorHeight * 0.8]} />
                  <meshStandardMaterial color="#88ccff" opacity={0.4} transparent />
                </mesh>
             </group>
          )}
        </group>
      ))}

      {/* Roof */}
      <group position={[0, 1.5 + floors * floorHeight, 0]}>
        {style === 'modern' && (
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[3.7, 0.2, 3.7]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        )}
        {style === 'classic' && (
           <mesh position={[0, 0.5, 0]}>
            <coneGeometry args={[2.5, 1.5, 32]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        )}
        {style === 'industrial' && (
           <group>
             <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[3.4, 0.2, 3.4]} />
              <meshStandardMaterial color="#444" />
            </mesh>
             {/* Vents */}
             <mesh position={[0.5, 0.5, 0.5]}>
               <cylinderGeometry args={[0.2, 0.2, 0.8]} />
               <meshStandardMaterial color="#666" />
             </mesh>
           </group>
        )}
        
        {hasRoofGarden && style !== 'classic' && (
          <group position={[0, 0.5, 0]}>
             {/* Plants */}
             <mesh position={[1, 0, 1]}>
               <coneGeometry args={[0.3, 0.8, 8]} />
               <meshStandardMaterial color="#4ade80" />
             </mesh>
             <mesh position={[-1, 0, -1]}>
               <coneGeometry args={[0.4, 0.9, 8]} />
               <meshStandardMaterial color="#22c55e" />
             </mesh>
             <mesh position={[1, 0, -1]}>
               <coneGeometry args={[0.3, 0.7, 8]} />
               <meshStandardMaterial color="#4ade80" />
             </mesh>
          </group>
        )}
      </group>

      {/* Pool Addon */}
      {hasPool && (
        <group position={[3.5, 0.1, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[2.5, 3, 0.2]} />
            <meshStandardMaterial color="#ccc" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
            <planeGeometry args={[2, 2.5]} />
            <meshStandardMaterial color="#00F0FF" transparent opacity={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
};

const HouseDesigner = () => {
  const [floors, setFloors] = useState(1);
  const [color, setColor] = useState('#ffffff');
  const [hasRoofGarden, setHasRoofGarden] = useState(false);
  const [hasPool, setHasPool] = useState(false);
  const [style, setStyle] = useState('modern'); // modern, classic, industrial
  const [view, setView] = useState('day'); // day, night, sunset

  const colors = ['#ffffff', '#f5f5f5', '#3b82f6', '#10b981', '#f43f5e', '#1e293b', '#fbbf24'];

  const getBgColor = () => {
    if (view === 'night') return '#050510';
    if (view === 'sunset') return '#4a1d2c';
    return '#87CEEB'; // Sky blue for day
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
      {/* Controls */}
      <div className="glass-panel p-6 space-y-6 h-full overflow-y-auto custom-scrollbar">
        {/* Style Selector */}
        <div>
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Layout size={18} className="text-primary" /> Building Style
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {['modern', 'classic', 'industrial'].map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`py-2 px-1 rounded-lg text-xs font-bold capitalize transition-all ${style === s ? 'bg-primary text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* View Selector */}
        <div>
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Sun size={18} className="text-primary" /> Environment
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setView('day')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${view === 'day' ? 'bg-blue-400 text-white' : 'bg-white/5 text-gray-400'}`}
            >
              <Sun size={16} /> Day
            </button>
            <button 
              onClick={() => setView('sunset')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${view === 'sunset' ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400'}`}
            >
              <Cloud size={16} /> Sunset
            </button>
            <button 
              onClick={() => setView('night')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${view === 'night' ? 'bg-indigo-900 text-white' : 'bg-white/5 text-gray-400'}`}
            >
              <Moon size={16} /> Night
            </button>
          </div>
        </div>

        <div className="h-px bg-white/10 my-4"></div>

        <div>
          <h3 className="text-white font-bold mb-4">Floors</h3>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setFloors(Math.max(1, floors - 1))}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-bold text-primary">{floors}</span>
            <button 
              onClick={() => setFloors(Math.min(5, floors + 1))}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">Facade Color</h3>
          <div className="flex gap-3 flex-wrap">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">Add-ons</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${hasRoofGarden ? 'bg-primary border-primary' : 'border-gray-500'}`}>
                {hasRoofGarden && <span className="text-black text-xs">✓</span>}
              </div>
              <input type="checkbox" className="hidden" checked={hasRoofGarden} onChange={() => setHasRoofGarden(!hasRoofGarden)} />
              <span className="text-gray-300 group-hover:text-white transition-colors">Roof Garden</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${hasPool ? 'bg-primary border-primary' : 'border-gray-500'}`}>
                {hasPool && <span className="text-black text-xs">✓</span>}
              </div>
              <input type="checkbox" className="hidden" checked={hasPool} onChange={() => setHasPool(!hasPool)} />
              <span className="text-gray-300 group-hover:text-white transition-colors">Swimming Pool</span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Estimated Cost</span>
            <span className="text-2xl font-bold text-white">
              ${(200000 + floors * 50000 + (hasRoofGarden ? 15000 : 0) + (hasPool ? 25000 : 0)).toLocaleString()}
            </span>
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-lg text-white font-bold shadow-lg hover:shadow-primary/50 transition-all">
            Save Design
          </button>
        </div>
      </div>

      {/* 3D View */}
      <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden relative transition-colors duration-1000" style={{ backgroundColor: getBgColor() }}>
        <Canvas shadows camera={{ position: [6, 6, 6], fov: 45 }}>
          {view === 'day' && <Sky sunPosition={[100, 20, 100]} />}
          {view === 'sunset' && <Sky sunPosition={[100, 2, 100]} mieCoefficient={0.005} mieDirectionalG={0.7} Rayleigh={3} turbidity={10} />}
          {view === 'night' && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
          
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
          
          <ambientLight intensity={view === 'night' ? 0.2 : 0.6} />
          <pointLight position={[10, 10, 10]} intensity={view === 'night' ? 0.5 : 1} castShadow />
          {view === 'night' && <pointLight position={[-5, 5, -5]} intensity={0.5} color="#7000FF" />}
          
          <Stage environment={view === 'night' ? 'night' : 'city'} intensity={view === 'night' ? 0.2 : 0.5} adjustCamera={false}>
            <HouseModel floors={floors} color={color} hasRoofGarden={hasRoofGarden} hasPool={hasPool} style={style} />
          </Stage>
        </Canvas>
        
        <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
           <div className="bg-black/50 backdrop-blur px-3 py-1 rounded text-xs text-white">
             Style: <span className="text-primary capitalize">{style}</span>
           </div>
           <div className="bg-black/50 backdrop-blur px-3 py-1 rounded text-xs text-white">
             View: <span className="text-primary capitalize">{view}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HouseDesigner;
