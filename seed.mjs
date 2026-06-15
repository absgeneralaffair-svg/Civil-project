import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { 
    INITIAL_FASES, 
    INITIAL_STOK, 
    INITIAL_SUB_PEKERJAAN,
    INITIAL_RAB,
    INITIAL_PENGGUNAAN,
    INITIAL_MASUK,
    INITIAL_ORDERS
} from './backup_data.mjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedData() {
  console.log("Memulai proses seeding SELURUH data ke Firebase...");

  try {
    for (const item of INITIAL_FASES) {
      await setDoc(doc(collection(db, "projects"), item.id), item);
    }
    for (const item of INITIAL_STOK) {
      await setDoc(doc(collection(db, "materials"), item.id), item);
    }
    for (const item of INITIAL_SUB_PEKERJAAN) {
      await setDoc(doc(collection(db, "subPekerjaan"), item.id), item);
    }
    for (const item of INITIAL_RAB) {
      await setDoc(doc(collection(db, "rabs"), item.id), item);
    }
    for (const item of INITIAL_PENGGUNAAN) {
      await setDoc(doc(collection(db, "penggunaanLogs"), item.id), item);
    }
    for (const item of INITIAL_MASUK) {
      await setDoc(doc(collection(db, "barangMasuk"), item.id), item);
    }
    for (const item of INITIAL_ORDERS) {
      await setDoc(doc(collection(db, "orders"), item.id), item);
    }

    console.log("Semua data berhasil di-seed secara utuh!");
    process.exit(0);
  } catch (error) {
    console.error("Gagal melakukan seeding:", error);
    process.exit(1);
  }
}

seedData();
