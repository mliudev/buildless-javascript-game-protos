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

# HTM with React Three Fiber - Issue and Solutions

This repository demonstrates the issue with using HTM (Hyperscript Tagged Markup) with React Three Fiber, and provides several solutions.

## The Issue

When using HTM with React Three Fiber, you may encounter this error:

```
Uncaught Error: Objects are not valid as a React child (found: object with keys {$$typeof, type, key, ref, props}). If you meant to render a collection of children, use an array instead.
```

This happens because HTM doesn't handle React Three Fiber's component hierarchy correctly, particularly with how R3F manages its children and context.

## Examples

### 1. Minimal Working Example (`minimal.html`)

This example uses `React.createElement` directly for all R3F components and only uses HTM for the outer container. This approach works reliably.

### 2. Broken Example (`minimal-broken.html`)

This example tries to use HTM for everything, including R3F components. This will produce the error mentioned above.

### 3. Hybrid Approach (`minimal-hybrid.html`)

This example uses a hybrid approach:
- `React.createElement` for all R3F/Three.js components
- HTM for regular UI components

## Why This Happens

The issue occurs because:

1. React Three Fiber uses a custom reconciler and context system
2. HTM converts template literals to React elements, but doesn't handle the special context requirements of R3F
3. When HTM tries to render R3F components as children, the context chain is broken

## Best Practices

When using HTM with React Three Fiber:

1. Use `React.createElement` for all Three.js/R3F components
2. Use HTM only for regular UI components
3. Keep the R3F component tree separate from the HTM component tree
4. Pass R3F components as variables to HTM templates, not as HTM tags

## Running the Examples

You can run these examples with Python's built-in HTTP server:

```bash
python -m http.server
```

Then visit:
- http://localhost:8000/minimal.html (working example)
- http://localhost:8000/minimal-broken.html (broken example)
- http://localhost:8000/minimal-hybrid.html (hybrid approach)
