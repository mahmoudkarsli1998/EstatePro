import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { useSpring, animated, config } from '@react-spring/three';
import { Html } from '@react-three/drei';

const Sector = ({ startAngle, endAngle, color, label, value, radius = 2 }) => {
  const [hovered, setHovered] = useState(false);

  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.arc(0, 0, radius, startAngle, endAngle, false);
    shape.lineTo(0, 0);
    return shape;
  }, [startAngle, endAngle, radius]);

  const { scale, z, extrusion } = useSpring({
    scale: hovered ? 1.1 : 1,
    z: hovered ? 0.5 : 0,
    extrusion: hovered ? 0.8 : 0.5,
    config: config.wobbly,
  });

  // Calculate center for tooltip
  const midAngle = (startAngle + endAngle) / 2;
  const x = Math.cos(midAngle) * (radius / 1.5);
  const y = Math.sin(midAngle) * (radius / 1.5);

  return (
    <animated.group 
      position-z={z} 
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <mesh rotation={[0, 0, 0]}>
        <extrudeGeometry args={[shape, { depth: 0.5, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 5 }]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
      
      {hovered && (
        <Html position={[x, y, 1]} center>
          <div className="bg-black/90 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap border border-white/20 pointer-events-none shadow-lg">
            <div className="font-bold">{label}</div>
            <div className="text-accent">{value}%</div>
          </div>
        </Html>
      )}
    </animated.group>
  );
};

const PieChart3D = ({ data }) => {
  let currentAngle = 0;
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <group rotation={[-Math.PI / 3, 0, 0]}>
      {data.map((item, index) => {
        const angle = (item.value / total) * Math.PI * 2;
        const start = currentAngle;
        currentAngle += angle;
        
        return (
          <Sector
            key={index}
            startAngle={start}
            endAngle={start + angle}
            color={item.color}
            label={item.name}
            value={item.value}
          />
        );
      })}
    </group>
  );
};

export default PieChart3D;
