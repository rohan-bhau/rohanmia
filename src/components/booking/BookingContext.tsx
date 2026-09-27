'use client';

import React, { createContext, useContext, useState } from 'react';

interface BookingContextType {
  isOpen: boolean;
  openBooking: () => void;
  closeBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openBooking = () => setIsOpen(true);
  const closeBooking = () => setIsOpen(false);

  return (
    <BookingContext.Provider value={{ isOpen, openBooking, closeBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
