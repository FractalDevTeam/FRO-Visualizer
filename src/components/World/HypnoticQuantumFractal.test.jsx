import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { HypnoticQuantumFractal } from './';

// Mock Three.js
jest.mock('three', () => ({
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    setClearColor: jest.fn(),
    domElement: document.createElement('canvas')
  })),
  TextureLoader: jest.fn(() => ({
    load: jest.fn()
  })),
  Group: jest.fn(),
  SphereGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  Mesh: jest.fn(),
  ShaderMaterial: jest.fn(),
  Color: jest.fn(),
  BufferGeometry: jest.fn(),
  Float32Array: jest.fn(),
  Points: jest.fn(),
  LineBasicMaterial: jest.fn(),
  Line: jest.fn(),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn()
}));

describe('HypnoticQuantumFractal', () => {
  beforeEach(() => {
    // Mock window properties
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    Object.defineProperty(window, 'innerHeight', { value: 768 });
  });

  it('renders without crashing', () => {
    render(<HypnoticQuantumFractal />);
    expect(screen.getByText('QUANTUM')).toBeInTheDocument();
    expect(screen.getByText('FRACTAL MIND')).toBeInTheDocument();
  });

  it('toggles play/pause state', () => {
    render(<HypnoticQuantumFractal />);
    const playButton = screen.getByText('Pause Experience');
    fireEvent.click(playButton);
    expect(screen.getByText('Resume Experience')).toBeInTheDocument();
  });

  it('updates energy level', () => {
    render(<HypnoticQuantumFractal />);
    const slider = screen.getByLabelText('Energy Level');
    fireEvent.change(slider, { target: { value: '80' } });
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('updates fractal dimension', () => {
    render(<HypnoticQuantumFractal />);
    const slider = screen.getByLabelText('Fractal Dimension');
    fireEvent.change(slider, { target: { value: '2' } });
    expect(screen.getByText('2.000')).toBeInTheDocument();
  });

  it('toggles controls visibility', () => {
    render(<HypnoticQuantumFractal />);
    const toggleButton = screen.getByLabelText('Toggle Controls');
    fireEvent.click(toggleButton);
    expect(screen.queryByText('Energy Level')).not.toBeInTheDocument();
  });
});
