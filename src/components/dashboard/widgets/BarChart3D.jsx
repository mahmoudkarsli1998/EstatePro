import React, { useState } from 'react';
import { useSpring, animated, config } from '@react-spring/three';
import { Text, Html, RoundedBox } from '@react-three/drei';

const Bar = ({ position, height, color, label, value }) => {
  const [hovered, setHovered] = useState(false);
  
  const { scaleY } = useSpring({
    scaleY: hovered ? 1.1 : 1,
    config: config.wobbly,
  });

  const { animatedHeight } = useSpring({
    from: { animatedHeight: 0 },
    to: { animatedHeight: height },
    config: { mass: 1, tension: 120, friction: 14 },
    delay: 200,
  });

  return (
    <group position={position}>
      <animated.mesh 
        position-y={animatedHeight.to(h => h / 2)} 
        scale-y={animatedHeight}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.8, 1, 0.8]} />
        <animated.meshStandardMaterial 
             color={hovered ? '#fbbf24' : '#f97316'} 
             emissive={hovered ? '#fbbf24' : '#ea580c'}
             emissiveIntensity={0.5}
             roughness={0.2}
             metalness={0.3}
        />
      </animated.mesh>

      {/* Label */}
      <Text
        position={[0, -0.5, 0.5]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="top"
      >
        {label}
      </Text>

      {/* Value Tooltip */}
      {hovered && (
        <Html position={[0, height + 0.5, 0]} center>
          <div className="bg-black/80 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap border border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] font-bold">
            ${value}
          </div>
        </Html>
      )}
    </group>
  );
};

const BarChart3D = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.value));
  
  return (
    <group>
      {data.map((item, index) => {
        // Normalize height between 0 and 5
        const height = (item.value / maxVal) * 5;
        // Center the chart
        const x = (index - data.length / 2) * 1.2 + 0.6;
        
        return (
          <Bar 
            key={index}
            position={[x, 0, 0]}
            height={height}
            color="#7000FF"
            label={item.name}
            value={item.value}
          />
        );
      })}
    </group>
  );
};

export default BarChart3D;
