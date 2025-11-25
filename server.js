import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import jwt from "jsonwebtoken";
import fs from "fs";
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();
import { Middleware } from "./middleware.js";
const path = process.env.SERVICE_ACCOUNT_CREDS;

const serviceAccountCreds = JSON.parse(fs.readFileSync(path, "utf8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountCreds),
});

const app = express();
const db = admin.firestore();
//app.use(middleware)
app.use(express.json());
//.createServer() takes in request listener as an argument. app - the express object which is callable - has a signature of app(req,res) so it is a request listener.
//server here is a raw node HTTP server.
const server = http.createServer(app);
const io = new Server(server);
const redisClient = createClient();

app.use(express.static("public"));

app.post("/api/auth", async (req, res) => {
    const { idToken } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);
    const jwtToken = jwt.sign(
        {
            uid: decoded.uid,
            email: decoded.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" },
    );

    res.json({ token: jwtToken });
});

app.use(Middleware);

app.post("/api/canvases", async (req, res) => {
    try {
        const { name, height, width } = req.body;
        const userId = req.user.uid;

        const canvasRef = await db
            .collection("users")
            .doc(userId)
            .collection("canvases")
            .add({
                name,
                height,
                width,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        const canvasDoc = await canvasRef.get();

        res.status(201).json({
            id: canvasRef.id,
            ...canvasDoc.data(),
        });
    } catch (error) {
        console.log("Error creating canvas:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/canvases", async (req, res) => {
    const userId = req.user.uid;

    const canvasesRef = await db
        .collection("users")
        .doc(userId)
        .collection("canvases")
        .orderBy("createdAt", "desc")
        .get();

    const result = canvasesRef.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));

    res.json(result);
});

redisClient.on("error", (err) => console.log("Redis couldn't connect", err));
async function connectToRedis() {
    await redisClient.connect();
    console.log("Redis connected!");
}

connectToRedis();

io.on("connection", async (socket) => {
    console.log("A user connected");
    socket.on("sendingId", async (canvasId) => {
        const cache = await redisClient.lRange(`canvas:${canvasId}`, 0, -1);
        socket.emit("canvas_init", cache.map(JSON.parse));
        socket.on("pixel_update_sent", (data) => {
            redisClient
                .rPush(`canvas:${canvasId}`, JSON.stringify(data))
                .catch(() => console.error("Redis has a problem.."));
            socket.broadcast.emit("pixel_update_message", data);
        });
    });
    socket.on("disconnect", () => console.log("A user disconnected"));
});

// process.on("SIGINT", async () => {
//     await redisClient.del("canvas:1");
//     process.exit(0);
// });
//
server.listen(3000, "0.0.0.0", () => console.log("Server running"));
