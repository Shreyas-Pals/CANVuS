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
const newcanvasBtn = document.getElementById("newCanvasBtn");
const token = localStorage.getItem("jwt_token");

onIdTokenChanged(auth, async (user) => {
    if (!user) {
        localStorage.removeItem("jwt_token");
        return;
    }
    console.log("Token refresh");
    const newIdToken = await user.getIdToken();

    const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: newIdToken }),
    });

    const data = await res.json();
    localStorage.setItem("jwt_token", data.token);
});

const canvasList = document.getElementById("canvasList");
const canvasModal = new bootstrap.Modal(document.getElementById("canvasModal"));
async function fetchCanvases() {
    try {
        canvasList.innerHTML = "Token is Invalid, Refresh The Page.";
        const response = await fetch("/api/canvases", {
            headers: { Authorization: `Bearer ${token}` },
        });

        const canvases = await response.json();

        canvases.forEach((canvas) => {
            const card = document.createElement("div");
            card.className = "canvas-card";
            card.innerHTML = `${canvas.name} <span style="font-size:10px; color:#555">${canvas.height}px * ${canvas.width}px</span>`;

            canvasList.appendChild(card);
            card.addEventListener("click", () => {
                window.location.href = `/canvas.html?id=${canvas.id}&height=${canvas.height}&width=${canvas.width}`;
            });
        });
    } catch (err) {
        console.error("Error fetching canvases:", err);
    }
}

fetchCanvases();

newcanvasBtn.addEventListener("click", () => {
    try {
        canvasModal.show();
        document
            .getElementById("canvasForm")
            .addEventListener("submit", async function (e) {
                //This is for preventing form submission and reload:- (default behaviour)
                e.preventDefault();
                if (!this.checkValidity()) {
                    this.classList.add("was-validated");
                    return;
                }

                const name = document.getElementById("canvasName").value;
                const width = document.getElementById("canvasWidth").value || 50;
                const height = document.getElementById("canvasHeight").value || 50;

                const response = await fetch("/api/canvases", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name: name, height: height, width: width }),
                });

                const data = await response.json();
                console.log("Canvas created:", data);

                const card = document.createElement("div");
                card.className = "canvas-card";
                card.innerHTML = `${data.name} <span style="font-size:10px; color:#555">${data.height}px * ${data.width}px</span>`;
                canvasList.appendChild(card);
                canvasModal.hide();

                card.addEventListener("click", () => {
                    window.location.href = `/canvas.html?id=${data.id}&height=${height}&width=${width}`;
                });
            });
    } catch (err) {
        console.log("Error creating a new canvas", err);
    }
});
