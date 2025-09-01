'use client';

import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';

export default function PaymentButton() {
  const { user } = useUser(); // O an giriş yapmış kullanıcının bilgilerini alır
  const [isLoadingCrypto, setIsLoadingCrypto] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(false);

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
    if (!user) {
      alert("Lütfen önce giriş yapın.");
      return;
    }
    
    setIsLoadingCard(true);

    // DİKKAT: Shopier panelinden aldığınız ürün linkini buraya yapıştırın!
    const shopierProductUrl = "https://www.shopier.com/ShowProductNew/PRODÜCT_ID_BURAYA"; 
    
    // Kullanıcının kimliğini (Clerk User ID) linke özel bir parametre olarak ekliyoruz
    const finalUrl = `${shopierProductUrl}?platform_order_id=${user.id}`;
    
    // Kullanıcıyı bu akıllı linke yönlendiriyoruz
    window.location.href = finalUrl;
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