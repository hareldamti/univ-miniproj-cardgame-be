import { Coords, DevelopmentCard, Hexagonal, HexType, EdgeLocation, Robber, NodeLocation, Table, SpecialCard } from "../package/Entities/Models";
import { GameState, PlayerState } from "../package/Entities/State";
import { GameAction } from "../package/Entities/GameActions";
import { PlayerAction, PlayerActionType } from "../package/Entities/PlayerActions";
import { availableRoads, availableStructures } from "../package/Logic/BoardLogic";


export function handlePlayerAction(action: PlayerAction, playerIdx: number, gameState: GameState): GameAction[] {
    switch (action.type) {
        case PlayerActionType.BuildSettlement:
            buildSettlement(action.settlement, playerIdx, gameState);
            break;
        case PlayerActionType.BuildCity:
            buildCity(action.city, playerIdx, gameState);
            break;
        case PlayerActionType.BuildRoad:
            buildRoad(action.road, playerIdx, gameState);
            break;
        case PlayerActionType.DrawDevelopmentCard:
            buyDevelopmentCard(playerIdx, gameState);
            break;
        case PlayerActionType.PlayDevelopmentCard:
            playDevelopmentCard(action.card, playerIdx, gameState);
            break;
        case PlayerActionType.OfferTrade:
            offerTrade(action.trade, playerIdx, gameState);
            break;
        case PlayerActionType.AcceptTrade:
            acceptTrade(action.trade, playerIdx, gameState);
            break;
        case PlayerActionType.FinishStep:
            finishStep(playerIdx, gameState);
            break;
    }
    return gameState;
}


 
// TODO: actual action functions
//function to build a road
export function buildRoad(playerState: PlayerState, gameState: GameState, EdgeLocation: EdgeLocation): void {
    if (canBuildRoad(playerState, gameState, EdgeLocation)) {
        EdgeLocation.owner = playerState.id;
        playerState.Roads.push(EdgeLocation);
        playerState.Resources.lumber--;
        playerState.Resources.brick--;
        playerState.AvailableAssets.roads--;
    }
}

//function to build a settlement
export function buildSettlement(playerState: PlayerState, gameState: GameState, NodeLocation: NodeLocation): void {
    if (canBuildSettlement(playerState, gameState, NodeLocation)) {
        NodeLocation.owner = playerState.id;
        playerState.Settlements.push(NodeLocation);
        playerState.Resources.lumber--;
        playerState.Resources.brick--;
        playerState.Resources.wool--;
        playerState.Resources.grain--;
        playerState.AvailableAssets.settlements--;
    }
}

//function to build a city
export function buildCity(playerState: PlayerState, gameState: GameState, NodeLocation: NodeLocation): void {
    if (canBuildCity(playerState, gameState, NodeLocation)) {
        NodeLocation.owner = playerState.id;
        playerState.Cities.push(NodeLocation);
        playerState.Resources.grain -= 2;
        playerState.Resources.ore -= 3;
        playerState.AvailableAssets.cities--;
    }
}

//function to buy a development card
export function buyDevelopmentCard(playerState: PlayerState, gameState: GameState): void {
    if (canBuyDevelopmentCard(playerState, gameState)) {
        playerState.Resources.grain--;
        playerState.Resources.ore--;
        playerState.Resources.wool--;
        playerState.DevelopmentCards.push(gameState.stack.pop() as DevelopmentCard);
    }
}

// function to play a knight card only
export function playDevelopmentCard(playerState: PlayerState, gameState: GameState, card: DevelopmentCard): void {
    if (canPlayDevelopmentCard(playerState, gameState)) {
        removeKnightCard(playerState);
        playerState.knightsPlayed++;
        if (playerState.knightsPlayed == 3) {
            playerState.SpecialCards.push({ type: 'LargestArmy' } as SpecialCard);
            playerState.score += 2;
        }
        //todo: here the player has to choose the new hex for the robber
        gameState.Table.Robber.Hex = { row: 0, col: 0 };
    }
}

// helper function to playdevelopmentcard
function removeKnightCard(playerState: PlayerState): void {
    const knightCardIndex = playerState.DevelopmentCards.findIndex(card => card.type === 'Knight');
    if (knightCardIndex !== -1) {
        playerState.DevelopmentCards.splice(knightCardIndex, 1);
    }
}

//finishStep function
export function finishStep(gameState: GameState): void {
    if (gameState.round === 1) {
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
        if (gameState.currentPlayer === 0) {
            gameState.round = 2
        }
    }
    else if (gameState.round === 2) {
        gameState.currentPlayer = (gameState.currentPlayer - 1) % gameState.players.length;
        if (gameState.currentPlayer === 0) {
            gameState.round = 3
        }
    }
    else {
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    }
}

export function tradeResources() {}