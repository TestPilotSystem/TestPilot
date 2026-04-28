import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TestRunner from './TestRunner';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/components/ui/ConfirmModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onConfirm, title }: {
    isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string;
  }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <p>{title}</p>
        <button onClick={onClose}>Cancelar</button>
        <button onClick={onConfirm}>Confirmar abandono</button>
      </div>
    ) : null,
}));

global.fetch = jest.fn();

const mockQuestions = [
  {
    id: 'q1',
    enunciado: '¿Qué indica una señal de STOP?',
    opciones: { A: 'Ceder el paso', B: 'Detenerse completamente', C: 'Reducir velocidad' },
    respuestaCorrecta: 'Detenerse completamente',
    explicacion: 'Una señal de STOP indica parada obligatoria.',
  },
  {
    id: 'q2',
    enunciado: '¿Cuál es la velocidad máxima en autopista?',
    opciones: { A: '100 km/h', B: '120 km/h', C: '130 km/h' },
    respuestaCorrecta: '120 km/h',
    explicacion: 'En autopista española el límite general es 120 km/h.',
  },
];

const buildTest = (overrides = {}) => ({
  id: 'test-1',
  type: 'CUSTOM',
  topic: { name: 'Señales de tráfico' },
  questions: mockQuestions,
  ...overrides,
});

describe('TestRunner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders the first question, topic name and timer', () => {
    render(<TestRunner test={buildTest()} />);

    expect(screen.getByText('Señales de tráfico')).toBeInTheDocument();
    expect(screen.getByText('¿Qué indica una señal de STOP?')).toBeInTheDocument();
    expect(screen.getByText('30:00')).toBeInTheDocument();
    expect(screen.getByText('Pregunta 1 de 2')).toBeInTheDocument();
  });

  it('renders all answer options for the current question', () => {
    render(<TestRunner test={buildTest()} />);

    expect(screen.getByText('Ceder el paso')).toBeInTheDocument();
    expect(screen.getByText('Detenerse completamente')).toBeInTheDocument();
    expect(screen.getByText('Reducir velocidad')).toBeInTheDocument();
  });

  it('navigates to a specific question via numbered buttons', () => {
    render(<TestRunner test={buildTest()} />);

    fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(screen.getByText('Pregunta 2 de 2')).toBeInTheDocument();
    expect(screen.getByText('¿Cuál es la velocidad máxima en autopista?')).toBeInTheDocument();
  });

  it('shows the Finalizar button only on the last question', () => {
    render(<TestRunner test={buildTest()} />);

    expect(screen.queryByRole('button', { name: /finalizar/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(screen.getByRole('button', { name: /finalizar/i })).toBeInTheDocument();
  });

  it('opens the exit confirmation modal when clicking Abandonar', () => {
    render(<TestRunner test={buildTest()} />);

    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /abandonar/i }));

    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    expect(screen.getByText(/¿Abandonar el test\?/i)).toBeInTheDocument();
  });

  it('redirects to driving-tests when confirming exit', () => {
    render(<TestRunner test={buildTest()} />);

    fireEvent.click(screen.getByRole('button', { name: /abandonar/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmar abandono/i }));

    expect(mockPush).toHaveBeenCalledWith('/estudiante/driving-tests');
  });

  it('CUSTOM type: calculates score locally and shows completion screen', async () => {
    render(<TestRunner test={buildTest({ type: 'CUSTOM' })} />);

    // Answer q1 correctly
    fireEvent.click(screen.getByRole('button', { name: /Detenerse completamente/i }));

    // Go to q2 and answer correctly
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: /120 km\/h/i }));

    // Finalizar
    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Test Personalizado Completado/i)).toBeInTheDocument();
      expect(screen.getByText(/100%/)).toBeInTheDocument();
      expect(screen.getByText('Aciertos: 2/2')).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('CUSTOM type: shows partial score when some answers are wrong', async () => {
    render(<TestRunner test={buildTest({ type: 'CUSTOM' })} />);

    // Answer q1 incorrectly
    fireEvent.click(screen.getByRole('button', { name: /Ceder el paso/i }));

    // Go to q2 and answer correctly
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: /120 km\/h/i }));

    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    await waitFor(() => {
      expect(screen.getByText(/50%/)).toBeInTheDocument();
      expect(screen.getByText('Aciertos: 1/2')).toBeInTheDocument();
    });
  });

  it('standard type: calls API and redirects to results on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'result-123' }),
    });

    render(<TestRunner test={buildTest({ type: undefined })} />);

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/student/driving-tests/submit',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(mockPush).toHaveBeenCalledWith('/estudiante/driving-tests/resultados/result-123');
    });
  });

  it('standard type: shows error toast when API fails', async () => {
    const { toast } = require('sonner');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    render(<TestRunner test={buildTest({ type: undefined })} />);

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al guardar el test');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows question review after CUSTOM completion', async () => {
    render(<TestRunner test={buildTest({ type: 'CUSTOM' })} />);

    // Navigate to q2 without answering q1, then finish
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    await waitFor(() => screen.getByText(/ver respuestas/i));
    fireEvent.click(screen.getByRole('button', { name: /ver respuestas/i }));

    // Both questions show in review
    expect(screen.getByText('¿Qué indica una señal de STOP?')).toBeInTheDocument();
    expect(screen.getByText('Una señal de STOP indica parada obligatoria.')).toBeInTheDocument();
    // Both q1 and q2 were unanswered, so there are two "Sin respuesta" labels
    expect(screen.getAllByText(/sin respuesta/i)).toHaveLength(2);
  });
});
