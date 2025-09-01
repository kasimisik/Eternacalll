'use client';

import { useState } from 'react';

export default function PaymentButton() {
  const [isLoadingCrypto, setIsLoadingCrypto] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(false);

  const shopierLink = 'https://www.shopier.com/39003278';

  const handleCryptoPayment = async () => {
    setIsLoadingCrypto(true);
    try {
      const response = await fetch('/api/payment/create-crypto-payment', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Kripto ödeme linki oluşturulamadı.');
      const data = await response.json();
      console.log('API Response:', data);
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert('Ödeme linki alınamadı. Lütfen tekrar deneyin.');
        setIsLoadingCrypto(false);
      }
    } catch (error) {
      console.error(error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
      setIsLoadingCrypto(false);
    }
  };

  const handleCardPayment = () => {
    setIsLoadingCard(true);
    window.location.href = shopierLink;
  };

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <button onClick={handleCardPayment} disabled={isLoadingCard || isLoadingCrypto}>
        {isLoadingCard ? 'Yönlendiriliyor...' : 'Kredi Kartı ile Öde'}
      </button>
      <button onClick={handleCryptoPayment} disabled={isLoadingCrypto || isLoadingCard}>
        {isLoadingCrypto ? 'Yönlendiriliyor...' : 'Kripto ile Öde'}
      </button>
    </div>
  );
}