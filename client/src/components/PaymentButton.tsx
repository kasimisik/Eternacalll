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

  const handleCardPayment = async () => {
    if (!user) {
      alert("Lütfen önce giriş yapın.");
      return;
    }
    
    setIsLoadingCard(true);

    try {
      const response = await fetch('/api/payment/create-shopier-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.emailAddresses[0]?.emailAddress || '',
          userName: user.fullName || 'Kullanıcı'
        })
      });

      if (!response.ok) throw new Error('Shopier ödeme oluşturulamadı.');
      
      const data = await response.json();
      console.log('Shopier API Response:', data);

      if (data.success && data.paymentFormHTML) {
        // Yeni pencerede Shopier ödeme formunu aç
        const paymentWindow = window.open('', '_blank');
        if (paymentWindow) {
          paymentWindow.document.write(data.paymentFormHTML);
          paymentWindow.document.close();
        } else {
          alert('Pop-up engellenmiş olabilir. Lütfen pop-up izinlerini etkinleştirin.');
        }
      } else {
        alert('Ödeme linki oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error(error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoadingCard(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button 
        onClick={handleCardPayment} 
        disabled={isLoadingCard || isLoadingCrypto}
        className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <span>{isLoadingCard ? 'Yönlendiriliyor...' : '💳 Kredi Kartı ile Öde'}</span>
      </button>
      <button 
        onClick={handleCryptoPayment} 
        disabled={isLoadingCrypto || isLoadingCard}
        className="flex items-center justify-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        <span>{isLoadingCrypto ? 'Yönlendiriliyor...' : '₿ Kripto ile Öde'}</span>
      </button>
    </div>
  );
}