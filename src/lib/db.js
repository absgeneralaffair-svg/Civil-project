import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, setDoc, runTransaction } from 'firebase/firestore';

const PROJECT_ID = "main-project";

export const subscribeCollection = (collectionName, callback) => {
  return onSnapshot(collection(db, "projects", PROJECT_ID, collectionName), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    callback(data);
  }, (error) => {
    console.error(`Error listening to ${collectionName}:`, error);
  });
};

export const addItem = async (collectionName, data) => {
  const { id, ...payload } = data;
  const colRef = collection(db, "projects", PROJECT_ID, collectionName);
  const docRef = await addDoc(colRef, payload);
  return docRef.id;
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
  const logRef = doc(db, "projects", PROJECT_ID, "penggunaan", id);
  if (!materialId) {
    await deleteDoc(logRef);
    return;
  }
  const stockRef = doc(db, "projects", PROJECT_ID, "stok", materialId);
  await runTransaction(db, async (transaction) => {
    const stockDoc = await transaction.get(stockRef);
    if (stockDoc.exists()) {
      const currentStock = Number(stockDoc.data().stok) || 0;
      transaction.update(stockRef, { stok: currentStock + Number(jumlah) });
    }
    transaction.delete(logRef);
  });
};

export const updatePenggunaanTransaction = async (id, oldMaterialId, oldJumlah, newData) => {
  const logRef = doc(db, "projects", PROJECT_ID, "penggunaan", id);
  if (!oldMaterialId) {
    const newStockRef = doc(db, "projects", PROJECT_ID, "stok", newData.materialId);
    await runTransaction(db, async (transaction) => {
      const newStockDoc = await transaction.get(newStockRef);
      if (newStockDoc.exists()) {
        const currentStock = Number(newStockDoc.data().stok) || 0;
        transaction.update(newStockRef, { stok: currentStock - Number(newData.jumlah) });
      }
      transaction.update(logRef, newData);
    });
    return;
  }
  
  if (oldMaterialId !== newData.materialId) {
    const oldStockRef = doc(db, "projects", PROJECT_ID, "stok", oldMaterialId);
    const newStockRef = doc(db, "projects", PROJECT_ID, "stok", newData.materialId);
    await runTransaction(db, async (transaction) => {
      const oldStockDoc = await transaction.get(oldStockRef);
      const newStockDoc = await transaction.get(newStockRef);
      if (oldStockDoc.exists()) {
        const currentStock = Number(oldStockDoc.data().stok) || 0;
        transaction.update(oldStockRef, { stok: currentStock + Number(oldJumlah) }); // Kembalikan stok lama
      }
      if (newStockDoc.exists()) {
        const currentStock = Number(newStockDoc.data().stok) || 0;
        transaction.update(newStockRef, { stok: currentStock - Number(newData.jumlah) }); // Potong stok baru
      }
      transaction.update(logRef, newData);
    });
    return;
  }

  const stockRef = doc(db, "projects", PROJECT_ID, "stok", oldMaterialId);
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
  const logRef = doc(db, "projects", PROJECT_ID, "barangMasuk", id);
  if (!materialId) {
    await deleteDoc(logRef);
    return;
  }
  const stockRef = doc(db, "projects", PROJECT_ID, "stok", materialId);
  await runTransaction(db, async (transaction) => {
    const stockDoc = await transaction.get(stockRef);
    if (stockDoc.exists()) {
      const currentStock = Number(stockDoc.data().stok) || 0;
      transaction.update(stockRef, { stok: currentStock - Number(jumlah) });
    }
    transaction.delete(logRef);
  });
};

export const updateBarangMasukTransaction = async (id, oldMaterialId, oldJumlah, newData) => {
  const logRef = doc(db, "projects", PROJECT_ID, "barangMasuk", id);
  if (!oldMaterialId) {
    const newStockRef = doc(db, "projects", PROJECT_ID, "stok", newData.materialId);
    await runTransaction(db, async (transaction) => {
      const newStockDoc = await transaction.get(newStockRef);
      if (newStockDoc.exists()) {
        const currentStock = Number(newStockDoc.data().stok) || 0;
        transaction.update(newStockRef, { stok: currentStock + Number(newData.jumlah) });
      }
      transaction.update(logRef, newData);
    });
    return;
  }
  
  if (oldMaterialId !== newData.materialId) {
    const oldStockRef = doc(db, "projects", PROJECT_ID, "stok", oldMaterialId);
    const newStockRef = doc(db, "projects", PROJECT_ID, "stok", newData.materialId);
    await runTransaction(db, async (transaction) => {
      const oldStockDoc = await transaction.get(oldStockRef);
      const newStockDoc = await transaction.get(newStockRef);
      if (oldStockDoc.exists()) {
        const currentStock = Number(oldStockDoc.data().stok) || 0;
        transaction.update(oldStockRef, { stok: currentStock - Number(oldJumlah) }); // Tarik kembali stok lama
      }
      if (newStockDoc.exists()) {
        const currentStock = Number(newStockDoc.data().stok) || 0;
        transaction.update(newStockRef, { stok: currentStock + Number(newData.jumlah) }); // Tambah stok baru
      }
      transaction.update(logRef, newData);
    });
    return;
  }

  const stockRef = doc(db, "projects", PROJECT_ID, "stok", oldMaterialId);
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
