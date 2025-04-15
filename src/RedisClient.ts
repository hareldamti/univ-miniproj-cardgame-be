import { exit } from "process";
import { createClient, RedisClientType } from "redis";
import { GameState } from "../package/Entities/State";

export class RedisClient {
  public redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient();
    this.redisClient.on("error", (err) => {
      console.log("Redis Client Error", err);
      exit(1);
    });
    this.redisClient.connect();
    this.redisClient.flushAll();
  }

  public registerSocket(socketId: string, username: string) {
    return this.redisClient.set(`socket:${socketId}:user`, username);
  }

  public getSocketUser(socketId: string) {
    return this.redisClient.get(`socket:${socketId}:user`);
  }

  public unregisterSocket(socketId: string) {
    return this.redisClient.del(`socket:${socketId}:user`);
  }

  public addUserToRoom(roomId: string, username: string) {
    return this.redisClient
      .sAdd(`room:${roomId}:users`, username)
      .then(() => this.redisClient.set(`user:${username}:room`, roomId));
  }

  public getUserRoom(username: string) {
    return this.redisClient.get(`user:${username}:room`);
  }

  public removeUserFromRoom(roomId: string, username: string) {
    return this.redisClient
      .sRem(`room:${roomId}:users`, username)
      .then(() => this.redisClient.del(`user:${username}:room`));
  }

  public getActiveRooms() {
    return this.redisClient
      .keys(`room:*`)
      .then((keys) => keys.map((key) => key.split(":")[1]));
  }

  public async getRoomStatus() {
    const rooms = await this.getActiveRooms();
    const results = await Promise.all(
      rooms.map(async (room) => {
        const users = await this.getUsersInRoom(room);
        if (users.length == 0) return null;
        const playing = await this.isRoomPlaying(room);
        return ({ [room]: {users, playing} });
      }).filter(room => room != null));
    // Merge the array of objects into a single dictionary
    return Object.assign({}, ...results);
  }

  public removeUserFromAllRooms(username: string) {
    return this.redisClient.keys(`room:*:users`).then((rooms) =>
      rooms.forEach(async (room) => {
        if (await this.redisClient.sIsMember(room, username))
          await this.redisClient.sRem(room, username);
      })
    );
  }

  public getUsersInRoom(roomId: string) {
    return this.redisClient.sMembers(`room:${roomId}:users`);
  }

  public setGameState(roomId: string, gameState: GameState) {
    return this.redisClient.set(
      `room:${roomId}:match`,
      JSON.stringify(gameState)
    );
  }

  public async getGameState(roomId: string): Promise<GameState> {
    const gameStateJSON = await this.redisClient.get(`room:${roomId}:match`);
    if (!gameStateJSON) throw new Error("GameState not found");
    return JSON.parse(gameStateJSON) as GameState;
  }

  public async isRoomPlaying(roomId: string): Promise<boolean> {
    return !!(await this.redisClient.get(`room:${roomId}:match`));
  }
}
