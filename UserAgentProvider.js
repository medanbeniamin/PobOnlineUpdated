import { Platform } from "react-native";
import DeviceInfo from 'react-native-device-info'
import UserAgent from 'react-native-user-agent'

const os = Platform.OS === 'android' ? 'Android' : 'IOS'

const DeviceUserAgent = `${UserAgent.getUserAgent()} [POB/${os}/${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})]`
export default DeviceUserAgent