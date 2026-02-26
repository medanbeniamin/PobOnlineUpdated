// import { createStackNavigator } from "react-navigation-stack";
// import { createAppContainer } from "react-navigation";
// import HomeScreen from '../HomeScreen'
// import BarcodeScreen from '../BarcodeScreen'

// const screens = {
//     Home: { 
//             screen: HomeScreen,
//             navigationOptions: {
//               headerShown: false,
//             }
//          },
//     BarcodeScreen: { 
//             screen: BarcodeScreen,
//             navigationOptions: {
//               headerShown: true,
//               headerBackTitle: 'Inapoi',
//               title: 'Cititor cod de bare',
//             }
//           },
// }

// const HomeStack = createStackNavigator(screens)

// export default createAppContainer(HomeStack);

// AppNavigator.js (sau App.js dacă ești direct în root)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../HomeScreen';
import BarcodeScreen from '../BarcodeScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BarcodeScreen"
          component={BarcodeScreen}
          options={{
            headerShown: true,
            headerBackTitle: 'Înapoi',
            title: 'Cititor cod de bare',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


// import { createStackNavigator } from '@react-navigation/stack';
// import HomeScreen from '../HomeScreen';
// import BarcodeScreen from '../BarcodeScreen';

// const Stack = createStackNavigator();

// function AppNavigator() {
//   return (
//     <Stack.Navigator initialRouteName="Home">
//       <Stack.Screen name="Home" component={HomeScreen} />
//       <Stack.Screen name="BarcodeScreen" component={BarcodeScreen} />
//     </Stack.Navigator>
//   );
// }
