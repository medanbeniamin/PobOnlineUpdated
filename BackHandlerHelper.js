import { BackHandler, Platform } from 'react-native'

export default {
  removeEvent: eventHandler => {
    if (Platform.OS === 'ios') return
    // BackHandler.removeEventListener('hardwareBackPress', eventHandler)
  },
  addEvent: eventHandler => {
    if (Platform.OS === 'ios') return
    BackHandler.addEventListener('hardwareBackPress', eventHandler)
  },
}
