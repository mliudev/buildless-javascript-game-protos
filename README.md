# Buildless JavaScript Game Prototypes

A prototype demonstrating how to use Three.js with React Three Fiber (R3F) using ESM imports directly from CDNs.

## Overview

This project demonstrates how to build 3D web applications using React Three Fiber without a build step by leveraging ESM imports directly from CDNs like esm.sh. Some examples use ESM.sh/tsx to transpile JSX.

## Examples

basic-r3f-jsx - Basic buildless prototype using R3F and JSX
advanced-r3f-jsx - More R3F libraries with postprocessing using R3F with JSX
r3f-htm - advanced R3F prototype without using JSX at all

One-shot iteration:

threejs-one-shot-0 - successful 1 shot but with controller issues
threejs-one-shot-1 - prompt-iteration v1 successful but large generation

## Key Features

- No build step required
- Direct ESM imports from CDN
- Physics simulation with @react-three/cannon
- Orbit controls and advanced 3D objects

## ESM Import Examples

```javascript
    <script type="importmap">
        {
            "imports": {
                "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
            }
        }
    </script>
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
