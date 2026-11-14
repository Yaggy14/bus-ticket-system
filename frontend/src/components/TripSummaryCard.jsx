import React from 'react';
import { Bus, MapPin, Calendar, Clock, ShieldCheck, Ticket } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function TripSummaryCard() {
  const { tripData, passengers, totalPrice } = useBooking();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-20">
      <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100">
        <Ticket className="w-5 h-5 text-indigo-600" />
        <h2 className="font-bold text-slate-800 text-base">Sefer ve Fiyat Özeti</h2>
      </div>

      {/* Firma & Otobüs Bilgisi */}
      <div className="mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-slate-800 text-sm">{tripData.companyName}</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-md">
            {tripData.busType}
          </span>
        </div>
        <p className="text-xs text-slate-500">Sefer No: {tripData.tripId} | Plaka: {tripData.busPlate}</p>
      </div>

      {/* Güzergah & Saat */}
      <div className="space-y-3 mb-5 text-xs text-slate-600">
        <div className="flex items-start space-x-2.5">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800 block text-sm">{tripData.from}</span>
            <span className="text-slate-400">Kalkış Noktası</span>
          </div>
        </div>

        <div className="w-0.5 h-4 bg-slate-200 ml-4.5"></div>

        <div className="flex items-start space-x-2.5">
          <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800 block text-sm">{tripData.to}</span>
            <span className="text-slate-400">Varış Noktası</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-700">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{tripData.departureDate}</span>
          </div>
          <div className="flex items-center space-x-1.5 font-bold text-slate-900">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{tripData.departureTime}</span>
          </div>
        </div>
      </div>

      {/* Seçilen Koltuklar */}
      <div className="mb-5 pb-4 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-500 block mb-2">Seçilen Koltuklar</span>
        <div className="flex flex-wrap gap-1.5">
          {tripData.selectedSeats.map((seat) => {
            const isFemale = seat.gender === 'F' || seat.genderConstraint === 'F';
            return (
              <span
                key={seat.seatNumber}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border font-bold text-xs ${
                  isFemale
                    ? 'bg-pink-50 border-pink-200 text-pink-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}
              >
                {isFemale ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-pink-600">
                    <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-4.5 10.5C6.12 12.5 5 13.62 5 15v1.5l1.5 5h11l1.5-5V15c0-1.38-1.12-2.5-2.5-2.5h-9z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-blue-600">
                    <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-5 11c-1.66 0-3 1.34-3 3v4a1 1 0 001 1h14a1 1 0 001-1v-4c0-1.66-1.34-3-3-3H7z" />
                  </svg>
                )}
                <span>Koltuk: {seat.seatNumber} ({isFemale ? 'Kadın' : 'Erkek'})</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Fiyatlandırma Hesap Tablosu */}
      <div className="space-y-2 mb-5 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Koltuk Başı Ücret</span>
          <span className="font-medium text-slate-800">{tripData.pricePerSeat} ₺</span>
        </div>
        <div className="flex justify-between">
          <span>Bilet Adedi</span>
          <span className="font-medium text-slate-800">{passengers.length} Yolcu</span>
        </div>
        <div className="flex justify-between">
          <span>Hizmet & KDV Bedeli</span>
          <span className="font-medium text-emerald-600">Dahil</span>
        </div>
        <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
          <span className="font-bold text-slate-800 text-sm">Toplam Tutar:</span>
          <span className="font-extrabold text-xl text-indigo-600">{totalPrice} ₺</span>
        </div>
      </div>

      {/* Güvenlik Rozeti */}
      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center space-x-2 text-xs text-emerald-800">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Koltuklarınız rezervasyon süresince koruma altındadır.</span>
      </div>
    </div>
  );
}
