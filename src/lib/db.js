import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, setDoc } from 'firebase/firestore';

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
