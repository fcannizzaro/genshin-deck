import { Actions } from './actions';
import { useGlobalSettings, useStreamDeck } from './hooks/stream-deck';
import { SettingsBox } from './components/SettingsBox';
import { SettingsHeader } from './components/SettingsHeader';
import styled from 'styled-components';
import { useState } from 'react';
import HoYoLab from './images/hoyolab.png';
import { darken } from 'polished';
import { Gesture } from './components/Gesture';

function SimpleBox({ message }) {
  return (
    <SettingsBox>
      <SettingsHeader>
        <span>{message}</span>
      </SettingsHeader>
    </SettingsBox>
  );
}

const TextInput = styled.input`
  background: transparent;
  opacity: 0.7;
  outline: none;
  color: white;
  border-radius: 30px;
  width: calc(100% - 44px);
  margin-left: 4px;
  resize: none;
  margin-bottom: 12px;
  padding: 8px 16px;
  transition: all 0.3s;
  border: 2px solid #242734;

  &:first-of-type {
    margin-top: 12px;
  }

  &:focus,
  &:hover {
    opacity: 1;
    border-color: #657ef8;
  }
`;

const BlockDisplay = styled.div`
  background: #0c0f1d;
  background-size: cover;
  margin-top: 8px;
  width: calc(100% - 18px);

  & > div {
    padding: 0 8px;
  }

  & > div:first-of-type {
    background: #1b1d2a;
    cursor: pointer;
    padding: 12px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s;
    opacity: 0.7;

    & img {
      max-height: 24px;
    }

    &:hover {
      opacity: 1;
    }
  }

  display: block;
`;

const Spaced = styled.div`
  margin-top: 8px;
`;

const Collapsed = styled.div`
  height: ${(p) => (p.collapsed ? 0 : 'auto')};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & button {
    margin-top: 12px;
    background: #657ef8;
    color: white;
    text-align: center;
    padding: 8px;
    width: calc(100% - 16px);
    border-radius: 16px;
    border: none;
    transition: all 0.3s;
    outline: none !important;

    &:hover {
      cursor: pointer;
      background: ${darken(0.05, '#657ef8')};
    }
  }
`;

function Authentication({ authentication = {}, setSettings }) {
  const [collapsed, setCollapsed] = useState(authentication?.uuid);
  return (
    <BlockDisplay>
      <div onClick={() => setCollapsed(!collapsed)}>
        <img src={HoYoLab} alt='HoYoLab' />
      </div>
      <Collapsed collapsed={collapsed}>
        <button onClick={() => window.open('https://github.com/fcannizzaro/genshin-deck/wiki')}>
          GUIDE
        </button>

        <TextInput
          placeholder='uid'
          value={authentication.uid ?? ''}
          onChange={(e) => setSettings({ uid: e.target.value })}
        />
        <TextInput
          placeholder='ltuid'
          type='password'
          value={authentication.ltuid ?? ''}
          onChange={(e) => setSettings({ ltuid: e.target.value })}
        />
        <TextInput
          placeholder='ltoken'
          type='password'
          value={authentication.ltoken ?? ''}
          onChange={(e) => setSettings({ ltoken: e.target.value })}
        />
      </Collapsed>
    </BlockDisplay>
  );
}

function App() {
  const { action, info } = useStreamDeck();
  const [pluginSettings, setPluginSettings] = useGlobalSettings();
  const shortAction = action?.replace(`${info?.plugin.uuid}.`, '');
  const Action = Actions[shortAction];

  const authentication = pluginSettings?.['authentication'];

  return (
    <div className='container'>
      <div className='mini-spaced' />
      <div className='content'>
        {!action ? <SimpleBox message='loading...' /> : Action ? <Action /> : <></>}
        {!!pluginSettings && shortAction !== 'banner' && (
          <Authentication
            authentication={authentication}
            setSettings={(auth) =>
              setPluginSettings({
                authentication: {
                  ...authentication,
                  ...auth,
                },
              })
            }
          />
        )}
      </div>
      <Spaced>
        <Gesture action='Refresh actions' gesture={'Single Tap'} />
      </Spaced>
    </div>
  );
}

export default App;
