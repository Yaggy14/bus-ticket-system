import React, { useState, useEffect } from 'react';
import { ShieldCheck, Smartphone, Loader2, KeyRound, X } from 'lucide-react';

export default function ThreeDSecureModal({ isOpen, onClose, onSuccess, phoneNumber, totalPrice, cardLast4 }) {
  // Adım 1: Bankaya Bağlanıyor (Yükleniyor)
  // Adım 2: SMS Kodu Bekleniyor
  // Adım 3: Şifre Doğrulanıyor
  const [step, setStep] = useState(1); 
  const [smsCode, setSmsCode] = useState('');
  const [error, setError] = useState('');

  // Telefon numarasını maskele (KVKK uyumu)
  // Örn: 05551234567 -> 0555 *** ** 67
  const maskedPhone = phoneNumber 
    ? `${phoneNumber.slice(0, 4)} *** ** ${phoneNumber.slice(-2)}` 
    : '05** *** ** **';

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSmsCode('');
      setError('');
      
      // 1.5 saniye bankaya bağlanma simülasyonu
      const timer = setTimeout(() => setStep(2), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (smsCode.length !== 6) {
      setError('Lütfen 6 haneli şifreyi eksiksiz giriniz.');
      return;
    }
    
    setStep(3); // Doğrulama animasyonuna geç
    setError('');

    // 1.5 saniye şifre doğrulama simülasyonu
    setTimeout(() => {
      // Test kolaylığı için şifreyi 123456 yaptık
      if (smsCode === '123456') {
        onSuccess();
      } else {
        setError('Hatalı SMS şifresi girdiniz. (Demo şifresi: 123456)');
        setStep(2); // Şifre ekranına geri dön
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        
        {/* Banka Logosu ve Kapatma Butonu */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm">3D Secure Doğrulama</span>
          </div>
          <button onClick={onClose} disabled={step === 3} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <h3 className="font-bold text-slate-800">Bankanıza Bağlanılıyor...</h3>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Lütfen bekleyiniz, güvenli işlem penceresi açılıyor.
              </p>
            </div>
          )}

          {step >= 2 && (
            <div className="animate-fade-in">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8" />
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg">SMS Şifresi Gönderildi</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  İşlemi tamamlamak için <strong className="text-slate-800">{maskedPhone}</strong> numaralı telefonunuza gönderilen 6 haneli şifreyi giriniz.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">İşlem Tutarı:</span>
                  <span className="font-bold text-indigo-700">{totalPrice} ₺</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kredi Kartı:</span>
                  <span className="font-semibold text-slate-700">•••• {cardLast4}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4 relative">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Şifre: 123456"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                    disabled={step === 3}
                    className={`w-full pl-11 pr-4 py-3 text-lg font-mono tracking-widest text-center rounded-xl border focus:outline-hidden transition-colors ${
                      error ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-slate-300 focus:border-indigo-500 bg-white'
                    }`}
                  />
                  {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={step === 3}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all"
                >
                  {step === 3 ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Şifre Onaylanıyor...</span>
                    </>
                  ) : (
                    <span>Onayla ve Öde</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
