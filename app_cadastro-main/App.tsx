import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './src/lib/app/login';
import CriarConta from './src/lib/app/criar_conta';
import CadPokemon from './src/lib/app/cad_pokemon';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="CriarConta" component={CriarConta} />
        <Stack.Screen name="CadPokemon" component={CadPokemon} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
