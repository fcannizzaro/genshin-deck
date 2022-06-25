export interface Banner {
  type: 'character' | 'weapon';
  image: string;
  start: number;
  end: number;
}

export interface PluginSettings {
  authentication: {
    uid: string;
    ltuid: string;
    ltoken: string;
  };
  daily: Record<string, any>;
  abyss: {
    end: number;
    stars: string;
  };
}

export interface RecoveryTime {
  Day: number;
  Hour: number;
  Minute: number;
}

export interface MatrixCell {
  type: GenshinView;
  title?: string;
  image?: string;
  action?: string;
  data?: Record<string, any>;
}

export type GenshinViewMatrix = Record<string, MatrixCell>;

export enum GenshinView {
  expedition,
  ui,
}
