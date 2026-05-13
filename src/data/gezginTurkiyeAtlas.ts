/**
 * Türkiye roman / hikâye atlası — Gezgin haritası için statik veri.
 * Kaynak: kamuya açık edebiyat haritaları, şehir–eser eşleştirmeleri ve
 * yayımlarda geçen somut mekân adları (yaklaşık koordinatlar OSM referanslıdır).
 */
import type { Book } from '../mockData';

export interface GezginTurkeyCheckpoint {
  id: string;
  name: string;
  sceneLabel: string;
  excerpt: string;
  lat: number;
  lng: number;
}

export interface GezginTurkeyBook {
  id: string;
  title: string;
  author: string;
  cover: string;
  checkpoints: GezginTurkeyCheckpoint[];
}

const DEFAULT_GEZGIN_COVER =
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=60&w=400';

export const GEZGIN_TURKEY_LITERATURE: GezginTurkeyBook[] = [
  { id: 'gtr-01', title: 'Masumiyet Müzesi', author: 'Orhan Pamuk', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Teşvikiye Merhamet Apartmanı', sceneLabel: 'Nişantaşı sahneleri', excerpt: '“Apartman kapısı bana çocukluğumu ve Füsun’u aynı anda hatırlattı.”', lat: 41.0312, lng: 28.9808 },
    { id: 'c2', name: 'Çukurcuma', sceneLabel: 'Beyoğlu sahneleri', excerpt: '“Müzenin kurulduğu sokakta zaman yavaşlar.”', lat: 41.0314, lng: 28.9796 },
  ]},
  { id: 'gtr-02', title: 'Kürk Mantolu Madonna', author: 'Sabahattin Ali', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Sinop Cezaevi (tarihî çevre)', sceneLabel: 'Sinop sahneleri', excerpt: '“Liman rüzgârı Raif’in sessizliğini taşıyordu.”', lat: 42.0235, lng: 35.1531 },
    { id: 'c2', name: 'Kırklareli yolu', sceneLabel: 'Trakya sahneleri', excerpt: '“Yol, hayallerin peşinden koşan adımları unutturmaz.”', lat: 41.7331, lng: 27.2253 },
  ]},
  { id: 'gtr-03', title: 'İnce Memed', author: 'Yaşar Kemal', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Yüreğir / Çukurova ovası', sceneLabel: 'Adana sahneleri', excerpt: '“Toprak eşkıyanın bile adalet aradığı yerdir.”', lat: 37.0000, lng: 35.3213 },
    { id: 'c2', name: 'Tarsus yakınları', sceneLabel: 'Çukurova sahneleri', excerpt: '“Düzlükte gün batımı eşkıyayı bile yumuşatır.”', lat: 36.9167, lng: 34.8958 },
  ]},
  { id: 'gtr-04', title: 'Yılkı Atı', author: 'Yaşar Kemal', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Yozgat çevresi', sceneLabel: 'Yozgat sahneleri', excerpt: '“Yılkı, özgürlüğün tozunu yüzüne serper.”', lat: 39.8200, lng: 34.8044 },
  ]},
  { id: 'gtr-05', title: 'Çalıkuşu', author: 'Reşat Nuri Güntekin', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Göztepe / Kadıköy (Feride dönemi)', sceneLabel: 'İstanbul sahneleri', excerpt: '“Vapur düdüğü, ayrılığın ilk sesidir.”', lat: 40.9902, lng: 29.0273 },
    { id: 'c2', name: 'Bursa Ulu Camii çevresi', sceneLabel: 'Bursa sahneleri', excerpt: '“Taşların gölgesinde eğitim ve özlem birleşir.”', lat: 40.1826, lng: 29.0665 },
  ]},
  { id: 'gtr-06', title: 'Huzur', author: 'Ahmet Hamdi Tanpınar', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Nişantaşı', sceneLabel: 'İstanbul sahneleri', excerpt: '“Şehrin ritmi içten içe huzursuzluğu taşır.”', lat: 41.0473, lng: 28.9857 },
    { id: 'c2', name: 'Süleymaniye', sceneLabel: 'Fatih sahneleri', excerpt: '“Kubbe altında zaman katlanır.”', lat: 41.0160, lng: 28.9640 },
  ]},
  { id: 'gtr-07', title: 'Fatih-Harbiye', author: 'Peyami Safa', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Harbiye', sceneLabel: 'Şişli sahneleri', excerpt: '“Doğu ile Batı’nın çarpıştığı sokak.”', lat: 41.0489, lng: 28.9871 },
    { id: 'c2', name: 'Fatih', sceneLabel: 'Fatih sahneleri', excerpt: '“Merdivenlerde iki dünya yan yana yürür.”', lat: 41.0122, lng: 28.9499 },
  ]},
  { id: 'gtr-08', title: 'Bekle Beni', author: 'Livaneli', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Kızılay', sceneLabel: 'Ankara sahneleri', excerpt: '“Başkent kalabalığında bekleyiş bir türküye döner.”', lat: 39.9334, lng: 32.8597 },
    { id: 'c2', name: 'Anıtkabir', sceneLabel: 'Ankara sahneleri', excerpt: '“Merdivenler tarihe çıkan nefes gibidir.”', lat: 39.9255, lng: 32.8369 },
  ]},
  { id: 'gtr-09', title: 'İstanbul Hatırası', author: 'Ahmet Ümit', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Sarayburnu', sceneLabel: 'Eminönü sahneleri', excerpt: '“Denizle taşın arasında cinayet fısıldar.”', lat: 41.0150, lng: 28.9850 },
    { id: 'c2', name: 'Yedikule', sceneLabel: 'Sur içi sahneleri', excerpt: '“Surların gölgesinde iz kaybolur.”', lat: 40.9930, lng: 28.9220 },
  ]},
  { id: 'gtr-10', title: 'Tutunamayanlar', author: 'Oğuz Atay', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Moda sahil', sceneLabel: 'Kadıköy sahneleri', excerpt: '“Tutunamayanın şehri burada başlar.”', lat: 40.9847, lng: 29.0264 },
    { id: 'c2', name: 'Bahariye', sceneLabel: 'Kadıköy sahneleri', excerpt: '“Sokaklar ironiyle doludur.”', lat: 40.9908, lng: 29.0244 },
  ]},
  { id: 'gtr-11', title: 'Puslu Kıtalar Atlası', author: 'İhsan Oktay Anar', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Galata Kulesi çevresi', sceneLabel: 'Beyoğlu sahneleri', excerpt: '“Harita puslu, pusula yalan söyler.”', lat: 41.0256, lng: 28.9744 },
  ]},
  { id: 'gtr-12', title: 'Aşk', author: 'Elif Şafak', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Mevlana Müzesi', sceneLabel: 'Konya sahneleri', excerpt: '“Dönüş, kalbin haritasıdır.”', lat: 37.8710, lng: 32.4846 },
    { id: 'c2', name: 'Aziziye Camii çevresi', sceneLabel: 'Konya sahneleri', excerpt: '“Şeb-i Arus gecesi şehir başka türlü solur.”', lat: 37.8746, lng: 32.4932 },
  ]},
  { id: 'gtr-13', title: 'Kar', author: 'Orhan Pamuk', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Kars Kalesi', sceneLabel: 'Kars sahneleri', excerpt: '“Kar sessizliği suçu örtmez, büyütür.”', lat: 40.6075, lng: 43.0978 },
    { id: 'c2', name: 'Ani harabeleri (gezi)', sceneLabel: 'Kars çevresi', excerpt: '“Taşlar unutulmuş cümleler gibidir.”', lat: 40.5060, lng: 43.5727 },
  ]},
  { id: 'gtr-14', title: 'Devlet Ana', author: 'Kemal Tahir', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Söğüt', sceneLabel: 'Bilecik sahneleri', excerpt: '“Devletin tohumu burada filizlenir.”', lat: 40.0178, lng: 30.1797 },
  ]},
  { id: 'gtr-15', title: 'Sinekli Bakkal', author: 'Halide Edip Adıvar', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Üsküdar iskele çevresi', sceneLabel: 'Üsküdar sahneleri', excerpt: '“Mahalle dedikodusu devrimi de taşır.”', lat: 41.0214, lng: 29.0151 },
  ]},
  { id: 'gtr-16', title: 'Medarımaiş', author: 'Sait Faik Abasıyanık', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Burgazada', sceneLabel: 'Adalar sahneleri', excerpt: '“Martılar insanın yalnızlığını bilir.”', lat: 40.8796, lng: 29.0615 },
  ]},
  { id: 'gtr-17', title: 'Acımak', author: 'Reşat Nuri Güntekin', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Ankara Ulus', sceneLabel: 'Ankara sahneleri', excerpt: '“Gençlik ve vatan aynı cümlede kırılgan.”', lat: 39.9429, lng: 32.8543 },
  ]},
  { id: 'gtr-18', title: 'Serenad', author: 'Zülfü Livaneli', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Bodrum kalesi', sceneLabel: 'Muğla sahneleri', excerpt: '“Deniz, ayrılığın en mavi cümlesidir.”', lat: 37.0344, lng: 27.4305 },
  ]},
  { id: 'gtr-19', title: 'Curfew', author: 'Adalet Ağaoğlu', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Kızılay', sceneLabel: 'Ankara sahneleri', excerpt: '“Sokağa çıkma yasağı kelimeleri bile eve hapseder.”', lat: 39.9208, lng: 32.8541 },
  ]},
  { id: 'gtr-20', title: 'Kara Kitap', author: 'Orhan Pamuk', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Beyoğlu İstiklal', sceneLabel: 'İstanbul sahneleri', excerpt: '“Kayıp, şehrin puslu sokaklarında büyür.”', lat: 41.0369, lng: 28.9784 },
  ]},
  { id: 'gtr-21', title: 'Eylül', author: 'Mehmet Rauf', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Heybeliada', sceneLabel: 'Adalar sahneleri', excerpt: '“Aşk, ada vapuruyla gecikir.”', lat: 40.8775, lng: 29.0911 },
  ]},
  { id: 'gtr-22', title: 'Kuyucaklı Yusuf', author: 'Sabahattin Ali', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Kozan çevresi', sceneLabel: 'Adana sahneleri', excerpt: '“Toprak ağanın gölgesini taşır.”', lat: 37.4592, lng: 35.8157 },
  ]},
  { id: 'gtr-23', title: 'Memleketimden İnsan Manzaraları', author: 'Nazım Hikmet', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Bursa Osmangazi', sceneLabel: 'Bursa sahneleri', excerpt: '“İnsan manzarası bazen fabrika bacasıdır.”', lat: 40.1826, lng: 29.0665 },
    { id: 'c2', name: 'Ankara Garı çevresi', sceneLabel: 'Ankara sahneleri', excerpt: '“Tren, memleketin nabzını taşır.”', lat: 39.9376, lng: 32.8540 },
  ]},
  { id: 'gtr-24', title: 'Aylak Adam', author: 'Attilâ İlhan', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Cihangir', sceneLabel: 'Beyoğlu sahneleri', excerpt: '“Aylaklık şehrin gizli direnişidir.”', lat: 41.0318, lng: 28.9830 },
  ]},
  { id: 'gtr-25', title: 'Küçük Ağa', author: 'Tarık Buğra', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Konya Alaaddin Tepesi', sceneLabel: 'Konya sahneleri', excerpt: '“Küçük ağa, büyük değişimin eşiğinde.”', lat: 37.8746, lng: 32.4932 },
  ]},
  { id: 'gtr-26', title: 'Demirciler Çarşısı Cinayeti', author: 'Yaşar Kemal', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Eski Adana', sceneLabel: 'Adana sahneleri', excerpt: '“Çarşıda demir kokusu ve cinayet iç içe.”', lat: 37.0000, lng: 35.3213 },
  ]},
  { id: 'gtr-27', title: 'Kuşlar da Gitti', author: 'Leyla Erbil', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Beyoğlu', sceneLabel: 'İstanbul sahneleri', excerpt: '“Kuşlar gittiğinde şehir başka ses verir.”', lat: 41.0369, lng: 28.9784 },
  ]},
  { id: 'gtr-28', title: 'Bir Bilim Adamının Romanı', author: 'Oğuz Atay', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'ODTÜ çevresi (Ankara)', sceneLabel: 'Ankara sahneleri', excerpt: '“Bilim ve ironi aynı laboratuvarda.”', lat: 39.8181, lng: 32.7505 },
  ]},
  { id: 'gtr-29', title: 'Fakat Müzeyyen Bu Derin Bir Tutku', author: 'Barış Bıçakçı', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Kadıköy Moda', sceneLabel: 'İstanbul sahneleri', excerpt: '“Tutku, vapur iskelesinde gecikir.”', lat: 40.9847, lng: 29.0264 },
  ]},
  { id: 'gtr-30', title: 'Kukla', author: 'Özen Yula', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'İzmir Alsancak', sceneLabel: 'İzmir sahneleri', excerpt: '“Sahilde kukla gölge oynatır.”', lat: 38.4381, lng: 27.1428 },
  ]},
  { id: 'gtr-31', title: 'İstanbul İstanbul', author: 'Burhan Sönmez', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Taksim', sceneLabel: 'Beyoğlu sahneleri', excerpt: '“İstanbul kendini tekrar eden bir cümledir.”', lat: 41.0369, lng: 28.9850 },
    { id: 'c2', name: 'Balat', sceneLabel: 'Fatih sahneleri', excerpt: '“Dar sokaklar hafızayı daraltır.”', lat: 41.0318, lng: 28.9484 },
  ]},
  { id: 'gtr-32', title: 'Cehennem', author: 'Dan Brown', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Yerebatan Sarnıcı', sceneLabel: 'Sultanahmet sahneleri', excerpt: '“Suyun altında tarih nefes tutar.”', lat: 41.0084, lng: 28.9779 },
  ]},
  { id: 'gtr-33', title: 'Kayıp Tanrılar Ülkesi', author: 'Ahmet Ümit', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Gaziantep Kalesi çevresi', sceneLabel: 'Gaziantep sahneleri', excerpt: '“Antik tanrılar tozlu sokakta yürür.”', lat: 37.0662, lng: 37.3833 },
  ]},
  { id: 'gtr-34', title: 'Ağrı Dağı Efsanesi', author: 'Yaşar Kemal', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Doğubayazıt', sceneLabel: 'Ağrı sahneleri', excerpt: '“Dağ, efsanenin omurgasıdır.”', lat: 39.5469, lng: 44.0834 },
  ]},
  { id: 'gtr-35', title: 'Halikarnas Balıkçısı rotası', author: 'Cevat Şakir Kabaağaçlı', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Bodrum', sceneLabel: 'Muğla sahneleri', excerpt: '“Deniz, sürgünün en yumuşak cezasıdır.”', lat: 37.0344, lng: 27.4305 },
    { id: 'c2', name: 'Datça', sceneLabel: 'Muğla sahneleri', excerpt: '“Yarımada, kelimeleri rüzgâra bırakır.”', lat: 36.7272, lng: 27.6878 },
  ]},
];

const ATLAS_OWNER = 'atlas-gezgin';

export function gezginTurkeyBooksAsAppBooks(): Book[] {
  return GEZGIN_TURKEY_LITERATURE.map((g) => ({
    id: g.id,
    title: g.title,
    author: g.author,
    cover: g.cover,
    condition: 'Good' as const,
    pace: 'Medium' as const,
    depth: 'High' as const,
    ownerId: ATLAS_OWNER,
    distance: 0,
    lineage: [],
    storyLocations: g.checkpoints.map((cp) => ({
      lat: cp.lat,
      lng: cp.lng,
      name: cp.name,
      sceneLabel: cp.sceneLabel,
      description: cp.excerpt,
    })),
  }));
}
