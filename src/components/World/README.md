# World View Component (HypnoticQuantumFractal)

A mesmerizing 3D visualization of the quantum-fractal space that represents mathematical theories and their relationships.

## Features

- Interactive 3D scene with Three.js
- Sacred geometry points representing mathematical constants:
  - Unity (1.0)
  - Golden Ratio (1.618)
  - Duality (2.0)
  - Pi (3.14159)
  - Euler's Number (e)
- Dynamic quantum particle effects
- Real-time connections between related concepts
- User controls for:
  - Energy level
  - Fractal dimension
  - Pulse speed
  - Visual mode

## Usage

```jsx
import { HypnoticQuantumFractal } from './components/World';

function App() {
  return (
    <div>
      <HypnoticQuantumFractal />
    </div>
  );
}
```

## Props

The component is currently self-contained and doesn't accept props. Future versions will support:
- Initial camera position
- Custom sacred points
- Theme customization
- Data injection

## Technical Details

- Uses Three.js for 3D rendering
- Custom shaders for glow effects
- React hooks for state management
- Responsive design
- Memory-optimized particle system

## Performance Notes

- Automatically adjusts particle count based on device capability
- Uses instancing for efficient rendering
- Implements proper cleanup in useEffect
- Throttles heavy calculations
