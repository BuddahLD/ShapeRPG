/**
 * Domain Service: Shape Matching
 * Handles pattern recognition for spell casting
 */

export interface Point {
  x: number;
  y: number;
}

export interface ShapeMatchResult {
  readonly spellId: string | null;
  readonly accuracy: number;
  readonly isKnownPattern: boolean;
  readonly debuffType?: 'self_damage' | 'slow_player' | 'screen_blackout' | 'weakness';
}

export class ShapeMatchingService {
  private readonly TRIANGLE_THRESHOLD = 0.7; // Similarity threshold for triangle recognition
  private readonly MIN_POINTS_FOR_TRIANGLE = 3;

  /**
   * Matches drawn points against spell patterns
   * Now any spell can be cast, but accuracy affects effectiveness
   */
  matchShape(drawnPoints: Point[], availableSpellIds: string[]): ShapeMatchResult {
    if (drawnPoints.length < this.MIN_POINTS_FOR_TRIANGLE) {
      return {
        spellId: null,
        accuracy: 0,
        isKnownPattern: false,
        debuffType: 'self_damage'
      };
    }

    // Check for triangle pattern
    const triangleAccuracy = this.calculateTriangleSimilarity(drawnPoints);
    
    if (triangleAccuracy >= this.TRIANGLE_THRESHOLD) {
      // Triangle pattern matches Fire Bolt
      return {
        spellId: 'SPL01',
        accuracy: triangleAccuracy,
        isKnownPattern: true
      };
    }

    // TODO: Add other pattern checks (zigzag, circle, wave)
    // For now, only triangle is implemented

    // No pattern match - random debuff
    const debuffTypes: Array<'self_damage' | 'slow_player' | 'screen_blackout' | 'weakness'> = [
      'self_damage', 'slow_player', 'screen_blackout', 'weakness'
    ];
    const randomDebuff = debuffTypes[Math.floor(Math.random() * debuffTypes.length)];

    return {
      spellId: null,
      accuracy: 0,
      isKnownPattern: false,
      debuffType: randomDebuff
    };
  }

  /**
   * Calculates how similar the drawn points are to a triangle
   */
  private calculateTriangleSimilarity(points: Point[]): number {
    if (points.length < 3) return 0;

    // Normalize points to a standard size (40px triangle)
    const normalizedPoints = this.normalizePoints(points, 40);
    
    // Check if the shape forms a triangle
    const isTriangle = this.isTriangleShape(normalizedPoints);
    
    if (!isTriangle) return 0;

    // Calculate accuracy based on how close to equilateral triangle
    const equilateralScore = this.calculateEquilateralScore(normalizedPoints);
    
    return Math.min(equilateralScore, 1.0);
  }

  /**
   * Normalizes points to a standard size
   */
  private normalizePoints(points: Point[], targetSize: number): Point[] {
    if (points.length === 0) return points;

    // Find bounding box
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const maxDimension = Math.max(width, height);

    if (maxDimension === 0) return points;

    const scale = targetSize / maxDimension;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return points.map(point => ({
      x: (point.x - centerX) * scale,
      y: (point.y - centerY) * scale
    }));
  }

  /**
   * Checks if the points form a triangle-like shape
   */
  private isTriangleShape(points: Point[]): boolean {
    if (points.length < 3) return false;

    // Find the three most extreme points (likely triangle vertices)
    const vertices = this.findTriangleVertices(points);
    
    if (vertices.length < 3) return false;

    // Check if the shape is roughly triangular
    const angles = this.calculateAngles(vertices);
    const totalAngle = angles.reduce((sum, angle) => sum + angle, 0);
    
    // Triangle angles should sum to approximately 180 degrees
    return Math.abs(totalAngle - 180) < 30;
  }

  /**
   * Finds the three most extreme points that could be triangle vertices
   */
  private findTriangleVertices(points: Point[]): Point[] {
    if (points.length <= 3) return points;

    // Find points with maximum distance from center
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const center = { x: centerX, y: centerY };

    // Sort points by distance from center
    const sortedPoints = points
      .map(point => ({
        point,
        distance: Math.sqrt((point.x - center.x) ** 2 + (point.y - center.y) ** 2)
      }))
      .sort((a, b) => b.distance - a.distance);

    // Take the three most distant points
    return sortedPoints.slice(0, 3).map(item => item.point);
  }

  /**
   * Calculates angles between three points
   */
  private calculateAngles(vertices: Point[]): number[] {
    if (vertices.length < 3) return [];

    const angles: number[] = [];
    
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      const p3 = vertices[(i + 2) % vertices.length];

      const angle = this.calculateAngle(p1, p2, p3);
      angles.push(angle);
    }

    return angles;
  }

  /**
   * Calculates the angle at point p2 between p1 and p3
   */
  private calculateAngle(p1: Point, p2: Point, p3: Point): number {
    const a = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    const b = Math.sqrt((p3.x - p2.x) ** 2 + (p3.y - p2.y) ** 2);
    const c = Math.sqrt((p3.x - p1.x) ** 2 + (p3.y - p1.y) ** 2);

    if (a === 0 || b === 0) return 0;

    // Use law of cosines
    const cosAngle = (a * a + b * b - c * c) / (2 * a * b);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    
    return (angle * 180) / Math.PI; // Convert to degrees
  }

  /**
   * Calculates how close the triangle is to being equilateral
   */
  private calculateEquilateralScore(vertices: Point[]): number {
    if (vertices.length < 3) return 0;

    const angles = this.calculateAngles(vertices);
    if (angles.length < 3) return 0;

    // In an equilateral triangle, all angles should be 60 degrees
    const targetAngle = 60;
    const angleVariance = angles.reduce((sum, angle) => {
      return sum + Math.abs(angle - targetAngle);
    }, 0);

    // Lower variance = higher score
    const maxVariance = 180; // Worst case scenario
    const score = Math.max(0, 1 - (angleVariance / maxVariance));

    return score;
  }
}
