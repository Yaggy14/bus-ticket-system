import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Printer, QrCode, Bus, Calendar, Clock, MapPin, Copy, ArrowRight, Check } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { confirmedBooking, tripData, passengers, totalPrice, resetBooking } = useBooking();
  const [copied, setCopied] = React.useState(false);

  // Eğer doğrudan bu URL'e gelinmişse ve onay verisi yoksa fallback oluştur
  const booking = confirmedBooking || {
    bookingId: 'PNR-849102',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    paymentCardLast4: '4242',
  };

  const handleCopyPnr = () => {
    navigator.clipboard.writeText(booking.bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStartNewBooking = () => {
    resetBooking();
    navigate('/seats');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col print:bg-white">
      {/* Yazdırma modunda Header gizlenir */}
      <div className="print:hidden">
        <Header currentStep={4} />
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 w-full grow">
        {/* Başarı Kutlaması (Yazdırma modunda sadeleşir) */}
        <div className="text-center mb-8 print:mb-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            Bilet Rezervasyonunuz Başarıyla Onaylandı!
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Bilet detaylarınız SMS ve e-posta adresinize gönderilmiştir.
          </p>
        </div>

        {/* PNR Kodu Vurgu Kartı */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block">
              Rezervasyon Takip (PNR) Kodu
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-indigo-950">
              {booking.bookingId}
            </span>
          </div>

          <button
            onClick={handleCopyPnr}
            className="print:hidden px-4 py-2 bg-white hover:bg-slate-100 border border-indigo-200 text-indigo-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kodu Kopyala</span>
              </>
            )}
          </button>
        </div>

        {/* Dijital Otobüs Bileti Kartı (Ticket Voucher) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          {/* Bilet Üst Bandı */}
          <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center space-x-3">
              <Bus className="w-6 h-6 text-indigo-400" />
              <div>
                <h3 className="font-bold text-base">{tripData.companyName}</h3>
                <span className="text-xs text-slate-400">
                  {tripData.busType} • Plaka: {tripData.busPlate}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block">Sefer Kodu</span>
              <span className="font-mono text-sm font-semibold">{tripData.tripId}</span>
            </div>
          </div>

          {/* Güzergah & Tarih Bilgisi */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Kalkış</span>
              <h4 className="font-bold text-slate-800 text-lg">{tripData.from}</h4>
              <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{tripData.departureDate}</span>
                <Clock className="w-3.5 h-3.5 ml-2" />
                <span className="font-bold text-slate-900">{tripData.departureTime}</span>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center text-slate-400">
              <span className="text-xs mb-1 font-medium">{tripData.estimatedDuration}</span>
              <div className="w-32 border-t-2 border-dashed border-slate-300 relative">
                <div className="absolute -top-1.5 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-400 rotate-45"></div>
              </div>
            </div>

            <div className="md:text-right">
              <span className="text-xs text-slate-400 uppercase font-semibold">Varış</span>
              <h4 className="font-bold text-slate-800 text-lg">{tripData.to}</h4>
              <p className="text-xs text-slate-500 mt-1">Tahmini Varış: 20:00</p>
            </div>
          </div>

          {/* Yolcu ve Koltuk Dağılım Tablosu */}
          <div className="p-6 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">
              Yolcu ve Koltuk Listesi
            </h4>
            <div className="space-y-3">
              {passengers.map((p, idx) => {
                const isFemale = p.gender === 'F';
                return (
                  <div
                    key={p.seatNumber}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 gap-2 text-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isFemale ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {isFemale ? (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-4.5 10.5C6.12 12.5 5 13.62 5 15v1.5l1.5 5h11l1.5-5V15c0-1.38-1.12-2.5-2.5-2.5h-9z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-5 11c-1.66 0-3 1.34-3 3v4a1 1 0 001 1h14a1 1 0 001-1v-4c0-1.66-1.34-3-3-3H7z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{p.fullName}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-3xs font-extrabold uppercase ${
                              isFemale ? 'bg-pink-500 text-white' : 'bg-blue-600 text-white'
                            }`}
                          >
                            {isFemale ? 'Kadın' : 'Erkek'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          T.C: {p.tcNo} • {p.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-auto">
                      <span className="px-3 py-1 bg-slate-800 text-white rounded-lg text-xs font-extrabold shadow-xs">
                        Koltuk: {p.seatNumber}
                      </span>
                      <span className="font-bold text-slate-700 text-xs">
                        {tripData.pricePerSeat} ₺
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alt Kısım: Ödeme & QR Kod */}
          <div className="p-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                <QrCode className="w-16 h-16 text-slate-800" />
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-800 block text-sm">Hızlı Biniş Karekodu</span>
                <p>Otobüse binerken muavine bu karekodu veya PNR kodunuzu göstermeniz yeterlidir.</p>
                <p className="mt-1 text-slate-400">Ödeme: Kart (•••• {booking.paymentCardLast4})</p>
              </div>
            </div>

            <div className="text-right self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
              <span className="text-xs text-slate-500 block">Tahsil Edilen Toplam Tutar</span>
              <span className="text-2xl font-black text-emerald-600">{totalPrice} ₺</span>
              <span className="text-2xs text-emerald-700 block font-semibold">Ödendi ✓</span>
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları (Yazdırma ve Yeni Bilet) */}
        <div className="print:hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Bileti Yazdır / PDF İndir</span>
          </button>

          <button
            onClick={handleStartNewBooking}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Yeni Sefer Ara</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
