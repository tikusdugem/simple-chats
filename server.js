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
        if(reply) users = JSON.parse(reply);
    });
    client.get("messages", (err, reply) => {
        if(reply) messages = JSON.parse(reply);
    });
});

app.use(express.static("resources"));

app.get("/", (err, res) => {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    console.log("User Connected!");

    io.emit("user-count", users.length);

    socket.on("join", (userName) => {
        if(users.indexOf(userName) === -1) {
            console.log(userName, "Connected!");

            users.push(userName);
            client.set("users", JSON.stringify(users));

            socket.emit("status", {
                "userName": userName,
                status: 1
            });

            io.emit("user-count", users.length);
            io.emit("user-online", users);
            socket.emit("messages", messages);
        } else {
            socket.emit("status", {
                status: 0
            });
        }
    });

    socket.on("leave", (userName) => {
        if(userName) {
            console.log(userName, "Disconnected!");

            users.splice(users.indexOf(userName), 1);
            client.set("users", JSON.stringify(users));

            socket.emit("status", {
                "userName": userName,
                status: 1
            });

            io.emit("user-count", users.length);
            io.emit("user-online", users);
        } else {
            socket.emit("status", {
                status: 0
            });
        }
    });

    socket.on("message", (data) => {
        messages.push({
            "user": data.username,
            "message": data.message
        });
        client.set("messages", JSON.stringify(messages));

        io.emit("users", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected!");
    });
});