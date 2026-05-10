import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { createClient } from '@supabase/supabase-js';

// Configuration drawn from project config
const firebaseConfig = {
  apiKey: "AIzaSyC5_ujs7Vqi_FQv2BpQiVpqpCHG_YkZW_0",
  authDomain: "f1-quiz-8e9a1.firebaseapp.com",
  projectId: "f1-quiz-8e9a1",
  storageBucket: "f1-quiz-8e9a1.firebasestorage.app",
  messagingSenderId: "766261564505",
  appId: "1:766261564505:web:716b830cc15d45ed1a0d48",
};

const supabaseUrl = "https://acbuspkgizigwkhmlebp.supabase.co";
const supabaseKey = "sb_publishable_iyYF8mfvwcSW-VGYiTuL4A_RpJZuHGa";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("\n========================================================");
  console.log("🚀 Starting Data Migration: Firestore -> Supabase");
  console.log("========================================================\n");

  try {
    // 1. Migrate Questions
    console.log("Fetching data from Firestore 'questions' collection...");
    const qSnapshot = await getDocs(collection(db, "questions"));
    const questions = [];
    
    qSnapshot.forEach(doc => {
      const data = doc.data();
      // Cleaning and flattening data to match SQL schema
      questions.push({
        level: data.level || "basic",
        stage: Number(data.stage) || 1,
        questionText: data.questionText || "",
        imageUrl: data.imageUrl || "",
        options: Array.isArray(data.options) ? data.options : [],
        correctAnswer: data.correctAnswer || ""
      });
    });
    
    console.log(`📊 Found ${questions.length} questions.`);

    if (questions.length > 0) {
      console.log("Uploading to Supabase 'questions' table...");
      // Insert chunked to avoid URL length limits if many, but simple works for <= a few hundred
      const { error: qErr } = await supabase.from('questions').insert(questions);
      
      if (qErr) {
        console.error("❌ Error inserting questions to Supabase:", qErr.message);
        console.error("Details:", qErr.details);
      } else {
        console.log("✅ Successfully migrated questions.");
      }
    }

    console.log("\n--------------------------------------------------------\n");

    // 2. Migrate Leaderboard
    console.log("Fetching data from Firestore 'leaderboard' collection...");
    const lbSnapshot = await getDocs(collection(db, "leaderboard"));
    const leaderboard = [];
    
    lbSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Validate timeTaken and score is numeric
      let scoreVal = Number(data.score);
      if (isNaN(scoreVal)) scoreVal = 0;
      
      let timeVal = data.timeTaken !== undefined ? Number(data.timeTaken) : null;
      if (isNaN(timeVal)) timeVal = null;

      leaderboard.push({
        name: data.name || "Anonymous",
        score: scoreVal,
        level: data.level || "basic",
        stage: Number(data.stage) || 1,
        timeTaken: timeVal,
        createdAt: data.createdAt || new Date().toISOString()
      });
    });

    console.log(`📊 Found ${leaderboard.length} leaderboard entries.`);

    if (leaderboard.length > 0) {
      console.log("Uploading to Supabase 'leaderboard' table...");
      const { error: lbErr } = await supabase.from('leaderboard').insert(leaderboard);
      
      if (lbErr) {
        console.error("❌ Error inserting leaderboard to Supabase:", lbErr.message);
        console.error("Details:", lbErr.details);
      } else {
        console.log("✅ Successfully migrated leaderboard.");
      }
    }

    console.log("\n========================================================");
    console.log("🎉 ALL DONE!");
    console.log("========================================================\n");
    
  } catch (err) {
    console.error("\n❌ CRITICAL FATAL ERROR during migration:");
    console.error(err);
  }
  
  process.exit(0);
}

main();
