// Ship data structure definitions

export type Coordinate = string; // e.g., "A1", "B4"
export type SegmentStatus = "healthy" | "damaged";

export type ShipSegment = {
  coordinate: Coordinate;
  status: SegmentStatus;
};

export type Ship = {
  segments: ShipSegment[]; // Array of segments in order from head to tail

  // Helper properties (can be computed)
  get isVertical(): boolean;
  get head(): ShipSegment;
  get tail(): ShipSegment;
  get body(): ShipSegment[];
  get isDestroyed(): boolean;
};

// Ship factory function
export function createShip(coordinates: Coordinate[]): Ship {
  const segments: ShipSegment[] = coordinates.map((coordinate) => ({
    coordinate,
    status: "healthy",
  }));

  return {
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
  };
}
