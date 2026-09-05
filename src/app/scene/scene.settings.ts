export class SceneSettings {
  public static lines = 20;
  public static columns = 50;
  public static initialSpeed = 200;
  public static speedStep = 10;
  public static minSpeed = 100;
  public static initialLength = 4;

  public static speedForLength(length: number): number {
    const grown = Math.max(0, length - SceneSettings.initialLength);
    return Math.max(
      SceneSettings.minSpeed,
      SceneSettings.initialSpeed - grown * SceneSettings.speedStep
    );
  }

  public static speedLevelForLength(length: number): number {
    const grown = Math.max(0, length - SceneSettings.initialLength);
    const maxGrown = Math.floor(
      (SceneSettings.initialSpeed - SceneSettings.minSpeed) / SceneSettings.speedStep
    );
    return 1 + Math.min(grown, maxGrown);
  }
}
