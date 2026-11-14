import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Info, Check, X } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';

// Erkek Silüet İkonu
function MaleIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-5 11c-1.66 0-3 1.34-3 3v4a1 1 0 001 1h14a1 1 0 001-1v-4c0-1.66-1.34-3-3-3H7z" />
    </svg>
  );
}

// Kadın Silüet İkonu
function FemaleIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-4.5 10.5C6.12 12.5 5 13.62 5 15v1.5l1.5 5h11l1.5-5V15c0-1.38-1.12-2.5-2.5-2.5h-9z" />
    </svg>
  );
}

// Koltuk İkonu (Boş durum için)
function SeatArmchairIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
      <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z" />
      <path d="M5 18v3" />
      <path d="M19 18v3" />
    </svg>
  );
}

export default function SeatSelectionPlaceholder() {
  const navigate = useNavigate();
  const { tripData, setTripData, resetLockTimer } = useBooking();

  // Örnek Otobüs Koltuk Düzeni (2+1 formatı)
  // status: 'AVAILABLE' (Boş/Gri), 'OCCUPIED_M' (Dolu Erkek), 'OCCUPIED_F' (Dolu Kadın)
  const busLayout = [
    // Sıra 1
    { seatNumber: 1, row: 1, side: 'single', status: 'AVAILABLE' },
    { seatNumber: 2, row: 1, side: 'double_left', status: 'OCCUPIED_F' },
    { seatNumber: 3, row: 1, side: 'double_right', status: 'AVAILABLE', adjacentGenderConstraint: 'F' }, // Yanı kadın dolu
    // Sıra 2
    { seatNumber: 4, row: 2, side: 'single', status: 'AVAILABLE' },
    { seatNumber: 5, row: 2, side: 'double_left', status: 'OCCUPIED_M' },
    { seatNumber: 6, row: 2, side: 'double_right', status: 'AVAILABLE', adjacentGenderConstraint: 'M' }, // Yanı erkek dolu
    // Sıra 3
    { seatNumber: 7, row: 3, side: 'single', status: 'AVAILABLE' },
    { seatNumber: 8, row: 3, side: 'double_left', status: 'AVAILABLE' },
    { seatNumber: 9, row: 3, side: 'double_right', status: 'AVAILABLE' },
    // Sıra 4
    { seatNumber: 10, row: 4, side: 'single', status: 'AVAILABLE' },
    { seatNumber: 11, row: 4, side: 'double_left', status: 'OCCUPIED_M' },
    { seatNumber: 12, row: 4, side: 'double_right', status: 'AVAILABLE', adjacentGenderConstraint: 'M' },
    // Sıra 5
    { seatNumber: 13, row: 5, side: 'single', status: 'AVAILABLE' },
    { seatNumber: 14, row: 5, side: 'double_left', status: 'AVAILABLE' },
    { seatNumber: 15, row: 5, side: 'double_right', status: 'AVAILABLE' },
  ];

  // Seçilen koltuklar listesi: { seatNumber, gender, genderConstraint }
  // Kullanıcı geri döndüğünde Context'te kayıtlı seçimlerini korur
  const [selectedSeats, setSelectedSeats] = useState(() => {
    if (tripData?.selectedSeats && tripData.selectedSeats.length > 0) {
      return tripData.selectedSeats.map((s) => ({
        seatNumber: s.seatNumber,
        gender: s.gender || (s.genderConstraint === 'F' ? 'F' : 'M'),
        genderConstraint: s.genderConstraint || 'ANY',
      }));
    }
    return [];
  });

  // tripData değiştiğinde (örneğin yeni biletle sıfırlandığında) yerel seçimi güncelle
  React.useEffect(() => {
    if (tripData?.selectedSeats) {
      setSelectedSeats(
        tripData.selectedSeats.map((s) => ({
          seatNumber: s.seatNumber,
          gender: s.gender || (s.genderConstraint === 'F' ? 'F' : 'M'),
          genderConstraint: s.genderConstraint || 'ANY',
        }))
      );
    }
  }, [tripData?.selectedSeats]);

  // Cinsiyet seçimi için açılan mini modal kontrolü
  const [activeGenderModalSeat, setActiveGenderModalSeat] = useState(null);

  const handleSeatClick = (seat) => {
    if (seat.status.startsWith('OCCUPIED')) return;

    const existingIndex = selectedSeats.findIndex((s) => s.seatNumber === seat.seatNumber);

    // Eğer zaten seçiliyse seçimi kaldır
    if (existingIndex > -1) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
      return;
    }

    // Eğer yan koltukta cinsiyet kısıtı varsa (örn: yanı Kadınsa sadece Kadın seçilebilir)
    if (seat.adjacentGenderConstraint) {
      setSelectedSeats([
        ...selectedSeats,
        {
          seatNumber: seat.seatNumber,
          gender: seat.adjacentGenderConstraint,
          genderConstraint: seat.adjacentGenderConstraint,
        },
      ]);
      return;
    }

    // Yan kısıtı yoksa kullanıcıya Erkek mi Kadın mı olduğunu soran modalı aç
    setActiveGenderModalSeat(seat);
  };

  const applyGenderSelection = (gender) => {
    if (!activeGenderModalSeat) return;

    setSelectedSeats([
      ...selectedSeats,
      {
        seatNumber: activeGenderModalSeat.seatNumber,
        gender: gender,
        genderConstraint: activeGenderModalSeat.adjacentGenderConstraint || 'ANY',
      },
    ]);
    setActiveGenderModalSeat(null);
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('Lütfen en az 1 koltuk seçiniz!');
      return;
    }

    // Context'i güncelle (Kullanıcının seçtiği cinsiyet bilgisini de aktar)
    setTripData({
      ...tripData,
      selectedSeats: selectedSeats.map((s) => ({
        seatNumber: s.seatNumber,
        gender: s.gender,
        genderConstraint: s.genderConstraint,
      })),
    });

    // 5 dakikalık kilit süresini başlat
    resetLockTimer(300);

    navigate('/passengers');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header currentStep={1} />

      <main className="max-w-4xl mx-auto px-4 py-8 w-full grow">
        {/* Bilgilendirme Kutusu */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 sm:p-5 mb-8 flex items-start space-x-3 text-indigo-900 text-sm">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Koltuk Seçimi & Cinsiyet Düzeni (2+1 Otobüs Şeması)</h3>
            <p className="text-xs text-indigo-700 mt-1">
              Boş koltuklar <strong>gri</strong> renktedir. Seçim yapıldığında <strong>Erkek için mavi</strong> ve erkek silüeti, <strong>Kadın için pembe</strong> ve kadın silüeti gösterilmektedir.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto">
          {/* Sefer Başlığı */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">{tripData.from} → {tripData.to}</h2>
              <span className="text-xs text-slate-500">{tripData.departureDate} • {tripData.departureTime}</span>
            </div>
            <span className="px-3 py-1 bg-slate-100 font-semibold text-xs text-slate-700 rounded-lg">
              {tripData.busType}
            </span>
          </div>

          {/* Koltuk Renk Açıklaması (Legend) */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-4 bg-slate-50 rounded-xl mb-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-md bg-slate-200 border border-slate-300 inline-block"></span>
              <span>Boş Koltuk</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-md bg-blue-500 border border-blue-600 inline-block"></span>
              <span>Erkek</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-md bg-pink-500 border border-pink-600 inline-block"></span>
              <span>Kadın</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-md bg-slate-400 border border-slate-500 inline-block"></span>
              <span>Dolu Koltuk</span>
            </div>
          </div>

          {/* Otobüs Şeması (2+1 Düzeni) */}
          <div className="bg-slate-100/70 p-6 rounded-3xl border border-slate-200 max-w-xs mx-auto mb-8 shadow-inner">
            <div className="text-center text-3xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              ─── OTOBÜS ÖNÜ (KAPTAN) ───
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((rowNumber) => {
                const singleSeat = busLayout.find((s) => s.row === rowNumber && s.side === 'single');
                const doubleLeft = busLayout.find((s) => s.row === rowNumber && s.side === 'double_left');
                const doubleRight = busLayout.find((s) => s.row === rowNumber && s.side === 'double_right');

                const renderSeatBtn = (seat) => {
                  if (!seat) return <div className="w-12 h-14" />;

                  const selectedInfo = selectedSeats.find((s) => s.seatNumber === seat.seatNumber);
                  const isOccupiedMale = seat.status === 'OCCUPIED_M';
                  const isOccupiedFemale = seat.status === 'OCCUPIED_F';
                  const isOccupied = isOccupiedMale || isOccupiedFemale;

                  // Renk Belirleme
                  let btnStyle = "bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300"; // Varsayılan Boş Gri
                  let icon = <SeatArmchairIcon className="w-4 h-4 text-slate-400" />;

                  if (selectedInfo) {
                    if (selectedInfo.gender === 'M') {
                      btnStyle = "bg-blue-500 border-blue-600 text-white shadow-md ring-2 ring-blue-300 scale-105";
                      icon = <MaleIcon className="w-5 h-5 text-white" />;
                    } else {
                      btnStyle = "bg-pink-500 border-pink-600 text-white shadow-md ring-2 ring-pink-300 scale-105";
                      icon = <FemaleIcon className="w-5 h-5 text-white" />;
                    }
                  } else if (isOccupiedMale) {
                    btnStyle = "bg-blue-200/90 border-blue-300 text-blue-800 cursor-not-allowed opacity-80";
                    icon = <MaleIcon className="w-4 h-4 text-blue-600" />;
                  } else if (isOccupiedFemale) {
                    btnStyle = "bg-pink-200/90 border-pink-300 text-pink-800 cursor-not-allowed opacity-80";
                    icon = <FemaleIcon className="w-4 h-4 text-pink-600" />;
                  }

                  return (
                    <button
                      key={seat.seatNumber}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => handleSeatClick(seat)}
                      className={`w-12 h-14 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative ${btnStyle}`}
                      title={
                        isOccupied
                          ? 'Dolu Koltuk'
                          : selectedInfo
                          ? `Koltuk ${seat.seatNumber} (${selectedInfo.gender === 'M' ? 'Erkek' : 'Kadın'}) - Seçildi`
                          : `Koltuk ${seat.seatNumber} - Boş`
                      }
                    >
                      <span className="text-3xs font-bold leading-tight">{seat.seatNumber}</span>
                      <div className="mt-0.5">{icon}</div>
                    </button>
                  );
                };

                return (
                  <div key={rowNumber} className="flex items-center justify-between">
                    {/* Tekli Koltuk (Sol) */}
                    <div>{renderSeatBtn(singleSeat)}</div>

                    {/* Koridor */}
                    <div className="w-6 border-l border-dashed border-slate-300 h-10 my-auto" />

                    {/* İkili Koltuklar (Sağ) */}
                    <div className="flex items-center space-x-2">
                      {renderSeatBtn(doubleLeft)}
                      {renderSeatBtn(doubleRight)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seçim Özeti ve İlerleme Butonu */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs text-slate-500 font-medium">Seçilen Koltuklar</div>
              <div className="text-sm font-bold text-slate-800">
                {selectedSeats.length > 0 ? (
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      {selectedSeats.map((s) => (
                        <span
                          key={s.seatNumber}
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-bold text-white ${
                            s.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                          }`}
                        >
                          <span>No: {s.seatNumber}</span>
                          {s.gender === 'M' ? <MaleIcon className="w-3 h-3" /> : <FemaleIcon className="w-3 h-3" />}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-indigo-700 font-bold block mt-1">
                      Toplam: {selectedSeats.length * (tripData.pricePerSeat || 650)} ₺
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">Henüz koltuk seçilmedi</span>
                )}
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <span>Yolcu Bilgilerini Doldur</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cinsiyet Seçim Modalı (Serbest koltuk tıklandığında açılır) */}
        {activeGenderModalSeat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-2xl border border-slate-100 text-center">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-800 text-base">Koltuk {activeGenderModalSeat.seatNumber}</span>
                <button
                  onClick={() => setActiveGenderModalSeat(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-5">
                Lütfen bu koltukta seyahat edecek yolcunun cinsiyetini seçiniz:
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => applyGenderSelection('M')}
                  className="py-3 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer hover:scale-105"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <MaleIcon className="w-5 h-5" />
                  </div>
                  <span>Erkek Yolcu</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyGenderSelection('F')}
                  className="py-3 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer hover:scale-105"
                >
                  <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center">
                    <FemaleIcon className="w-5 h-5" />
                  </div>
                  <span>Kadın Yolcu</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

