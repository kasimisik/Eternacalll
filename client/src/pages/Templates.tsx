import React from "react";
import { GlowCard } from "@/components/ui/spotlight-card";
import CardFlip from "@/components/ui/flip-card";

const templateData = [
  { 
    id: 1, 
    title: "İş Sohbet Asistanı", 
    subtitle: "Profesyonel iş iletişimi", 
    description: "İş ortamlarında etkili iletişim kurun ve profesyonel görüşmeler gerçekleştirin",
    features: ["Mesleki Dil", "İş Protokolü", "Toplantı Yönetimi", "E-posta Yazımı"],
    glowColor: "blue" as const,
    color: "#3b82f6"
  },
  { 
    id: 2, 
    title: "Müşteri Destek Uzmanı", 
    subtitle: "7/24 müşteri yardımı", 
    description: "Müşteri memnuniyetini artıran profesyonel destek hizmeti sunun",
    features: ["Anında Yanıt", "Problem Çözme", "Empati Kurma", "Çözüm Odaklı"],
    glowColor: "green" as const,
    color: "#10b981"
  },
  { 
    id: 3, 
    title: "Satış Danışmanı", 
    subtitle: "AI destekli satış görüşmeleri", 
    description: "Etkili satış stratejileri ile müşteri dönüşüm oranlarınızı artırın",
    features: ["İkna Teknikleri", "Müşteri Analizi", "Kapatma Stratejisi", "Değer Sunumu"],
    glowColor: "purple" as const,
    color: "#8b5cf6"
  },
  { 
    id: 4, 
    title: "Teknik Destek Uzmanı", 
    subtitle: "Uzman teknik yardım", 
    description: "Karmaşık teknik sorunları basit şekilde açıklayın ve çözüm sunun",
    features: ["Teknik Bilgi", "Adım Adım Rehber", "Hata Teşhisi", "Uzaktan Yardım"],
    glowColor: "red" as const,
    color: "#ef4444"
  },
  { 
    id: 5, 
    title: "Pazarlama Asistanı", 
    subtitle: "Yaratıcı pazarlama çözümleri", 
    description: "Etkili pazarlama stratejileri ve yaratıcı kampanya fikirleri geliştirin",
    features: ["Kampanya Fikirleri", "Sosyal Medya", "İçerik Üretimi", "Hedef Kitle"],
    glowColor: "orange" as const,
    color: "#f97316"
  },
  { 
    id: 6, 
    title: "Kişisel Antrenör", 
    subtitle: "Fitness ve sağlık rehberi", 
    description: "Kişiselleştirilmiş antrenman programları ve beslenme önerileri",
    features: ["Antrenman Planı", "Beslenme Rehberi", "Motivasyon", "İlerleme Takibi"],
    glowColor: "blue" as const,
    color: "#0ea5e9"
  },
  { 
    id: 7, 
    title: "Dil Öğretmeni", 
    subtitle: "İnteraktif dil öğrenimi", 
    description: "Etkili dil öğrenme teknikleri ve konuşma pratiği",
    features: ["Konuşma Pratiği", "Gramer Kuralları", "Kelime Hazinesi", "Telaffuz"],
    glowColor: "green" as const,
    color: "#059669"
  },
  { 
    id: 8, 
    title: "Mali Müşavir", 
    subtitle: "Akıllı finansal planlama", 
    description: "Kişisel bütçe yönetimi ve yatırım önerileri",
    features: ["Bütçe Planlama", "Yatırım Tavsiyeleri", "Vergi Optimizasyonu", "Risk Analizi"],
    glowColor: "purple" as const,
    color: "#7c3aed"
  },
  { 
    id: 9, 
    title: "Seyahat Rehberi", 
    subtitle: "Kişiselleştirilmiş seyahat planlama", 
    description: "En iyi rotalar, konaklama ve aktivite önerileri",
    features: ["Rota Planlama", "Otel Önerileri", "Yerel Aktiviteler", "Bütçe Hesabı"],
    glowColor: "red" as const,
    color: "#dc2626"
  },
  { 
    id: 10, 
    title: "Yemek Asistanı", 
    subtitle: "Yemek pişirme ve tarif yardımı", 
    description: "Lezzetli tarifler ve pişirme teknikleri öğrenin",
    features: ["Tarif Önerileri", "Pişirme Teknikleri", "Malzeme Listesi", "Beslenme Değeri"],
    glowColor: "orange" as const,
    color: "#ea580c"
  },
  { 
    id: 11, 
    title: "Çalışma Arkadaşı", 
    subtitle: "Eğitim desteği", 
    description: "Öğrenme sürecinizi hızlandıran kişisel eğitim asistanı",
    features: ["Konu Anlatımı", "Sınav Hazırlığı", "Ödev Yardımı", "Çalışma Planı"],
    glowColor: "blue" as const,
    color: "#2563eb"
  },
  { 
    id: 12, 
    title: "Ruh Sağlığı Uzmanı", 
    subtitle: "Zihinsel sağlık desteği", 
    description: "Stres yönetimi ve kişisel gelişim rehberliği",
    features: ["Stres Yönetimi", "Mindfulness", "Duygusal Destek", "Kişisel Gelişim"],
    glowColor: "green" as const,
    color: "#16a34a"
  },
  { 
    id: 13, 
    title: "Kod İncelemecisi", 
    subtitle: "Programlama yardımcısı", 
    description: "Kod kalitesini artıran profesyonel geliştirici asistanı",
    features: ["Kod İnceleme", "Bug Tespiti", "Optimizasyon", "Best Practices"],
    glowColor: "purple" as const,
    color: "#9333ea"
  },
  { 
    id: 14, 
    title: "Yazı Asistanı", 
    subtitle: "Yaratıcı yazım yardımı", 
    description: "Etkili ve akıcı metinler oluşturun",
    features: ["İçerik Üretimi", "Düzenleme", "Stil Geliştirme", "SEO Optimizasyonu"],
    glowColor: "red" as const,
    color: "#dc2626"
  },
  { 
    id: 15, 
    title: "Müzik Öğretmeni", 
    subtitle: "Müzik teorisi ve pratik", 
    description: "Müzik becerilerinizi geliştiren kişisel eğitmen",
    features: ["Enstrüman Eğitimi", "Müzik Teorisi", "Şarkı Analizi", "Kompozisyon"],
    glowColor: "orange" as const,
    color: "#f59e0b"
  },
  { 
    id: 16, 
    title: "Emlak Uzmanı", 
    subtitle: "Gayrimenkul alım rehberi", 
    description: "En uygun gayrimenkul seçimi ve yatırım önerileri",
    features: ["Piyasa Analizi", "Konum Değerlendirmesi", "Fiyat Karşılaştırması", "Yatırım Tavsiyesi"],
    glowColor: "blue" as const,
    color: "#0284c7"
  },
  { 
    id: 17, 
    title: "Hukuk Danışmanı", 
    subtitle: "Hukuki danışmanlık", 
    description: "Temel hukuki konularda bilgilendirme ve yönlendirme",
    features: ["Hukuki Bilgilendirme", "Doküman Hazırlığı", "Süreç Yönetimi", "Risk Değerlendirmesi"],
    glowColor: "green" as const,
    color: "#15803d"
  },
  { 
    id: 18, 
    title: "Kariyer Koçu", 
    subtitle: "Profesyonel gelişim", 
    description: "Kariyerinizi ilerletecek stratejiler ve fırsatlar",
    features: ["Kariyer Planlama", "CV Geliştirme", "Mülakat Hazırlığı", "Network Kurma"],
    glowColor: "purple" as const,
    color: "#7c3aed"
  },
  { 
    id: 19, 
    title: "Meditasyon Rehberi", 
    subtitle: "Farkındalık ve rahatlama", 
    description: "İç huzuru bulmanıza yardımcı olan rehberli meditasyon",
    features: ["Nefes Egzersizleri", "Rehberli Meditasyon", "Stres Azaltma", "Farkındalık"],
    glowColor: "red" as const,
    color: "#dc2626"
  },
  { 
    id: 20, 
    title: "Evcil Hayvan Uzmanı", 
    subtitle: "Hayvan bakımı ve eğitimi", 
    description: "Evcil hayvanınızın sağlığı ve mutluluğu için kapsamlı rehber",
    features: ["Bakım Tavsiyeleri", "Eğitim Teknikleri", "Sağlık Takibi", "Beslenme Planı"],
    glowColor: "orange" as const,
    color: "#ea580c"
  },
  { 
    id: 21, 
    title: "İç Mimar", 
    subtitle: "İç tasarım fikirleri", 
    description: "Yaşam alanlarınızı güzelleştiren dekorasyon önerileri",
    features: ["Renk Paleti", "Mobilya Seçimi", "Dekorasyon Fikirleri", "Alan Optimizasyonu"],
    glowColor: "blue" as const,
    color: "#1d4ed8"
  },
  { 
    id: 22, 
    title: "Oyun Ustası", 
    subtitle: "RPG ve oyun yardımcısı", 
    description: "Oyun deneyiminizi zenginleştiren yaratıcı fikirler",
    features: ["Senaryo Yazımı", "Karakter Yaratma", "Dünya Kurgusu", "Kural Optimizasyonu"],
    glowColor: "green" as const,
    color: "#16a34a"
  },
  { 
    id: 23, 
    title: "Stil Danışmanı", 
    subtitle: "Stil ve giyim tavsiyeleri", 
    description: "Kişisel tarzınızı yansıtan giyim önerileri",
    features: ["Renk Analizi", "Vücut Tipi Uyumu", "Trend Takibi", "Gardrob Planlaması"],
    glowColor: "purple" as const,
    color: "#a855f7"
  },
  { 
    id: 24, 
    title: "Bahçıvanlık Uzmanı", 
    subtitle: "Bitki ve bahçe bakımı", 
    description: "Sağlıklı bitki yetiştirme ve bahçe düzenleme rehberi",
    features: ["Bitki Seçimi", "Sulama Planı", "Hastalık Tespiti", "Mevsimsel Bakım"],
    glowColor: "red" as const,
    color: "#dc2626"
  },
  { 
    id: 25, 
    title: "Fotoğraf Koçu", 
    subtitle: "Fotoğraf teknikleri ve ipuçları", 
    description: "Daha iyi fotoğraflar çekmek için profesyonel rehberlik",
    features: ["Kompozisyon", "Işık Kullanımı", "Ekipman Seçimi", "Düzenleme Teknikleri"],
    glowColor: "orange" as const,
    color: "#f97316"
  },
  { 
    id: 26, 
    title: "Etkinlik Planlayıcısı", 
    subtitle: "Özel etkinlik organizasyonu", 
    description: "Unutulmaz etkinlikler düzenlemek için kapsamlı planlama",
    features: ["Etkinlik Konsepti", "Mekan Seçimi", "Zaman Planlaması", "Bütçe Yönetimi"],
    glowColor: "blue" as const,
    color: "#0ea5e9"
  },
  { 
    id: 27, 
    title: "Beslenme Uzmanı", 
    subtitle: "Diyet ve beslenme rehberi", 
    description: "Sağlıklı yaşam için kişiselleştirilmiş beslenme önerileri",
    features: ["Diyet Planı", "Kalori Hesabı", "Besin Analizi", "Sağlık Takibi"],
    glowColor: "green" as const,
    color: "#059669"
  },
  { 
    id: 28, 
    title: "Sanat Öğretmeni", 
    subtitle: "Yaratıcı sanat eğitimi", 
    description: "Artistik becerilerinizi geliştiren adım adım rehber",
    features: ["Teknik Öğretimi", "Yaratıcılık Geliştirme", "Stil Bulma", "Proje Rehberliği"],
    glowColor: "purple" as const,
    color: "#8b5cf6"
  },
  { 
    id: 29, 
    title: "Fen Bilimleri Öğretmeni", 
    subtitle: "STEM eğitim desteği", 
    description: "Matematik ve fen bilimlerinde kapsamlı eğitim yardımı",
    features: ["Formül Açıklama", "Problem Çözme", "Deney Rehberi", "Kavram Pekiştirme"],
    glowColor: "red" as const,
    color: "#ef4444"
  },
  { 
    id: 30, 
    title: "Yaşam Koçu", 
    subtitle: "Kişisel gelişim", 
    description: "Hedeflerinize ulaşmanızı destekleyen kişisel rehberlik",
    features: ["Hedef Belirleme", "Motivasyon", "Alışkanlık Geliştirme", "Başarı Stratejileri"],
    glowColor: "orange" as const,
    color: "#f59e0b"
  },
];

export default function Templates() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
        <div className="flex items-center space-x-2">
          <p className="text-muted-foreground">
            {templateData.length} şablon mevcut
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templateData.map((template) => (
          <GlowCard 
            key={template.id} 
            glowColor={template.glowColor}
            customSize={true}
            className="w-[300px] h-[360px] cursor-pointer transition-transform duration-300 p-0"
            data-testid={`template-card-${template.id}`}
          >
            <div className="flex items-center justify-center h-full">
              <CardFlip
                title={template.title}
                subtitle={template.subtitle}
                description={template.description}
                features={template.features}
                color={template.color}
              />
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}