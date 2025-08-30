interface Point {
  x: number;
  y: number;
}

interface Pattern {
  id: string;
  name: string;
  points: Point[];
  tolerance: number;
}

interface MatchResult {
  spell: any | null;
  accuracy: number;
  success: boolean;
}

export class ShapeMatching {
  private patterns: Map<string, Pattern> = new Map();

  constructor() {
    this.initializePatterns();
  }

  public matchShape(drawnPoints: Point[], knownSpells: string[]): MatchResult {
    if (drawnPoints.length < 3) {
      return { spell: null, accuracy: 0, success: false };
    }

    // Normalize the drawn shape
    const normalizedDrawing = this.normalizeShape(drawnPoints);
    
    let bestMatch = { pattern: null as Pattern | null, accuracy: 0 };

    // Compare against all known patterns
    for (const [patternId, pattern] of this.patterns) {
      // Check if player knows a spell with this pattern
      const matchingSpell = this.findSpellByPattern(patternId, knownSpells);
      if (!matchingSpell) continue;

      const accuracy = this.compareShapes(normalizedDrawing, pattern.points);
      
      if (accuracy > bestMatch.accuracy && accuracy > 0.6) { // Minimum 60% accuracy
        bestMatch = { pattern, accuracy };
      }
    }

    if (bestMatch.pattern) {
      const spell = this.findSpellByPattern(bestMatch.pattern.id, knownSpells);
      return {
        spell: spell,
        accuracy: bestMatch.accuracy,
        success: true
      };
    }

    // No match found - return failure
    return { spell: null, accuracy: 0, success: false };
  }

  private normalizeShape(points: Point[]): Point[] {
    if (points.length === 0) return [];

    // Find bounding box
    let minX = points[0].x, maxX = points[0].x;
    let minY = points[0].y, maxY = points[0].y;

    points.forEach(point => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const size = Math.max(width, height);

    if (size === 0) return points;

    // Normalize to 0-1 range and center
    return points.map(point => ({
      x: (point.x - minX) / size - 0.5,
      y: (point.y - minY) / size - 0.5
    }));
  }

  private compareShapes(shape1: Point[], shape2: Point[]): number {
    if (shape1.length === 0 || shape2.length === 0) return 0;

    // Simple shape comparison using distance between corresponding points
    const samples = 32; // Sample both shapes at regular intervals
    const sampledShape1 = this.sampleShape(shape1, samples);
    const sampledShape2 = this.sampleShape(shape2, samples);

    let totalDistance = 0;
    for (let i = 0; i < samples; i++) {
      const dx = sampledShape1[i].x - sampledShape2[i].x;
      const dy = sampledShape1[i].y - sampledShape2[i].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }

    const averageDistance = totalDistance / samples;
    const maxDistance = Math.sqrt(2); // Maximum possible distance in normalized space

    // Convert distance to accuracy (0-1, where 1 is perfect match)
    return Math.max(0, 1 - (averageDistance / maxDistance));
  }

  private sampleShape(points: Point[], sampleCount: number): Point[] {
    if (points.length <= sampleCount) return points;

    const samples: Point[] = [];
    const step = (points.length - 1) / (sampleCount - 1);

    for (let i = 0; i < sampleCount; i++) {
      const index = Math.round(i * step);
      samples.push(points[Math.min(index, points.length - 1)]);
    }

    return samples;
  }

  private findSpellByPattern(patternId: string, knownSpells: string[]): any {
    // This would normally query the game data for spells with matching patterns
    // For now, return a simple mapping
    const spellPatterns: { [key: string]: string } = {
      "line": "SPL01",    // Fire Bolt
      "zigzag": "SPL02",  // Ice Shard
      "circle": "SPL03",  // Shield Aura
      "wave": "SPL04"     // Dark Mist
    };

    const spellId = spellPatterns[patternId];
    if (spellId && knownSpells.includes(spellId)) {
      // Return basic spell data - in a real implementation, this would come from game data
      const spellData: { [key: string]: any } = {
        "SPL01": { id: "SPL01", name: "Fire Bolt", effect: { type: "damage", amount: 10 } },
        "SPL02": { id: "SPL02", name: "Ice Shard", effect: { type: "damage+slow", damage: 8 } },
        "SPL03": { id: "SPL03", name: "Shield Aura", effect: { type: "buff", defPlus: 5 } },
        "SPL04": { id: "SPL04", name: "Dark Mist", effect: { type: "debuff" } }
      };
      
      return spellData[spellId];
    }

    return null;
  }

  private initializePatterns(): void {
    // Define basic shape patterns
    this.patterns.set("line", {
      id: "line",
      name: "Line",
      points: [
        { x: -0.4, y: 0 },
        { x: -0.2, y: 0 },
        { x: 0, y: 0 },
        { x: 0.2, y: 0 },
        { x: 0.4, y: 0 }
      ],
      tolerance: 0.3
    });

    this.patterns.set("circle", {
      id: "circle",
      name: "Circle",
      points: this.generateCirclePoints(0.3, 16),
      tolerance: 0.3
    });

    this.patterns.set("zigzag", {
      id: "zigzag",
      name: "Zigzag",
      points: [
        { x: -0.4, y: 0.2 },
        { x: -0.2, y: -0.2 },
        { x: 0, y: 0.2 },
        { x: 0.2, y: -0.2 },
        { x: 0.4, y: 0.2 }
      ],
      tolerance: 0.3
    });

    this.patterns.set("wave", {
      id: "wave",
      name: "Wave",
      points: this.generateWavePoints(0.3, 16),
      tolerance: 0.3
    });
  }

  private generateCirclePoints(radius: number, count: number): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }
    return points;
  }

  private generateWavePoints(amplitude: number, count: number): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      const t = (i / (count - 1)) * 2 - 1; // -1 to 1
      points.push({
        x: t * 0.4,
        y: Math.sin(t * Math.PI * 2) * amplitude
      });
    }
    return points;
  }
}
