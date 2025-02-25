import { GameAction, GameActionTypes } from "../Entities/GameActions";
import { Coords, DevelopmentCard, EdgeLocation, Hexagonal, NodeLocation, Trade } from "../Entities/Models";
import { PlayerAction, PlayerActionType } from "../Entities/PlayerActions";
import { GameState, getCurrentPlayer, getNextRound, getRound } from "../Entities/State";
import { availableRoads, availableStructures } from "./BoardLogic";
import { hasEdge, hasNode } from "./BoardUtils";
import { addResources, canBuy, cityCost, multiplyResources, negateResources, resourceAt, roadCost, rollDice, settlementCost, zeroCost } from "./GameUtils";

export function handlePlayerAction(action: PlayerAction, playerId: number, gameState: GameState): GameAction[] {
    switch (action.type) {
        case PlayerActionType.RespondToTrade:
            return respondToTrade(action.accepted, playerId, gameState)
    }
    if (getCurrentPlayer(gameState) != playerId) {
        console.log(`Player ${playerId} tried to play ${PlayerActionType[action.type]} at player ${getCurrentPlayer(gameState)}'s turn`);
        return [];
    }
    switch (action.type) {
        case PlayerActionType.BuildSettlement:
            return buildSettlement(action.settlement, playerId, gameState);
        case PlayerActionType.BuildCity:
            return buildCity(action.city, playerId, gameState);
        case PlayerActionType.BuildRoad:
            return buildRoad(action.road, playerId, gameState);
        case PlayerActionType.DrawDevelopmentCard:
            return buyDevelopmentCard(playerId, gameState);
        case PlayerActionType.PlayDevelopmentCard:
            return playDevelopmentCard(action.card, playerId, gameState);
        case PlayerActionType.OfferTrade:
            return offerTrade(action.trade, playerId, gameState);
        case PlayerActionType.FinishStep:
            return finishStep(playerId, gameState);
    }
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
    const isStarting = getRound(gameState) == 0 || getRound(gameState) == 3;
    const canBuild = (isStarting || canBuy(gameState, playerId, roadCost))
                      && hasEdge(availableRoads(playerId, gameState), road);
    if (!canBuild) return [];
    const updates: GameAction[] = [{
        type: GameActionTypes.AddRoad, payload: { playerId, road }
    }];
    if (!isStarting) updates.push({
        type: GameActionTypes.ChangeResources, payload: { playerId, delta: negateResources(roadCost) }
    });
    if (isStarting) updates.push({
        type: GameActionTypes.FinishStep, payload: { dice: rollDice(gameState) }
    });
    return updates;
}

function buyDevelopmentCard(playerId: number, gameState: GameState): GameAction[] {
    throw new Error("Function not implemented.");
}

function playDevelopmentCard(card: DevelopmentCard, playerId: number, gameState: GameState): GameAction[] {
    throw new Error("Function not implemented.");
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

