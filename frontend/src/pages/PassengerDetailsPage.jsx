import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';
import PassengerCard from '../components/PassengerCard';
import TripSummaryCard from '../components/TripSummaryCard';
import TimeoutModal from '../components/TimeoutModal';
import {
  validateTcKimlik,
  validatePhone,
  validateEmail,
  validateFullName,
} from '../utils/validation';

export default function PassengerDetailsPage() {
  const navigate = useNavigate();
  const { passengers } = useBooking();

  // Her yolcunun hatalarını koltuk numarasına göre tutan state nesnesi
  // Örn: { 12: { fullName: 'Hata...', tcNo: 'Hata...' } }
  const [errors, setErrors] = useState({});

  if (!passengers || passengers.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header currentStep={2} />
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Henüz Koltuk Seçilmedi</h3>
            <p className="text-xs text-slate-500 mb-6">Yolcu bilgilerini girmeden önce lütfen seyahat edeceğiniz koltukları seçiniz.</p>
            <button
              onClick={() => navigate('/seats')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Koltuk Seçimine Git
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Form Doğrulama (Validation) Mantığı
  const handleProceedToCheckout = (e) => {
    e.preventDefault();

    const newErrors = {};
    let hasError = false;

    passengers.forEach((passenger) => {
      const passengerErrors = {};

      // 1. Ad Soyad Kontrolü
      const nameCheck = validateFullName(passenger.fullName);
      if (!nameCheck.isValid) passengerErrors.fullName = nameCheck.message;

      // 2. TC Kimlik No Algoritmik Kontrolü
      const tcCheck = validateTcKimlik(passenger.tcNo);
      if (!tcCheck.isValid) passengerErrors.tcNo = tcCheck.message;

      // 3. Telefon Kontrolü
      const phoneCheck = validatePhone(passenger.phone);
      if (!phoneCheck.isValid) passengerErrors.phone = phoneCheck.message;

      // 4. E-posta Kontrolü
      const emailCheck = validateEmail(passenger.email);
      if (!emailCheck.isValid) passengerErrors.email = emailCheck.message;

      // 5. Cinsiyet Kısıt Kontrolü
      if (passenger.genderConstraint === 'M' && passenger.gender !== 'M') {
        passengerErrors.gender = 'Yan koltuk kuralı gereği erkek seçilmelidir.';
      } else if (passenger.genderConstraint === 'F' && passenger.gender !== 'F') {
        passengerErrors.gender = 'Yan koltuk kuralı gereği kadın seçilmelidir.';
      }

      if (Object.keys(passengerErrors).length > 0) {
        newErrors[passenger.seatNumber] = passengerErrors;
        hasError = true;
      }
    });

    setErrors(newErrors);

    if (hasError) {
      // Hata varsa kullanıcıyı uyar
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Her şey geçerliyse Ödeme & Onay sayfasına yönlendir
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 2. Adım: Yolcu Bilgileri Başlığı */}
      <Header currentStep={2} />

      <main className="max-w-6xl mx-auto px-4 py-8 w-full grow">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Yolcu ve İletişim Bilgileri</h2>
          <p className="text-sm text-slate-500 mt-1">
            Biletlerinizin adınıza düzenlenebilmesi için lütfen her koltuk için yolcu bilgilerini giriniz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Sütun: Yolcu Kartları Formu */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleProceedToCheckout} className="space-y-6">
              {passengers.map((passenger, index) => (
                <PassengerCard
                  key={passenger.seatNumber}
                  index={index}
                  passenger={passenger}
                  errors={errors[passenger.seatNumber] || {}}
                />
              ))}

              {/* Alt Butonlar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => navigate('/seats')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Koltuk Seçimine Dön</span>
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <span>Ödemeye ve Özete İlerle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Sağ Sütun: Sefer ve Fiyat Özeti */}
          <div className="lg:col-span-1">
            <TripSummaryCard />
          </div>
        </div>
      </main>

      {/* Süre Dolduğunda Açılan Modal */}
      <TimeoutModal />
    </div>
  );
}
