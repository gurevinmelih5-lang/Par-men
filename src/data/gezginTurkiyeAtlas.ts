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
    { id: 'c1', name: 'Teşvikiye Merhamet Apartmanı', sceneLabel: 'Nişantaşı sahneleri', excerpt: 'Kemal ile Füsun’un ilk kez baş başa kaldığı, her katı çocukluk hatıraları ve sırlar taşıyan meşhur apartman dairesi.', lat: 41.0312, lng: 28.9808 },
    { id: 'c2', name: 'Çukurcuma', sceneLabel: 'Beyoğlu sahneleri', excerpt: 'Kemal’in Füsun’a ait her türlü eşyayı 30 yıl boyunca saplantılı bir biçimde toplayarak ölümsüz bir aşk anıtına dönüştürdüğü çatı katı.', lat: 41.0314, lng: 28.9796 },
  ]},
  { id: 'gtr-02', title: 'Kürk Mantolu Madonna', author: 'Sabahattin Ali', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Sinop Cezaevi (tarihî çevre)', sceneLabel: 'Sinop sahneleri', excerpt: 'Raif Efendi’nin derin yalnızlığı ve melankolisinin, Karadeniz’in o soğuk rüzgârları altında şekillendiği tarihî cezaevi surları.', lat: 42.0235, lng: 35.1531 },
    { id: 'c2', name: 'Kırklareli yolu', sceneLabel: 'Trakya sahneleri', excerpt: 'Sabahattin Ali’nin kendi trajik sonuna da zemin hazırlayan, ruhundaki hüzünlü ve kasvetli Trakya sınır hattı.', lat: 41.7331, lng: 27.2253 },
  ]},
  { id: 'gtr-03', title: 'İnce Memed', author: 'Yaşar Kemal', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Yüreğir / Çukurova ovası', sceneLabel: 'Adana sahneleri', excerpt: 'İnce Memed’in zalim Abdi Ağa’ya karşı ilk isyan ateşini yaktığı ve Çukurova köylüleriyle destanlaştığı sarı sıcak topraklar.', lat: 37.0000, lng: 35.3213 },
    { id: 'c2', name: 'Tarsus yakınları', sceneLabel: 'Çukurova sahneleri', excerpt: 'Hatçe’nin kaçırılışından sonra İnce Memed’in çetesiyle birlikte sığınarak izini kaybettirdiği geçit vermez Toros yamaçları.', lat: 36.9167, lng: 34.8958 },
  ]},
  { id: 'gtr-04', title: 'Yılkı Atı', author: 'Abbas Sayar', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Yozgat çevresi', sceneLabel: 'Yozgat sahneleri', excerpt: 'Emektar at Dorukısrak’ın kışın dondurucu ayazında vahşi doğada hayatta kalma savaşı verdiği Yozgat bozkırları.', lat: 39.8200, lng: 34.8044 },
  ]},
  { id: 'gtr-05', title: 'Çalıkuşu', author: 'Reşat Nuri Güntekin', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Göztepe / Kadıköy (Feride dönemi)', sceneLabel: 'İstanbul sahneleri', excerpt: 'Feride’nin teyzesinin konağındaki o büyük ağaca tırmanarak Kamran ile ilk kez bakıştığı ve aralarındaki çocuksu aşkın alevlendiği bahçe.', lat: 40.9902, lng: 29.0273 },
    { id: 'c2', name: 'Bursa Ulu Camii çevresi', sceneLabel: 'Bursa sahneleri', excerpt: 'Feride’nin İstanbul’dan kaçıp idealist bir Anadolu öğretmeni olarak çocukların hayatına dokunduğu tarihî cami gölgesi.', lat: 40.1826, lng: 29.0665 },
  ]},
  { id: 'gtr-06', title: 'Huzur', author: 'Ahmet Hamdi Tanpınar', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Nişantaşı', sceneLabel: 'İstanbul sahneleri', excerpt: 'Mümtaz ile Nuran’ın Doğu-Batı sentezi, müzik ve felsefe eşliğinde aşk ile derin bir melankoli arasında mekik dokuduğu caddeler.', lat: 41.0473, lng: 28.9857 },
    { id: 'c2', name: 'Süleymaniye', sceneLabel: 'Fatih sahneleri', excerpt: 'Yaklaşan İkinci Dünya Savaşı’nın gölgesinde Mümtaz’ın imparatorluğun görkemli geçmişini ve huzursuz geleceğini hissettiği mistik kubbe altı.', lat: 41.0160, lng: 28.9640 },
  ]},
  { id: 'gtr-07', title: 'Fatih-Harbiye', author: 'Peyami Safa', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Harbiye', sceneLabel: 'Şişli sahneleri', excerpt: 'Neriman’ın cazibesine kapılarak hayalini kurduğu Batılı, modern ve ışıltılı kafelerle bezeli kozmopolit semt caddesi.', lat: 41.0489, lng: 28.9871 },
    { id: 'c2', name: 'Fatih', sceneLabel: 'Fatih sahneleri', excerpt: 'Şinasi’nin sabırla beklediği, geleneksel Türk-İslam değerlerinin ve huzurlu mahalle yaşantısının simgesi olan eski İstanbul sokakları.', lat: 41.0122, lng: 28.9499 },
  ]},
  { id: 'gtr-08', title: 'Bekle Beni', author: 'Livaneli', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Kızılay', sceneLabel: 'Ankara sahneleri', excerpt: 'Gri başkent kalabalığında devrimci gençlerin büyük umutları, buluşma heyecanları ve ayrılık acılarının kesiştiği o büyük meydan.', lat: 39.9334, lng: 32.8597 },
    { id: 'c2', name: 'Anıtkabir', sceneLabel: 'Ankara sahneleri', excerpt: 'Karakterlerin geçmişin sessiz tanıklığı ve değişen Türkiye’nin kaderiyle derin bir hüzünle yüzleştiği Aslanlı Yol.', lat: 39.9255, lng: 32.8369 },
  ]},
  { id: 'gtr-09', title: 'İstanbul Hatırası', author: 'Ahmet Ümit', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Sarayburnu', sceneLabel: 'Eminönü sahneleri', excerpt: 'Başkomiser Nevzat’ın, elinde antik Bizans sikkesiyle bulunan ilk kurbanın cesediyle karşılaşarak yedi tepeli gizemli cinayetler zincirine adım attığı sahil.', lat: 41.0150, lng: 28.9850 },
    { id: 'c2', name: 'Yedikule', sceneLabel: 'Sur içi sahneleri', excerpt: 'Bizans imparatorluk döneminden bugüne uzanan intikam planlarının ve cinayetlerin düğüm noktalarından biri olan tarihî zindanlar.', lat: 40.9930, lng: 28.9220 },
  ]},
  { id: 'gtr-10', title: 'Tutunamayanlar', author: 'Oğuz Atay', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Moda sahil', sceneLabel: 'Kadıköy sahneleri', excerpt: 'Selim Işık’ın kendi iç dünyasındaki fırtınalarla boğuşurken adımladığı, "tutunamayanlar" manifestosunun ilk tohumlarının atıldığı sahil.', lat: 40.9847, lng: 29.0264 },
    { id: 'c2', name: 'Bahariye', sceneLabel: 'Kadıköy sahneleri', excerpt: 'Turgut Özben’in, dostu Selim’in gizemli intiharının ardındaki sır perdesini aralamak için adımlarını takip ettiği hüzünlü ve entelektüel cadde.', lat: 40.9908, lng: 29.0244 },
  ]},
  { id: 'gtr-11', title: 'Puslu Kıtalar Atlası', author: 'İhsan Oktay Anar', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Galata Kulesi çevresi', sceneLabel: 'Beyoğlu sahneleri', excerpt: 'Uzun İhsan Efendi’nin uyku şurubunu içip düşlerinde yeni dünyalar haritalandırdığı, Galata’nın o sisli ve gizemli Osmanlı sokakları.', lat: 41.0256, lng: 28.9744 },
  ]},
  { id: 'gtr-12', title: 'Aşk', author: 'Elif Şafak', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Mevlana Müzesi', sceneLabel: 'Konya sahneleri', excerpt: 'Şems-i Tebrizi ile Mevlana Celaleddin Rumi’nin yollarının kesiştiği, ilahi aşk ve tasavvuf felsefesinin kalbi olan mistik mekân.', lat: 37.8710, lng: 32.4846 },
    { id: 'c2', name: 'Aziziye Camii çevresi', sceneLabel: 'Konya sahneleri', excerpt: 'Ella ve Aziz’in yüzyıllar öncesinin ilahi aşk öğretileri eşliğinde kendi yalnızlıklarını dindirdikleri eski Konya sokakları.', lat: 37.8746, lng: 32.4932 },
  ]},
  { id: 'gtr-13', title: 'Kar', author: 'Orhan Pamuk', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Kars Kalesi', sceneLabel: 'Kars sahneleri', excerpt: 'Sürgün şair Ka’nın, Kars’ın amansız kar fırtınasında kayıp aşkı İpek’i ararken siyasi gerilimlerin ve inanç çatışmalarının ortasında kaldığı kale etekleri.', lat: 40.6075, lng: 43.0978 },
    { id: 'c2', name: 'Ani harabeleri (gezi)', sceneLabel: 'Kars çevresi', excerpt: 'Ka ile İpek’in sınırın sıfır noktasındaki kadim medeniyet taşları arasında gezinirken yalnızlıklarını ve sevdalarını paylaştığı harabeler.', lat: 40.5060, lng: 43.5727 },
  ]},
  { id: 'gtr-14', title: 'Devlet Ana', author: 'Kemal Tahir', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Söğüt', sceneLabel: 'Bilecik sahneleri', excerpt: 'Ertuğrul Gazi ve yoldaşlarının bozkırda yeni bir cihan imparatorluğunun düşünü kurup Osmanlı Devleti’nin tohumlarını attığı kadim topraklar.', lat: 40.0178, lng: 30.1797 },
  ]},
  { id: 'gtr-15', title: 'Sinekli Bakkal', author: 'Halide Edip Adıvar', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Üsküdar iskele çevresi', sceneLabel: 'Üsküdar sahneleri', excerpt: 'Rabia’nın doğu ve batı müziği arasında köprü kurduğu, mahallenin samimi havasının devrimci gizli toplantılarla buluştuğu Üsküdar iskelesi.', lat: 41.0214, lng: 29.0151 },
  ]},
  { id: 'gtr-16', title: 'Medarımaiş', author: 'Sait Faik Abasıyanık', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Burgazada', sceneLabel: 'Adalar sahneleri', excerpt: 'Sait Faik’in balıkçılarla, martılarla ve adanın çam ağaçlarıyla iç içe yaşayarak sıradan insanların yaşam mücadelesini ölümsüzleştirdiği sokaklar.', lat: 40.8796, lng: 29.0615 },
  ]},
  { id: 'gtr-17', title: 'Acımak', author: 'Reşat Nuri Güntekin', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Ankara Ulus', sceneLabel: 'Ankara sahneleri', excerpt: 'Zehra Öğretmen’in vefat eden babasının günlüğünü okurken, katı kalbindeki öfkenin büyük bir merhamete ve hüzne dönüştüğü tarihî Ulus caddeleri.', lat: 39.9429, lng: 32.8543 },
  ]},
  { id: 'gtr-18', title: 'Serenad', author: 'Zülfü Livaneli', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Bodrum kalesi', sceneLabel: 'Muğla sahneleri', excerpt: 'Maya Duran ile Profesör Maximilian Wagner’in Struma faciasının ve yarım asırlık hüzünlü bir aşkın izini sürdüğü masmavi Bodrum koyları.', lat: 37.0344, lng: 27.4305 },
  ]},
  { id: 'gtr-19', title: 'Curfew', author: 'Adalet Ağaoğlu', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Kızılay', sceneLabel: 'Ankara sahneleri', excerpt: 'Sokağa çıkma yasağının ilan edildiği o gerilimli gecede, farklı hayatların ve yarım kalmış sevdaların kesiştiği Ankara’nın kalbi.', lat: 39.9208, lng: 32.8541 },
  ]},
  { id: 'gtr-20', title: 'Kara Kitap', author: 'Orhan Pamuk', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Beyoğlu İstiklal', sceneLabel: 'İstanbul sahneleri', excerpt: 'Galip’in, ortadan kaybolan eşi Rüya’yı ve köşe yazarı Celal Salik’i ararken kimlik değiştirip kendi içinde kaybolduğu İstiklal caddesi.', lat: 41.0369, lng: 28.9784 },
  ]},
  { id: 'gtr-21', title: 'Eylül', author: 'Mehmet Rauf', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Heybeliada', sceneLabel: 'Adalar sahneleri', excerpt: 'Suat, Süreyya ve Necip arasındaki o yasak, melankolik aşk üçgeninin sonbaharın hüzünlü yaprakları eşliğinde alevlendiği ada villası.', lat: 40.8775, lng: 29.0911 },
  ]},
  { id: 'gtr-22', title: 'Kuyucaklı Yusuf', author: 'Sabahattin Ali', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Kozan çevresi', sceneLabel: 'Adana sahneleri', excerpt: 'Yusuf’un ailesini kaybettikten sonra sığındığı kaymakamın yanında, Muazzez’e olan temiz aşkını kalbinde büyüttüğü Kozan sokakları.', lat: 37.4592, lng: 35.8157 },
  ]},
  { id: 'gtr-23', title: 'Memleketimden İnsan Manzaraları', author: 'Nazım Hikmet', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Bursa Osmangazi', sceneLabel: 'Bursa sahneleri', excerpt: 'Nazım Hikmet’in hapishane penceresinden izlediği, Anadolu insanının o çileli ama umut dolu yaşam mücadelesinin mısralara döküldüğü tarihî semt.', lat: 40.1826, lng: 29.0665 },
    { id: 'c2', name: 'Ankara Garı çevresi', sceneLabel: 'Ankara sahneleri', excerpt: 'İkinci Dünya Savaşı yıllarında, Anadolu’nun dört bir yanından gelen yolcuların, askerlerin ve memurların yollarının kesiştiği gar binası.', lat: 39.9376, lng: 32.8540 },
  ]},
  { id: 'gtr-24', title: 'Aylak Adam', author: 'Yusuf Atılgan', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Cihangir', sceneLabel: 'Beyoğlu sahneleri', excerpt: 'C.’nin o "gerçek aşkı" ararken İstanbul caddelerinde aylakça dolaştığı, modern insanın yalnızlığını ve yabancılaşmasını en derinden yaşadığı sokaklar.', lat: 41.0318, lng: 28.9830 },
  ]},
  { id: 'gtr-25', title: 'Küçük Ağa', author: 'Tarık Buğra', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Konya Alaaddin Tepesi', sceneLabel: 'Konya sahneleri', excerpt: 'İstanbullu Hoca’nın (Küçük Ağa), Kurtuluş Savaşı’nın eşiğinde halkı milli mücadeleye ve birliğe davet ettiği tarihî anlar.', lat: 37.8746, lng: 32.4932 },
  ]},
  { id: 'gtr-26', title: 'Demirciler Çarşısı Cinayeti', author: 'Yaşar Kemal', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Eski Adana', sceneLabel: 'Adana sahneleri', excerpt: 'Derviş Bey ile Mustafa Bey arasındaki o kan davasının, demir döven ustaların çekiç sesleri arasında Çukurova’yı kana buladığı eski çarşı.', lat: 37.0000, lng: 35.3213 },
  ]},
  { id: 'gtr-27', title: 'Kuşlar da Gitti', author: 'Yaşar Kemal', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Beyoğlu', sceneLabel: 'İstanbul sahneleri', excerpt: 'Modernleşen ve betonlaşan İstanbul’da çocukların yakaladığı kuşları satamadığı, insanların merhametini yitirişini simgeleyen hüzünlü sokaklar.', lat: 41.0369, lng: 28.9784 },
  ]},
  { id: 'gtr-28', title: 'Bir Bilim Adamının Romanı', author: 'Oğuz Atay', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'ODTÜ çevresi (Ankara)', sceneLabel: 'Ankara sahneleri', excerpt: 'Prof. Mustafa İnan’ın bilime adanmış hayatının ve idealist gençleri yetiştirmek için verdiği mücadelenin yaşandığı yeşil ODTÜ kampüsü.', lat: 39.8181, lng: 32.7505 },
  ]},
  { id: 'gtr-29', title: 'Fakat Müzeyyen Bu Derin Bir Tutku', author: 'Barış Bıçakçı', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Kadıköy Moda', sceneLabel: 'İstanbul sahneleri', excerpt: 'Arif’in o gizemli ve tutkulu Müzeyyen ile tanışıp aşkın o tatlı belirsizliğinde kaybolduğu, Moda sahilinin serin rüzgârlı caddeleri.', lat: 40.9847, lng: 29.0264 },
  ]},
  { id: 'gtr-30', title: 'Kukla', author: 'Ahmet Ümit', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'İzmir Alsancak', sceneLabel: 'İzmir sahneleri', excerpt: 'Alsancak’ın ışıltılı caddelerinde, karanlık siyasi ilişkilerin ve güç savaşlarının ortasında adeta birer kukla gibi oynatılan hayatlar.', lat: 38.4381, lng: 27.1428 },
  ]},
  { id: 'gtr-31', title: 'İstanbul İstanbul', author: 'Burhan Sönmez', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Taksim', sceneLabel: 'Beyoğlu sahneleri', excerpt: 'Dört mahkûmun yeraltı hücresinde birbirlerine anlattıkları İstanbul hikâyelerinin yerüstündeki o canlı ve özgür caddelerle tezat oluşturduğu meydan.', lat: 41.0369, lng: 28.9850 },
    { id: 'c2', name: 'Balat', sceneLabel: 'Fatih sahneleri', excerpt: 'Tarihin, acının ve farklı kültürlerin iç içe geçtiği, dar sokaklarında geçmişin hayaletlerinin ve anılarının dolaştığı eski İstanbul mahallesi.', lat: 41.0318, lng: 28.9484 },
  ]},
  { id: 'gtr-32', title: 'Cehennem', author: 'Dan Brown', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Yerebatan Sarnıcı', sceneLabel: 'Sultanahmet sahneleri', excerpt: 'Robert Langdon’ın, insanlığın yarısını yok edecek virüsün saklandığı çantayı bulmak için Medusa başının yanındaki sulara daldığı nefes kesici tarihi sarnıç.', lat: 41.0084, lng: 28.9779 },
  ]},
  { id: 'gtr-33', title: 'Kayıp Tanrılar Ülkesi', author: 'Ahmet Ümit', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Gaziantep Kalesi çevresi', sceneLabel: 'Gaziantep sahneleri', excerpt: 'Berlin’den Gaziantep’e uzanan cinayet zincirinin, Zeus Sunağı’nın gölgesinde antik mitler ve eski aile sırlarıyla buluştuğu kale yamaçları.', lat: 37.0662, lng: 37.3833 },
  ]},
  { id: 'gtr-34', title: 'Ağrı Dağı Efsanesi', author: 'Yaşar Kemal', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Doğubayazıt', sceneLabel: 'Ağrı sahneleri', excerpt: 'Ahmet ile Gülbahar’ın törelere ve paşaya meydan okuyan sevdalarının, Ağrı Dağı’nın o dumanlı ve efsanevi zirvesinde son bulduğu coğrafya.', lat: 39.5469, lng: 44.0834 },
  ]},
  { id: 'gtr-35', title: 'Halikarnas Balıkçısı rotası', author: 'Cevat Şakir Kabaağaçlı', cover: DEFAULT_GEZGIN_COVER, checkpoints: [
    { id: 'c1', name: 'Bodrum', sceneLabel: 'Muğla sahneleri', excerpt: 'Cevat Şakir’in sürgün olarak geldiği andan itibaren âşık olduğu, Bodrum’u mavi yolculukların ve sünger avcılarının cenneti haline getirdiği sahil şeridi.', lat: 37.0344, lng: 27.4305 },
    { id: 'c2', name: 'Datça', sceneLabel: 'Muğla sahneleri', excerpt: 'Balıkçı’nın mavi teknelerle yanaşıp doğanın el değmemiş büyüleyici güzelliğini ve Ege’nin mitolojik rüzgârını içine çektiği gizli Datça koyları.', lat: 36.7272, lng: 27.6878 },
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
