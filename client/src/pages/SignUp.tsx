import { SignUpPage } from "@/components/ui/sign-up";
import { useLocation } from 'wouter';

const sampleTestimonials = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    name: "Fatma Özkan",
    handle: "@fatmaozkan",
    text: "24/7 müşteri destek hizmetimizi otomatikleştirdik. Artık gece yarısı bile müşterilerimize anında yanıt verebiliyoruz."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    name: "Can Erdoğan",
    handle: "@canerdogan",
    text: "Anthropic Claude'nin doğal konuşma yeteneği inanılmaz. Müşteriler bot olduğunu anlamıyor bile!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Ahmet Yılmaz",
    handle: "@ahmetyilmaz",
    text: "AI sesli asistanımızı kullanmaya başladığımızdan beri müşteri memnuniyetimiz %80 arttı."
  },
];

export default function SignUpPageDemo() {
  const [, setLocation] = useLocation();

  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sign Up submitted:", data);
    
    // Simulate successful registration and redirect to dashboard
    setLocation('/dashboard');
  };

  const handleGoogleSignUp = () => {
    console.log("Continue with Google clicked");
    // Simulate Google signup and redirect to dashboard
    setLocation('/dashboard');
  };

  const handleResetPassword = () => {
    alert("Şifre sıfırlama isteği gönderildi. E-posta adresinizi kontrol edin.");
  };

  const handleSignIn = () => {
    setLocation('/sign-in');
  };

  return (
    <div className="bg-background text-foreground">
      <SignUpPage
        title={<span className="font-light text-foreground tracking-tighter">Hesap Oluşturun</span>}
        description="AI sesli asistan deneyiminize hemen başlayın - ücretsiz hesap oluşturun"
        heroImageSrc="https://images.unsplash.com/photo-1661956602116-aa6865609028?w=2160&q=80"
        testimonials={sampleTestimonials}
        onSignUp={handleSignUp}
        onGoogleSignUp={handleGoogleSignUp}
        onResetPassword={handleResetPassword}
        onSignIn={handleSignIn}
      />
    </div>
  );
}