import React from 'react';
import { Bus, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function Header({ currentStep = 2 }) {
  const { timeLeft, isLockedExpired } = useBooking();

  // Kalan süreyi Dakika : Saniye (04:59) formatına dönüştürme
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Süreye göre renk değişimi (Son 60 saniyede kırmızıya döner)
  const isTimeCritical = timeLeft < 60;

  const steps = [
    { number: 1, label: 'Koltuk Seçimi' },
    { number: 2, label: 'Yolcu Bilgileri' },
    { number: 3, label: 'Ödeme & Özet' },
    { number: 4, label: 'Bilet Onayı' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Üst Kısım: Logo ve Kalan Kilit Süresi */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-sm flex items-center justify-center">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">BiletMatik</h1>
              <p className="text-xs text-slate-500">Güvenli Otobüs Bilet Rezervasyon Sistemi</p>
            </div>
          </div>

          {/* Dinamik Geri Sayım Rozeti (Team Member 1 & 2 Entegrasyonu) */}
          <div
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
              isLockedExpired
                ? 'bg-red-50 text-red-700 border-red-200'
                : isTimeCritical
                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {isLockedExpired ? (
              <>
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Kilit Süresi Doldu!</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Koltuk Kilit Süresi:</span>
                <span className="font-mono text-base font-bold">{formattedTime}</span>
              </>
            )}
          </div>
        </div>

        {/* Alt Kısım: 4 Adımlı İlerleme Çubuğu (Step Wizard) */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            return (
              <div key={step.number} className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : step.number}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    isCurrent
                      ? 'text-indigo-600 font-bold'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
