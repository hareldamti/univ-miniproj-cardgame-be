import { Coords, DevelopmentCard, Hexagonal, HexType, EdgeLocation, Robber, NodeLocation, Table, SpecialAction } from "../Entities/Models";
import { GameState, getRound, PlayerState } from "../Entities/State";
import { allEdges, allNodes, diffEdges, diffNodes, getConnectedRoads, getNodeRoads, getRoadNodes, uniqueEdges } from "./BoardUtils";



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
    const taken = [
        ...gameState.Table.Roads.filter(road => road.owner != playerId).flatMap(getRoadNodes),
        ...[...gameState.Table.Settlements, ...gameState.Table.Cities ]
    ];
    switch (getRound(gameState)) {
        case 0:
        case 3:
            return [];
        case 1:
        case 2:
            return diffNodes(allNodes, taken);
        default:
            return diffNodes(gameState.players[playerId].Roads.map(getRoadNodes).flat(1), taken); 
    }
}

// Function to get available road locations for building for specific player
export function availableRoads(playerId: number, gameState: GameState): EdgeLocation[] {
    if (playerId == -1) return [];
    const taken = [
        ...gameState.Table.Roads.filter(road => road.owner != playerId).flatMap(getConnectedRoads),
        ...gameState.Table.Roads.filter(road => road.owner == playerId),
        ...[...gameState.Table.Settlements, ...gameState.Table.Cities, ].filter(road => road.owner != playerId).flatMap(getNodeRoads)
    ];
    if (gameState.players[playerId].ActiveSpecialActions.includes(SpecialAction.BuildRoad)) {
        return diffEdges(gameState.players[playerId].Roads.map(getConnectedRoads).flat(1), taken);
    }
    switch (getRound(gameState)) {
        case 1:
        case 2:
            return [];
        case 0:
        case 3:
            return diffEdges(allEdges, taken);
        default:
            return diffEdges(gameState.players[playerId].Roads.map(getConnectedRoads).flat(1), taken);
    }
    }