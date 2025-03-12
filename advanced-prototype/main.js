import React, { useRef, useState } from 'https://esm.sh/react@18.2.0';
import * as ReactDOMClient from 'https://esm.sh/react-dom@18.2.0/client';
import * as THREE from 'https://esm.sh/three@0.149.0';
import { Canvas, useFrame } from 'https://esm.sh/@react-three/fiber@8.13.0?deps=react@18.2.0,three@0.149.0';
import htm from 'https://esm.sh/htm@3.1.1';

// Initialize htm with React.createElement
const html = htm.bind(React.createElement);

// Box component using HTM (should work)
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

  return html`
    <mesh
      ref=${meshRef}
      position=${props.position}
      scale=${active ? 1.5 : 1}
      onClick=${() => setActive(!active)}
      onPointerOver=${() => setHover(true)}
      onPointerOut=${() => setHover(false)}
    >
      <boxGeometry args=${[1, 1, 1]} />
      <meshStandardMaterial color=${hovered ? 'hotpink' : 'orange'} />
    </mesh>
  `;
}

// Plane component using HTM
function Plane() {
  return html`
    <mesh
      rotation=${[-Math.PI / 2, 0, 0]}
      position=${[0, -1, 0]}
    >
      <planeGeometry args=${[10, 10]} />
      <meshStandardMaterial color="#303030" />
    </mesh>
  `;
}

// Scene component with proper HTM fragment syntax
function Scene() {
  return html`
    <${React.Fragment}>
      ${React.createElement('ambientLight', { intensity: 0.5 })}
      ${React.createElement('pointLight', { position: [10, 10, 10] })}
      <${Box} position=${[0, 1, 0]} />
      <${Plane} />
    </${React.Fragment}>
  `;
}

// Main app component
function App() {
  return html`
    <div style=${{ width: '100vw', height: '100vh' }}>
      ${React.createElement(
        Canvas,
        { camera: { position: [0, 5, 10], fov: 50 } },
        React.createElement(Scene)
      )}
      <div style=${{ position: 'absolute', top: '10px', left: '10px', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px' }}>
        <h1>R3F ESM Prototype</h1>
        <p>Click on the box to scale it</p>
      </div>
    </div>
  `;
}

// Render the app
const rootElement = document.getElementById('root');
const root = ReactDOMClient.createRoot(rootElement);
root.render(html`<${App} />`);
