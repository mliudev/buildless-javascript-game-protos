import React, { useRef, useState, useEffect } from 'https://esm.sh/react@18.3.1?dev';
import ReactDOM from 'https://esm.sh/react-dom@18.3.1?dev';
import { Canvas, useFrame, useThree, extend } from 'https://esm.sh/@react-three/fiber@8.14.5';
import { OrbitControls, Stars, Text, useTexture } from 'https://esm.sh/@react-three/drei@9.92.7';
import * as THREE from 'https://esm.sh/three@0.171.0?dev';
import htm from 'https://esm.sh/htm@3.1.1';

// Initialize htm with React.createElement
const html = htm.bind(React.createElement);

// Extend Three.js with OrbitControls
extend({ OrbitControls });

// Create a camera controller
function CameraController() {
  const { camera, gl } = useThree();
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.minDistance = 3;
    controls.maxDistance = 20;
    return () => {
      controls.dispose();
    };
  }, [camera, gl]);
  return null;
}

// Create a planet component
function Planet({ position, size, texture, rotationSpeed = 0.005, children }) {
  const meshRef = useRef();
  const texturePath = `https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/${texture}.jpg`;
  const planetTexture = useTexture(texturePath);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  return React.createElement(
    'group',
    { position },
    React.createElement(
      'mesh',
      { ref: meshRef },
      React.createElement('sphereGeometry', { args: [size, 64, 64] }),
      React.createElement('meshStandardMaterial', { map: planetTexture })
    ),
    children
  );
}

// Create a moon component
function Moon({ distance, size, rotationSpeed = 0.01, orbitSpeed = 0.005 }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const texturePath = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg';
  const moonTexture = useTexture(texturePath);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += orbitSpeed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  return React.createElement(
    'group',
    { ref: groupRef },
    React.createElement(
      'mesh',
      { ref: meshRef, position: [distance, 0, 0] },
      React.createElement('sphereGeometry', { args: [size, 32, 32] }),
      React.createElement('meshStandardMaterial', { map: moonTexture })
    )
  );
}

// Create a planet with moon
function EarthWithMoon() {
  return React.createElement(
    Planet,
    { position: [0, 0, 0], size: 1, texture: "earth_atmos_2048", rotationSpeed: 0.002 },
    React.createElement(Moon, { distance: 2, size: 0.27 })
  );
}

// Create the scene component
function Scene() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(CameraController),
    React.createElement('ambientLight', { intensity: 0.2 }),
    React.createElement('pointLight', { position: [10, 10, 10], intensity: 1.5 }),
    React.createElement(Stars, {
      radius: 100,
      depth: 50,
      count: 5000,
      factor: 4,
      saturation: 0,
      fade: true
    }),
    React.createElement(EarthWithMoon),
    React.createElement(Planet, {
      position: [5, 0, -5],
      size: 0.6,
      texture: "mars_1k",
      rotationSpeed: 0.003
    }),
    React.createElement(Planet, {
      position: [-6, 0, -3],
      size: 1.5,
      texture: "jupiter_1k",
      rotationSpeed: 0.001
    }),
    React.createElement(
      Text,
      {
        position: [0, 2.5, 0],
        color: "white",
        fontSize: 0.5,
        maxWidth: 200,
        lineHeight: 1,
        letterSpacing: 0.02,
        textAlign: "center",
        font: "https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff",
        anchorX: "center",
        anchorY: "middle"
      },
      "R3F ESM Solar System"
    )
  );
}

// Create the canvas component
function ThreeCanvas() {
  return React.createElement(
    Canvas,
    { camera: { position: [0, 2, 10], fov: 45 } },
    React.createElement(Scene)
  );
}

// Create the info component using HTM
function Info() {
  return html`
    <div className="info">
      <h1>R3F ESM Advanced Prototype</h1>
      <p>Drag to rotate | Scroll to zoom</p>
    </div>
  `;
}

// Create the main app component using HTM for UI and React.createElement for 3D
function App() {
  return html`
    <div>
      <${Info} />
      <${ThreeCanvas} />
    </div>
  `;
}

// Render the app
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(React.createElement(App));
