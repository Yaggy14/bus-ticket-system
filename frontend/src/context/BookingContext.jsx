import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Context'i oluşturuyoruz (Merkezi Veri Havuzu)
const BookingContext = createContext();

// Şimdilik Team Member 2 henüz koltuk ekranını bağlamadığı için
// test edebileceğimiz gerçekçi bir "Örnek Sefer ve Koltuk" verisi tanımlıyoruz.
const INITIAL_MOCK_TRIP = {
  tripId: 'TRP-2026-3406',
  companyName: 'Pamukkale Turizm',
  busPlate: '34 PK 1923',
  busType: '2+1 Rahat Hat',
  from: 'İstanbul (Esenler Otogarı)',
  to: 'Ankara (AŞTİ)',
  departureDate: '15 Ekim 2026',
  departureTime: '14:30',
  estimatedDuration: '5 saat 30 dk',
  pricePerSeat: 650, // TL
  // Kullanıcının TM2 ekranında seçtiğini varsaydığımız koltuklar:
  selectedSeats: [
    { seatNumber: 12, genderConstraint: 'M' }, // Yan koltuk kuralı: Erkek
    { seatNumber: 13, genderConstraint: 'ANY' }, // Serbest koltuk
  ],
  // 5 dakikalık kilit süresi (milisaniye cinsinden bitiş zamanı)
  lockExpiresAt: Date.now() + 5 * 60 * 1000, 
};

// 2. Provider Bileşeni: Bu bileşen tüm uygulamayı saracak ve verileri dağıtacak
export function BookingProvider({ children }) {
  // 1. STATE BAŞLATMA (Initialization)
  // Tarayıcı hafızasını (sessionStorage) kontrol ederek başlar.
  const [tripData, setTripData] = useState(() => {
    const saved = sessionStorage.getItem('tripData');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_TRIP;
  });

  const [passengers, setPassengers] = useState(() => {
    const saved = sessionStorage.getItem('passengers');
    if (saved) return JSON.parse(saved);
    // İlk kez açılıyorsa boş yolcu listesi oluştur
    return INITIAL_MOCK_TRIP.selectedSeats.map((seat) => ({
      seatNumber: seat.seatNumber,
      genderConstraint: seat.genderConstraint,
      fullName: '',
      tcNo: '',
      gender: seat.genderConstraint === 'M' ? 'M' : seat.genderConstraint === 'F' ? 'F' : 'M',
      email: '',
      phone: '',
    }));
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem('timeLeft');
    return saved ? JSON.parse(saved) : 300; // 300 saniye = 5 dk
  });

  const [isLockedExpired, setIsLockedExpired] = useState(() => {
    const saved = sessionStorage.getItem('isLockedExpired');
    return saved ? JSON.parse(saved) : false;
  });

  const [confirmedBooking, setConfirmedBooking] = useState(() => {
    const saved = sessionStorage.getItem('confirmedBooking');
    return saved ? JSON.parse(saved) : null;
  });

  // 2. OTOMATİK KAYIT MEKANİZMASI (Auto-Save)
  useEffect(() => {
    sessionStorage.setItem('tripData', JSON.stringify(tripData));
    sessionStorage.setItem('passengers', JSON.stringify(passengers));
    sessionStorage.setItem('timeLeft', JSON.stringify(timeLeft));
    sessionStorage.setItem('isLockedExpired', JSON.stringify(isLockedExpired));
    sessionStorage.setItem('confirmedBooking', JSON.stringify(confirmedBooking));
  }, [tripData, passengers, timeLeft, isLockedExpired, confirmedBooking]);

  // 3. KOLTUKLAR DEĞİŞTİĞİNDE YOLCU LİSTESİNİ SENKRONİZE ETME (Bug Fix)
  // Koltuk seçim sayfasında (TM2) yeni koltuk seçilirse veya iptal edilirse, 
  // yolcu formlarının sayısını ve verilerini ona göre ayarlar.
  useEffect(() => {
    setPassengers((prevPassengers) => {
      // Seçilen koltuklara göre yeni yolcu listesi oluştur
      return tripData.selectedSeats.map((seat) => {
        // Eğer bu koltuk önceden varsa (isim vs. yazılmışsa) onun verisini koru
        const existingPassenger = prevPassengers.find(p => p.seatNumber === seat.seatNumber);
        const determinedGender = seat.gender || (seat.genderConstraint === 'M' ? 'M' : seat.genderConstraint === 'F' ? 'F' : 'M');

        if (existingPassenger) {
          return {
            ...existingPassenger,
            gender: seat.gender || existingPassenger.gender || determinedGender,
            genderConstraint: seat.genderConstraint,
          };
        }
        // Yepyeni seçilmiş bir koltuksa koltuk seçimindeki cinsiyeti aktar
        return {
          seatNumber: seat.seatNumber,
          genderConstraint: seat.genderConstraint,
          fullName: '',
          tcNo: '',
          gender: determinedGender,
          email: '',
          phone: '',
        };
      });
    });
  }, [tripData.selectedSeats]);

  // Kilit Süresi Sayacı (Timeout Logic)
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsLockedExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLockedExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup: Bileşen ekrandan kalkarsa sayacı durdur
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Tek bir yolcunun bilgisini güncelleme fonksiyonu
  const updatePassenger = (seatNumber, field, value) => {
    setPassengers((prevPassengers) =>
      prevPassengers.map((p) =>
        p.seatNumber === seatNumber ? { ...p, [field]: value } : p
      )
    );
  };

  // Toplam Tutar Hesaplama
  const totalPrice = passengers.length * (tripData?.pricePerSeat || 0);

  // Süreyi sıfırlama veya yeni kilit alma (örnek butonlar için)
  const resetLockTimer = (newDurationSeconds = 300) => {
    setTimeLeft(newDurationSeconds);
    setIsLockedExpired(false);
  };

  // Yeni sefer/biletleme için state'i sıfırlama fonksiyonu
  const resetBooking = () => {
    setTripData({ ...INITIAL_MOCK_TRIP, selectedSeats: [] });
    setPassengers([]);
    setTimeLeft(300);
    setIsLockedExpired(false);
    setConfirmedBooking(null);
    sessionStorage.removeItem('confirmedBooking');
    sessionStorage.removeItem('passengers');
    sessionStorage.removeItem('tripData');
  };

  return (
    <BookingContext.Provider
      value={{
        tripData,
        setTripData,
        passengers,
        updatePassenger,
        totalPrice,
        timeLeft,
        isLockedExpired,
        resetLockTimer,
        resetBooking,
        confirmedBooking,
        setConfirmedBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

// 3. Kolay kullanım için Custom Hook
export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking mutlaka BookingProvider içinde kullanılmalıdır!');
  }
  return context;
}
