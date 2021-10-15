import React from 'react';
import * as eva from '@eva-design/eva';
import Start from './pages/authorization/start';
import { ApplicationProvider } from '@ui-kitten/components';

export default () => (
    <ApplicationProvider {...eva} theme={eva.light}>
        <Start />
    </ApplicationProvider>
);
