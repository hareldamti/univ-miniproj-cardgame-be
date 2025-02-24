import { DevelopmentCard, EdgeLocation, NodeLocation, Resources, Trade } from "./Models";
import { GameState, PlayerState } from "./State";

export enum PlayerActionType {
    BuildSettlement,
    BuildCity,
    BuildRoad,
    DrawDevelopmentCard,
    PlayDevelopmentCard,
    OfferTrade,
    AcceptTrade,
    FinishStep
}

export type PlayerAction =
    | { type: PlayerActionType.BuildSettlement, settlement: NodeLocation }
    | { type: PlayerActionType.BuildCity, city: NodeLocation }
    | { type: PlayerActionType.BuildRoad, road: EdgeLocation }
    | { type: PlayerActionType.DrawDevelopmentCard }
    | { type: PlayerActionType.PlayDevelopmentCard, card: DevelopmentCard }
    | { type: PlayerActionType.OfferTrade, trade: Trade }
    | { type: PlayerActionType.AcceptTrade, trade: Trade }
    | { type: PlayerActionType.FinishStep };
