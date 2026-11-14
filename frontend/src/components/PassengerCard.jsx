import React, { useState } from 'react';
import { User, CreditCard, Mail, Phone } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { validateTcKimlik, validatePhone, validateEmail, validateFullName } from '../utils/validation';

export default function PassengerCard({ index, passenger, errors = {} }) {
  const { updatePassenger } = useBooking();
  const seatNum = passenger.seatNumber;

  // Gerçek zamanlı (Real-time) doğrulama için state'ler
  const [touched, setTouched] = useState({});
  const [localErrors, setLocalErrors] = useState({});

  // Kullanıcı bir input kutusundan çıktığında (onBlur) çalışacak fonksiyon
  const handleBlur = (field, value) => {
    // 1. Kutucuğa dokunulduğunu işaretle
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    // 2. İlgili kuralı çalıştır
    let check = { isValid: true, message: '' };
    if (field === 'fullName') check = validateFullName(value);
    if (field === 'tcNo') check = validateTcKimlik(value);
    if (field === 'phone') check = validatePhone(value);
    if (field === 'email') check = validateEmail(value);

    // 3. Varsa hatayı local state'e kaydet
    setLocalErrors((prev) => ({
      ...prev,
      [field]: check.isValid ? null : check.message,
    }));
  };

  // Ekranda gösterilecek hatayı belirleme fonksiyonu
  // (Öncelik: En alttaki submit butonundan gelen ana 'errors' prop'u, 
  // yoksa kullanıcının anlık olarak tetiklediği 'localErrors')
  const getError = (field) => {
    return errors[field] || (touched[field] ? localErrors[field] : null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300">
      {/* Kart Başlığı ve Koltuk Rozeti */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              {index + 1}. Yolcu Bilgileri
            </h3>
            <span className="text-xs text-slate-500">Lütfen kimlikteki bilgileri eksiksiz giriniz</span>
          </div>
        </div>

        {/* Koltuk Numarası & Cinsiyet Rozeti */}
        <div className="flex items-center space-x-2">
          <div
            className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide flex items-center space-x-1.5 shadow-xs ${
              passenger.gender === 'F'
                ? 'bg-pink-500 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {passenger.gender === 'F' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-4.5 10.5C6.12 12.5 5 13.62 5 15v1.5l1.5 5h11l1.5-5V15c0-1.38-1.12-2.5-2.5-2.5h-9z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-5 11c-1.66 0-3 1.34-3 3v4a1 1 0 001 1h14a1 1 0 001-1v-4c0-1.66-1.34-3-3-3H7z" />
              </svg>
            )}
            <span>{passenger.gender === 'F' ? 'Kadın Yolcu' : 'Erkek Yolcu'}</span>
          </div>

          <div className="px-3 py-1 bg-slate-800 text-white rounded-lg text-xs font-bold tracking-wide shadow-xs">
            Koltuk No: {seatNum}
          </div>
        </div>
      </div>

      {/* Form Alanları Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ad Soyad */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Ad ve Soyad *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Örn: Ahmet Yılmaz"
              value={passenger.fullName}
              onChange={(e) => updatePassenger(seatNum, 'fullName', e.target.value)}
              onBlur={(e) => handleBlur('fullName', e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-hidden transition-all ${
                getError('fullName')
                  ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
            />
          </div>
          {getError('fullName') && (
            <p className="text-red-500 text-xs mt-1 animate-fade-in">{getError('fullName')}</p>
          )}
        </div>

        {/* T.C. Kimlik No */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            T.C. Kimlik Numarası *
          </label>
          <div className="relative">
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              maxLength={11}
              placeholder="11 haneli T.C. No"
              value={passenger.tcNo}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, '');
                updatePassenger(seatNum, 'tcNo', onlyNums);
              }}
              onBlur={(e) => handleBlur('tcNo', e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-hidden transition-all ${
                getError('tcNo')
                  ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
            />
          </div>
          {getError('tcNo') && (
            <p className="text-red-500 text-xs mt-1 animate-fade-in">{getError('tcNo')}</p>
          )}
        </div>

        {/* Cinsiyet Bilgisi (Koltuk Seçiminden Otomatik Gelir) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Cinsiyet (Koltuk Seçiminde Belirlendi)
          </label>
          <div
            className={`py-2 px-3.5 text-xs font-bold rounded-xl border flex items-center space-x-2 ${
              passenger.gender === 'F'
                ? 'bg-pink-50 border-pink-200 text-pink-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            {passenger.gender === 'F' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-pink-600 shrink-0">
                <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-4.5 10.5C6.12 12.5 5 13.62 5 15v1.5l1.5 5h11l1.5-5V15c0-1.38-1.12-2.5-2.5-2.5h-9z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600 shrink-0">
                <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-5 11c-1.66 0-3 1.34-3 3v4a1 1 0 001 1h14a1 1 0 001-1v-4c0-1.66-1.34-3-3-3H7z" />
              </svg>
            )}
            <span>
              Bu koltuk için <strong>{passenger.gender === 'F' ? 'Kadın Yolcu' : 'Erkek Yolcu'}</strong> seçildi.
            </span>
          </div>
        </div>

        {/* Telefon Numarası */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Cep Telefonu *
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="tel"
              maxLength={14}
              placeholder="05xx xxx xx xx"
              value={passenger.phone}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
                let formatted = raw;
                if (raw.length > 4 && raw.length <= 7) {
                  formatted = `${raw.slice(0, 4)} ${raw.slice(4)}`;
                } else if (raw.length > 7 && raw.length <= 9) {
                  formatted = `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`;
                } else if (raw.length > 9) {
                  formatted = `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7, 9)} ${raw.slice(9)}`;
                }
                updatePassenger(seatNum, 'phone', formatted);
              }}
              onBlur={(e) => handleBlur('phone', e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-hidden transition-all ${
                getError('phone')
                  ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
            />
          </div>
          {getError('phone') && (
            <p className="text-red-500 text-xs mt-1 animate-fade-in">{getError('phone')}</p>
          )}
        </div>

        {/* E-posta Adresi (Tam Genişlik) */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            E-posta Adresi (Bilet bilgilendirmesi için) *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              placeholder="ornek@email.com"
              value={passenger.email}
              onChange={(e) => updatePassenger(seatNum, 'email', e.target.value)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-hidden transition-all ${
                getError('email')
                  ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
            />
          </div>
          {getError('email') && (
            <p className="text-red-500 text-xs mt-1 animate-fade-in">{getError('email')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
