// ⚠️ Remplace "X.Y.Z" par une version actuelle si besoin.
// Import Firebase (SDK modulaire)
import { initializeApp } from "https://www.gstatic.com/firebasejs/X.Y.Z/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/X.Y.Z/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/X.Y.Z/firebase-firestore.js";

// 1) Config Firebase — à copier depuis la console Firebase (voir étape 3)
const firebaseConfig = {
  apiKey: "REMPLACEZ",
  authDomain: "REMPLACEZ",
  projectId: "REMPLACEZ",
  appId: "REMPLACEZ"
};

// 2) Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// 3) UI
const loginBtn   = document.getElementById("login");
const logoutBtn  = document.getElementById("logout");
const whoami     = document.getElementById("whoami");
const form       = document.getElementById("message-form");
const input      = document.getElementById("message-input");
const list       = document.getElementById("messages");

// 4) Auth anonyme
loginBtn.addEventListener("click", async () => { await signInAnonymously(auth); });
logoutBtn.addEventListener("click", async () => { await signOut(auth); });

onAuthStateChanged(auth, (user) => {
  if (user) {
    const short = user.uid.slice(0, 6);
    whoami.textContent = `Connecté (anonyme) — id: ${short}…`;
    loginBtn.hidden = true;
    logoutBtn.hidden = false;
    form.hidden = false;
  } else {
    whoami.textContent = "Non connecté";
    loginBtn.hidden = false;
    logoutBtn.hidden = true;
    form.hidden = true;
  }
});

// 5) Envoi d'un message
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  try {
    await addDoc(collection(db, "messages"), {
      text,
      uid: auth.currentUser?.uid ?? null,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    alert("Erreur: " + err.message);
  }
});

// 6) Flux en temps réel
const q = query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(25));
onSnapshot(q, (snapshot) => {
  list.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    // Sécurité XSS : toujours utiliser textContent
    li.textContent = data?.text ?? "";
    list.appendChild(li);
  });
});
