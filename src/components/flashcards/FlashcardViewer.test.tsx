import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import FlashcardViewer from './FlashcardViewer';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockCards = [
  { id: 'c1', pregunta: '¿Qué es un semáforo?', respuesta: 'Dispositivo luminoso', explicacion: 'Regula el tráfico.' },
  { id: 'c2', pregunta: '¿Qué significa línea continua?', respuesta: 'Prohibido cruzar', explicacion: 'Separa carriles opuestos.' },
  { id: 'c3', pregunta: '¿Qué es la señal de ceda el paso?', respuesta: 'Prioridad al otro', explicacion: 'Triángulo invertido.' },
];

describe('FlashcardViewer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the deck name and the first card question', () => {
    render(<FlashcardViewer deckName="Tema 1: Señales" cards={mockCards} />);

    expect(screen.getByText('Tema 1: Señales')).toBeInTheDocument();
    expect(screen.getByText('¿Qué es un semáforo?')).toBeInTheDocument();
  });

  it('shows the correct card counter on first card', () => {
    render(<FlashcardViewer deckName="Señales" cards={mockCards} />);

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('previous button is disabled on the first card', () => {
    render(<FlashcardViewer deckName="Señales" cards={mockCards} />);

    const allButtons = screen.getAllByRole('button');
    const disabledBtn = allButtons.find(btn => btn.hasAttribute('disabled'));
    expect(disabledBtn).toBeDefined();
    expect(disabledBtn).toBeDisabled();
  });

  it('advances to the next card when clicking the next button', async () => {
    render(<FlashcardViewer deckName="Señales" cards={mockCards} />);

    expect(screen.getByText('¿Qué es un semáforo?')).toBeInTheDocument();

    // ChevronRight button (next): the last non-disabled nav button in the bottom bar
    const allButtons = screen.getAllByRole('button');
    const nextButton = allButtons[allButtons.length - 1]; // last button is ChevronRight
    fireEvent.click(nextButton);

    act(() => jest.advanceTimersByTime(300));

    await waitFor(() => {
      expect(screen.getByText('¿Qué significa línea continua?')).toBeInTheDocument();
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });
  });

  it('shows the completion screen after going through all cards', async () => {
    const singleCard = [
      { id: 'c1', pregunta: '¿Pregunta única?', respuesta: 'Respuesta', explicacion: 'Explicación.' },
    ];
    render(<FlashcardViewer deckName="Mini mazo" cards={singleCard} />);

    const allButtons = screen.getAllByRole('button');
    const nextButton = allButtons[allButtons.length - 1];
    fireEvent.click(nextButton);

    act(() => jest.advanceTimersByTime(300));

    await waitFor(() => {
      expect(screen.getByText(/Lote completado/i)).toBeInTheDocument();
      expect(screen.getByText(/Has repasado las 1 tarjetas/i)).toBeInTheDocument();
    });
  });

  it('restart button resets to the first card', async () => {
    const singleCard = [
      { id: 'c1', pregunta: '¿Pregunta única?', respuesta: 'Respuesta', explicacion: 'Explicación.' },
    ];
    render(<FlashcardViewer deckName="Mini mazo" cards={singleCard} />);

    // Advance to completion
    const allButtons = screen.getAllByRole('button');
    fireEvent.click(allButtons[allButtons.length - 1]);
    act(() => jest.advanceTimersByTime(300));

    await waitFor(() => screen.getByText(/Lote completado/i));

    // Click restart
    fireEvent.click(screen.getByRole('button', { name: /repetir/i }));

    await waitFor(() => {
      expect(screen.getByText('¿Pregunta única?')).toBeInTheDocument();
      expect(screen.getByText('1 / 1')).toBeInTheDocument();
    });
  });

  it('exit button navigates back to the flashcards list', () => {
    render(<FlashcardViewer deckName="Señales" cards={mockCards} />);

    fireEvent.click(screen.getByRole('button', { name: /salir/i }));

    expect(mockPush).toHaveBeenCalledWith('/estudiante/flashcards');
  });

  it('hides navigation buttons on the completion screen', async () => {
    const singleCard = [
      { id: 'c1', pregunta: '¿P?', respuesta: 'R', explicacion: 'E.' },
    ];
    render(<FlashcardViewer deckName="Mini" cards={singleCard} />);

    const allButtons = screen.getAllByRole('button');
    fireEvent.click(allButtons[allButtons.length - 1]);
    act(() => jest.advanceTimersByTime(300));

    await waitFor(() => screen.getByText(/Lote completado/i));

    // After completion, prev/next icon-only buttons disappear; only "Salir" and "Repetir" remain
    const remaining = screen.getAllByRole('button');
    const hasIconOnlyButton = remaining.some(btn => !btn.textContent?.trim());
    expect(hasIconOnlyButton).toBe(false);
  });
});
