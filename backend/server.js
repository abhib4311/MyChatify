const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const UserRoutes = require("./routes/userRoutes");
const ChatRoutes = require("./routes/chatRoutes");
const MessageRoutes = require("./routes/messageRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Middleware to parse JSON
app.use(express.json());

// ------------------- CORS Configuration -------------------
// Allow requests from any origin
app.use(cors({
    origin: "*",  // Allows all origins
    credentials: true, // Allow cookies if needed (you can remove this if you don't need cookies)
}));

// API routes
app.use("/api/user", UserRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/message", MessageRoutes);

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.get("/", (req, res) => {
        res.send("API is running..");
    });
// ------------------ Socket.io Setup ------------------

// Initialize socket.io
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*",  // Allows all origins
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    // Handle user setup and join a personal room
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log("User ID: " + userData._id);
        socket.emit("connected");
    });

    // Handle joining a chat room
    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined room: " + room);
    });

    // Handle typing status
    socket.on("typing", (room) => socket.to(room).emit("typing"));
    socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

    // Handle new messages
    socket.on("new message", (newMessageReceived) => {
        const chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) return;

            socket.to(user._id).emit("message received", newMessageReceived);
        });
    });
});
