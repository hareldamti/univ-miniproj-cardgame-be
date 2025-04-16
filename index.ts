const express = require("express");
import { Request, Response, NextFunction } from "express";
const app = express();
const http = require("http");
import * as mediasoup from "mediasoup";

import { Server, Socket } from "socket.io";
const httpServer = http.createServer(app);

import { NO_ROOM, validateToken } from "./src/utils";
import { RedisClient } from "./src/RedisClient";
import { SocketTags } from "./package/Consts";
import { initializeGame } from "./package/Logic/Initialization";
import {
  GameAction,
  GameActionTypes,
  gameReducer,
} from "./package/Entities/GameActions";
import {
  PlayerAction,
  PlayerActionType,
} from "./package/Entities/PlayerActions";
import { handlePlayerAction } from "./package/Logic/GameLogic";

let redisClient: RedisClient;

const io = new Server(httpServer, {
  cors: {
    origin: '*', // or '*' during dev
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!validateToken(token)) return next(new Error("Authentication error"));
  redisClient.registerSocket(socket.id, token);
  return next();
});

io.on(
  "connection",
  (socket) =>
    new Promise(async () => {
      const username = await redisClient.getSocketUser(socket.id);
      if (!username) {
        socket.disconnect();
        return;
      }
      console.log(`${username} connected`);
      await socket.join(NO_ROOM);
      const roomStatus = await redisClient.getRoomStatus();
      await io.emit(SocketTags.JOIN, roomStatus);

      socket.on("disconnect", async () => {
        await redisClient.unregisterSocket(socket.id);
        await redisClient.removeUserFromAllRooms(username);
        const roomStatus = await redisClient.getRoomStatus();
        await io.emit(SocketTags.LEAVE, roomStatus);
        console.log(`${username} disconnected`);
      });

      socket.on(SocketTags.JOIN, async (roomId: string) => {
        await redisClient.addUserToRoom(roomId, username);
        await socket.leave(NO_ROOM);
        await socket.join(roomId);
        const roomStatus = await redisClient.getRoomStatus();
        await io.emit(SocketTags.JOIN, roomStatus);
        console.log(`${username} joined room ${roomId}`);
      });

      socket.on(SocketTags.LEAVE, async (roomId: string) => {
        await redisClient.removeUserFromRoom(roomId, username);
        await socket.leave(roomId);
        await socket.join(NO_ROOM);
        const roomStatus = await redisClient.getRoomStatus();
        await io.emit(SocketTags.LEAVE, roomStatus);
        console.log(`${username} left room ${roomId}`);
      });

      socket.on(SocketTags.START, async () => {
        const roomId = await redisClient.getUserRoom(username);
        if (!roomId) return;
        const users = await redisClient.getUsersInRoom(roomId);
        const initializedGame = initializeGame(users);
        redisClient.setGameState(roomId, initializedGame);
        await io.to(roomId).emit(SocketTags.START);
        const roomStatus = await redisClient.getRoomStatus();
        await io.emit(SocketTags.LEAVE, roomStatus);
        console.log(`Starting match in ${roomId}`);
      });

      socket.on(SocketTags.INIT, async () => {
        const roomId = await redisClient.getUserRoom(username);
        if (!roomId) return;
        const initializedGameState = await redisClient.getGameState(roomId);
        initializedGameState.user.playerId =
          initializedGameState.players.findIndex(
            (player) => player.username === username
          );
        await socket.emit(SocketTags.INIT, {
          type: GameActionTypes.InitializeGame,
          payload: { initialized: initializedGameState },
        });
        console.log(`Initialized game for ${username} in room ${roomId}`);
      });

      socket.on(SocketTags.ACTION, async (action: PlayerAction) => {
        const roomId = await redisClient.getUserRoom(username);
        if (!roomId) return;
        const gameState = await redisClient.getGameState(roomId);
        const playerId = gameState.players.findIndex(
          (player) => player.username === username
        );
        if (playerId == -1) {
          console.error(`User ${username} not found in room ${roomId}`);
          return;
        }
        const {updates, updatedGame} = handlePlayerAction(action, playerId, gameState);
        await io.to(roomId).emit(SocketTags.UPDATE, updates);
        await redisClient.setGameState(roomId, updatedGame);
        console.log(
          `Handled ${username}'s ${
            PlayerActionType[action.type]
          } in room ${roomId}`
        );
      });

      socket.on(SocketTags.AUDIO, async (data) => {
          const roomId = await redisClient.getUserRoom(username);
          if (!roomId) return;
          io.to(roomId).emit(SocketTags.AUDIO, {senderId: socket.id, data});
          console.log(`Sent ${username}'s voice message in room ${roomId}`);
      });
    })
);

app.get("/", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/index.html");
});

httpServer.listen(process.env.PORT, '0.0.0.0', async () => {
  redisClient = new RedisClient();
  console.log(`listening on *:${process.env.PORT}`);
});
