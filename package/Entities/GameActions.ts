import { getTableState } from "../Logic/BoardLogic";
import { addResources } from "../Logic/GameUtils";
import { EdgeLocation, NodeLocation, Resources, SpecialAction, Trade } from "./Models";
import { GameState } from "./State";

export enum GameActionTypes {
    AddSettlement,
    AddCity,
    AddRoad,
    InitializeGame,
    ChangeResources,
    DrawDevelopmentCard,
    ApplyDevelopmentCard,
    UseSpecialAction,
    FinishStep,
    OpenTrade,
    CloseTrade,
    FinishGame
}

export const validateActions = (actions: any): actions is GameAction[] => {
    return Array.isArray(actions) && actions.every(action => Object.values(GameActionTypes).includes(action.type));
}

export type GameAction = 
    | { type: GameActionTypes.AddCity, payload: {playerId: number, city: NodeLocation} }
    | { type: GameActionTypes.AddSettlement, payload: {playerId: number, settlement: NodeLocation} }
    | { type: GameActionTypes.AddRoad, payload: {playerId: number, road: EdgeLocation} }
    | { type: GameActionTypes.ChangeResources, payload: {playerId: number, delta: Resources} }
    | { type: GameActionTypes.InitializeGame, payload: {initialized: GameState}}
    | { type: GameActionTypes.FinishStep, payload: {dice: [number, number] | null }}
    | { type: GameActionTypes.OpenTrade, payload: {trade: Trade }}
    | { type: GameActionTypes.CloseTrade, payload: {trade: Trade }}
    | { type: GameActionTypes.FinishGame, payload: {winnerPlayerId?: number, quittingPlayerId?: number}}
    | { type: GameActionTypes.DrawDevelopmentCard, payload: { playerId: number }}
    | { type: GameActionTypes.ApplyDevelopmentCard, payload: { playerId: number, cardIdx: number }}
    | { type: GameActionTypes.UseSpecialAction, payload: { playerId: number, type: SpecialAction }}

export function gameReducer(state: GameState, actions: GameAction[]): GameState {
    let updatedState: GameState = state;
    actions.forEach(action => {
        switch (action.type) {
            case GameActionTypes.InitializeGame: {
                let update = {...action.payload.initialized};
                updatedState = {...update, Table: getTableState(update)};
                break;
            }
            case GameActionTypes.AddSettlement: {
                let update = {...updatedState, players: updatedState.players.map(player => player.id == action.payload.playerId ? {...player, Settlements: [...player.Settlements, {...action.payload.settlement, owner: player.id}], score: player.score + 1} : player)}
                updatedState = {...update, Table: getTableState(update)};
                break;
            } 
            case GameActionTypes.AddCity: {
                let update = {...updatedState, players: updatedState.players.map(player => player.id == action.payload.playerId ? {...player, Cities: [...player.Cities, {...action.payload.city, owner: player.id}], score: player.score + 2} : player)}
                updatedState = {...update, Table: getTableState(update)};
                break;
            }
            case GameActionTypes.AddRoad: {
                let update = {...updatedState, players: updatedState.players.map(player => player.id == action.payload.playerId ? {...player, Roads: [...player.Roads, {...action.payload.road, owner: player.id}]} : player)}
                updatedState = {...update, Table: getTableState(update)};
                break;
            }
            case GameActionTypes.DrawDevelopmentCard: {
                updatedState = {...updatedState, players: updatedState.players.map(player => player.id == action.payload.playerId ? {...player, DevelopmentCards: [...player.DevelopmentCards, ...updatedState.stack.splice(0, 1)]} : player)};
                break;
            }
            case GameActionTypes.ApplyDevelopmentCard: {
                if (action.payload.playerId < 0 || action.payload.playerId > updatedState.players.length) break;
                const card = updatedState.players[action.payload.playerId].DevelopmentCards.splice(action.payload.cardIdx, 1)[0];
                if (!card) break;
                updatedState.stack.push(card);
                updatedState.players[action.payload.playerId].ActiveSpecialActions = [...updatedState.players[action.payload.playerId].ActiveSpecialActions, ...(card.specialActions ?? [])];
                updatedState.players[action.payload.playerId].score += card.points ?? 0;
                updatedState = {...updatedState};
                break;
            }
            case GameActionTypes.UseSpecialAction: {
                const idx = updatedState.players[action.payload.playerId].ActiveSpecialActions.indexOf(action.payload.type);
                updatedState.players[action.payload.playerId].ActiveSpecialActions.splice(idx, 1);
                updatedState = {...updatedState};
                break;
            }
            case GameActionTypes.ChangeResources: {
                updatedState = {...updatedState, players: updatedState.players.map(player => player.id == action.payload.playerId ? {...player, Resources: addResources(player.Resources, action.payload.delta)} : player)}
                break;
            }
            case GameActionTypes.FinishStep: {
                updatedState = {...updatedState, turn: updatedState.turn + 1, lastDice: action.payload.dice};
                break;
            }
            case GameActionTypes.OpenTrade: {
                updatedState = {...updatedState, openTrades: [...updatedState.openTrades, action.payload.trade]};
                break;
            }
            case GameActionTypes.CloseTrade: {
                updatedState = {...updatedState, openTrades: updatedState.openTrades.filter(trade => trade.offeredById != action.payload.trade.offeredById || trade.offeredToId != action.payload.trade.offeredToId)};
                break;
            }
            case GameActionTypes.FinishGame: {
                updatedState = {...updatedState, turn: -1, winnerId: action.payload.winnerPlayerId, quitterId: action.payload.quittingPlayerId }
            }
        }
    });
    return updatedState;
}