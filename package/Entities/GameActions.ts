import { getTableState } from "../Logic/BoardLogic";
import { EdgeLocation, NodeLocation } from "./Models";
import { GameState } from "./State";

export enum GameActionTypes {
    AddSettlement,
    AddCity,
    AddRoad,
    InitializeGame,
    // User actions:
    SetVisibleAvailableStructures,
}

export const validateActions = (actions: any): actions is GameAction[] => {
    return Array.isArray(actions) && actions.every(action => Object.values(GameActionTypes).includes(action.type));
}

export type GameAction = 
    | { type: GameActionTypes.AddCity, payload: {playerId: number, location: NodeLocation} }
    | { type: GameActionTypes.AddSettlement, payload: {playerId: number, location: NodeLocation} }
    | { type: GameActionTypes.AddRoad, payload: {playerId: number, location: EdgeLocation} }
    | { type: GameActionTypes.SetVisibleAvailableStructures, payload: {choice: 'Cities' | 'Settlements' | 'Roads' | null }}
    | { type: GameActionTypes.InitializeGame, payload: {initialized: GameState}}

export function gameReducer(state: GameState, actions: GameAction[]): GameState {
    let updatedState: GameState = state;
    actions.forEach(action => {
        switch (action.type) {
            case GameActionTypes.InitializeGame: {
                return action.payload.initialized;
            }
            case GameActionTypes.AddSettlement: {
                let update = {...updatedState, players: updatedState.players.map(player => player.id == action.payload.playerId ? {...player, Settlements: [...player.Settlements, {...action.payload.location, owner: player.id}]} : player)}
                updatedState = {...update, Table: getTableState(update)};
                break;
            } 
            case GameActionTypes.AddCity: {
                let update = {...updatedState, players: updatedState.players.map(player => player.id == action.payload.playerId ? {...player, Cities: [...player.Cities, {...action.payload.location, owner: player.id}]} : player)}
                updatedState = {...update, Table: getTableState(update)};
                break;
            }
            case GameActionTypes.AddRoad: {
                let update = {...updatedState, players: updatedState.players.map(player => player.id == action.payload.playerId ? {...player, Roads: [...player.Roads, {...action.payload.location, owner: player.id}]} : player)}
                updatedState = {...update, Table: getTableState(update)};
                break;
            }
            
            case GameActionTypes.SetVisibleAvailableStructures: {     
                updatedState = {...updatedState, user: {...updatedState.user, availableVisible: action.payload.choice}};
                break;
            }
        }
    });
    return updatedState;
}