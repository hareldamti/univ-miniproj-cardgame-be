import { DevelopmentCard, Resources, EdgeLocation, NodeLocation, Table, Trade, SpecialAction } from './Models';

export type GameState = {
    Table: Table,
    players: PlayerState[],
    stack: DevelopmentCard[],
    turn: number,
    openTrades: Trade[],
    lastDice: [number, number] | null,
    user: UserState,
    winnerId?: number
    quitterId?: number
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
    ActiveSpecialActions: SpecialAction[], 
    Resources: Resources,
    DevelopmentCards: DevelopmentCard[], //cards that you can buy
    knightsPlayed: number,
    score: number
}