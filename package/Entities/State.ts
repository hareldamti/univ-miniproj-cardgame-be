import { DevelopmentCard, Resources, EdgeLocation, NodeLocation, SpecialCard, Table, Trade } from './Models';

export type GameState = {
    Table: Table,
    players: PlayerState[],
    stack: DevelopmentCard[],
    turn: number,
    openTrades: Trade[],
    lastDice: [number, number] | null,
    user: UserState
}

export const getCurrentPlayer = (state: GameState) => state.turn % state.players.length;
export const getRound = (state: GameState) => Math.floor(state.turn / state.players.length);
export const getNextRound = (state: GameState) => Math.floor((state.turn + 1) / state.players.length);

export type UserState = {
    playerId: number,
    availableVisible: 'Cities' | 'Settlements' | 'Roads' | null 
}

export type PlayerState = {
    id: number, // index in players array
    username: string,
    Settlements: NodeLocation[], // IDs of placed settlements
    Cities: NodeLocation[], // IDs of placed cities
    Roads: EdgeLocation[], // all placed roads
    AvailableAssets: {
        settlements: number, // Number of settlements left to build
        cities: number, // Number of cities left to build
        roads: number, // Number of roads left to build
    },
    Resources: Resources,
    DevelopmentCards: DevelopmentCard[], //cards that you can buy
    knightsPlayed: number,
    SpecialCards: SpecialCard[], 
    score: number
}