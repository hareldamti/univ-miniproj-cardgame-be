import { DevelopmentCard, Resources, EdgeLocation, NodeLocation, SpecialCard, Table } from './Models';
import { buildCity, buildRoad, buildSettlement, buyDevelopmentCard, finishStep, playDevelopmentCard, tradeResources } from '../Logic/Step_server';

export type GameState = {
    Table: Table,
    players: PlayerState[],
    currentPlayer: number,
    stack: DevelopmentCard[],
    round: number,
    user: UserState
}

export type UserState = {
    playerIdx: number,
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