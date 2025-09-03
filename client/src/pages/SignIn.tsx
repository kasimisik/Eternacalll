import { SignInPage } from "@/components/ui/sign-in";
import { useLocation } from 'wouter';

const sampleTestimonials = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Ahmet Yılmaz",
    handle: "@ahmetyilmaz",
    text: "AI sesli asistanımızı kullanmaya başladığımızdan beri müşteri memnuniyetimiz %80 arttı. Gerçekten çok etkileyici bir teknoloji!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    name: "Zeynep Demir",
    handle: "@zeynepdemir",
    text: "SIP entegrasyonu sayesinde mevcut telefon sistemimizi değiştirmeden AI'dan faydalanmaya başladık. Kurulum çok kolaydı."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    name: "Mehmet Kaya",
    handle: "@mehmetkaya",
    text: "Azure Speech Services ile Türkçe konuşma tanıma kalitesi mükemmel. Müşterilerimiz robotla değil, gerçek bir kişiyle konuştuğunu düşünüyor."
  },
];

export default function SignInPageDemo() {
  const [, setLocation] = useLocation();

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sign In submitted:", data);
    
    // Simulate successful login and redirect to dashboard
    setLocation('/dashboard');
  };

  const handleGoogleSignIn = () => {
    console.log("Continue with Google clicked");
    // Simulate Google login and redirect to dashboard
    setLocation('/dashboard');
  };

  const handleResetPassword = () => {
    alert("Şifre sıfırlama isteği gönderildi. E-posta adresinizi kontrol edin.");
  };

  const handleCreateAccount = () => {
    setLocation('/sign-up');
  };

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        title={<span className="font-light text-foreground tracking-tighter">Hoş Geldiniz</span>}
        description="Hesabınıza giriş yapın ve AI sesli asistan deneyiminize devam edin"
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={sampleTestimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
}