/**
 * Seed Script: Push 30 Basic-Level F1 Quiz Questions to Firestore
 * Run: node scripts/seed-basic-questions.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5_ujs7Vqi_FQv2BpQiVpqpCHG_YkZW_0",
  authDomain: "f1-quiz-8e9a1.firebaseapp.com",
  projectId: "f1-quiz-8e9a1",
  storageBucket: "f1-quiz-8e9a1.firebasestorage.app",
  messagingSenderId: "766261564505",
  appId: "1:766261564505:web:716b830cc15d45ed1a0d48",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ═══════════════════════════════════════════════════════
// 30 BASIC LEVEL QUESTIONS (3 Stages x 10 Questions)
// ═══════════════════════════════════════════════════════

const BASIC_QUESTIONS = [
  // ─── STAGE 1: FREE PRACTICE (10 Soal) ───
  {
    level: "basic",
    stage: 1,
    questionText: "Berapa total sesi Free Practice sebelum Qualifying di satu weekend F1?",
    imageUrl: "https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=800&q=80",
    options: ["1 sesi", "2 sesi", "3 sesi", "4 sesi"],
    correctAnswer: "3 sesi"
  },
  {
    level: "basic",
    stage: 1,
    questionText: "Apa tujuan utama Free Practice dalam F1?",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    options: ["Untuk menentukan juara", "Untuk testing, setup, dan pembalap belajar track", "Untuk entertainment fans", "Tidak ada tujuan khusus"],
    correctAnswer: "Untuk testing, setup, dan pembalap belajar track"
  },
  {
    level: "basic",
    stage: 1,
    questionText: "Pada FP3 (sesi ketiga Free Practice), kapan biasanya diadakan?",
    imageUrl: "https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&w=800&q=80",
    options: ["Jumat pagi", "Jumat sore", "Sabtu pagi", "Sabtu sore"],
    correctAnswer: "Sabtu pagi"
  },
  {
    level: "basic",
    stage: 1,
    questionText: "Berapa lama durasi setiap sesi Free Practice?",
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    options: ["30 menit", "45 menit", "60 menit", "90 menit"],
    correctAnswer: "60 menit"
  },
  {
    level: "basic",
    stage: 1,
    questionText: "Driver mana yang saat ini menjadi juara dunia F1 2024?",
    imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    options: ["Max Verstappen", "Lando Norris", "Lewis Hamilton", "Carlos Sainz"],
    correctAnswer: "Max Verstappen"
  },
  {
    level: "basic",
    stage: 1,
    questionText: "Tim apa yang dipimpin oleh Max Verstappen di 2024?",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    options: ["Mercedes", "Ferrari", "Red Bull Racing", "McLaren"],
    correctAnswer: "Red Bull Racing"
  },
  {
    level: "basic",
    stage: 1,
    questionText: "Warna dominan untuk tim Mercedes adalah?",
    imageUrl: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80",
    options: ["Merah", "Silver/Abu-abu", "Biru", "Orange"],
    correctAnswer: "Silver/Abu-abu"
  },
  {
    level: "basic",
    stage: 1,
    questionText: "Siapa yang menggantikan Lewis Hamilton di Mercedes tahun 2025?",
    imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    options: ["George Russell", "Valtteri Bottas", "Carlos Sainz", "Fernando Alonso"],
    correctAnswer: "Carlos Sainz"
  },
  {
    level: "basic",
    stage: 1,
    questionText: "Tim mana yang menguasai era 'Hybrid' F1 (2014-2020)?",
    imageUrl: "https://images.unsplash.com/photo-1562591176-788df0a256f1?auto=format&fit=crop&w=800&q=80",
    options: ["Ferrari", "Red Bull Racing", "Mercedes", "McLaren"],
    correctAnswer: "Mercedes"
  },
  {
    level: "basic",
    stage: 1,
    questionText: "Driver mana yang memiliki nomor balap 1 sebagai juara bertahan?",
    imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
    options: ["Charles Leclerc", "Lando Norris", "George Russell", "Max Verstappen"],
    correctAnswer: "Max Verstappen"
  },

  // ─── STAGE 2: QUALIFYING (10 Soal) ───
  {
    level: "basic",
    stage: 2,
    questionText: "Berapa banyak bagian dalam sesi Qualifying (Q) di F1 modern?",
    imageUrl: "https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=800&q=80",
    options: ["1 part", "2 parts", "3 parts", "5 parts"],
    correctAnswer: "3 parts"
  },
  {
    level: "basic",
    stage: 2,
    questionText: "Apa itu 'Pole Position' dalam F1?",
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    options: ["Tempat yang paling jauh dari garis finish", "Posisi start di garis depan (posisi 1) di race", "Posisi start di lap terakhir", "Posisi yang paling aman"],
    correctAnswer: "Posisi start di garis depan (posisi 1) di race"
  },
  {
    level: "basic",
    stage: 2,
    questionText: "Berapa banyak driver yang lolos ke Q3 (babak final Qualifying)?",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    options: ["5 driver", "10 driver", "15 driver", "20 driver"],
    correctAnswer: "10 driver"
  },
  {
    level: "basic",
    stage: 2,
    questionText: "Tyre compound apa yang sering digunakan saat Qualifying?",
    imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
    options: ["Hard", "Medium", "Soft", "Intermediate"],
    correctAnswer: "Soft"
  },
  {
    level: "basic",
    stage: 2,
    questionText: "Driver Ferrari siapa yang paling sering meraih pole position di musim-musim terakhir?",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    options: ["Charles Leclerc", "Carlos Sainz", "Sebastian Vettel", "Kimi Räikkönen"],
    correctAnswer: "Charles Leclerc"
  },
  {
    level: "basic",
    stage: 2,
    questionText: "Tim mana yang memiliki pembalap Lando Norris?",
    imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    options: ["Ferrari", "McLaren", "Mercedes", "Red Bull Racing"],
    correctAnswer: "McLaren"
  },
  {
    level: "basic",
    stage: 2,
    questionText: "Berapa banyak lap yang biasanya dilakukan pembalap di Q1?",
    imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    options: ["1-2 lap", "3-4 lap", "5-10 lap", "Tidak ada limit"],
    correctAnswer: "5-10 lap"
  },
  {
    level: "basic",
    stage: 2,
    questionText: "Driver apa yang sering disebut sebagai 'Qualifying Specialist' karena sangat cepat saat Qualifying?",
    imageUrl: "https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&w=800&q=80",
    options: ["Max Verstappen", "Lewis Hamilton", "Charles Leclerc", "George Russell"],
    correctAnswer: "George Russell"
  },
  {
    level: "basic",
    stage: 2,
    questionText: "Apa pengaruh cuaca (hujan) terhadap Qualifying di F1?",
    imageUrl: "https://images.unsplash.com/photo-1562591176-788df0a256f1?auto=format&fit=crop&w=800&q=80",
    options: ["Tidak ada pengaruh", "Bisa postpone atau reschedule Qualifying", "Qualifying dibatalkan selamanya", "Semua pembalap harus gunakan wet tyre"],
    correctAnswer: "Bisa postpone atau reschedule Qualifying"
  },
  {
    level: "basic",
    stage: 2,
    questionText: "Berapa poin yang didapat driver untuk meraih pole position di Qualifying?",
    imageUrl: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80",
    options: ["0 poin", "1 poin", "3 poin", "5 poin"],
    correctAnswer: "0 poin"
  },

  // ─── STAGE 3: RACE (10 Soal) ───
  {
    level: "basic",
    stage: 3,
    questionText: "Berapa panjang typical F1 race?",
    imageUrl: "https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=800&q=80",
    options: ["Minimal 1 jam", "Minimal 2 jam", "Minimal 3 jam", "Minimal 4 jam"],
    correctAnswer: "Minimal 2 jam"
  },
  {
    level: "basic",
    stage: 3,
    questionText: "Berapa banyak point yang didapat pembalap untuk menang race?",
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    options: ["10 point", "15 point", "20 point", "25 point"],
    correctAnswer: "25 point"
  },
  {
    level: "basic",
    stage: 3,
    questionText: "Apa itu 'Safety Car' dalam F1?",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    options: ["Mobil yang jaga keselamatan di pit lane", "Mobil yang dipimpin pembalap untuk lap tambahan", "Mobil yang lead race saat kondisi dangerous (accident/cuaca buruk)", "Mobil backup kalau mobil race rusak"],
    correctAnswer: "Mobil yang lead race saat kondisi dangerous (accident/cuaca buruk)"
  },
  {
    level: "basic",
    stage: 3,
    questionText: "Berapa banyak pembalap yang bisa finish race dan mendapat poin?",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    options: ["Top 5 finish", "Top 8 finish", "Top 10 finish", "Top 15 finish"],
    correctAnswer: "Top 10 finish"
  },
  {
    level: "basic",
    stage: 3,
    questionText: "Pitstop adalah kesempatan untuk ganti apa di mobil F1?",
    imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
    options: ["Ban saja", "Bahan bakar saja", "Ban dan bahan bakar", "Semua spare part yang rusak"],
    correctAnswer: "Ban dan bahan bakar"
  },
  {
    level: "basic",
    stage: 3,
    questionText: "Tim apa yang memiliki pembalap Oscar Piastri?",
    imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    options: ["Ferrari", "McLaren", "Alpine", "Alfa Romeo"],
    correctAnswer: "McLaren"
  },
  {
    level: "basic",
    stage: 3,
    questionText: "Driver yang baru pindah ke Ferrari di 2025 adalah siapa?",
    imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    options: ["Sergio Pérez", "Lewis Hamilton", "George Russell", "Charles Leclerc"],
    correctAnswer: "Lewis Hamilton"
  },
  {
    level: "basic",
    stage: 3,
    questionText: "Apa itu 'DRS' yang sering diomongin saat race?",
    imageUrl: "https://images.unsplash.com/photo-1562591176-788df0a256f1?auto=format&fit=crop&w=800&q=80",
    options: ["Direct Racing System", "Drag Reduction System", "Digital Rear Speed", "Double Racing Speed"],
    correctAnswer: "Drag Reduction System"
  },
  {
    level: "basic",
    stage: 3,
    questionText: "Berapa lap yang biasanya dilakukan dalam satu F1 race?",
    imageUrl: "https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&w=800&q=80",
    options: ["10-20 lap", "20-40 lap", "40-60 lap", "60-100 lap"],
    correctAnswer: "40-60 lap"
  },
  {
    level: "basic",
    stage: 3,
    questionText: "Siapa yang menjadi person utama yang communicate dengan driver via radio saat race?",
    imageUrl: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80",
    options: ["Tim Principal", "Race Engineer", "Strategy Engineer", "Chief Mechanic"],
    correctAnswer: "Race Engineer"
  },
];

async function main() {
  console.log("🏎️  F1 Quiz — Firestore Basic Questions Seeder");
  console.log("═══════════════════════════════════════════════\n");

  // Step 1: Delete ALL existing "basic" level questions
  console.log("🗑️  Step 1: Deleting existing BASIC level questions from Firestore...");
  const qRef = collection(db, "questions");
  const snapshot = await getDocs(qRef);
  
  let deletedCount = 0;
  const deletePromises = [];
  
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.level === "basic") {
      deletePromises.push(deleteDoc(doc(db, "questions", docSnap.id)));
      deletedCount++;
    }
  });
  
  await Promise.all(deletePromises);
  console.log(`   ✅ Deleted ${deletedCount} existing basic questions.\n`);

  // Step 2: Add all 30 new basic questions
  console.log("📝 Step 2: Adding 30 new BASIC level questions...\n");
  
  let addedCount = 0;
  for (const q of BASIC_QUESTIONS) {
    const docRef = await addDoc(collection(db, "questions"), q);
    addedCount++;
    const stageLabel = q.stage === 1 ? "FP" : q.stage === 2 ? "QUALI" : "RACE";
    console.log(`   [${stageLabel}] #${addedCount} → ${q.questionText.substring(0, 60)}...  (${docRef.id})`);
  }

  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`✅ DONE! Successfully seeded ${addedCount} basic questions to Firestore.`);
  console.log(`   - Stage 1 (Free Practice): 10 soal`);
  console.log(`   - Stage 2 (Qualifying):    10 soal`);
  console.log(`   - Stage 3 (Race):          10 soal`);
  console.log(`\n🏁 Firestore collection: "questions"`);
  
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Fatal Error:", err);
  process.exit(1);
});
