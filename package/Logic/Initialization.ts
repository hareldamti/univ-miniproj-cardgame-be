import { Coords, DevelopmentCard, Hexagonal, HexType, EdgeLocation, Robber, NodeLocation, Table, RoadBuildingCard, ChapelCard, GreatHallCard, LibraryCard, MarketCard, MonopolyCard, UniversityCard, YearOfPlentyCard } from "../Entities/Models";
import { GameState, PlayerState, UserState } from "../Entities/State";
import { shuffle } from "./BoardUtils"
import { cityCost, roadCost, subtractResources, zeroCost } from "./GameUtils";
// Initialize Game
// returns new Game: GameState

export function initializeUser(): UserState {
    return {
        playerId: -1,
        availableVisible: null
    }
}

export function initializeGame(usernames: string[]): GameState {
    const players = initializePlayers(usernames);
    return {
        Table: initializeTable(),
        players: players,
        stack: initializeStack(),
        turn: 0,
        openTrades: [],
        lastDice: null,
        user: initializeUser()
    };
}

//Initialize Table
export function initializeTable(): Table {
    return {
        Board: initializeBoard(),
        Cities: initializeNodeLocation(),
        Settlements: initializeNodeLocation(),
        Roads: initializeEdgeLocation(),
        Robber: initializeRobber(),
    };
}

// Initialize Board
function initializeBoard(): Hexagonal[][] {
    const partialBoard = [
        // First row (4 hexagons)
        [
            { type: HexType.Sea, nuOfPoints: 0 },
            { type: HexType.Sea, nuOfPoints: 0 },
            { type: HexType.Sea, nuOfPoints: 0 },
            { type: HexType.Sea, nuOfPoints: 0 }
        ],
        // Second row (5 hexagons)
        [
            { type: HexType.Sea, nuOfPoints: 0 },
            { type: HexType.Hill, nuOfPoints: 8 },
            { type: HexType.Pasture, nuOfPoints: 4 },
            { type: HexType.Hill, nuOfPoints: 11 },
            { type: HexType.Sea, nuOfPoints: 0 },
        ],
        // Third row (6 hexagons)
        [
            { type: HexType.Sea, nuOfPoints: 0 },
            { type: HexType.Field, nuOfPoints: 10 },
            { type: HexType.Mountain, nuOfPoints: 11 },
            { type: HexType.Forest, nuOfPoints: 3 },
            { type: HexType.Pasture, nuOfPoints: 12 },
            { type: HexType.Sea, nuOfPoints: 0 },
        ],
        // Fourth row (7 hexagons)
        [
            { type: HexType.Sea, nuOfPoints: 0 },
            { type: HexType.Forest, nuOfPoints: 5 },
            { type: HexType.Hill, nuOfPoints: 9 },
            { type: HexType.Desert, nuOfPoints: 0 },
            { type: HexType.Mountain, nuOfPoints: 6 },
            { type: HexType.Field, nuOfPoints: 9 },
            { type: HexType.Sea, nuOfPoints: 0 },
        ],
        // Fifth row (6 hexagons)
        [
            { type: HexType.Sea, nuOfPoints: 0 },
            { type: HexType.Field, nuOfPoints: 2 },
            { type: HexType.Mountain, nuOfPoints: 4 },
            { type: HexType.Field, nuOfPoints: 5 },
            { type: HexType.Forest, nuOfPoints: 10 },
            { type: HexType.Sea, nuOfPoints: 0 },
        ],
        // Sixth row (5 hexagons)
        [
            { type: HexType.Sea, nuOfPoints: 0 },
            { type: HexType.Forest, nuOfPoints: 6 },
            { type: HexType.Pasture, nuOfPoints: 3 },
            { type: HexType.Pasture, nuOfPoints: 8 },
            { type: HexType.Sea, nuOfPoints: 0 },
        ],
        // Seventh row (4 hexagons)
        [
            { type: HexType.Sea, nuOfPoints: 0 },
            { type: HexType.Sea, nuOfPoints: 0 },
            { type: HexType.Sea, nuOfPoints: 0 },
            { type: HexType.Sea, nuOfPoints: 0 },
        ]
    ];
    return Object.entries(partialBoard).map(
        rowElement => {
            const [row, tableRow] = rowElement;
            return Object.entries(tableRow).map(colElement => {
                const [col, tableHex] = colElement;
                return { coords: {row: parseInt(row), col: parseInt(col)}, ...tableHex }
            })
        }
    );
}

// Initialize NodeLocation
function initializeNodeLocation(): NodeLocation[] {
    let NodeLocations: NodeLocation[] = [];
    return NodeLocations;
}

// Initialize EdgeLocation
function initializeEdgeLocation(): EdgeLocation[] {
    let EdgeLocations: EdgeLocation[] = [];
    return EdgeLocations;
}

// Initialize Robber
function initializeRobber(): Robber {
    return { Hex: { row: 3, col: 3 } };
}

// Initialize Players
function initializePlayers(usernames: string[]): PlayerState[] {
    //todo: input from the user
    let ans = []
    for (let i = 0; i < usernames.length; i++) {
        ans.push(initializePlayer(usernames[i], i));
    }
    return ans;
}

// Initialize Player
function initializePlayer(username: string, currentPlayer: number): PlayerState {
    return {
        id: currentPlayer,
        username: username, //todo: input from the user
        Settlements: [],
        Cities: [],
        Roads: [],
        ActiveSpecialActions: [],
        Resources: {
            lumber: 0,
            brick: 0,
            ore: 0,
            grain: 0,
            wool: 0,
        },
        DevelopmentCards: [RoadBuildingCard,
            YearOfPlentyCard,
            MonopolyCard,
            RoadBuildingCard,
            YearOfPlentyCard,
            MonopolyCard,
            UniversityCard,
            MarketCard,
            GreatHallCard,
            ChapelCard,
            LibraryCard],
        knightsPlayed: 0,
        score: 0,
    };
}

// Initialize Stack
function initializeStack(): DevelopmentCard[] {
    let stack: DevelopmentCard[] = [
        RoadBuildingCard,
        YearOfPlentyCard,
        MonopolyCard,
        RoadBuildingCard,
        YearOfPlentyCard,
        MonopolyCard,
        UniversityCard,
        MarketCard,
        GreatHallCard,
        ChapelCard,
        LibraryCard
    ];
    stack = shuffle(stack);
    return stack;
}


