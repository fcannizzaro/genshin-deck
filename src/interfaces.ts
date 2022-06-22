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
