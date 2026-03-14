'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';

// Agent component with glowing chest core
function Agent({ position, coreColor, name, action }) {
  const groupRef = useRef();
  const bobOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  
  useFrame((state) => {
    if (groupRef.current && action?.includes('walking')) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10 + bobOffset) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.6, 0]}>
        <capsuleGeometry args={[0.25, 0.8, 8, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Glowing chest core */}
      <mesh position={[0, 0.7, 0.2]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={coreColor} />
      </mesh>
      <pointLight position={[0, 0.7, 0.2]} color={coreColor} intensity={2} distance={2} />
      {/* Head */}
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.06, 1.38, 0.14]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      <mesh position={[0.06, 1.38, 0.14]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      {/* Name label */}
      {name && (
        <Text position={[0, 1.8, 0]} fontSize={0.15} color="#fff" anchorX="center" anchorY="middle">
          {name}
        </Text>
      )}
      {/* Action bubble */}
      {action && (
        <Float speed={3} rotationIntensity={0} floatIntensity={0.3}>
          <group position={[0.5, 1.6, 0]}>
            <mesh>
              <planeGeometry args={[0.8, 0.25]} />
              <meshBasicMaterial color="#222" transparent opacity={0.9} />
            </mesh>
            <Text position={[0, 0, 0.01]} fontSize={0.08} color="#fff" anchorX="center" anchorY="middle" maxWidth={0.7}>
              {action}
            </Text>
          </group>
        </Float>
      )}
    </group>
  );
}

// Office floor and walls
function Office() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      {/* Grid overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#5a4a3a" wireframe transparent opacity={0.3} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 2, -10]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* Left wall */}
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* Glass partition */}
      <mesh position={[-3, 1.5, -5]} rotation={[0, 0, 0]}>
        <boxGeometry args={[4, 2, 0.05]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

// Desk with monitor
function Desk({ position }) {
  return (
    <group position={position}>
      {/* Desk top */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Desk legs */}
      <mesh position={[-0.5, 0.2, -0.2]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.5, 0.2, -0.2]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.5, 0.2, 0.2]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.5, 0.2, 0.2]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Monitor */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.05]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.7, 0.03]}>
        <planeGeometry args={[0.55, 0.35]} />
        <meshBasicMaterial color="#1a3a5c" />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Chair */}
      <mesh position={[0, 0.25, 0.5]}>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.1, 0.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

// Plant
function Plant({ position }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.15, 0.12, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Plant leaves */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[Math.cos(i * Math.PI * 0.4) * 0.1, 0.4 + i * 0.1, Math.sin(i * Math.PI * 0.4) * 0.1]} rotation={[0.3, i * Math.PI * 0.4, 0.2]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      ))}
    </group>
  );
}

// Gym room
function Gym({ position }) {
  return (
    <group position={position}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Floor markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[5.5, 4.5]} />
        <meshStandardMaterial color="#333" wireframe />
      </mesh>
      {/* Wall */}
      <mesh position={[0, 2, 2.5]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* GYM sign */}
      <mesh position={[0, 3.2, 2.45]}>
        <planeGeometry args={[1.5, 0.4]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <Text position={[0, 3.2, 2.46]} fontSize={0.25} color="#f59e0b" anchorX="center" anchorY="middle">
        GYM
      </Text>
      {/* Bench press */}
      <group position={[-1, 0, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[1.5, 0.15, 0.5]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 0.1, -0.2]}>
          <boxGeometry args={[0.1, 0.2, 0.1]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0, 0.1, 0.2]}>
          <boxGeometry args={[0.1, 0.2, 0.1]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        {/* Barbell */}
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2]} />
          <meshStandardMaterial color="#888" metalness={0.8} />
        </mesh>
        {/* Weights */}
        <mesh position={[-0.5, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05]} />
          <meshStandardMaterial color="#444" metalness={0.9} />
        </mesh>
        <mesh position={[0.5, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05]} />
          <meshStandardMaterial color="#444" metalness={0.9} />
        </mesh>
      </group>
      {/* Dumbbell rack */}
      <group position={[1.5, 0, 1]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.6, 0.6, 0.2]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        {/* Dumbbells */}
        <mesh position={[-0.2, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.2, 8, 8]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <mesh position={[0.2, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.2, 8, 8]} />
          <meshStandardMaterial color="#666" />
        </mesh>
      </group>
      {/* Pull-up bar */}
      <group position={[-1.5, 2.5, 2]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        <mesh position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.1]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.1]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      </group>
      {/* Motivational poster */}
      <mesh position={[2, 2, 2.45]}>
        <planeGeometry args={[0.8, 0.5]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <Text position={[2, 2, 2.46]} fontSize={0.15} color="#f59e0b" anchorX="center" anchorY="middle">
        TRAIN HARD
      </Text>
      {/* Treadmill */}
      <mesh position={[1.5, 0.2, -1]}>
        <boxGeometry args={[0.7, 0.4, 1.2]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

// Training particles
function TrainingParticles({ active, position }) {
  const particlesRef = useRef();
  const particles = useMemo(() => 
    Array.from({ length: 15 }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: Math.random() * 2,
      z: (Math.random() - 0.5) * 2,
      speed: Math.random() * 0.03 + 0.01,
    }))
  , []);

  useFrame(() => {
    if (particlesRef.current && active) {
      particlesRef.current.children.forEach((child, i) => {
        child.position.y += particles[i].speed;
        if (child.position.y > 3) {
          child.position.y = 0;
        }
      });
    }
  });

  if (!active) return null;

  return (
    <group ref={particlesRef} position={position}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// Scene lighting
function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3.5, 0]} intensity={1} color="#ffffff" />
      <pointLight position={[8, 3, -3]} intensity={0.8} color="#f59e0b" />
      <spotLight position={[0, 4, 5]} angle={0.5} penumbra={0.5} intensity={0.5} castShadow />
    </>
  );
}

// Main 3D Scene Component
export default function Scene({ agentPositions, location, training }) {
  return (
    <>
      <Lights />
      <Office />
      <Gym position={[8, 0, -3]} />
      
      {/* Desks */}
      <Desk position={[-3, 0, -2]} />
      <Desk position={[0, 0, -2]} />
      
      {/* Plants */}
      <Plant position={[-6, 0, -5]} />
      <Plant position={[5, 0, -5]} />
      <Plant position={[-6, 0, 3]} />
      
      {/* Agents */}
      <Agent 
        position={agentPositions.a} 
        coreColor="#00ffff" 
        name="Leo" 
        action={location === 'gym' ? "Training..." : null}
      />
      <Agent 
        position={agentPositions.b} 
        coreColor="#ff00ff" 
        name="Orbit" 
        action={training?.action === 'bench' ? "Lifting! 💪" : location === 'walking_to_gym' ? "*walking*" : null}
      />
      
      <TrainingParticles active={training?.done} position={[8, 1, -3]} />
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}
