# Buildless JavaScript Game Prototypes

A prototype demonstrating how to use Three.js with React Three Fiber (R3F) using ESM imports directly from CDNs.

## Overview

This project demonstrates how to build 3D web applications using React Three Fiber without a build step by leveraging ESM imports directly from CDNs like esm.sh. Some examples use ESM.sh/tsx to transpile JSX.

## Examples

basic-r3f-jsx - Basic buildless prototype using R3F and JSX
advanced-r3f-jsx - More R3F libraries with postprocessing using R3F with JSX
r3f-htm - advanced R3F prototype without using JSX at all

## Key Features

- No build step required
- Direct ESM imports from CDN
- Physics simulation with @react-three/cannon
- Orbit controls and advanced 3D objects

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
2. Start a local server with `python3 -m http.server 8001`
3. Open your browser to `http://localhost:8001`

## Running the Examples

You can run these examples with Python's built-in HTTP server:

```bash
python3 -m http.server 8001
```
