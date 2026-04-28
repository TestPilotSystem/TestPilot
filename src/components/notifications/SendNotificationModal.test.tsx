import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SendNotificationModal from './SendNotificationModal';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: any) =>
      require('react').createElement('div', rest, children),
  },
  AnimatePresence: ({ children }: any) => children ?? null,
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

global.fetch = jest.fn();

const oneRecipient = [{ id: 1, name: 'Ana García' }];
const manyRecipients = [
  { id: 1, name: 'Ana García' },
  { id: 2, name: 'Luis Martínez' },
  { id: 3, name: 'María López' },
];

describe('SendNotificationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Notificación enviada correctamente' }),
    });
  });

  it('renders nothing when isOpen is false', () => {
    render(
      <SendNotificationModal isOpen={false} onClose={jest.fn()} recipients={oneRecipient} />,
    );

    expect(screen.queryByText('Enviar notificación')).not.toBeInTheDocument();
  });

  it('renders the modal when isOpen is true', () => {
    render(
      <SendNotificationModal isOpen onClose={jest.fn()} recipients={oneRecipient} />,
    );

    expect(screen.getByText('Enviar notificación')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Recordatorio de clase/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Escribe el mensaje/i)).toBeInTheDocument();
  });

  it('shows single recipient name when there is only one', () => {
    render(
      <SendNotificationModal isOpen onClose={jest.fn()} recipients={oneRecipient} />,
    );

    expect(screen.getByText('Para: Ana García')).toBeInTheDocument();
  });

  it('shows recipient count when there are multiple recipients', () => {
    render(
      <SendNotificationModal isOpen onClose={jest.fn()} recipients={manyRecipients} />,
    );

    expect(screen.getByText('Para: 3 alumnos')).toBeInTheDocument();
  });

  it('send button is disabled when fields are empty', () => {
    render(
      <SendNotificationModal isOpen onClose={jest.fn()} recipients={oneRecipient} />,
    );

    expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled();
  });

  it('send button enables only when both title and message are filled', () => {
    render(
      <SendNotificationModal isOpen onClose={jest.fn()} recipients={oneRecipient} />,
    );

    const sendButton = screen.getByRole('button', { name: /^enviar$/i });
    const titleInput = screen.getByPlaceholderText(/Recordatorio de clase/i);
    const messageInput = screen.getByPlaceholderText(/Escribe el mensaje/i);

    fireEvent.change(titleInput, { target: { value: 'Mi título' } });
    expect(sendButton).toBeDisabled();

    fireEvent.change(messageInput, { target: { value: 'Mi mensaje' } });
    expect(sendButton).not.toBeDisabled();
  });

  it('updates the character counter as the message grows', () => {
    render(
      <SendNotificationModal isOpen onClose={jest.fn()} recipients={oneRecipient} />,
    );

    expect(screen.getByText('0/2000')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Escribe el mensaje/i), {
      target: { value: 'Hola' },
    });

    expect(screen.getByText('4/2000')).toBeInTheDocument();
  });

  it('sends correct payload and calls onClose on success', async () => {
    const onClose = jest.fn();

    render(
      <SendNotificationModal isOpen onClose={onClose} recipients={manyRecipients} />,
    );

    fireEvent.change(screen.getByPlaceholderText(/Recordatorio de clase/i), {
      target: { value: 'Clase cancelada' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Escribe el mensaje/i), {
      target: { value: 'La clase de mañana queda cancelada por mal tiempo.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^enviar$/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/notifications/send',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userIds: [1, 2, 3],
            title: 'Clase cancelada',
            messageBody: 'La clase de mañana queda cancelada por mal tiempo.',
          }),
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error toast and keeps modal open when API fails', async () => {
    const { toast } = require('sonner');
    const onClose = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Error interno del servidor' }),
    });

    render(
      <SendNotificationModal isOpen onClose={onClose} recipients={oneRecipient} />,
    );

    fireEvent.change(screen.getByPlaceholderText(/Recordatorio de clase/i), {
      target: { value: 'Título' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Escribe el mensaje/i), {
      target: { value: 'Cuerpo del mensaje' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^enviar$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error interno del servidor');
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('calls onClose when clicking the X button', () => {
    const onClose = jest.fn();

    render(
      <SendNotificationModal isOpen onClose={onClose} recipients={oneRecipient} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
