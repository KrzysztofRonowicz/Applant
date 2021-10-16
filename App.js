import React from 'react';
import * as eva from '@eva-design/eva';
import Start from './pages/authorization/start';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { default as theme } from './assets/custom-theme.json';

export default () => (
    <>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>
            <Start />
        </ApplicationProvider>
    </>
);
