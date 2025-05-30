import { db } from './firebase'; // Adjust path if firebase.ts is elsewhere
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import type { TradeInfo, Item, Cash } from '@/types';

/**
 * Reads all item documents from the 'item' collection in Firestore
 * and maps them to the Item[] type.
 * Assumes your item collection is named 'item'.
 */
export async function getInventoryItems(): Promise<Item[]> {
  const itemsCollectionRef = collection(db, 'item'); // Collection name is 'item'
  try {
    const querySnapshot = await getDocs(itemsCollectionRef);
    const inventory: Item[] = [];
    querySnapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data();
      inventory.push({
        id: docSnap.id, // The document's auto-generated ID
        name: data.name as string,
        stock: data.stock as number,
      });
    });
    return inventory;
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    // Depending on your error handling strategy, you might throw,
    // return empty array, or return a result object with an error.
    throw error;
  }
}

/**
 * Reads all tradeinfo documents from the 'tradeinfo' collection in Firestore
 * and maps them to the TradeInfo[] type.
 * Assumes your tradeinfo collection is named 'tradeinfo'.
 */
export async function getTradeLog(): Promise<TradeInfo[]> {
  const tradesCollectionRef = collection(db, 'tradeinfo'); // Collection name is 'tradeinfo'
  try {
    const querySnapshot = await getDocs(tradesCollectionRef);
    const trades: TradeInfo[] = [];
    querySnapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data();

      // The 'id' field within the Firestore 'tradeinfo' document's data
      // (data.id) refers to the item's ID, as per your description.
      // The TradeInfo type's 'id' field is for the tradeinfo document's own ID (docSnap.id).
      // If you need data.id (the item's ID) in your TradeInfo object,
      // you'll need to add a field like 'itemId' to your TradeInfo interface.

      const tradeEntry: TradeInfo = {
        id: docSnap.id, // The tradeinfo document's auto-generated ID
        quantity: data.quantity as number,
        amount: data.amount as number,
        isPurchase: data.isPurchase as boolean,
        isCash: data.isCash as boolean,
        date: data.date as string,
        newName: data.newName as string,
        // If you added itemId to TradeInfo type:
        // itemId: data.id as string, // This is the item's ID from Firestore data
      };
      trades.push(tradeEntry);
    });
    return trades;
  } catch (error) {
    console.error("Error fetching trade log:", error);
    throw error;
  }
}

/**
 * Reads a specific cash document from the 'cash' collection in Firestore
 * and maps it to the Cash type.
 * Assumes your cash collection is named 'cash'.
 * You need to specify WHICH cash document to fetch.
 * If there's only one, or a known one (e.g., 'main', 'currentStatus').
 */
const DEFAULT_CASH_DOCUMENT_ID = 'n7durBkG2jOEEmHfypaF';

export async function getCashDocument(): Promise<Cash | null> {
  // Ensure 'db' is defined and imported correctly.
  // For this example, let's mock it or assume it's globally available.
  // const db = {} as any; // Placeholder if db is not imported in this snippet

  const cashCollectionRef = collection(db, 'cash');
  try {
    const querySnapshot = await getDocs(cashCollectionRef);
    if (!querySnapshot.empty) {
      const cashDoc = querySnapshot.docs[0];
      const rawData: DocumentData | undefined = cashDoc.data();

      if (!rawData) {
        console.warn(`Document ${cashDoc.id} in 'cash' collection has no data.`);
        return null;
      }

      const convertedCash: Cash = {
        10000: 0,
        5000: 0,
        1000: 0,
        500: 0,
        100: 0,
        50: 0,
        10: 0,
        5: 0,
        1: 0,
      };

      for (const key in rawData) {
        if (Object.prototype.hasOwnProperty.call(rawData, key)) {
          const numericKey = Number(key); // Convert string key to number
          const value = rawData[key];

          // Check if the key is a valid number and the value is also a number
          if (!isNaN(numericKey) && typeof value === 'number') {
            convertedCash[numericKey as keyof Cash] = value;
          } else {
            // Log a warning for keys that couldn't be converted or values that aren't numbers
            console.warn(`Skipping invalid entry in cash document: key='${key}', value='${value}'`);
          }
        }
      }

      return convertedCash;
    } else {
      console.warn("No documents found in 'cash' collection.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching or processing cash document:", error);
    // Re-throwing the error is often good practice unless you have specific error handling.
    throw error;
  }
}

export async function addNewItem(itemData: Omit<Item, 'id'>): Promise<string> {
/**
 * Appends a new item to 'item' collection with an autogenerated ID.
 * Logs the new item's ID to the console.
 * @param itemData - The data for the new item (name, stock).
 * @returns The ID of the newly created item.
 */
  const itemsCollectionRef = collection(db, 'item');
  try {
    // Firestore data for the new item should not include the 'id' field,
    // as Firestore will generate it.
    const docRef = await addDoc(itemsCollectionRef, {
      name: itemData.name,
      stock: itemData.stock,
    });
    console.log("New item added with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding new item: ", error);
    throw error;
  }
}


export async function editExistingItem(itemId: string, updates: Partial<Omit<Item, 'id'>>): Promise<void> {
/**
 * 2. Accesses an existing item with a given ID and edits its attributes.
 * @param itemId - The ID of the item to update.
 * @param updates - An object containing the fields to update (e.g., { name: "New Name", stock: 50 }).
 *                  Can be a partial update.
 */
  if (!itemId) {
    throw new Error("Item ID must be provided to edit an item.");
  }
  const itemDocRef = doc(db, 'item', itemId);
  try {
    await updateDoc(itemDocRef, updates);
    console.log(`Item with ID ${itemId} updated successfully.`);
  } catch (error) {
    console.error(`Error updating item with ID ${itemId}: `, error);
    // You might want to check if the error is because the document doesn't exist
    // e.g., if (error.code === 'not-found') { ... }
    throw error;
  }
}

export async function addNewTradeInfo(tradeData: TradeInfo): Promise<string> {
/**
 * 3. Appends a new tradeinfo document to the 'tradeinfo' collection with an autogenerated ID.
 * @param tradeData - The data for the new trade.
 *                    If your firestore `tradeinfo` document contains an `id` field that refers to an `item`'s id,
 *                    ensure `tradeData` includes that field (e.g., `tradeData.itemId`).
 * @returns The ID of the newly created tradeinfo document.
 */

  const tradesCollectionRef = collection(db, 'tradeinfo');

  try {
    const docRef = await addDoc(tradesCollectionRef, tradeData);
    console.log("New tradeinfo added with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding new tradeinfo: ", error);
    throw error;
  }
}


export async function setCash(
  fullCashData: Cash,
  cashDocId: string = DEFAULT_CASH_DOCUMENT_ID
): Promise<void> {
  if (!cashDocId) {
    throw new Error("Cash document ID must be provided to set cash.");
  }
  const cashDocRef = doc(db, 'cash', cashDocId);
  try {
    // setDoc will overwrite the entire document with fullCashData.
    // If the document does not exist, it will be created.
    await setDoc(cashDocRef, fullCashData);
    console.log(`Cash document with ID ${cashDocId} set/created successfully.`);
  } catch (error) {
    console.error(`Error setting cash document with ID ${cashDocId}: `, error);
    throw error;
  }
}
