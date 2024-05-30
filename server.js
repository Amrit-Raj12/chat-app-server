const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const mongoose = require("mongoose")
const cors = require("cors") // Import cors middleware

const app = express()
app.use(cors()) // Use cors middleware
const server = http.createServer(app)
const io = socketIo(server)

mongoose
  .connect("mongodb://localhost:27017/voice_chat_app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected")
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
  })

app.get("/", (req, res) => {
  res.send("Server is running")
})

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id)

  socket.on("message", (message) => {
    io.emit("message", message)
  })

  socket.on("callUser", ({ userToCall, signalData, from }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from })
  })

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
