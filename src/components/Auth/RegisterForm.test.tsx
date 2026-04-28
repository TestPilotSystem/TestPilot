import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterForm from './RegisterForm';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

global.fetch = jest.fn();

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Solicitud enviada correctamente.' }),
    });
  });

  const fillValidForm = () => {
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'juan@test.com' } });
    fireEvent.change(screen.getByLabelText('DNI con letra'), { target: { value: '12345678Z' } });
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1990-01-01' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Password123*' } });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'Password123*' } });
  };

  it('renders all form fields and the submit button', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Apellidos')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('DNI con letra')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha de nacimiento')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('password fields start as type password and toggle to text on click', () => {
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmInput = screen.getByLabelText('Confirmar contraseña');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');

    const [togglePassword] = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('type') === 'button',
    );
    fireEvent.click(togglePassword);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmInput).toHaveAttribute('type', 'password');
  });

  it('shows loading state and disables fields while submitting', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 500)),
    );

    render(<RegisterForm />);
    fillValidForm();
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }).closest('form')!);

    expect(await screen.findByText(/enviando solicitud/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeDisabled();
    expect(screen.getByRole('button', { name: /enviando solicitud/i })).toBeDisabled();
  });

  it('shows success message and redirects to / on successful registration', async () => {
    render(<RegisterForm />);
    fillValidForm();
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }).closest('form')!);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows API error message when registration fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'El email ya está registrado.' }),
    });

    render(<RegisterForm />);
    fillValidForm();
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }).closest('form')!);

    expect(await screen.findByText('El email ya está registrado.')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows network error message when fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<RegisterForm />);
    fillValidForm();
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }).closest('form')!);

    expect(
      await screen.findByText(/error de red/i),
    ).toBeInTheDocument();
  });

  it('sends the correct payload to the register API', async () => {
    render(<RegisterForm />);
    fillValidForm();
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }).closest('form')!);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('/api/auth/register');
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body);
    expect(body.firstName).toBe('Juan');
    expect(body.email).toBe('juan@test.com');
    expect(body.dni).toBe('12345678Z');
  });
});
