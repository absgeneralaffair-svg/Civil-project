import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, setDoc, runTransaction } from 'firebase/firestore';

const PROJECT_ID = "main-project";

export const subscribeCollection = (collectionName, callback) => {
  return onSnapshot(collection(db, "projects", PROJECT_ID, collectionName), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    console.error(`Error listening to ${collectionName}:`, error);
  });
};

export const addItem = async (collectionName, data) => {
  // If data already has an 'id' from legacy structure, we could optionally use setDoc
  // But standard subcollections use addDoc to auto-generate IDs
  const colRef = collection(db, "projects", PROJECT_ID, collectionName);
  await addDoc(colRef, data);
};

export const updateItem = async (collectionName, id, data) => {
  // Remove 'id' field if it exists in data to avoid duplicating it
  const { id: _, ...updatePayload } = data;
  const docRef = doc(db, "projects", PROJECT_ID, collectionName, id);
  await updateDoc(docRef, updatePayload);
};

export const deleteItem = async (collectionName, id) => {
  const docRef = doc(db, "projects", PROJECT_ID, collectionName, id);
  await deleteDoc(docRef);
};

// Helper for initial migration
export const migrateArrayToCollection = async (collectionName, arrayData) => {
  for (const item of arrayData) {
    const { id, ...data } = item;
    // Use the existing ID as the document ID
    const docRef = doc(db, "projects", PROJECT_ID, collectionName, id);
    await setDoc(docRef, data);
  }
};

// --- TRANSACTIONAL FUNCTIONS ---

export const addPenggunaanTransaction = async (data) => {
  const stockRef = doc(db, "projects", PROJECT_ID, "stok", data.materialId);
  const logRef = doc(collection(db, "projects", PROJECT_ID, "penggunaan"));
  await runTransaction(db, async (transaction) => {
    const stockDoc = await transaction.get(stockRef);
    if (!stockDoc.exists()) throw new Error("Material tidak ditemukan di daftar stok!");
    const currentStock = Number(stockDoc.data().stok) || 0;
    transaction.update(stockRef, { stok: currentStock - Number(data.jumlah) });
    transaction.set(logRef, data);
  });
};

export const deletePenggunaanTransaction = async (id, materialId, jumlah) => {
  const stockRef = doc(db, "projects", PROJECT_ID, "stok", materialId);
  const logRef = doc(db, "projects", PROJECT_ID, "penggunaan", id);
  await runTransaction(db, async (transaction) => {
    const stockDoc = await transaction.get(stockRef);
    if (stockDoc.exists()) {
      const currentStock = Number(stockDoc.data().stok) || 0;
      transaction.update(stockRef, { stok: currentStock + Number(jumlah) });
    }
    transaction.delete(logRef);
  });
};

export const updatePenggunaanTransaction = async (id, materialId, oldJumlah, newData) => {
  if (materialId !== newData.materialId) {
    const logRef = doc(db, "projects", PROJECT_ID, "penggunaan", id);
    await updateDoc(logRef, newData);
    return;
  }
  const stockRef = doc(db, "projects", PROJECT_ID, "stok", materialId);
  const logRef = doc(db, "projects", PROJECT_ID, "penggunaan", id);
  await runTransaction(db, async (transaction) => {
    const stockDoc = await transaction.get(stockRef);
    if (stockDoc.exists()) {
      const currentStock = Number(stockDoc.data().stok) || 0;
      const diff = Number(newData.jumlah) - Number(oldJumlah);
      transaction.update(stockRef, { stok: currentStock - diff });
    }
    transaction.update(logRef, newData);
  });
};

export const addBarangMasukTransaction = async (data) => {
  const stockRef = doc(db, "projects", PROJECT_ID, "stok", data.materialId);
  const logRef = doc(collection(db, "projects", PROJECT_ID, "barangMasuk"));
  await runTransaction(db, async (transaction) => {
    const stockDoc = await transaction.get(stockRef);
    if (!stockDoc.exists()) throw new Error("Material tidak ditemukan di daftar stok!");
    const currentStock = Number(stockDoc.data().stok) || 0;
    transaction.update(stockRef, { stok: currentStock + Number(data.jumlah) });
    transaction.set(logRef, data);
  });
};

export const deleteBarangMasukTransaction = async (id, materialId, jumlah) => {
  const stockRef = doc(db, "projects", PROJECT_ID, "stok", materialId);
  const logRef = doc(db, "projects", PROJECT_ID, "barangMasuk", id);
  await runTransaction(db, async (transaction) => {
    const stockDoc = await transaction.get(stockRef);
    if (stockDoc.exists()) {
      const currentStock = Number(stockDoc.data().stok) || 0;
      transaction.update(stockRef, { stok: currentStock - Number(jumlah) });
    }
    transaction.delete(logRef);
  });
};

export const updateBarangMasukTransaction = async (id, materialId, oldJumlah, newData) => {
  if (materialId !== newData.materialId) {
    const logRef = doc(db, "projects", PROJECT_ID, "barangMasuk", id);
    await updateDoc(logRef, newData);
    return;
  }
  const stockRef = doc(db, "projects", PROJECT_ID, "stok", materialId);
  const logRef = doc(db, "projects", PROJECT_ID, "barangMasuk", id);
  await runTransaction(db, async (transaction) => {
    const stockDoc = await transaction.get(stockRef);
    if (stockDoc.exists()) {
      const currentStock = Number(stockDoc.data().stok) || 0;
      const diff = Number(newData.jumlah) - Number(oldJumlah);
      transaction.update(stockRef, { stok: currentStock + diff });
    }
    transaction.update(logRef, newData);
  });
};
