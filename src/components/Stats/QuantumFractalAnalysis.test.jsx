import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { QuantumFractalAnalysis } from './';

// Mock Recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  ScatterChart: ({ children }) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: () => <div>Scatter</div>,
  ZAxis: () => <div>ZAxis</div>,
  Cell: () => <div>Cell</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div>Line</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div>Pie</div>
}));

describe('QuantumFractalAnalysis', () => {
  it('renders without crashing', () => {
    render(<QuantumFractalAnalysis />);
    expect(screen.getByText('Quantum-Fractal Truth Solver Analysis')).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    render(<QuantumFractalAnalysis />);
    
    // Check Categories tab
    expect(screen.getByText('Problem Category Distribution')).toBeInTheDocument();
    
    // Switch to Alpha Distribution tab
    fireEvent.click(screen.getByText('Fractal Analysis'));
    expect(screen.getByText('Fractal Dimension (Alpha) Distribution')).toBeInTheDocument();
    
    // Switch to Sacred Geometry tab
    fireEvent.click(screen.getByText('Sacred Geometry'));
    expect(screen.getByText('Sacred Geometry Points')).toBeInTheDocument();
    
    // Switch to Quantum Analysis tab
    fireEvent.click(screen.getByText('Quantum Analysis'));
    expect(screen.getByText('Quantum Fidelity Analysis')).toBeInTheDocument();
  });

  it('displays correct category data', () => {
    render(<QuantumFractalAnalysis />);
    expect(screen.getByText('Number Theory')).toBeInTheDocument();
    expect(screen.getByText('Geometry')).toBeInTheDocument();
    expect(screen.getByText('Graph Theory')).toBeInTheDocument();
  });

  it('shows correlation data', () => {
    render(<QuantumFractalAnalysis />);
    fireEvent.click(screen.getByText('Quantum Analysis'));
    expect(screen.getByText(/Strong positive correlation/)).toBeInTheDocument();
  });

  it('displays quantum fidelity statistics', () => {
    render(<QuantumFractalAnalysis />);
    fireEvent.click(screen.getByText('Quantum Analysis'));
    expect(screen.getByText(/Quantum fidelity ranges from/)).toBeInTheDocument();
  });
});
