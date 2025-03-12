# R3F ESM Prototype

A prototype demonstrating how to use Three.js with React Three Fiber (R3F) using ESM imports directly from CDNs.

## Overview

This project demonstrates how to build 3D web applications using React Three Fiber without a build step by leveraging ESM imports directly from CDNs like esm.sh.

## Examples

The prototype includes two examples:

1. **Basic Example** (index.html): A simple physics-based scene with a box and a plane.
2. **Advanced Example** (advanced.html): A solar system visualization with orbit controls.

## Key Features

- No build step required
- Direct ESM imports from CDN
- Physics simulation with @react-three/cannon
- Orbit controls and advanced 3D objects
- Responsive design

## ESM Import Examples

```javascript
// React and ReactDOM
import React from 'https://esm.sh/react@18.3.1?dev';
import ReactDOM from 'https://esm.sh/react-dom@18.3.1?dev';

// Three.js
import * as THREE from 'https://esm.sh/three@0.171.0?dev';

// React Three Fiber
import { Canvas, useFrame, useThree, extend } from 'https://esm.sh/@react-three/fiber@8.14.5';

// React Three Fiber Physics
import { Physics, useBox, usePlane } from 'https://esm.sh/@react-three/cannon@6.6.0';

// React Three Fiber Helpers
import { OrbitControls, Stars, Text, useTexture } from 'https://esm.sh/@react-three/drei@9.92.7';
```

## Running the Project

1. Clone the repository
2. Run `npm install` (optional, only needed for the development server)
3. Start the server with `npm start`
4. Open your browser to `http://localhost:3000`

Alternatively, you can simply open the HTML files directly in your browser, but some browsers may have CORS restrictions for module loading.

## Browser Compatibility

This prototype works best in modern browsers that support ES modules:
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+
