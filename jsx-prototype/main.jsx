import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useBox } from '@react-three/cannon';

// Box component with physics
function PhysicsBox(props) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: props.position,
    args: [1, 1, 1]
  }));

  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(!active);
    api.applyImpulse([0, 5, 0], [0, 0, 0]);
  };

  return (
    <mesh
      ref={ref}
      scale={active ? 1.5 : 1}
      onClick={handleClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}

// Plane component with physics
function PhysicsPlane() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -1, 0]
  }));

  return (
    <mesh ref={ref}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#303030" />
    </mesh>
  );
}

// Scene component with wrapper components
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Physics gravity={[0, -9.81, 0]} defaultContactMaterial={{ restitution: 0.7 }}>
        <PhysicsBox position={[0, 5, 0]} />
        <PhysicsPlane />
      </Physics>
    </>
  );
}

// Main app component
function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <Scene />
      </Canvas>
      <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px' }}>
        <h1>R3F ESM Prototype with Physics</h1>
        <p>Click on the box to apply an impulse</p>
      </div>
    </div>
  );
}

// Render the app
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<App />);
