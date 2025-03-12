import React from 'https://esm.sh/react@18.3.1?dev';
import ReactDOM from 'https://esm.sh/react-dom@18.3.1?dev';
import { Canvas, useFrame, useThree, extend } from 'https://esm.sh/@react-three/fiber@8.14.5';
import { Physics, useBox, usePlane } from 'https://esm.sh/@react-three/cannon@6.6.0';
import * as THREE from 'https://esm.sh/three@0.171.0?dev';
import htm from 'https://esm.sh/htm@3.1.1';

// Initialize htm with React.createElement
const html = htm.bind(React.createElement);

// Create a simple box component using React.createElement
function Box(props) {
  const [ref, api] = useBox(() => ({ mass: 1, position: [0, 5, 0], ...props }));
  const [hovered, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  useFrame(() => {
    ref.current.rotation.x += 0.01;
    ref.current.rotation.y += 0.01;
  });

  return React.createElement(
    'mesh',
    {
      ref: ref,
      scale: active ? 1.5 : 1,
      onClick: () => setActive(!active),
      onPointerOver: () => setHover(true),
      onPointerOut: () => setHover(false)
    },
    React.createElement('boxGeometry', { args: [1, 1, 1] }),
    React.createElement('meshStandardMaterial', { color: hovered ? 'hotpink' : 'orange' })
  );
}

// Create a simple plane component using React.createElement
function Plane(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }));

  return React.createElement(
    'mesh',
    { ref: ref, receiveShadow: true },
    React.createElement('planeGeometry', { args: [10, 10] }),
    React.createElement('meshStandardMaterial', { color: "#303030" })
  );
}

// Create the scene component using React.createElement
function Scene() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement('ambientLight', { intensity: 0.5 }),
    React.createElement('spotLight', {
      position: [10, 10, 10],
      angle: 0.15,
      penumbra: 1,
      castShadow: true
    }),
    React.createElement(
      Physics,
      null,
      React.createElement(Box, { position: [0, 5, 0] }),
      React.createElement(Plane, { position: [0, 0, 0] })
    )
  );
}

// Create the canvas component using React.createElement
function ThreeCanvas() {
  return React.createElement(
    Canvas,
    {
      shadows: true,
      camera: { position: [0, 5, 10], fov: 50 }
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
