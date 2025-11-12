import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginForm from './LoginForm'; 

// Mockear el router de Next.js
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('Login Component Frontend Environment Verification', () => {
    it('should confirm the environment is JSDOM and render the core elements', () => {
        
        render(<LoginForm />);
        expect(typeof window).toBe('object');
        expect(window).toBeDefined();

        const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
        const emailInput = screen.getByLabelText(/Correo Electrónico/i);

        expect(submitButton).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
    });
});