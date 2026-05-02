require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");

const connectDB = require("./config/db");
const { initSocket } = require("./socket/socket");

const app = express();
const server = http.createServer(app);

connectDB();
initSocket(server);

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

server.listen(5000, () => console.log("Server running on port 5000"));