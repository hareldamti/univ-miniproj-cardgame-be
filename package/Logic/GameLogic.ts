import { GameAction, GameActionTypes, gameReducer } from "../Entities/GameActions";
import { Coords, DevelopmentCard, EdgeLocation, Hexagonal, HexType, NodeLocation, Resources, SpecialAction, Trade } from "../Entities/Models";
import { PlayerAction, PlayerActionType } from "../Entities/PlayerActions";
import { GameState, getCurrentPlayer, getNextRound, getRound } from "../Entities/State";
import { availableRoads, availableStructures } from "./BoardLogic";
import { hasEdge, hasNode } from "./BoardUtils";
import { addResources, canBuy, cardCost, cityCost, developmentCardCost, dotResources, getWinner, multiplyResources, negateResources, resourceAt, roadCost, rollDice, settlementCost, zeroCost } from "./GameUtils";

export function handlePlayerAction(action: PlayerAction, playerId: number, gameState: GameState): {updates: GameAction[], updatedGame: GameState} {
    let updates: GameAction[] = [];
    switch (action.type) {
        case PlayerActionType.RespondToTrade:
            updates = respondToTrade(action.accepted, playerId, gameState);
            break;
        case PlayerActionType.Quit:
            updates = quitGame(playerId);
            break;
    }
    if (getCurrentPlayer(gameState) != playerId) {
        console.log(`Player ${playerId} tried to play ${PlayerActionType[action.type]} at player ${getCurrentPlayer(gameState)}'s turn`);
    }
    else switch (action.type) {
        case PlayerActionType.BuildSettlement:
            updates = buildSettlement(action.settlement, playerId, gameState);
            break;
        case PlayerActionType.BuildCity:
            updates = buildCity(action.city, playerId, gameState);
            break;
        case PlayerActionType.BuildRoad:
            updates = buildRoad(action.road, playerId, gameState);
            break;
        case PlayerActionType.DrawDevelopmentCard:
            updates = buyDevelopmentCard(playerId, gameState);
            break;
        case PlayerActionType.PlayDevelopmentCard:
            updates = playDevelopmentCard(action.cardIdx, playerId, gameState);
            break;
        case PlayerActionType.OfferTrade:
            updates = offerTrade(action.trade, playerId, gameState);
            break;
        case PlayerActionType.FinishStep:
            updates = finishStep(playerId, gameState);
            break;
        case PlayerActionType.GetResource:
            updates = getResource(action.resource, playerId, gameState);
            break;
        case PlayerActionType.StealResource:
            updates = stealResource(action.resource, playerId, gameState);
            break;
    }
    const updatedGame = gameReducer(gameState, updates);
    const winnerPlayerId = getWinner(updatedGame);
    if (winnerPlayerId != undefined) {
        updates.push({ type: GameActionTypes.FinishGame, payload: { winnerPlayerId }});
    }
    return {updates, updatedGame};

}

function quitGame(quittingPlayerId: number): GameAction[] {
    return [{ type: GameActionTypes.FinishGame, payload: { quittingPlayerId } }];
}

function buildSettlement(settlement: NodeLocation, playerId: number, gameState: GameState): GameAction[] {
    const isStarting = getRound(gameState) == 1 || getRound(gameState) == 2;
    const canBuild = (isStarting || canBuy(gameState, playerId, settlementCost))
                      && hasNode(availableStructures(playerId, gameState), settlement);
    if (!canBuild) return [];
    const updates: GameAction[] = [{
        type: GameActionTypes.AddSettlement, payload: { playerId, settlement }
    }];
    if (!isStarting) updates.push({
        type: GameActionTypes.ChangeResources, payload: { playerId, delta: negateResources(settlementCost) }
    });
    if (isStarting) updates.push({
        type: GameActionTypes.FinishStep, payload: { dice: null }
    });
    return updates;
}

function buildCity(city: NodeLocation, playerId: number, gameState: GameState): GameAction[] {
    const canBuild = canBuy(gameState, playerId, cityCost)
                      && hasNode(availableStructures(playerId, gameState), city);
    if (!canBuild) return [];
    return [{
        type: GameActionTypes.AddCity, payload: { playerId, city }
    }, {
        type: GameActionTypes.ChangeResources, payload: { playerId, delta: negateResources(cityCost) }
    }];
}

function buildRoad(road: EdgeLocation, playerId: number, gameState: GameState): GameAction[] {
    const withSpecialAction = gameState.players[playerId].ActiveSpecialActions.includes(SpecialAction.BuildRoad);
    const isStarting = getRound(gameState) == 0 || getRound(gameState) == 3;
    const canBuild = (isStarting || canBuy(gameState, playerId, roadCost))
                      && hasEdge(availableRoads(playerId, gameState), road) || withSpecialAction;
    if (!canBuild) return [];
    const updates: GameAction[] = [{
        type: GameActionTypes.AddRoad, payload: { playerId, road }
    }];
    if (withSpecialAction) updates.push({
        type: GameActionTypes.UseSpecialAction, payload: { playerId, type: SpecialAction.BuildRoad }
    })
    if (!isStarting && !withSpecialAction) updates.push({
        type: GameActionTypes.ChangeResources, payload: { playerId, delta: negateResources(roadCost) }
    });
    if (isStarting) updates.push({
        type: GameActionTypes.FinishStep, payload: { dice: rollDice(gameState) }
    });
    return updates;
}

function buyDevelopmentCard(playerId: number, gameState: GameState): GameAction[] {
    const canBuild = canBuy(gameState, playerId, developmentCardCost);
    if (!canBuild) return [];
    return [{
        type: GameActionTypes.DrawDevelopmentCard, payload: { playerId }
    }, {
        type: GameActionTypes.ChangeResources, payload: { playerId, delta: negateResources(developmentCardCost) }
    }];
}

function playDevelopmentCard(cardIdx: number, playerId: number, gameState: GameState): GameAction[] {
    if (cardIdx < 0 || cardIdx >= gameState.players[playerId].DevelopmentCards.length) return [];
    return [{ type: GameActionTypes.ApplyDevelopmentCard, payload: { playerId, cardIdx }}];
}

function offerTrade(trade: Trade, playerId: number, gameState: GameState): GameAction[] {
    if (trade.offeredById != playerId) return [];
    if (!canBuy(gameState, playerId, trade.tradeDelta)) return [];
    if (gameState.openTrades.map(trade => trade.offeredToId).includes(trade.offeredToId)) return [];
    return [{type: GameActionTypes.OpenTrade, payload: {trade}}]
}

function respondToTrade(accepted: boolean, playerId: number, gameState: GameState): GameAction[] {
    const trades_ = gameState.openTrades.filter(trade => trade.offeredById == playerId);
    if (trades_.length > 0) return [{type: GameActionTypes.CloseTrade, payload: {trade: trades_[0]}}];
    const trades = gameState.openTrades.filter(trade => trade.offeredToId == playerId);
    if (trades.length == 0) return [];
    const trade = trades[0];
    const updates: GameAction[] = [{type: GameActionTypes.CloseTrade, payload: {trade}}];
    if (accepted && canBuy(gameState, playerId, negateResources(trade.tradeDelta))) {
        updates.push({type: GameActionTypes.ChangeResources, payload: {playerId: trade.offeredById, delta: negateResources(trade.tradeDelta)}});
        updates.push({type: GameActionTypes.ChangeResources, payload: {playerId: trade.offeredToId, delta: trade.tradeDelta}});
    }
    return updates;
}

function finishStep(playerId: number, gameState: GameState): GameAction[] {
    const dice = rollDice(gameState);
    const updates: GameAction[] = [{
        type: GameActionTypes.FinishStep, payload: { dice }
    }];
    if (dice) {
        const sumDice = dice[0] + dice[1];
        const matchingHexes = gameState.Table.Board.flat().filter(hex => hex.nuOfPoints == sumDice);
        gameState.players.forEach(player => {
            let isMatching = false;
            let profit = zeroCost;
            matchingHexes.forEach(hex => {
                const nAdjCities = player.Cities.filter(city => city.adjHex.map(c => `${c.row}${c.col}`).includes(`${hex.coords.row}${hex.coords.col}`)).length,
                      nAdjSettlements = player.Settlements.filter(settlement => settlement.adjHex.map(coords => `${coords.row}${coords.col}`).includes(`${hex.coords.row}${hex.coords.col}`)).length,
                      factor = nAdjCities * 2 + nAdjSettlements;
                if (factor != 0) {
                    isMatching = true;
                    profit = addResources(profit, multiplyResources(resourceAt(hex.type), factor));
                }
            });
            if (isMatching) {
                updates.push({
                    type: GameActionTypes.ChangeResources, payload: {playerId: player.id, delta: profit}
                })
            }
        });
    };
    return updates;
}

function getResource(resource: HexType, playerId: number, gameState: GameState): GameAction[] {
    if (!gameState.players[playerId].ActiveSpecialActions.includes(SpecialAction.ResouceFromBank))
        return [];
    return [{
        type: GameActionTypes.ChangeResources, payload: { playerId, delta: resourceAt(resource) }
    }, {
        type: GameActionTypes.UseSpecialAction, payload: {playerId, type: SpecialAction.ResouceFromBank}
    }];
}

function stealResource(resourceType: HexType, playerId: number, gameState: GameState): GameAction[] {
    if (!gameState.players[playerId].ActiveSpecialActions.includes(SpecialAction.ResourceFromPlayers))
        return [];
    const updates: GameAction[] = [{
        type: GameActionTypes.UseSpecialAction, payload: {playerId, type: SpecialAction.ResourceFromPlayers}
    }];
    let resource = resourceAt(resourceType);
    let total = zeroCost;
    gameState.players.forEach(player => {
        let steal = dotResources(resource, player.Resources);
        total = addResources(total, steal);
        updates.push({
            type: GameActionTypes.ChangeResources, payload: {playerId: player.id, delta: negateResources(steal)}
        });
    });
    updates.push({
        type: GameActionTypes.ChangeResources, payload: {playerId, delta: total}
    });
    return updates;
}

