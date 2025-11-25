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

const canvasWidth = parseInt(params.get("width")); // fallback default
const canvasHeight = parseInt(params.get("height"));
const canvasId = params.get("id");
canvas.style.display = "block";
sidebar.style.display = "flex";
canvas.width = canvasWidth;
canvas.height = canvasHeight;
sidebar.height = canvasHeight;

onIdTokenChanged(auth, (user) => {
    if (!user) {
        window.location.href = "/login.html";
    }
});

let currentColor = "#fff";
function connect(x1, x2, y1, y2, color) {
    ctx.lineWidth = 5;
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
    console.log(data);
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
        currentColor = button.dataset.color;
        chosenColor.style.backgroundColor = currentColor;
        canDraw = true;
    });
});

const customPicker = document.getElementById("customColor");
customPicker.addEventListener("input", () => {
    currentColor = customPicker.value;
    chosenColor.style.backgroundColor = currentColor;
    canDraw = true;
});
