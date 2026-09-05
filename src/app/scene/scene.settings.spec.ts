import { SceneSettings } from './scene.settings';

describe('SceneSettings lane helpers', () => {
  it('maps head + row axis to the head row index', () => {
    expect(SceneSettings.laneFor({ i: 0, j: 3 }, 'row')).toEqual({
      axis: 'row',
      index: 0,
    });
  });

  it('maps head + col axis to the head column index', () => {
    expect(SceneSettings.laneFor({ i: 2, j: 7 }, 'col')).toEqual({
      axis: 'col',
      index: 7,
    });
  });

  it('reports only cells on the active lane', () => {
    const lane = { axis: 'row' as const, index: 0 };
    expect(SceneSettings.cellIsOnLane(0, 10, lane)).toBe(true);
    expect(SceneSettings.cellIsOnLane(1, 10, lane)).toBe(false);
    expect(SceneSettings.cellIsOnLane(2, 7, { axis: 'col', index: 7 })).toBe(true);
    expect(SceneSettings.cellIsOnLane(2, 6, { axis: 'col', index: 7 })).toBe(false);
  });
});

describe('SceneSettings speed formula', () => {
  it('maps length to interval and level: 4→200/1, 5→190/2, 9→150/6, 14→100/11, 19→50/16, 25→50/16', () => {
    expect(SceneSettings.speedForLength(4)).toBe(200);
    expect(SceneSettings.speedLevelForLength(4)).toBe(1);

    expect(SceneSettings.speedForLength(5)).toBe(190);
    expect(SceneSettings.speedLevelForLength(5)).toBe(2);

    expect(SceneSettings.speedForLength(9)).toBe(150);
    expect(SceneSettings.speedLevelForLength(9)).toBe(6);

    expect(SceneSettings.speedForLength(14)).toBe(100);
    expect(SceneSettings.speedLevelForLength(14)).toBe(11);

    expect(SceneSettings.speedForLength(19)).toBe(50);
    expect(SceneSettings.speedLevelForLength(19)).toBe(16);

    expect(SceneSettings.speedForLength(25)).toBe(50);
    expect(SceneSettings.speedLevelForLength(25)).toBe(16);
  });

  it('keeps interval at 50 and level at 16 for every length at or above the cap', () => {
    expect(SceneSettings.speedForLength(19)).toBe(50);
    expect(SceneSettings.speedLevelForLength(19)).toBe(16);
    expect(SceneSettings.speedForLength(20)).toBe(50);
    expect(SceneSettings.speedLevelForLength(20)).toBe(16);
    expect(SceneSettings.speedForLength(30)).toBe(50);
    expect(SceneSettings.speedLevelForLength(30)).toBe(16);
  });
});
