import React from 'https://esm.sh/react@18.3.1?dev';
import ReactDOM from 'https://esm.sh/react-dom@18.3.1?dev';
import { Canvas, useFrame, useThree, extend } from 'https://esm.sh/@react-three/fiber@8.14.5';
import { Physics, useBox, usePlane } from 'https://esm.sh/@react-three/cannon@6.6.0';
import * as THREE from 'https://esm.sh/three@0.171.0?dev';

// Create a simple box component
function Box(props) {
  const [ref, api] = useBox(() => ({ mass: 1, position: [0, 5, 0], ...props }));
  const [hovered, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  useFrame(() => {
    ref.current.rotation.x += 0.01;
    ref.current.rotation.y += 0.01;
  });

  return (
    <mesh
      ref={ref}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}

// Create a simple plane component
function Plane(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#303030" />
    </mesh>
  );
}

// Create the main scene component
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
      <Physics>
        <Box position={[0, 5, 0]} />
        <Plane position={[0, 0, 0]} />
      </Physics>
    </>
  );
}

// Create the main app component
function App() {
  return (
    <>
      <div className="info">
        <h1>R3F ESM Prototype</h1>
        <p>Click on the box to scale it</p>
      </div>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <Scene />
      </Canvas>
    </>
  );
}

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
