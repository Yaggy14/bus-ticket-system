import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';

export default function TimeoutModal() {
  const { isLockedExpired, resetLockTimer } = useBooking();
  const navigate = useNavigate();

  if (!isLockedExpired) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-red-100">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10" />
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Koltuk Rezervasyon Süreniz Doldu!
        </h3>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Koltuk kilit süresi (5 dakika) sona erdiği için seçtiğiniz koltuklar sistem tarafından 
          otomatik olarak <strong className="text-red-600">boşa çıkarıldı</strong>. 
          Başkalarının bilet alabilmesi için kilit kaldırılmıştır.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              resetLockTimer(300);
              navigate('/seats');
            }}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Tekrar Koltuk Seçimine Dön
          </button>

          {/* Test Kolaylığı için Buton (Hocaya sunum yaparken süreyi sıfırlamak için harika!) */}
          <button
            onClick={() => resetLockTimer(300)}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>[Demo/Sunum Modu] Süreyi 5 Dk Yenile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
