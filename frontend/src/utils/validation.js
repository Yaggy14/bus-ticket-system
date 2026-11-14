/**
 * validation.js - Form Doğrulama Yardımcı Fonksiyonları
 * 
 * Bu dosyadaki fonksiyonlar raporunda "Veri Bütünlüğü ve Validasyon Kuralları"
 * başlığı altında sunabileceğin gerçek algoritmaları içerir.
 */

/**
 * Türkiye Cumhuriyeti Kimlik Numarası Algoritmik Doğrulaması
 * Kurallar:
 * 1. 11 hanelidir.
 * 2. İlk hane '0' olamaz.
 * 3. 1, 3, 5, 7 ve 9. hanelerin toplamının 7 katından, 2, 4, 6 ve 8. hanelerin toplamı çıkarıldığında,
 *    elde edilen sonucun 10'a bölümünden kalan (mod 10) 10. haneyi verir.
 * 4. İlk 10 hanenin toplamının 10'a bölümünden kalan 11. haneyi verir.
 */
export function validateTcKimlik(tc) {
  if (!tc) return { isValid: false, message: 'T.C. Kimlik Numarası boş bırakılamaz.' };

  const str = String(tc).trim();

  if (!/^\d{11}$/.test(str)) {
    return { isValid: false, message: 'T.C. Kimlik No tam 11 haneli rakamlardan oluşmalıdır.' };
  }

  if (str[0] === '0') {
    return { isValid: false, message: 'T.C. Kimlik No ilk hanesi 0 olamaz.' };
  }

  const digits = str.split('').map(Number);

  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  const digit10 = ((oddSum * 7) - evenSum) % 10;
  // Negatif modülüsü düzelt
  const normalizedDigit10 = (digit10 + 10) % 10;

  if (normalizedDigit10 !== digits[9]) {
    return { isValid: false, message: 'Geçersiz T.C. Kimlik Numarası (Algoritma hatası).' };
  }

  const first10Sum = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
  if (first10Sum % 10 !== digits[10]) {
    return { isValid: false, message: 'Geçersiz T.C. Kimlik Numarası (Kontrol basamağı uyuşmuyor).' };
  }

  return { isValid: true, message: '' };
}

/**
 * Telefon Numarası Format Kontrolü (05XX XXX XX XX formatı)
 */
export function validatePhone(phone) {
  if (!phone) return { isValid: false, message: 'Telefon numarası zorunludur.' };

  // Boşlukları ve tireleri temizle
  const cleanPhone = phone.replace(/\D/g, '');

  // 10 haneli (5xx...) veya 11 haneli (05xx...) kontrolü
  if (!/^(0?5\d{9})$/.test(cleanPhone)) {
    return { isValid: false, message: 'Geçerli bir cep telefonu giriniz (Örn: 05xx xxx xx xx).' };
  }

  return { isValid: true, message: '' };
}

/**
 * E-posta Adresi Kontrolü
 */
export function validateEmail(email) {
  if (!email) return { isValid: false, message: 'E-posta adresi zorunludur.' };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Lütfen geçerli bir e-posta adresi giriniz.' };
  }

  return { isValid: true, message: '' };
}

/**
 * Ad Soyad Kontrolü (En az 2 kelime, Türkçe karakter destekli)
 */
export function validateFullName(name) {
  if (!name || name.trim().length < 3) {
    return { isValid: false, message: 'Ad ve Soyad en az 3 karakter olmalıdır.' };
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) {
    return { isValid: false, message: 'Lütfen hem adınızı hem de soyadınızı giriniz.' };
  }

  return { isValid: true, message: '' };
}
