import express from "express";
import Websocket, { WebSocketServer } from "ws";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import http from "http";
import userRoute from "./routes/User.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { updateConversation } from "./controllers/Conversation.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//configure dotenv
const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true })); //correct this
app.use("/users", userRoute);
//---------------
//deployment
app.use(express.static(path.join(__dirname, "/client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/build", "index.html"));
});
//deployment
//---------------

const connect = async () => {
  mongoose.connect(process.env.MONGODB); //need to paste in connection to mongodb database
};

const server = http.createServer(app); //create a server to share between express and ws

const wss = new WebSocketServer({ noServer: true });
//seems that this is only running on cnnection

const clients = new Map(); //Initialize map

wss.on("connection", (ws, request) => {
  //ws is an instance of wss (i guess every connection from server creates a ws instance)
  // const token = request.headers;

  ws.on("message", (data, isBinary) => {
    try {
      //how do i do different things depending on what's sent by the client ?
      //on connection client sends id
      //then he sends conversation messages

      //data structure :
      //initializing:true/false
      //message:"message",
      const parsedData = JSON.parse(data);
      let tokenList = [];
      let senderId = "";
      if (request.headers.cookie) {
        request.headers.cookie.split(";").map((keypair) => {
          tokenList.push({
            name: keypair.split("=")[0],
            value: keypair.split("=")[1],
          });
        });

        jwt.verify(tokenList[0].value, process.env.JWT, (err, decoded) => {
          if (err) console.log("err:", err);
          else {
            senderId = decoded.id;
          }
        });
      }

      if (parsedData.initializing) {
        clients.set(ws, senderId); //storing the connection linked to the id of the request
      } else if (parsedData.message) {
        const recipientId = parsedData.recipientId; //the sender is the name need to get the recipient ID
        // console.log("senderId:", senderId, "recipientId:", recipientId);
        updateConversation(senderId, recipientId, parsedData.message);

        let recipientWs = null; //intializing to null so i can check whether or not it exists
        [...clients.keys()].forEach((key) => {
          if (clients.get(key) === recipientId) recipientWs = key;
        }); //check if connection is active
        if (recipientWs) {
          console.log("recipientWs", recipientWs);
          recipientWs.send(
            JSON.stringify({ message: parsedData.message, senderId: senderId })
          );
        } //sending message to recipient
      }

      if (parsedData.logout) {
        //logging out
        app.post("users/auth/logout", () => {
          //remove ws connection from map and close socket conection
          clients.delete(ws);
          ws.close();
          process.nextTick(() => {
            if ([ws.OPEN, ws.CLOSING].includes(socket.readyState))
              socket.terminate();
          });
        });
      }
    } catch (err) {
      console.log("err", err);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

server.listen(process.env.PORT || 8080, () => {
  connect();
  console.log("up on 8080");
});
