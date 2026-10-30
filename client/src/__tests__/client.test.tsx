import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SuccessModal } from '../components/SuccessModal';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AuthProvider } from '../context/AuthContext';

describe('Client Components & UI Testing', () => {
  it('Navbar renders brand insignia and essential navigation links', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('WANDERLUST')).toBeDefined();
    expect(screen.getByText('Destinations')).toBeDefined();
    expect(screen.getByText('Tour Packages')).toBeDefined();
    expect(screen.getByText('Services')).toBeDefined();
    expect(screen.getByText('About Us')).toBeDefined();
    expect(screen.getByText('Contact')).toBeDefined();
  });

  it('SuccessModal renders unique inquiry reference and explicit reservation disclosure', () => {
    const mockInquiry = {
      reference: 'WND-2026-TEST1',
      customerName: 'Lady Eleanor Vance',
      destination: { name: 'Santorini', country: 'Greece' },
      package: { title: 'Cycladic Grandeur', price: 5400 },
      departureDate: '2026-06-12',
      returnDate: '2026-06-19',
      adults: 2,
      children: 0,
      status: 'PENDING',
    };

    render(
      <BrowserRouter>
        <SuccessModal
          isOpen={true}
          onClose={() => {}}
          inquiry={mockInquiry}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Voyage Inquiry Received')).toBeDefined();
    expect(screen.getByText('WND-2026-TEST1')).toBeDefined();
    expect(screen.getByText(/Lady Eleanor Vance/)).toBeDefined();
    expect(screen.getByText(/Santorini/)).toBeDefined();
    expect(screen.getByText(/This inquiry is a personalized request and does not constitute a confirmed reservation/)).toBeDefined();
  });

  it('NotFoundPage renders 404 message and navigation recovery buttons', () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Lost In The Voyage (404)')).toBeDefined();
    expect(screen.getByText('Return To Home Harbor')).toBeDefined();
    expect(screen.getByText('Browse Active Destinations')).toBeDefined();
  });
});
