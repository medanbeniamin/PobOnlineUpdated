import Reactotron from 'reactotron-react-native'

Reactotron.configure({ name: 'Ignite App' }) 
  .useReactNative() // add all built-in react native plugins
  .connect() // let's connect!

Reactotron.clear()

console.tron = Reactotron