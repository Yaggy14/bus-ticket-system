import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';

// Sayfalar
import SeatSelectionPlaceholder from './pages/SeatSelectionPlaceholder';
import PassengerDetailsPage from './pages/PassengerDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';

export default function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <Routes>
          {/* Ana sayfa doğrudan koltuk seçimine yönlendirir */}
          <Route path="/" element={<Navigate to="/seats" replace />} />

          {/* 1. Adım: Koltuk Seçimi (Team Member 2'nin alanı - test için hazırlandı) */}
          <Route path="/seats" element={<SeatSelectionPlaceholder />} />

          {/* 2. Adım: Yolcu Bilgileri (Team Member 3 - Senin alanın) */}
          <Route path="/passengers" element={<PassengerDetailsPage />} />

          {/* 3. Adım: Ödeme ve Özet (Team Member 3 - Senin alanın) */}
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* 4. Adım: Bilet Onay ve PNR Çıktısı (Team Member 3 - Senin alanın) */}
          <Route path="/confirmation" element={<ConfirmationPage />} />

          {/* Tanımsız rotalar için koltuk seçimine yönlendir */}
          <Route path="*" element={<Navigate to="/seats" replace />} />
        </Routes>
      </BrowserRouter>
    </BookingProvider>
  );
}
