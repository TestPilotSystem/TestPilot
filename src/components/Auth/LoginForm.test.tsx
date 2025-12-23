import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginForm from './LoginForm';
import { AuthProvider } from '@/context/AuthContext';

// Mockear el router de Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoginForm Component', () => {
  it('should render the login form with updated mockup elements', () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    expect(typeof window).toBe('object');

    const title = screen.getByText(/Arranca el viaje/i);
    const emailLabel = screen.getByText(/EMAIL/i); // Ahora es un label en uppercase
    const passwordLabel = screen.getByText(/CONTRASEÑA/i);
    const submitButton = screen.getByRole('button', { name: /Entrar/i });

    expect(title).toBeInTheDocument();
    expect(emailLabel).toBeInTheDocument();
    expect(passwordLabel).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    
    expect(screen.getByPlaceholderText(/tu@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });
});