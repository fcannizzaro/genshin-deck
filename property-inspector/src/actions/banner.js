import React from 'react';
import { useSettings } from '../hooks/stream-deck';
import { SettingsBox } from '../components/SettingsBox';
import { ButtonsGroup } from '../components/ButtonsGroup';

export const Banner = () => {
  const [settings, setSettings] = useSettings();
  return (
    <SettingsBox>
      <ButtonsGroup
        value={settings.banner || 'character'}
        onChange={(banner) => setSettings({ banner })}
        items={['character', 'weapon']}
      />
    </SettingsBox>
  );
};
