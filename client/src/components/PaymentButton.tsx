'use client';

import { useState } from 'react';

export default function PaymentButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment/create-crypto-payment', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Ödeme linki oluşturulamadı.');
      }

      const data = await response.json();
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error(error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={isLoading}>
      {isLoading ? 'Yönlendiriliyor...' : 'Profesyonel Plana Yükselt (1999 TL)'}
    </button>
  );
}