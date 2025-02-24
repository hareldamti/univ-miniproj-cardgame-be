import { Coords, DevelopmentCard, Hexagonal, HexType, EdgeLocation, Robber, NodeLocation, Table } from "../Entities/Models";
import { GameState, getRound, PlayerState } from "../Entities/State";
import { allEdges, allNodes, diffEdges, diffNodes, getConnectedRoads, getRoadNodes, uniqueEdges } from "./BoardUtils";



export function getTableState(gameState: GameState) {
    return {
        ...gameState.Table,
        Cities: gameState.players.map(player => player.Cities).flat(1),
        Settlements: gameState.players.map(player => player.Settlements).flat(1),
        Roads: gameState.players.map(player => player.Roads).flat(1)
    }
}

// Example usage in availableStructures function
export function availableStructures(playerId: number, gameState: GameState): NodeLocation[] {
    if (playerId == -1) return [];
    switch (getRound(gameState)) {
        case 0:
        case 3:
            return [];
        case 1:
        case 2:
            return diffNodes(allNodes, [...gameState.Table.Settlements, ...gameState.Table.Cities]);
        default:
            return diffNodes(gameState.players[playerId].Roads.map(getRoadNodes).flat(1), [...gameState.Table.Settlements, ...gameState.Table.Cities]); 
    }
}

// Function to get available road locations for building for specific player
export function availableRoads(playerId: number, gameState: GameState): EdgeLocation[] {
    if (playerId == -1) return [];
    switch (getRound(gameState)) {
        case 1:
        case 2:
            return [];
        case 0:
        case 3:
            return diffEdges(allEdges, gameState.Table.Roads);
        default:
            return diffEdges(gameState.players[playerId].Roads.map(getConnectedRoads).flat(1), gameState.Table.Roads);
    }
    }