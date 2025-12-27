import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  updateDoc,
  doc,
  type DocumentData,
} from "firebase/firestore";
// Storage işlemleri için gerekli importlar:
import { getStorage, ref, deleteObject } from "firebase/storage";
import "./App.css";
import { db } from "./firebase";

interface Scores {
  teknik: number;
  bicim: number;
  icerik: number;
  anlatim: number;
  duygu: number;
}

interface Photo {
  id: string;
  url: string;
  name: string;
  status: string;
}

function App() {
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Scores>({
    teknik: 10,
    bicim: 10,
    icerik: 10,
    anlatim: 10,
    duygu: 10,
  });

  // Storage servisini başlat
  const storage = getStorage();

  // Rastgele ve Etiketlenmemiş fotoğraf getir
  const fetchNextPhoto = async () => {
    setLoading(true);
    try {
      // 1. Adım: "Pending" olanlardan 50 tane çek (Havuz oluştur)
      const q = query(
        collection(db, "photos"),
        where("status", "==", "pending"),
        limit(50)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 2. Adım: Gelen havuzdan RASTGELE birini seç
        const randomIndex = Math.floor(
          Math.random() * querySnapshot.docs.length
        );
        const docData = querySnapshot.docs[randomIndex];

        setCurrentPhoto({ id: docData.id, ...docData.data() } as Photo);

        // Puanları sıfırla
        setScores({
          teknik: 10,
          bicim: 10,
          icerik: 10,
          anlatim: 10,
          duygu: 10,
        });
      } else {
        setCurrentPhoto(null); // Resim kalmadı
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const initFetch = async () => {
      await fetchNextPhoto();
    };
    initFetch();
  }, []);

  const handleSave = async () => {
    if (!currentPhoto) return;

    try {
      // 1. Önce Veritabanına Puanları Kaydet
      const photoRef = doc(db, "photos", currentPhoto.id);
      await updateDoc(photoRef, {
        scores: scores,
        total: Object.values(scores).reduce((a, b) => a + b, 0),
        status: "done", // Artık bu resim bir daha gelmeyecek
        labeled_at: new Date(),
        labeler: "human", // İnsan tarafından yapıldığını belirtelim
      });

      // 2. Sonra Storage'dan Resmi SİL (Yer kaplamasın)
      // Not: Yüklerken "images/" klasörüne attığımızı varsayıyorum
      const imageRef = ref(storage, `images/${currentPhoto.name}`);

      try {
        await deleteObject(imageRef);
        console.log("Dosya Storage'dan silindi:", currentPhoto.name);
      } catch (storageError) {
        // Resim silinemese bile akışı bozmayalım, loglayıp devam edelim
        console.error(
          "Dosya silinirken hata oldu (ama puan kaydedildi):",
          storageError
        );
      }

      // 3. Sıradakine geç
      fetchNextPhoto();
    } catch (error) {
      console.error("Genel Hata:", error);
      alert("Kaydedilemedi!");
    }
  };

  // CSV İndirme Fonksiyonu
  const downloadCSV = async () => {
    const q = query(collection(db, "photos"), where("status", "==", "done"));
    const querySnapshot = await getDocs(q);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Dosya,Teknik,Bicim,Icerik,Anlatim,Duygu,Toplam\n";

    querySnapshot.forEach((doc: DocumentData) => {
      const d = doc.data() as { name: string; scores: Scores; total: number };
      const s = d.scores;
      csvContent += `${d.name},${s.teknik},${s.bicim},${s.icerik},${s.anlatim},${s.duygu},${d.total}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "etiketli_kediler.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <h1>Resim Yükleniyor...</h1>;

  if (!currentPhoto)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>🎉 BİTTİ! Geçmiş olsun kaptan.</h1>
        <p>Veritabanında etiketlenecek fotoğraf kalmadı.</p>
        <button
          onClick={downloadCSV}
          style={{ padding: "20px", fontSize: "20px", cursor: "pointer" }}>
          📂 CSV İNDİR
        </button>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
        height: "100vh",
      }}>
      {/* Sol Taraf: Resim */}
      <div
        style={{
          flex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f0f0f0",
        }}>
        <img
          src={currentPhoto.url}
          alt="Kedi"
          crossOrigin="anonymous"
          style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain" }}
        />
      </div>

      {/* Sağ Taraf: Puanlama */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          background: "#222",
          color: "#fff",
          borderRadius: "10px",
        }}>
        <h2>📸 {currentPhoto.name}</h2>
        <p>
          Toplam:{" "}
          <strong>{Object.values(scores).reduce((a, b) => a + b, 0)}</strong> /
          100
        </p>
        <hr />

        {(Object.keys(scores) as Array<keyof Scores>).map((key) => (
          <div key={key} style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                textTransform: "capitalize",
                marginBottom: "5px",
              }}>
              {key}: <strong>{scores[key]}</strong>
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={scores[key]}
              onChange={(e) =>
                setScores({ ...scores, [key]: Number.parseInt(e.target.value) })
              }
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          style={{
            width: "100%",
            padding: "15px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "18px",
            cursor: "pointer",
            marginTop: "20px",
          }}>
          ✅ KAYDET & SIRADAKİ
        </button>

        <div style={{ marginTop: "50px", fontSize: "12px", color: "#aaa" }}>
          <button
            onClick={downloadCSV}
            style={{
              background: "transparent",
              border: "1px solid #aaa",
              color: "#aaa",
              padding: "5px",
              cursor: "pointer",
            }}>
            Ara Rapor Al (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
