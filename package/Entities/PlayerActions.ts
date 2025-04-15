import { DevelopmentCard, EdgeLocation, HexType, NodeLocation, Resources, Trade } from "./Models";
import { GameState, PlayerState } from "./State";

export enum PlayerActionType {
    BuildSettlement,
    BuildCity,
    BuildRoad,
    DrawDevelopmentCard,
    PlayDevelopmentCard,
    GetResource,
    StealResource,
    OfferTrade,
    RespondToTrade,
    FinishStep,
    Quit
}

export type PlayerAction =
    | { type: PlayerActionType.BuildSettlement, settlement: NodeLocation }
    | { type: PlayerActionType.BuildCity, city: NodeLocation }
    | { type: PlayerActionType.BuildRoad, road: EdgeLocation }
    | { type: PlayerActionType.DrawDevelopmentCard }
    | { type: PlayerActionType.PlayDevelopmentCard, cardIdx: number }
    | { type: PlayerActionType.GetResource, resource: HexType }
    | { type: PlayerActionType.StealResource, resource: HexType }
    | { type: PlayerActionType.OfferTrade, trade: Trade }
    | { type: PlayerActionType.RespondToTrade, accepted: boolean }
    | { type: PlayerActionType.FinishStep }
    | { type: PlayerActionType.Quit };
