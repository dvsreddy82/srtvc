import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store/store';
import { theme } from './shared/theme';

function App(): React.JSX.Element {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          {/* Navigation will be added here */}
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
}

export default App;

