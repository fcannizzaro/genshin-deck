import React from 'react';
import { useSettings } from '../hooks/stream-deck';
import { SettingsBox } from '../components/SettingsBox';
import { ButtonsGroup } from '../components/ButtonsGroup';

export const ParametricTransformer = () => {
  const [settings, setSettings] = useSettings();
  return (
    <SettingsBox>
      <ButtonsGroup
        value={settings.style || 'icon'}
        onChange={(style) => setSettings({ style })}
        items={['icon', 'text']}
      />
    </SettingsBox>
  );
};
