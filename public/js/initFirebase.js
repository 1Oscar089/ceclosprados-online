// =========================================================================
// public/js/initFirebase.js
// Configuración Central de Firebase para la plataforma C.E. Los Prados
// =========================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInAnonymously, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    initializeFirestore, 
    persistentLocalCache, 
    persistentMultipleTabManager, 
    doc, 
    getDoc, 
    getDocFromCache, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    getDocsFromCache,
    updateDoc,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuración oficial de tu proyecto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCm3JTxcaK5iNw4jikevlb8jKda1TexyHM",
    authDomain: "ceclosprados-online.firebaseapp.com",
    projectId: "ceclosprados-online",
    storageBucket: "ceclosprados-online.firebasestorage.app",
    messagingSenderId: "81400223246",
    appId: "1:81400223246:web:5e8a976bcfa567af410e5f",
    measurementId: "G-347HPXZHHE"
};

// 1. Inicializar la Aplicación
const app = initializeApp(firebaseConfig);

// 2. Inicializar Autenticación (Google y Anónima para la demo)
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// 3. Inicializar Firestore con OPTIMIZACIÓN EXTREMA
// Esto activa la caché offline y sincroniza la memoria entre varias pestañas abiertas
export const db = initializeFirestore(app, { 
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) 
});

// 4. Exportamos las herramientas para usarlas en otras páginas (Login, Clases, Tareas)
// Exportarlas desde aquí nos evita tener que escribir URLs largas en cada archivo HTML.
export { 
    signInWithPopup, 
    signInAnonymously, 
    signOut, 
    onAuthStateChanged, 
    doc, 
    getDoc, 
    getDocFromCache, 
    setDoc,
    updateDoc,
    arrayUnion,
    collection, 
    query, 
    where, 
    getDocs, 
    getDocsFromCache 
};