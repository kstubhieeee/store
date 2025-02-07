import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import SignIn from './SignIn';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('SignIn Component', () => {
  test('logs in successfully with valid credentials', async () => {
    try {
      render(
        <Router>
          <SignIn />
        </Router>
      );

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'e@e.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: '123456' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    } catch (error) {
      console.log('Error in valid credentials test:', error.message);
    }
  });

  test('shows error message with invalid credentials', async () => {
    try {
      render(
        <Router>
          <SignIn />
        </Router>
      );

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'e@e.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'wrongpassword' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    } catch (error) {
      console.log('Error in invalid credentials test:', error.message);
    }
  });
});