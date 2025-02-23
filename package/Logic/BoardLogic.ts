import { Coords, DevelopmentCard, Hexagonal, HexType, EdgeLocation, Robber, NodeLocation, Table } from "../Entities/Models";
import { GameState, PlayerState } from "../Entities/State";
import { diffEdges, diffNodes, getConnectedRoads, getRoadNodes, uniqueEdges } from "./BoardUtils";

// Function to shuffle an array
export function shuffle(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function getTableState(gameState: GameState) {
    return {
        ...gameState.Table,
        Cities: gameState.players.map(player => player.Cities).flat(1),
        Settlements: gameState.players.map(player => player.Settlements).flat(1),
        Roads: gameState.players.map(player => player.Roads).flat(1)
    }
}

// Example usage in availableStructures function
export function availableStructures(playerState: PlayerState, gameState: GameState): NodeLocation[] {
    return diffNodes(playerState.Roads.map(getRoadNodes).flat(1), [...gameState.Table.Settlements, ...gameState.Table.Cities]);
}

// Function to get available road locations for building for specific player
export function availableRoads(playerState: PlayerState, gameState: GameState): EdgeLocation[] {
    return diffEdges(playerState.Roads.map(getConnectedRoads).flat(1), gameState.Table.Roads);
}