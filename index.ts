const express = require('express');
import { Request, Response, NextFunction } from "express";
const app = express();
const http = require('http');
import { Server, Socket } from "socket.io";
const httpServer = http.createServer(app);
import { createClient } from "redis";
import { exit } from "process";

import { NO_ROOM, validateToken } from "./src/utils";
import { SocketTags } from "./package/Consts"
import { initializeGame } from "./package/Logic/Initialization"
import { GameAction, GameActionTypes } from "./package/Entities/GameActions"
import { GameState } from "./package/Entities/State";


const redisClient = createClient();
redisClient.on('error', err => {console.log('Redis Client Error', err); exit(1);});
redisClient.connect();
redisClient.flushAll();


const io = new Server(httpServer, {
    cors: {
      //origin: "https://example.com",
      //allowedHeaders: ["my-custom-header"],
      //credentials: true
    }
  });

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!validateToken(token)) return next(new Error("Authentication error"));
    registerSocket(socket.id, token);
    return next();
});

io.on('connection', (socket) => new Promise(async () => { 
  const username = await getSocketUser(socket.id);
  if (!username) {socket.disconnect(); return; }
  console.log(`${username} connected`);
  socket.join(NO_ROOM);
  socket.on('disconnect',() => {
    unregisterSocket(socket.id);
    removeUserFromAllRooms(username);
    console.log(`${username} disconnected`);
  });
  
  socket.on(SocketTags.JOIN, async (roomId: string) => {
    await addUserToRoom(roomId, username);
    await socket.leave(NO_ROOM);
    await socket.join(roomId);
    const users = await getUsersInRoom(roomId);
    await io.to(roomId).emit(SocketTags.JOIN, {room: roomId, users});
    console.log(`${username} joined room ${roomId}`);
  });

  socket.on(SocketTags.START, async () => {
    const roomId = await getUserRoom(username);
    if (!roomId) return;
    const users = await getUsersInRoom(roomId);
    const initializedGame = initializeGame(users);
    setGameState(roomId, initializedGame);
    await io.to(roomId).emit(SocketTags.START);
    console.log(`Starting match in ${roomId}`);
  });

  socket.on(SocketTags.INIT, async () => {
    const roomId = await getUserRoom(username);
    if (!roomId) return;
    const initializedGameState = await getGameState(roomId);
    initializedGameState.user.playerIdx = initializedGameState.players.findIndex(player => player.username === username);
    await socket.emit(SocketTags.INIT, {type: GameActionTypes.InitializeGame, payload: {initialized: initializedGameState}});
    console.log(`Initialized game for ${username} in room ${roomId}`);
  });

  socket.on(SocketTags.ACTION, async () => {
    const roomId = await getUserRoom(username);
    roomId && initMatch(socket, roomId);
  });
})
);


app.get('/', (req: Request, res: Response) => {
    res.sendFile(__dirname + '/index.html');
});

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});



function registerSocket(socketId: string, username: string) {
  return redisClient.set(`socket:${socketId}:user`, username);
}

function getSocketUser(socketId: string) {
  return redisClient.get(`socket:${socketId}:user`);
}

function unregisterSocket(socketId: string) {
  return redisClient.del(`socket:${socketId}:user`);
}

async function initMatch(socket: Socket, roomId: string) {
  }

function addUserToRoom(roomId: string, username: string) {
  return redisClient.sAdd(`room:${roomId}:users`, username).then( () =>
         redisClient.set(`user:${username}:room`, roomId)
  );

}

function getUserRoom(username: string) {
  return redisClient.get(`user:${username}:room`);
}

function removeUserFromRoom(roomId: string, username: string) {
  return redisClient.sRem(`room:${roomId}:users`, username).then( () =>
         redisClient.del(`user:${username}:room`)
);
}

function removeUserFromAllRooms(username: string) {
  return redisClient.keys(`room:*:users`).then(rooms => rooms.forEach(async room => {
    if (await redisClient.sIsMember(room, username))
      await redisClient.sRem(room, username);
  })
  );
}

function getUsersInRoom(roomId: string) {
  return redisClient.sMembers(`room:${roomId}:users`);
}

function setGameState(roomId: string, gameState: GameState) {
  return redisClient.set(`room:${roomId}:match`, JSON.stringify(gameState));
}

async function getGameState(roomId: string): Promise<GameState> {
  const gameStateJSON = await redisClient.get(`room:${roomId}:match`);
  if (!gameStateJSON) throw new Error("GameState not found");
  return JSON.parse(gameStateJSON) as GameState;
}