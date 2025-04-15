//GameState
export type Table = {
    Board: Hexagonal[][],
    Settlements: NodeLocation[],
    Cities: NodeLocation[],
    Roads: EdgeLocation[],
    Robber: Robber,
}

export type Coords = {
    row: number,
    col: number
}

export type ScoringTable = {
    ScoringPlayers: ScoringPlayers[], 
}

export type ScoringPlayers = {
    name: string,
    points: number,
}

export type Hexagonal = {
    coords: Coords,
    type: HexType,
    nuOfPoints: number,
}

export enum HexType {
    Forest, //lumber
    Hill, //brick
    Mountain, //ore
    Field, //grain
    Pasture, //wool
    Desert, //nothing
    Sea,
}

//Table
export type NodeLocation = {
    id: string,
    adjHex: [Coords, Coords, Coords], // Adjacent hexes
    owner?: number, // Player ID or null if unoccupied
};

export type EdgeLocation = {
    id: string,
    adjHex: [Coords, Coords], // Adjacent hexes
    owner?: number, // Player ID or null if unoccupied
};

export type Robber = {
    Hex: Coords, // The ID of the hexagonal where the robber is located
}

//PlayerState
export interface Resources {
    lumber: number;
    brick: number;
    ore: number;
    grain: number;
    wool: number;
}

export enum DevelopmentCardTypes {
    RoadBuilding,
    YearOfPlenty,
    Monopoly,
    University,
    Market,
    GreatHall,
    Chapel,
    Library
}

export enum SpecialAction {
    BuildRoad,
    ResouceFromBank,
    ResourceFromPlayers,
}

export type DevelopmentCard = {
    type: DevelopmentCardTypes,
    name: string,
    description: string,
    points?: number,
    specialActions?: SpecialAction[]
}

export const RoadBuildingCard: DevelopmentCard  = {
	type: DevelopmentCardTypes.RoadBuilding,
	name: "Road Building",
	description: "Build two new roads",
    specialActions: [SpecialAction.BuildRoad, SpecialAction.BuildRoad]
}
export const YearOfPlentyCard : DevelopmentCard = {
	type: DevelopmentCardTypes.YearOfPlenty,
	name: "Year Of Plenty",
	description: "Choose two resources to take from the bank",
    specialActions: [SpecialAction.ResouceFromBank, SpecialAction.ResouceFromBank]
}
export const MonopolyCard : DevelopmentCard = {
	type: DevelopmentCardTypes.Monopoly,
	name: "Monopoly",
	description: "Choose a resource type and get all of it from players",
    specialActions: [SpecialAction.ResourceFromPlayers]
}
export const UniversityCard : DevelopmentCard = {
	type: DevelopmentCardTypes.University,
	name: "University",
	description: "Activate to get 1 point",
	points: 1
}
export const MarketCard : DevelopmentCard = {
	type: DevelopmentCardTypes.Market,
	name: "Market",
	description: "Activate to get 1 point",
	points: 1
}
export const GreatHallCard : DevelopmentCard = {
	type: DevelopmentCardTypes.GreatHall,
	name: "Great Hall",
	description: "Activate to get 1 point",
	points: 1
}
export const ChapelCard : DevelopmentCard = {
	type: DevelopmentCardTypes.Chapel,
	name: "Chapel",
	description: "Activate to get 1 point",
	points: 1
}
export const LibraryCard : DevelopmentCard = {
	type: DevelopmentCardTypes.Library,
	name: "Library",
	description: "Activate to get 1 point",
	points: 1
}

export type Trade = {
    offeredById: number,
    offeredToId: number,
    tradeDelta: Resources,
}