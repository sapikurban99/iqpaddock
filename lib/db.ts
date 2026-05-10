import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  where 
} from "firebase/firestore";

// Types
export interface Question {
  id?: string;
  level: "basic" | "intermediate" | "advanced";
  stage: number; // 1, 2, or 3
  questionText: string;
  imageUrl: string;
  options: string[];
  correctAnswer: string;
}

export interface LeaderboardEntry {
  id?: string;
  name: string;
  score: number;
  level: "basic" | "intermediate" | "advanced";
  stage: number; // 1, 2, or 3
  timeTaken?: number; // Time taken to complete in seconds
  createdAt: string;
}

// Default question bank — BASIC: 30 questions (10 per stage), INTERMEDIATE & ADVANCED: 2 per stage
const DEFAULT_QUESTIONS: Question[] = [
  // ═══ BASIC STAGE 1: FREE PRACTICE (10) ═══
  { id:"b1", level:"basic", stage:1, questionText:"Berapa total sesi Free Practice sebelum Qualifying di satu weekend F1?", imageUrl:"https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=800&q=80", options:["1 sesi","2 sesi","3 sesi","4 sesi"], correctAnswer:"3 sesi" },
  { id:"b2", level:"basic", stage:1, questionText:"Apa tujuan utama Free Practice dalam F1?", imageUrl:"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80", options:["Untuk menentukan juara","Untuk testing, setup, dan pembalap belajar track","Untuk entertainment fans","Tidak ada tujuan khusus"], correctAnswer:"Untuk testing, setup, dan pembalap belajar track" },
  { id:"b3", level:"basic", stage:1, questionText:"Pada FP3 (sesi ketiga Free Practice), kapan biasanya diadakan?", imageUrl:"https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&w=800&q=80", options:["Jumat pagi","Jumat sore","Sabtu pagi","Sabtu sore"], correctAnswer:"Sabtu pagi" },
  { id:"b4", level:"basic", stage:1, questionText:"Berapa lama durasi setiap sesi Free Practice?", imageUrl:"https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80", options:["30 menit","45 menit","60 menit","90 menit"], correctAnswer:"60 menit" },
  { id:"b5", level:"basic", stage:1, questionText:"Driver mana yang saat ini menjadi juara dunia F1 2024?", imageUrl:"https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80", options:["Max Verstappen","Lando Norris","Lewis Hamilton","Carlos Sainz"], correctAnswer:"Max Verstappen" },
  { id:"b6", level:"basic", stage:1, questionText:"Tim apa yang dipimpin oleh Max Verstappen di 2024?", imageUrl:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80", options:["Mercedes","Ferrari","Red Bull Racing","McLaren"], correctAnswer:"Red Bull Racing" },
  { id:"b7", level:"basic", stage:1, questionText:"Warna dominan untuk tim Mercedes adalah?", imageUrl:"https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80", options:["Merah","Silver/Abu-abu","Biru","Orange"], correctAnswer:"Silver/Abu-abu" },
  { id:"b8", level:"basic", stage:1, questionText:"Siapa yang menggantikan Lewis Hamilton di Mercedes tahun 2025?", imageUrl:"https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80", options:["George Russell","Valtteri Bottas","Carlos Sainz","Fernando Alonso"], correctAnswer:"Carlos Sainz" },
  { id:"b9", level:"basic", stage:1, questionText:"Tim mana yang menguasai era 'Hybrid' F1 (2014-2020)?", imageUrl:"https://images.unsplash.com/photo-1562591176-788df0a256f1?auto=format&fit=crop&w=800&q=80", options:["Ferrari","Red Bull Racing","Mercedes","McLaren"], correctAnswer:"Mercedes" },
  { id:"b10", level:"basic", stage:1, questionText:"Driver mana yang memiliki nomor balap 1 sebagai juara bertahan?", imageUrl:"https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80", options:["Charles Leclerc","Lando Norris","George Russell","Max Verstappen"], correctAnswer:"Max Verstappen" },
  // ═══ BASIC STAGE 2: QUALIFYING (10) ═══
  { id:"b11", level:"basic", stage:2, questionText:"Berapa banyak bagian dalam sesi Qualifying (Q) di F1 modern?", imageUrl:"https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=800&q=80", options:["1 part","2 parts","3 parts","5 parts"], correctAnswer:"3 parts" },
  { id:"b12", level:"basic", stage:2, questionText:"Apa itu 'Pole Position' dalam F1?", imageUrl:"https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80", options:["Tempat yang paling jauh dari garis finish","Posisi start di garis depan (posisi 1) di race","Posisi start di lap terakhir","Posisi yang paling aman"], correctAnswer:"Posisi start di garis depan (posisi 1) di race" },
  { id:"b13", level:"basic", stage:2, questionText:"Berapa banyak driver yang lolos ke Q3 (babak final Qualifying)?", imageUrl:"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80", options:["5 driver","10 driver","15 driver","20 driver"], correctAnswer:"10 driver" },
  { id:"b14", level:"basic", stage:2, questionText:"Tyre compound apa yang sering digunakan saat Qualifying?", imageUrl:"https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80", options:["Hard","Medium","Soft","Intermediate"], correctAnswer:"Soft" },
  { id:"b15", level:"basic", stage:2, questionText:"Driver Ferrari siapa yang paling sering meraih pole position di musim-musim terakhir?", imageUrl:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80", options:["Charles Leclerc","Carlos Sainz","Sebastian Vettel","Kimi Räikkönen"], correctAnswer:"Charles Leclerc" },
  { id:"b16", level:"basic", stage:2, questionText:"Tim mana yang memiliki pembalap Lando Norris?", imageUrl:"https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80", options:["Ferrari","McLaren","Mercedes","Red Bull Racing"], correctAnswer:"McLaren" },
  { id:"b17", level:"basic", stage:2, questionText:"Berapa banyak lap yang biasanya dilakukan pembalap di Q1?", imageUrl:"https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80", options:["1-2 lap","3-4 lap","5-10 lap","Tidak ada limit"], correctAnswer:"5-10 lap" },
  { id:"b18", level:"basic", stage:2, questionText:"Driver apa yang sering disebut sebagai 'Qualifying Specialist' karena sangat cepat saat Qualifying?", imageUrl:"https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&w=800&q=80", options:["Max Verstappen","Lewis Hamilton","Charles Leclerc","George Russell"], correctAnswer:"George Russell" },
  { id:"b19", level:"basic", stage:2, questionText:"Apa pengaruh cuaca (hujan) terhadap Qualifying di F1?", imageUrl:"https://images.unsplash.com/photo-1562591176-788df0a256f1?auto=format&fit=crop&w=800&q=80", options:["Tidak ada pengaruh","Bisa postpone atau reschedule Qualifying","Qualifying dibatalkan selamanya","Semua pembalap harus gunakan wet tyre"], correctAnswer:"Bisa postpone atau reschedule Qualifying" },
  { id:"b20", level:"basic", stage:2, questionText:"Berapa poin yang didapat driver untuk meraih pole position di Qualifying?", imageUrl:"https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80", options:["0 poin","1 poin","3 poin","5 poin"], correctAnswer:"0 poin" },
  // ═══ BASIC STAGE 3: RACE (10) ═══
  { id:"b21", level:"basic", stage:3, questionText:"Berapa panjang typical F1 race?", imageUrl:"https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=800&q=80", options:["Minimal 1 jam","Minimal 2 jam","Minimal 3 jam","Minimal 4 jam"], correctAnswer:"Minimal 2 jam" },
  { id:"b22", level:"basic", stage:3, questionText:"Berapa banyak point yang didapat pembalap untuk menang race?", imageUrl:"https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80", options:["10 point","15 point","20 point","25 point"], correctAnswer:"25 point" },
  { id:"b23", level:"basic", stage:3, questionText:"Apa itu 'Safety Car' dalam F1?", imageUrl:"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80", options:["Mobil yang jaga keselamatan di pit lane","Mobil yang dipimpin pembalap untuk lap tambahan","Mobil yang lead race saat kondisi dangerous (accident/cuaca buruk)","Mobil backup kalau mobil race rusak"], correctAnswer:"Mobil yang lead race saat kondisi dangerous (accident/cuaca buruk)" },
  { id:"b24", level:"basic", stage:3, questionText:"Berapa banyak pembalap yang bisa finish race dan mendapat poin?", imageUrl:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80", options:["Top 5 finish","Top 8 finish","Top 10 finish","Top 15 finish"], correctAnswer:"Top 10 finish" },
  { id:"b25", level:"basic", stage:3, questionText:"Pitstop adalah kesempatan untuk ganti apa di mobil F1?", imageUrl:"https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80", options:["Ban saja","Bahan bakar saja","Ban dan bahan bakar","Semua spare part yang rusak"], correctAnswer:"Ban dan bahan bakar" },
  { id:"b26", level:"basic", stage:3, questionText:"Tim apa yang memiliki pembalap Oscar Piastri?", imageUrl:"https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80", options:["Ferrari","McLaren","Alpine","Alfa Romeo"], correctAnswer:"McLaren" },
  { id:"b27", level:"basic", stage:3, questionText:"Driver yang baru pindah ke Ferrari di 2025 adalah siapa?", imageUrl:"https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80", options:["Sergio Pérez","Lewis Hamilton","George Russell","Charles Leclerc"], correctAnswer:"Lewis Hamilton" },
  { id:"b28", level:"basic", stage:3, questionText:"Apa itu 'DRS' yang sering diomongin saat race?", imageUrl:"https://images.unsplash.com/photo-1562591176-788df0a256f1?auto=format&fit=crop&w=800&q=80", options:["Direct Racing System","Drag Reduction System","Digital Rear Speed","Double Racing Speed"], correctAnswer:"Drag Reduction System" },
  { id:"b29", level:"basic", stage:3, questionText:"Berapa lap yang biasanya dilakukan dalam satu F1 race?", imageUrl:"https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&w=800&q=80", options:["10-20 lap","20-40 lap","40-60 lap","60-100 lap"], correctAnswer:"40-60 lap" },
  { id:"b30", level:"basic", stage:3, questionText:"Siapa yang menjadi person utama yang communicate dengan driver via radio saat race?", imageUrl:"https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80", options:["Tim Principal","Race Engineer","Strategy Engineer","Chief Mechanic"], correctAnswer:"Race Engineer" },

  // ================= INTERMEDIATE LEVEL (C3) =================
  // --- Stage 1 ---
  {
    id: "q6",
    level: "intermediate",
    stage: 1,
    questionText: "Which circuit features the breathtaking, high-speed uphill combination corner named 'Eau Rouge'?",
    imageUrl: "https://images.unsplash.com/photo-1562591176-788df0a256f1?auto=format&fit=crop&w=800&q=80",
    options: ["Spa-Francorchamps", "Suzuka", "Silverstone", "Red Bull Ring"],
    correctAnswer: "Spa-Francorchamps"
  },
  {
    id: "q7",
    level: "intermediate",
    stage: 1,
    questionText: "Who is the only driver in Formula 1 history to be crowned World Champion posthumously?",
    imageUrl: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80",
    options: ["Jochen Rindt", "Ayrton Senna", "Jim Clark", "Gilles Villeneuve"],
    correctAnswer: "Jochen Rindt"
  },
  // --- Stage 2 ---
  {
    id: "q8",
    level: "intermediate",
    stage: 2,
    questionText: "At which Grand Prix did Sebastian Vettel secure his first-ever Formula 1 victory in 2008 for Toro Rosso?",
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    options: ["Italian GP", "German GP", "Monaco GP", "Belgian GP"],
    correctAnswer: "Italian GP"
  },
  {
    id: "q9",
    level: "intermediate",
    stage: 2,
    questionText: "What was the innovative steering system introduced by Mercedes during the 2020 pre-season testing?",
    imageUrl: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80",
    options: ["DAS (Dual Axis Steering)", "FRIC Suspension", "F-Duct System", "Active Aero Steering"],
    correctAnswer: "DAS (Dual Axis Steering)"
  },
  // --- Stage 3 ---
  {
    id: "q10",
    level: "intermediate",
    stage: 3,
    questionText: "How many World Championships did Sebastian Vettel win with Red Bull Racing between 2010 and 2013?",
    imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    options: ["4", "3", "2", "5"],
    correctAnswer: "4"
  },
  {
    id: "q10_2",
    level: "intermediate",
    stage: 3,
    questionText: "Which driver holds the record for the most race entries in Formula 1 history?",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    options: ["Fernando Alonso", "Kimi Räikkönen", "Rubens Barrichello", "Lewis Hamilton"],
    correctAnswer: "Fernando Alonso"
  },

  // ================= ADVANCED LEVEL (C5) =================
  // --- Stage 1 ---
  {
    id: "q11",
    level: "advanced",
    stage: 1,
    questionText: "Pada musim 2021, tim balap mana yang mengejutkan paddock dengan menggunakan livery spesial 'Gulf Oil' berwarna biru muda dan oranye di Grand Prix Monaco?",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    options: ["McLaren", "Williams", "Alpine", "Aston Martin"],
    correctAnswer: "McLaren"
  },
  {
    id: "q11_2",
    level: "advanced",
    stage: 1,
    questionText: "Siapakah pembalap termuda yang pernah memenangkan balapan Grand Prix dalam sejarah Formula 1?",
    imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    options: ["Max Verstappen", "Sebastian Vettel", "Lewis Hamilton", "Charles Leclerc"],
    correctAnswer: "Max Verstappen"
  },
  // --- Stage 2 ---
  {
    id: "q12",
    level: "advanced",
    stage: 2,
    questionText: "Pada musim balap 2009, tim Brawn GP secara ajaib memenangkan kejuaraan dunia konstruktor di tahun pertama dan satu-satunya mereka. Siapakah pembalap yang menjadi Juara Dunia saat itu?",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    options: ["Jenson Button", "Rubens Barrichello", "Sebastian Vettel", "Fernando Alonso"],
    correctAnswer: "Jenson Button"
  },
  {
    id: "q12_2",
    level: "advanced",
    stage: 2,
    questionText: "Pada Grand Prix Kanada 2011 yang memecahkan rekor balapan terlama sepanjang sejarah, pembalap mana yang menang setelah melakukan 6 pit stop?",
    imageUrl: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80",
    options: ["Jenson Button", "Sebastian Vettel", "Mark Webber", "Michael Schumacher"],
    correctAnswer: "Jenson Button"
  },
  // --- Stage 3 ---
  {
    id: "q13",
    level: "advanced",
    stage: 3,
    questionText: "Inovasi aerodinamis radikal apa yang digunakan oleh tim Brabham pada mobil BT46B di Grand Prix Swedia 1978, yang memenangkan balapan tapi kemudian langsung dilarang?",
    imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    options: ["Fan car (Kipas penyedot di belakang)", "Six wheels (Enam roda)", "F-Duct", "Double Diffuser"],
    correctAnswer: "Fan car (Kipas penyedot di belakang)"
  },
  {
    id: "q13_2",
    level: "advanced",
    stage: 3,
    questionText: "Siapakah satu-satunya pembalap wanita yang berhasil mencetak poin dalam sejarah kejuaraan dunia Formula 1 resmi?",
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    options: ["Lella Lombardi", "Maria Teresa de Filippis", "Susie Wolff", "Danica Patrick"],
    correctAnswer: "Lella Lombardi"
  }
];

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: "lb1", name: "Ayrton_Fan", score: 150, level: "advanced", stage: 3, createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "lb2", name: "MaxV_Fanboy", score: 100, level: "advanced", stage: 2, createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "lb3", name: "LandoNorris4", score: 90, level: "intermediate", stage: 2, createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "lb4", name: "NewbieF1", score: 50, level: "basic", stage: 1, createdAt: new Date(Date.now() - 3600000 * 48).toISOString() }
];

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if Firebase keys are fully configured
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let db: any = null;
let useFirebase = false;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    useFirebase = true;
    console.log("Firebase initialized successfully in Paddock Pulse.");
  } catch (error) {
    console.warn("Failed to initialize Firebase, falling back to Local Storage:", error);
  }
} else {
  console.log("No Firebase config detected. Running Paddock Pulse in Local Storage mode.");
}

// --- TELEMETRY RESILIENT CIRCUIT BREAKER (TIMEOUT HELPER) ---
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Firebase network connection timed out")), timeoutMs)
    )
  ]);
};

// --- LOCAL STORAGE HELPERS ---
const getLocalQuestions = (): Question[] => {
  if (typeof window === "undefined") return DEFAULT_QUESTIONS;
  const data = localStorage.getItem("paddock_pulse_questions");
  if (!data) {
    localStorage.setItem("paddock_pulse_questions", JSON.stringify(DEFAULT_QUESTIONS));
    return DEFAULT_QUESTIONS;
  }
  return JSON.parse(data);
};

const saveLocalQuestions = (questions: Question[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("paddock_pulse_questions", JSON.stringify(questions));
};

const getLocalLeaderboard = (): LeaderboardEntry[] => {
  if (typeof window === "undefined") return DEFAULT_LEADERBOARD;
  const data = localStorage.getItem("paddock_pulse_leaderboard");
  if (!data) {
    localStorage.setItem("paddock_pulse_leaderboard", JSON.stringify(DEFAULT_LEADERBOARD));
    return DEFAULT_LEADERBOARD;
  }
  return JSON.parse(data);
};

const saveLocalLeaderboard = (entries: LeaderboardEntry[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("paddock_pulse_leaderboard", JSON.stringify(entries));
};

// --- PUBLIC DB API ---
export const dbService = {
  isFirebaseActive: () => useFirebase,

  // --- QUESTIONS CRUD ---
  async getQuestions(level?: "basic" | "intermediate" | "advanced", stage?: number): Promise<Question[]> {
    if (useFirebase && db) {
      try {
        const qRef = collection(db, "questions");
        const snapshot = await withTimeout(getDocs(qRef), 10000);
        const list: Question[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({ 
            id: docSnap.id, 
            level: data.level || 'basic',
            stage: Number(data.stage) || 1,
            questionText: data.questionText || '',
            imageUrl: data.imageUrl || '',
            options: data.options || [],
            correctAnswer: data.correctAnswer || ''
          } as Question);
        });

        console.log(`[PaddockIQ/DB] Firebase returned ${list.length} total questions`);

        // Seed default questions if Firestore is empty
        if (list.length === 0) {
          console.log("Seeding default questions into Firestore...");
          for (const q of DEFAULT_QUESTIONS) {
            const { id, ...qData } = q;
            await addDoc(collection(db, "questions"), qData);
          }
          let filtered = DEFAULT_QUESTIONS;
          if (level) filtered = filtered.filter(q => q.level === level);
          if (stage) filtered = filtered.filter(q => Number(q.stage) === Number(stage));
          console.log(`[PaddockIQ/DB] After seed, returning ${filtered.length} filtered`);
          return filtered;
        }

        let filtered = list;
        if (level) filtered = filtered.filter(q => q.level === level);
        if (stage) filtered = filtered.filter(q => Number(q.stage) === Number(stage));
        console.log(`[PaddockIQ/DB] Firebase filtered: ${filtered.length} (level=${level}, stage=${stage})`);
        return filtered;
      } catch (err) {
        console.warn("Firestore getQuestions failed or timed out. Tripping circuit breaker & falling back to local storage:", err);
        useFirebase = false; // trip the circuit breaker for this session
      }
    }

    // Local storage fallback
    console.log(`[PaddockIQ/DB] Using local storage fallback`);
    let filtered = getLocalQuestions();
    console.log(`[PaddockIQ/DB] Local storage has ${filtered.length} total questions`);
    if (level) filtered = filtered.filter(q => q.level === level);
    if (stage) filtered = filtered.filter(q => Number(q.stage) === Number(stage));
    console.log(`[PaddockIQ/DB] Local filtered: ${filtered.length} (level=${level}, stage=${stage})`);
    return filtered;
  },

  async addQuestion(question: Omit<Question, "id">): Promise<Question> {
    if (useFirebase && db) {
      try {
        const docRef = await withTimeout(addDoc(collection(db, "questions"), question), 10000);
        return { id: docRef.id, ...question };
      } catch (err) {
        console.warn("Firestore addQuestion failed or timed out. Falling back to local storage:", err);
        useFirebase = false; // trip circuit breaker
      }
    }

    const list = getLocalQuestions();
    const newQ = { id: Math.random().toString(36).substr(2, 9), ...question };
    list.push(newQ);
    saveLocalQuestions(list);
    return newQ;
  },

  async updateQuestion(id: string, updated: Partial<Question>): Promise<boolean> {
    if (useFirebase && db) {
      try {
        const qRef = doc(db, "questions", id);
        await withTimeout(updateDoc(qRef, updated), 10000);
        return true;
      } catch (err) {
        console.warn("Firestore updateQuestion failed or timed out:", err);
        useFirebase = false; // trip circuit breaker
      }
    }

    const list = getLocalQuestions();
    const idx = list.findIndex(q => q.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updated };
      saveLocalQuestions(list);
      return true;
    }
    return false;
  },

  async deleteQuestion(id: string): Promise<boolean> {
    if (useFirebase && db) {
      try {
        const qRef = doc(db, "questions", id);
        await withTimeout(deleteDoc(qRef), 10000);
        return true;
      } catch (err) {
        console.warn("Firestore deleteQuestion failed or timed out:", err);
        useFirebase = false; // trip circuit breaker
      }
    }

    const list = getLocalQuestions();
    const filtered = list.filter(q => q.id !== id);
    if (filtered.length !== list.length) {
      saveLocalQuestions(filtered);
      return true;
    }
    return false;
  },

  // --- LEADERBOARD ---
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (useFirebase && db) {
      try {
        const lbRef = collection(db, "leaderboard");
        const q = query(lbRef, orderBy("score", "desc"), limit(100));
        const snapshot = await withTimeout(getDocs(q), 10000);
        const list: LeaderboardEntry[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as LeaderboardEntry);
        });

        if (list.length === 0) {
          console.log("Seeding default leaderboard into Firestore...");
          for (const entry of DEFAULT_LEADERBOARD) {
            await addDoc(collection(db, "leaderboard"), entry);
          }
          return DEFAULT_LEADERBOARD.sort((a, b) => b.score - a.score);
        }

        return list;
      } catch (err) {
        console.warn("Firestore getLeaderboard failed or timed out. Tripping circuit breaker & falling back to local storage:", err);
        useFirebase = false; // trip circuit breaker
      }
    }

    // Local storage fallback
    return getLocalLeaderboard().sort((a, b) => b.score - a.score);
  },

  async addToLeaderboard(entry: Omit<LeaderboardEntry, "id">): Promise<LeaderboardEntry> {
    if (useFirebase && db) {
      try {
        const docRef = await withTimeout(addDoc(collection(db, "leaderboard"), entry), 10000);
        return { id: docRef.id, ...entry };
      } catch (err) {
        console.warn("Firestore addToLeaderboard failed or timed out:", err);
        useFirebase = false; // trip circuit breaker
      }
    }

    const list = getLocalLeaderboard();
    const newEntry = { id: Math.random().toString(36).substr(2, 9), ...entry };
    list.push(newEntry);
    saveLocalLeaderboard(list);
    return newEntry;
  },

  async resetLocalDb(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("paddock_pulse_questions");
      localStorage.removeItem("paddock_pulse_leaderboard");
      getLocalQuestions();
      getLocalLeaderboard();
    }
  },

  async forceSyncDefaultsToFirestore(): Promise<boolean> {
    if (useFirebase && db) {
      try {
        const qRef = collection(db, "questions");
        const snapshot = await withTimeout(getDocs(qRef), 4000);
        const deletePromises: any[] = [];
        snapshot.forEach((docSnap) => {
          deletePromises.push(deleteDoc(doc(db, "questions", docSnap.id)));
        });
        await Promise.all(deletePromises);

        for (const q of DEFAULT_QUESTIONS) {
          const { id, ...qData } = q;
          await addDoc(collection(db, "questions"), qData);
        }
        return true;
      } catch (err) {
        console.error("Failed to force sync defaults to Firestore:", err);
        throw err;
      }
    }
    return false;
  }
};
