import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ShieldCheck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';
import TripSummaryCard from '../components/TripSummaryCard';
import TimeoutModal from '../components/TimeoutModal';
import ThreeDSecureModal from '../components/ThreeDSecureModal';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { tripData, passengers, totalPrice, isLockedExpired, setConfirmedBooking } = useBooking();

  // Kredi Kartı Form State'i
  const [cardInfo, setCardInfo] = useState({
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [paymentErrors, setPaymentErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // 3D Secure Modal State
  const [show3DModal, setShow3DModal] = useState(false);

  // Kart numarasını 4 haneli bloklar halinde formatlama (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardInfo({ ...cardInfo, cardNumber: formatted });
  };

  // Son kullanma tarihini MM/YY formatlama
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardInfo({ ...cardInfo, expiryDate: value });
  };

  // 1. ADIM: FORM DOĞRULAMA (Butona basınca çalışır)
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setServerError('');

    if (isLockedExpired) {
      setServerError('Koltuk kilit süreniz dolduğu için işlem tamamlanamıyor.');
      return;
    }

    // Basit Kart Validasyonu
    const errs = {};
    if (!cardInfo.cardHolder.trim()) errs.cardHolder = 'Kart üzerindeki isim gereklidir.';
    if (cardInfo.cardNumber.replace(/\s/g, '').length !== 16) {
      errs.cardNumber = 'Kart numarası 16 haneli olmalıdır.';
    }
    if (!/^\d{2}\/\d{2}$/.test(cardInfo.expiryDate)) {
      errs.expiryDate = 'AA/YY formatında giriniz.';
    }
    if (cardInfo.cvv.length < 3) errs.cvv = 'CVV 3 hane olmalıdır.';

    if (Object.keys(errs).length > 0) {
      setPaymentErrors(errs);
      return;
    }

    setPaymentErrors({});
    
    // Her şey doğruysa 3D Secure ekranını aç!
    setShow3DModal(true);
  };

  // 2. ADIM: 3D SECURE ONAYLANDIKTAN SONRA (Backend'e İstek Atma)
  const finalizeBooking = async () => {
    setShow3DModal(false);
    setIsSubmitting(true);

    // Team Member 1'in Backend API'sine gönderilecek veri paketi
    const payload = {
      tripId: tripData.tripId,
      selectedSeats: passengers.map((p) => p.seatNumber),
      passengers: passengers.map((p) => ({
        seatNumber: p.seatNumber,
        fullName: p.fullName,
        tcNo: p.tcNo,
        gender: p.gender,
        email: p.email,
        phone: p.phone,
      })),
      totalPrice: totalPrice,
      paymentDetails: {
        cardHolder: cardInfo.cardHolder,
        last4Digits: cardInfo.cardNumber.slice(-4),
      },
    };

    try {
      // 1. Gerçek Backend'e istek atmayı dene (Team Member 1'in API'si)
      const response = await fetch('http://localhost:5000/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Rezervasyon oluşturulurken bir hata oluştu.');
      }

      const responseData = await response.json();
      setConfirmedBooking(responseData);
      navigate('/confirmation');
    } catch (err) {
      // 2. Eğer backend henüz çalışmıyorsa veya offline ise (Geliştirme & Sunum Modu)
      console.warn('Backend henüz aktif değil. Simüle edilmiş PNR üretiliyor:', err.message);

      const mockPnr = 'PNR-' + Math.floor(100000 + Math.random() * 900000);
      const confirmedData = {
        bookingId: mockPnr,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        trip: tripData,
        passengers: passengers,
        totalPrice: totalPrice,
        paymentCardLast4: cardInfo.cardNumber.slice(-4) || '4242',
      };

      setTimeout(() => {
        setIsSubmitting(false);
        setConfirmedBooking(confirmedData);
        navigate('/confirmation');
      }, 1000);
    }
  };

  // İlk yolcunun numarasını 3D ekrana göndermek için al
  const primaryPhone = passengers.length > 0 ? passengers[0].phone : '';

  // Kart Markası Tespiti (Canlı Logo Tanıma)
  const cleanCard = cardInfo.cardNumber.replace(/\s/g, '');
  const isVisa = cleanCard.startsWith('4');
  const isMastercard = /^(5[1-5]|2[2-7])/.test(cleanCard);
  const isTroy = cleanCard.startsWith('9792');

  if (!passengers || passengers.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header currentStep={3} />
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Henüz Koltuk Seçilmedi</h3>
            <p className="text-xs text-slate-500 mb-6">Ödeme adımına geçmeden önce lütfen en az bir koltuk seçiniz.</p>
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


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header currentStep={3} />

      <main className="max-w-6xl mx-auto px-4 py-8 w-full grow">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Ödeme ve Rezervasyon Onayı</h2>
          <p className="text-sm text-slate-500 mt-1">
            Bilgilerinizi kontrol ediniz ve güvenli ödeme adımını tamamlayınız.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Sütun: Yolcu Özeti ve Ödeme Formu */}
          <div className="lg:col-span-2 space-y-6">
            {/* Yolcu Kontrol Listesi */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-slate-800 text-base mb-3">Yolcu ve Koltuk Dağılımı</h3>
              <div className="divide-y divide-slate-100">
                {passengers.map((p) => {
                  const isFemale = p.gender === 'F';
                  return (
                    <div key={p.seatNumber} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                            isFemale ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {isFemale ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-4.5 10.5C6.12 12.5 5 13.62 5 15v1.5l1.5 5h11l1.5-5V15c0-1.38-1.12-2.5-2.5-2.5h-9z" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-5 11c-1.66 0-3 1.34-3 3v4a1 1 0 001 1h14a1 1 0 001-1v-4c0-1.66-1.34-3-3-3H7z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800">{p.fullName || 'İsimsiz'}</span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-3xs font-extrabold uppercase ${
                                isFemale ? 'bg-pink-500 text-white' : 'bg-blue-600 text-white'
                              }`}
                            >
                              {isFemale ? 'Kadın' : 'Erkek'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">T.C: {p.tcNo} • Tel: {p.phone}</p>
                        </div>
                      </div>

                      <span className="px-3 py-1 bg-slate-800 text-white font-bold rounded-lg text-xs shadow-xs">
                        Koltuk No: {p.seatNumber}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Güvenli Ödeme Kartı */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Güvenli Kredi Kartı Ödemesi</h3>
                    <p className="text-xs text-slate-500">256-Bit SSL Sertifikalı Şifreli Altyapı</p>
                  </div>
                </div>
                {/* Sadece kart numarası girildiğinde ilgili logo görünür */}
                <div className="min-h-7 flex items-center">
                  {isVisa && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-black tracking-wider shadow-xs animate-fade-in ring-2 ring-blue-200">
                      VISA
                    </span>
                  )}
                  {isMastercard && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-black tracking-wider shadow-xs animate-fade-in ring-2 ring-amber-200">
                      Mastercard
                    </span>
                  )}
                  {isTroy && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-teal-600 text-white text-xs font-black tracking-wider shadow-xs animate-fade-in ring-2 ring-teal-200">
                      TROY
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {/* Kart Üzerindeki İsim */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kart Üzerindeki İsim
                  </label>
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    value={cardInfo.cardHolder}
                    onChange={(e) => setCardInfo({ ...cardInfo, cardHolder: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  {paymentErrors.cardHolder && (
                    <p className="text-red-500 text-xs mt-1">{paymentErrors.cardHolder}</p>
                  )}
                </div>

                {/* Kart Numarası */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kart Numarası
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={cardInfo.cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm font-mono tracking-wider rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  {paymentErrors.cardNumber && (
                    <p className="text-red-500 text-xs mt-1">{paymentErrors.cardNumber}</p>
                  )}
                </div>

                {/* Son Kullanma & CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Son Kullanma Tarihi
                    </label>
                    <input
                      type="text"
                      placeholder="AA/YY"
                      value={cardInfo.expiryDate}
                      onChange={handleExpiryChange}
                      className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    {paymentErrors.expiryDate && (
                      <p className="text-red-500 text-xs mt-1">{paymentErrors.expiryDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Güvenlik Kodu (CVV)
                    </label>
                    <input
                      type="password"
                      maxLength={3}
                      placeholder="•••"
                      value={cardInfo.cvv}
                      onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    {paymentErrors.cvv && (
                      <p className="text-red-500 text-xs mt-1">{paymentErrors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Alt Aksiyon Butonları */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate('/passengers')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Yolcu Bilgilerine Dön</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || isLockedExpired}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Bilet Onaylanıyor...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{totalPrice} ₺ Ödemeyi Tamamla ve Onayla</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sağ Sütun: Sefer & Tutar Özeti */}
          <div className="lg:col-span-1">
            <TripSummaryCard />
          </div>
        </div>
      </main>

      <TimeoutModal />
      
      {/* ŞOV KISMI: 3D Secure Doğrulama Ekranı */}
      <ThreeDSecureModal 
        isOpen={show3DModal} 
        onClose={() => setShow3DModal(false)} 
        onSuccess={finalizeBooking}
        phoneNumber={primaryPhone}
        totalPrice={totalPrice}
        cardLast4={cardInfo.cardNumber.slice(-4) || '••••'}
      />
    </div>
  );
}
