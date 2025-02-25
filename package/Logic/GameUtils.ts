import { HexType, Resources } from '../Entities/Models'
import { GameState, getNextRound } from '../Entities/State';

export const addResources = (a: Resources, b: Resources): Resources => ({
    lumber: a.lumber + b.lumber,
    brick: a.brick + b.brick,
    ore: a.ore + b.ore,
    grain: a.grain + b.grain,
    wool: a.wool + b.wool
});

export const subtractResources = (a: Resources, b: Resources): Resources => ({
    lumber: a.lumber - b.lumber,
    brick: a.brick - b.brick,
    ore: a.ore - b.ore,
    grain: a.grain - b.grain,
    wool: a.wool - b.wool
});

export const multiplyResources = (a: Resources, n: number): Resources => ({
    lumber: a.lumber * n,
    brick: a.brick * n,
    ore: a.ore * n,
    grain: a.grain * n,
    wool: a.wool * n
})

const legalPlayerResources = (a: Resources): boolean => Object.values(a).every(n => n >= 0);

export const zeroCost: Resources = {
    lumber: 0,
    brick: 0,
    ore: 0,
    grain: 0,
    wool: 0
}

export const negateResources = (a: Resources): Resources => subtractResources(zeroCost, a);

export const cityCost: Resources = {
    lumber: 0,
    brick: 0,
    ore: 3,
    grain: 2,
    wool: 0
}

export const settlementCost: Resources = {
    lumber: 1,
    brick: 1,
    ore: 0,
    grain: 1,
    wool: 1
}

export const roadCost: Resources = {
    lumber: 1,
    brick: 1,
    ore: 0,
    grain: 0,
    wool: 0
}

export const developmentCardCost: Resources = {
    lumber: 0,
    brick: 0,
    ore: 1,
    grain: 1,
    wool: 1
}

export const resourceAt = (type: HexType): Resources => ({
    lumber: type == HexType.Forest ? 1 : 0,
    brick: type == HexType.Hill ? 1 : 0,
    ore: type == HexType.Mountain ? 1 : 0,
    grain: type == HexType.Field ? 1 : 0,
    wool: type == HexType.Pasture ? 1 : 0
})

export const canBuy = (gameState: GameState, playerId: number, cost: Resources): boolean => {
    if (playerId == -1) return false;
    return legalPlayerResources(subtractResources(gameState.players[playerId].Resources, cost))
};

export const rollDice = (gameState: GameState) => getNextRound(gameState) < 4 ? null : [Math.floor(1 + Math.random() * 6), Math.floor(1 + Math.random() * 6)] as [number, number];
    