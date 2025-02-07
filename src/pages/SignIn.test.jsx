import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import SignIn from './SignIn';

describe('SignIn Component', () => {
  // Mock environment variables
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      VITE_USERNAME: 'test@example.com',
      VITE_PASSWORD: 'password123',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should log in successfully with valid credentials', () => {
    render(
      <Router>
        <SignIn />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
  });

  it('should display an error message with invalid credentials', () => {
    render(
      <Router>
        <SignIn />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });
});
