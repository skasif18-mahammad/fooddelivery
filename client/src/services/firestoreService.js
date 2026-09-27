import { db } from '../firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, where, onSnapshot, serverTimestamp, orderBy 
} from 'firebase/firestore';

/**
 * 📦 1. Save an Order to Cloud Firestore
 */
export async function saveOrderToFirestore(order) {
  try {
    if (!db || !order || !order.orderId) return null;

    const orderRef = doc(db, 'orders', order.orderId);
    const orderData = {
      ...order,
      firestoreCreatedAt: serverTimestamp(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(orderRef, orderData, { merge: true });
    console.log(`✅ Order ${order.orderId} synced to Cloud Firestore`);
    return { success: true, orderId: order.orderId };
  } catch (error) {
    console.warn('⚠️ Firestore write warning (using local fallback):', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 📡 2. Real-Time Listener for Live Order Delivery Tracking
 * Streams changes automatically when the order status advances!
 */
export function subscribeToOrderFromFirestore(orderId, onUpdate) {
  try {
    if (!db || !orderId) return () => {};

    const orderRef = doc(db, 'orders', orderId);
    
    const unsubscribe = onSnapshot(
      orderRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log(`📡 Real-time Firestore update for ${orderId}:`, data.currentStage || data.manualStage);
          onUpdate(data);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot warning for ${orderId}:`, error.message);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Could not subscribe to Firestore order:', error.message);
    return () => {};
  }
}

/**
 * 🔄 3. Update Order Delivery Stage in Firestore
 */
export async function updateOrderStageInFirestore(orderId, nextStage) {
  try {
    if (!db || !orderId) return false;

    const orderRef = doc(db, 'orders', orderId);
    await setDoc(orderRef, {
      manualStage: nextStage,
      currentStage: nextStage,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Stage updated to '${nextStage}' in Firestore for ${orderId}`);
    return true;
  } catch (error) {
    console.warn('Could not update order stage in Firestore:', error.message);
    return false;
  }
}

/**
 * 📋 4. Fetch All Orders for a Specific User Phone Number
 */
export async function fetchUserOrdersFromFirestore(phone) {
  try {
    if (!db || !phone) return [];

    const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('customer.phone', '==', cleanPhone));

    const snapshot = await getDocs(q);
    const orders = [];
    snapshot.forEach(doc => {
      orders.push(doc.data());
    });

    console.log(`📦 Retrieved ${orders.length} orders from Firestore for +91 ${cleanPhone}`);
    return orders;
  } catch (error) {
    console.warn('Could not fetch user orders from Firestore:', error.message);
    return [];
  }
}

/**
 * 👤 5. Save or Update User Profile in Firestore
 */
export async function saveUserToFirestore(userData) {
  try {
    if (!db || !userData || !userData.phone) return null;

    const cleanPhone = userData.phone.toString().replace(/\D/g, '').slice(-10);
    const userRef = doc(db, 'users', cleanPhone);

    const profile = {
      ...userData,
      phone: cleanPhone,
      updatedAt: new Date().toISOString()
    };

    await setDoc(userRef, profile, { merge: true });
    console.log(`👤 User +91 ${cleanPhone} saved to Cloud Firestore`);
    return profile;
  } catch (error) {
    console.warn('Could not save user to Firestore:', error.message);
    return userData;
  }
}

/**
 * 🔍 6. Get User Profile from Firestore
 */
export async function getUserFromFirestore(phone) {
  try {
    if (!db || !phone) return null;

    const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
    const userRef = doc(db, 'users', cleanPhone);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.warn('Could not read user from Firestore:', error.message);
    return null;
  }
}

/**
 * 🥭 7. Seed or Sync Food Products (Mangoes, Pickles, Cooking Oil) to Firestore
 */
export async function seedProductsToFirestore(products) {
  try {
    if (!db || !products || products.length === 0) return false;

    for (const product of products) {
      const prodRef = doc(db, 'products', product.id);
      await setDoc(prodRef, product, { merge: true });
    }
    console.log(`✅ Synced ${products.length} products to Cloud Firestore collection 'products'`);
    return true;
  } catch (error) {
    console.warn('Could not seed products to Firestore:', error.message);
    return false;
  }
}

/**
 * 🛍️ 8. Fetch Food Catalog from Firestore
 */
export async function fetchProductsFromFirestore() {
  try {
    if (!db) return [];

    const prodCol = collection(db, 'products');
    const snapshot = await getDocs(prodCol);
    
    if (snapshot.empty) return [];

    const products = [];
    snapshot.forEach(doc => {
      products.push(doc.data());
    });

    return products;
  } catch (error) {
    console.warn('Could not read products from Firestore:', error.message);
    return [];
  }
}
