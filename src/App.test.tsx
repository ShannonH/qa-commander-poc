import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders QA Commander app', () => {
  render(<App />);
  const titleElements = screen.getAllByText('Dashboard');
  expect(titleElements[0]).toBeInTheDocument();
});
