const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const UserRoutes = require("./routes/userRoutes")
const ChatRoutes = require("./routes/chatRoutes")
const MessageRoutes = require("./routes/messageRoutes")
const path = require("path");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// app.get('/', (req, res) => {
//   res.send('Hello, world!');
// });

connectDB();
app.use(express.json())
app.use("/api/user", UserRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/message", MessageRoutes);


const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// --------------------------deployment------------------------------

const NODE_ENV = process.env.NODE_ENV || "production";

// Resolve the directory for static assets
const buildPath = path.resolve(__dirname, "../frontend/build");

if (NODE_ENV === "production") {
    // Serve static files from the React application
    app.use(express.static(buildPath));

    // Serve the React application index.html on all other routes
    app.get("*", (req, res) => {
        res.sendFile(path.join(buildPath, "index.html"));
    });
} else {
    // A simple endpoint to check if the API is running
    app.get("/", (req, res) => {
        res.send("API is running..");
    });
    console.log(`Server running in ${NODE_ENV} mode`);
}
// --------------------------deployment------------------------------


const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    // Setting up user data and joining a personal room
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(userData._id)
        socket.emit("connected");
    });

    // Handling joining chat rooms
    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    // Handling typing status
    socket.on("typing", (room) => socket.to(room).emit("typing"));
    socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

    // Broadcasting a new message to other users in the chat
    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;

            socket.to(user._id).emit("message recieved", newMessageRecieved);
        });
    });

});



