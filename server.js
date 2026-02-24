const express = require("express")
require("dotenv").config();
const app = express();
const connectDB = require("./config/db");
const verify = require("./routes/AuthRoutes");
const tripRoutes = require("./routes/TripRoutes");
const chatController = require("./controller/ChatController");
const locationRoutes = require("./routes/LocationRoutes");
const cloudRoutes = require('./routes/CloudRoutes');
const AIRoutes = require('./routes/AIRoutes');

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    chatController.handleConnection(socket, io);
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(express.json());
connectDB();

app.get('/', (req, res) => {
    res.status(200).send({ message: "Welcome to TripLog" });
})


app.use('/verify', verify);
app.use('/trip', tripRoutes);
app.use('/location', locationRoutes);
app.use('/upload-image', cloudRoutes);
app.use('/location-suggestions', AIRoutes);

server.listen(process.env.PORT, () => {
    console.log("Server Listening in port ", process.env.PORT);
})