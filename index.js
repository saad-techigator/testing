const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the "public" directory
app.use(express.static("public"));

// Route for the home page
app.get("/", (req, res) => {
  //Showing this route on the http://localhost:3000
  res.send("Working");
  // uncomment the line below if html needed
  // res.sendFile(__dirname + "/index.html");
});

// Function to call an API when a user connects
// async function fetchUserData(socket) {
//   try {
//     const response = await fetch(
//       "https://wordleblitz.websitedemolynks.co/api/user/2",
//       {
//         headers: {
//           Authorization: "Bearer 25|G6II1jrmZrqVb21Nj5gb3Ugp0DAjO1jQzoC6SkHW", // Replace with your actual API token
//         },
//       }
//     );
//     const users = await response.json();
//     // socket.emit("chat message", msg);
//     console.log("res__", users);
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//   }
// }

async function getData(endpoint, token) {
  try {
    const response = await fetch(
      "https://wordleblitz.websitedemolynks.co/api"+endpoint,
      {
        headers: {
          Authorization: "Bearer "+token,
        },
      }
    );
    data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

async function postData(endpoint, token, body) {
  try {
    const response = await fetch(
      "https://wordleblitz.websitedemolynks.co/api"+endpoint,
      {
        headers: {
          Authorization: "Bearer "+token,
        },
        body: body,
      }
    );
    data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

async function callApi(url, method = "get", headers = {}, data = {}) {
  try {
    const response = await axios({
      method,
      url,
      headers,
      data,
    });

    jsonData = JSON.stringify(response.data);
    console.log("API response: ", jsonData);
    return jsonData;
  } catch (error) {
    // Handle the error, log it, or throw it based on your needs
    console.error("API error:", error.message);
    // throw error;
  }
}

// Socket.io connection handling
io.on("connection", async (socket) => {
  console.log("A user connected");

  // fetchUserData(socket);

  //getUser
  socket.on("fetch_user_data", async (endpoint, token) => {
    console.log(endpoint, token);
    data = await callApi('https://wordleblitz.websitedemolynks.co/api'+endpoint,'get',{Authorization: "Bearer "+token,});
    // data = await getData(endpoint, token);
    io.emit("user_data", data);
  });

  //Game - Wordle blitz
  socket.on("get_allGames", async (endpoint, token) => {
    console.log(endpoint, token);
    data = await callApi('https://wordleblitz.websitedemolynks.co/api'+endpoint,'get',{Authorization: "Bearer "+token,});
    io.emit("get_allGames", data);
  });

  socket.on("find_game", async (endpoint, token, sendingUserId, sendingGameId) => {
    console.log(endpoint, token, sendingUserId, sendingGameId);
    data = await callApi('https://wordleblitz.websitedemolynks.co/api'+endpoint,'post',{Authorization: "Bearer "+token,},{'user_id':sendingUserId,'game_id':sendingGameId});
    io.emit("find_game", data);
  });

  socket.on("game_leave", async (endpoint, token, sendingUserId, sendingRoomId) => {
    console.log(endpoint, token, sendingUserId, sendingRoomId);
    data = await callApi('https://wordleblitz.websitedemolynks.co/api'+endpoint,'post',{Authorization: "Bearer "+token,},{'user_id':sendingUserId,'room_id':sendingRoomId});
    io.emit("game_leave", data);
  });

  socket.on("winner_found", async (endpoint, token, sendingUserId, sendingRoomId, score, time) => {
    console.log(endpoint, token, sendingUserId, sendingRoomId);
    data = await callApi('https://wordleblitz.websitedemolynks.co/api'+endpoint,'post',{Authorization: "Bearer "+token,},{'room_id': sendingRoomId,'user_id': sendingUserId,'score': score,'time': time});
    io.emit("winner_found", data);
  });

  // Listen for chat messages
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);

    // Broadcast the message to all connected clients
    io.emit("chat message", msg);
  });

  socket.on("winner_found", (data) => {
    console.log("winner_found: " + data);

    // Broadcast the message to all connected clients
    io.emit("chat message", data);
  });

  // Listen for disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server on port 3000
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
