import { Ship, Coordinate, createShip, SHIPS } from "../components/Ship";

// Generate a random coordinate (e.g., "A1", "B5")
export const generateRandomCoordinate = (): Coordinate => {
    const row = String.fromCharCode(65 + Math.floor(Math.random() * 10)); // A-J
    const col = 1 + Math.floor(Math.random() * 10); // 1-10
    return `${row}${col}`;
};

// Check if coordinate is valid (within grid)
export const isValidCoordinate = (coord: string): boolean => {
    const row = coord.charAt(0);
    const col = parseInt(coord.slice(1));
    return row >= "A" && row <= "J" && col >= 1 && col <= 10;
};

// Check if a coordinate is already occupied by another ship
export const isCoordinateOccupied = (
    coord: string,
    existingShips: Ship[]
): boolean => {
    return existingShips.some((ship) =>
        ship.segments.some((segment) => segment.coordinate === coord)
    );
};

// Generate coordinates for a ship of specified size
export const generateShipCoordinates = (
    size: number,
    existingShips: Ship[]
): Coordinate[] => {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        attempts++;

        // Pick a random starting point and direction
        const startCoord = generateRandomCoordinate();
        const isVertical = Math.random() > 0.5;

        // Generate all coordinates for the ship
        const coords: Coordinate[] = [startCoord];

        const startRow = startCoord.charAt(0).charCodeAt(0);
        const startCol = parseInt(startCoord.slice(1));

        let valid = true;

        // Generate the rest of the coordinates
        for (let i = 1; i < size; i++) {
            let nextCoord: Coordinate;

            if (isVertical) {
                nextCoord = `${String.fromCharCode(startRow + i)}${startCol}`;
            } else {
                nextCoord = `${String.fromCharCode(startRow)}${startCol + i}`;
            }

            // Check if the coordinate is valid and not occupied
            if (
                !isValidCoordinate(nextCoord) ||
                isCoordinateOccupied(nextCoord, existingShips)
            ) {
                valid = false;
                break;
            }

            coords.push(nextCoord);
        }

        if (valid && !isCoordinateOccupied(startCoord, existingShips)) {
            return coords;
        }
    }

    console.error("Could not place ship after max attempts");
    return [];
};

// Generate ships for a player
export const generatePlayerShips = (): Ship[] => {
    const ships: Ship[] = [];

    // Place each ship
    for (const ship of SHIPS) {
        const coordinates = generateShipCoordinates(ship.size, ships);
        if (coordinates.length === ship.size) {
            const newShip = createShip(coordinates, ship.name);
            ships.push(newShip);
        }
    }

    return ships;
}; 