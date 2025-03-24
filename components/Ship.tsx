// Ship data structure definitions

// Ship color mapping
export const SHIP_COLORS = {
  Carrier: "rgba(70, 130, 180, 0.3)", // Steel Blue
  Battleship: "rgba(60, 179, 113, 0.3)", // Medium Sea Green
  Cruiser: "rgba(147, 112, 219, 0.3)", // Medium Purple
  Submarine: "rgba(255, 165, 0, 0.3)", // Orange
  Destroyer: "rgba(255, 99, 71, 0.3)", // Tomato
  default: "rgba(100, 149, 237, 0.3)", // Default Light Blue
};

export type Coordinate = string; // e.g., "A1", "B4"
export type SegmentStatus = "healthy" | "damaged";

export type ShipSegment = {
  coordinate: Coordinate;
  status: SegmentStatus;
};

export type Ship = {
  name: string; // Ship name (e.g., "Carrier", "Battleship")
  segments: ShipSegment[]; // Array of segments in order from head to tail

  // Helper properties (can be computed)
  get isVertical(): boolean;
  get head(): ShipSegment;
  get tail(): ShipSegment;
  get body(): ShipSegment[];
  get isDestroyed(): boolean;
  toString(): string; // Method to return a string representation of the ship
};

// Ship factory function
export function createShip(coordinates: Coordinate[], name: string): Ship {
  const segments: ShipSegment[] = coordinates.map((coordinate) => ({
    coordinate,
    status: "healthy",
  }));

  return {
    name,
    segments,

    get isVertical() {
      return (
        this.segments.length > 1 &&
        this.segments[0].coordinate.charAt(0) ===
          this.segments[1].coordinate.charAt(0)
      );
    },

    get head() {
      return this.segments[0];
    },

    get tail() {
      return this.segments[this.segments.length - 1];
    },

    get body() {
      return this.segments.slice(1, -1);
    },

    get isDestroyed() {
      return this.segments.every((segment) => segment.status === "damaged");
    },

    toString() {
      const size = this.segments.length;
      const orientation = this.isVertical ? "vertical" : "horizontal";
      const headStatus = `${this.head.coordinate} (${this.head.status})`;
      const tailStatus = `${this.tail.coordinate} (${this.tail.status})`;

      let bodyStatus = "";
      if (this.body.length > 0) {
        bodyStatus = this.body
          .map((segment) => `${segment.coordinate} (${segment.status})`)
          .join(", ");
      }

      let info = `Ship: ${this.name}\n`;
      info += `Size: ${size}, Orientation: ${orientation}\n`;
      info += `Head: ${headStatus}\n`;

      if (this.body.length > 0) {
        info += `Body: ${bodyStatus}\n`;
      }

      info += `Tail: ${tailStatus}\n`;
      info += `Status: ${this.isDestroyed ? "Destroyed" : "Active"}`;

      return info;
    },
  };
}
