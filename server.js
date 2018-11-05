const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const redis = require("redis");
const client = redis.createClient();
const port = Number(process.env.port || 2700);

http.listen(port, () => {
    console.log("");
    console.log("==========================");
    console.log("Server ready at port:", port);
});

client.on("connect", () => {
    console.log("Redis Server Connected!");
    console.log("==========================");
    console.log("");
});

let users = [];
let messages = [];

client.once("ready", () => {
    client.get("users", (err, reply) => {
        if(reply) users = JSON.stringify(reply);
    });
    client.get("messages", (err, reply) => {
        if(reply) messages = JSON.stringify(reply);
    });
});

app.use(express.static("resources"));

app.get("/", (err, res) => {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    console.log("User Connected!");

    socket.on("message", (data) => {
        io.emit("users", data);
    });

    socket.on("message-store", (data) => {
        messages.push({
            "user": data.user,
            "message": data.message
        });

        client.set("messages", JSON.stringify(messages));
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected!");
    });
});