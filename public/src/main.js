import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    onIdTokenChanged,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCERDtC-uZIW56b6h2zrMpaVQbMkhgdhPE",

    authDomain: "canvus-db331.firebaseapp.com",

    projectId: "canvus-db331",

    storageBucket: "canvus-db331.firebasestorage.app",

    messagingSenderId: "187869281206",

    appId: "1:187869281206:web:463b59754f9d4fa1cddf17",

    measurementId: "G-MRPS5Q8MP4",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

async function login() {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (
        user.email.endsWith("@hyderabad.bits-pilani.ac.in") ||
        user.email.endsWith("@pilani.bits-pilani.ac.in") ||
        user.email.endsWith("@goa.bits-pilani.ac.in") ||
        user.email.endsWith("@dubai.bits-pilani.ac.in")
    ) {
        auth.signOut();
        alert("Use a BITS college email to login.");
    }

    const idToken = await user.getIdToken();

    const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
    });
    const token_response_json = await response.json();
    // console.log(token_response_json.token);
    localStorage.setItem("jwt_token", token_response_json.token);
}

const signin_button = document.getElementById("googleSignIn");

onAuthStateChanged(auth, (user) => {
    if (user) {
        signin_button.textContent = "Dashboard";
        signin_button.addEventListener("click", () => {
            window.location.href = "/dashboard.html";
        });
    } else {
        signin_button.onclick = login;
    }
});

onIdTokenChanged(auth, async (user) => {
    if (!user) {
        localStorage.removeItem("jwt_token");
        return;
    }
    // console.log("Token refresh");
    const newIdToken = await user.getIdToken();

    const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: newIdToken }),
    });

    const data = await res.json();
    localStorage.setItem("jwt_token", data.token);
});
