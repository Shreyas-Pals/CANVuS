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

const socket = io();
const canvas = document.getElementById("canvas");
const sidebar = document.getElementById("sidebar");
const ctx = canvas.getContext("2d");
const params = new URLSearchParams(window.location.search);

const canvasWidth = parseInt(params.get("width"));
const canvasHeight = parseInt(params.get("height"));
const canvasId = params.get("id");
const access = params.get("access");

canvas.style.display = "block";
sidebar.style.display = "flex";
canvas.width = canvasWidth;
canvas.height = canvasHeight;
sidebar.height = canvasHeight;

// console.log(access);
if (access === "private") {
    const addPeopleBtn = document.getElementById("addPeopleBtn");
    addPeopleBtn.style.display = "inline-block";
    addPeopleBtn.addEventListener("click", () => {
        const modal = new bootstrap.Modal(document.getElementById("emailModal"));
        modal.show();
    });

    const addEmail = document.getElementById("addEmail");
    const emailInput = document.getElementById("emailInput");
    const email = emailInput.value.trim();

    addEmail.addEventListener("click", () => {
        const emailRegex =
            /^[^@]+@(hyderabad|goa|pilani|dubai)\.bits-pilani\.ac\.in$/;

        if (!emailRegex.test(email)) {
            alert("Invalid Email. Emails must be from the BITS Pilani Domain.");
            return;
        }

        if (!email) return;

        const li = document.createElement("li");
        li.className =
            "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
        ${email}
        <button class="btn btn-sm btn-outline-danger removeBtn">Remove</button>
    `;

        document.getElementById("emailList").appendChild(li);

        input.value = "";
    });

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("removeBtn")) {
            e.target.closest("li").remove();
            emailInput.focus();
        }
    });
}

onIdTokenChanged(auth, (user) => {
    if (!user) {
        window.location.href = "/login.html";
    }
});

let strokeWidth = 5;

let currentColor = "#fff";
function connect(x1, x2, y1, y2, color) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

socket.emit("sendingId", canvasId);

socket.on("pixel_update_message", (data) => {
    connect(data.x1, data.x2, data.y1, data.y2, data.color);
});

socket.on("canvas_init", (data) => {
    // console.log(data);
    for (const cmd of data) {
        connect(cmd.x1, cmd.x2, cmd.y1, cmd.y2, cmd.color);
    }
});

let prevX = null;
let prevY = null;
let canDraw = false;

canvas.addEventListener("mousemove", (e) => {
    if (!canDraw) return;
    if (e.buttons !== 1) {
        prevX = null;
        prevY = null;
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (prevX !== null && prevY !== null) {
        connect(prevX, x, prevY, y, currentColor);
        socket.emit("pixel_update_sent", {
            x1: prevX,
            x2: x,
            y1: prevY,
            y2: y,
            color: currentColor,
        });
    }

    prevX = x;
    prevY = y;
});

const colorButtons = document.querySelectorAll(".color-square");
const chosenColor = document.getElementById("chosen-color");
colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
        canvas.classList.remove("eraser-cursor");
        strokeWidth = 5;
        currentColor = button.dataset.color;
        chosenColor.style.backgroundColor = currentColor;
        canDraw = true;
    });
});

const customPicker = document.getElementById("customColor");
customPicker.addEventListener("input", () => {
    canvas.classList.remove("eraser-cursor");
    strokeWidth = 5;
    currentColor = customPicker.value;
    chosenColor.style.backgroundColor = currentColor;
    canDraw = true;
});

const erase = document.getElementById("erase");
erase.addEventListener("click", () => {
    canvas.classList.add("eraser-cursor");
    strokeWidth = 15;
    currentColor = "white";
    chosenColor.style.backgroundColor = currentColor;
    canDraw = true;
});

const home = document.getElementById("home");
home.addEventListener("click", () => {
    window.location.href = "/dashboard.html";
});
