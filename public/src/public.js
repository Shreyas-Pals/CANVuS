import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
    getAuth,
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
const token = localStorage.getItem("jwt_token");
const canvasList = document.getElementById("canvasList");
async function fetchCanvases() {
    try {
        const response = await fetch("/api/canvases/?access=public", {
            headers: { Authorization: `Bearer ${token}` },
        });

        const canvases = await response.json();

        canvases.forEach((canvas) => {
            const card = document.createElement("div");
            card.className = "canvas-card";
            card.innerHTML = `${canvas.name} <span style="font-size:10px; color:#555">${canvas.height}px * ${canvas.width}px</span>`;

            canvasList.appendChild(card);
            card.addEventListener("click", () => {
                window.location.href = `/canvas.html?id=${canvas.id}&height=${canvas.height}&width=${canvas.width}&access=${canvas.id}`;
            });
        });
    } catch (err) {
        console.error("Error fetching canvases", err);
    }
}

onIdTokenChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "/index.html";
    }
    // console.log("Token refresh");
    const newIdToken = await user.getIdToken();
    // console.log(newIdToken);
    const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: newIdToken }),
    });

    const data = await res.json();
    localStorage.setItem("jwt_token", data.token);
    fetchCanvases();
});
