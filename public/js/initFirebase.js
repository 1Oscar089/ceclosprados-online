// Public/js/initFirebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth, indexedDBLocalPersistence, initializeAuth, browserPopupRedirectResolver } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCm3JTxcaK5iNw4jikevlb8jKda1TexyHM",
  authDomain: "ceclosprados-online.firebaseapp.com",
  projectId: "ceclosprados-online",
  storageBucket: "ceclosprados-online.firebasestorage.app",
  messagingSenderId: "81400223246",
  appId: "1:81400223246:web:5e8a976bcfa567af410e5f",
  measurementId: "G-347HPXZHHE"
};

// Singleton
let app, auth, db, analytics, storage;

export function initFirebase() {
  if (app) return { auth, db, analytics, storage };
  
  app = initializeApp(firebaseConfig);
  
  // Auth con persistencia IndexedDB
  auth = initializeAuth(app, {
    persistence: indexedDBLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver
  });
  
  // Firestore con nueva API de cache (reemplaza enableIndexedDbPersistence)
  db = initializeFirestore(app, {
    cache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
  
  // Storage para archivos
  storage = getStorage(app);
  
  // Analytics (opcional, con fallback)
  analytics = null;
  isSupported().then(yes => { if (yes) analytics = getAnalytics(app); });
  
  return { auth, db, analytics, storage };
}

// Export directo para imports rápidos
export const getAuthInstance = () => auth;
export const getDbInstance = () => db;
export const getStorageInstance = () => storage;
export const getAnalyticsInstance = () => analytics;