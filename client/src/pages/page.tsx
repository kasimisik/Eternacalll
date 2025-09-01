import PaymentButton from '@/components/PaymentButton';

export default function DashboardPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Kullanıcı Paneli</h1>
      <p>Hoş geldiniz! Mevcut planınızı buradan yükseltebilirsiniz.</p>
      <div style={{ marginTop: '2rem' }}>
        <PaymentButton />
      </div>
    </main>
  );
}