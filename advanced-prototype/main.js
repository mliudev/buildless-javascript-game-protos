import React, { useRef, useState } from 'https://esm.sh/react@18.0.0';
import * as ReactDOMClient from 'https://esm.sh/react-dom@18.0.0/client';
import * as THREE from 'https://esm.sh/three@0.149.0';
import { Canvas, useFrame } from 'https://esm.sh/@react-three/fiber@8.13.0?deps=react@18.0.0,three@0.149.0';
import htm from 'https://esm.sh/htm@3.1.1';

// Initialize htm with React.createElement
const html = htm.bind(React.createElement);

// Create a simple box component
function Box(props) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // Create a THREE.js vector for position
  const position = new THREE.Vector3(props.position[0], props.position[1], props.position[2]);

  return React.createElement(
    'mesh',
    {
      ref: meshRef,
      position: position,
      scale: active ? 1.5 : 1,
      onClick: () => setActive(!active),
      onPointerOver: () => setHover(true),
      onPointerOut: () => setHover(false)
    },
    React.createElement('boxGeometry', { args: [1, 1, 1] }),
    React.createElement('meshStandardMaterial', { color: hovered ? 'hotpink' : 'orange' })
  );
}

// Create a simple plane component
function Plane(props) {
  // Create THREE.js vectors for rotation and position
  const rotation = new THREE.Euler(-Math.PI / 2, 0, 0);
  const position = new THREE.Vector3(props.position[0], props.position[1], props.position[2]);

  return React.createElement(
    'mesh',
    {
      rotation: rotation,
      position: position,
      receiveShadow: true
    },
    React.createElement('planeGeometry', { args: [10, 10] }),
    React.createElement('meshStandardMaterial', { color: '#303030' })
  );
}

// Create the scene component using direct React.createElement
function Scene() {
  const spotlightPosition = new THREE.Vector3(10, 10, 10);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement('ambientLight', { intensity: 0.5 }),
    React.createElement('spotLight', {
      position: spotlightPosition,
      angle: 0.15,
      penumbra: 1,
      castShadow: true
    }),
    React.createElement(Box, { position: [0, 1, 0] }),
    React.createElement(Plane, { position: [0, -1, 0] })
  );
}

// Create the canvas component using direct React.createElement
function ThreeCanvas() {
  const cameraPosition = new THREE.Vector3(0, 5, 10);

  return React.createElement(
    Canvas,
    {
      shadows: true,
      camera: {
        position: cameraPosition,
        fov: 50
      }
    },
    React.createElement(Scene)
  );
}

// Create the info component using HTM
function Info() {
  return html`
    <div className="info">
      <h1>R3F ESM Prototype</h1>
      <p>Click on the box to scale it</p>
    </div>
  `;
}

// Create the main app component
function App() {
  return html`
    <div>
      <${Info} />
      <${ThreeCanvas} />
    </div>
  `;
}

// Render the app using ReactDOMClient
const rootElement = document.getElementById('root');
const root = ReactDOMClient.createRoot(rootElement);
root.render(html`<${App} />`);
