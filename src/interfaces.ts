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
  progression: Array<Character>;
}

export interface RecoveryTime {
  Day: number;
  Hour: number;
  Minute: number;
}

export interface Character {
  avatar_level: number;
  element_attr_id: number;
  icon: string;
  id: number;
  max_level: number;
  name: string;
  weapon_cat_id: number;
}
