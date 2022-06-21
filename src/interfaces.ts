export interface Banner {
  image: string;
  start: number;
  end: number;
  type: 'character' | 'weapon';
}

export interface PluginSettings {
  authentication: {
    uid: string;
    ltuid: string;
    ltoken: string;
  };
  banner: Banner[];
  daily: Record<string, any>;
  abyss: {
    end: number;
    stars: string;
  };
}
