import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const redisClient = createClient();

app.use(express.static("public"));


redisClient.on("error", (err) => console.log("Redis couldn't connect", err));
async function connectToRedis() {
    await redisClient.connect();
    console.log("Redis connected!");
}

connectToRedis()

io.on("connection", async(socket)=> {
    console.log("A user connected");

    const cache = await redisClient.lRange("canvas:1",0,-1); 
    socket.emit('canvas_init',cache.map(JSON.parse));
    socket.on("pixel_update_sent",(data) => {
        redisClient.rPush('canvas:1',JSON.stringify(data)).catch(() => console.error('Redis has a problem..'));
        socket.broadcast.emit('pixel_update_message', data);
    });

    socket.on("disconnect", () => console.log("A user disconnected"));
});



process.on("SIGINT", async () => {
    await redisClient.del("canvas:1");
    process.exit(0);
});

server.listen(3000, "0.0.0.0" ,() => console.log("Server running"));
