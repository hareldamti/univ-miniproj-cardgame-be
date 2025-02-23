import { DevelopmentCard, EdgeLocation, NodeLocation, Resources } from "./Models";
import { GameState, PlayerState } from "./State";

export enum PlayerActionType {
    BuildSettlement,
    BuildCity,
    BuildRoad,
    DrawDevelopmentCard,
    PlayDevelopmentCard,
    Trade,
    FinishStep
}

export type PlayerAction =
    | { type: PlayerActionType.BuildSettlement, NodeLocation: NodeLocation }
    | { type: PlayerActionType.BuildCity, city: NodeLocation }
    | { type: PlayerActionType.BuildRoad, EdgeLocation: EdgeLocation }
    | { type: PlayerActionType.DrawDevelopmentCard }
    | { type: PlayerActionType.PlayDevelopmentCard, card: DevelopmentCard }
    | { type: PlayerActionType.Trade, resources: Resources }
    | { type: PlayerActionType.FinishStep };
