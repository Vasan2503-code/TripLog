const express = require("express")
require("dotenv").config();
const cors = require('cors');
const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'https://trip-log-4w6o.vercel.app', 'https://trip-log-one.vercel.app'], 
    credentials: true,
}));
const connectDB = require("./config/db");
const verify = require("./routes/AuthRoutes");
const tripRoutes = require("./routes/TripRoutes");
const chatController = require("./controller/ChatController");
const locationRoutes = require("./routes/LocationRoutes");
const cloudRoutes = require('./routes/CloudRoutes');
const AdvancedAIRoutes = require('./routes/AdvancedAIRoutes');

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
app.use('/location-suggestions', AdvancedAIRoutes);
app.use('/finance', require('./routes/ExpenseRoutes'));

server.listen(process.env.PORT, () => {
    console.log("Server Listening in port ", process.env.PORT);
})