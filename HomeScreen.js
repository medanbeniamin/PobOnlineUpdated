import React, { Component, useReducer } from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  AppRegistry,
  View,
  Text,
  Linking,
  ScrollView,
  RefreshControl,
  Dimensions,
  Platform,
  Share
} from 'react-native';
import cookie from 'cookie'
import _ from 'lodash'
import { WebView } from 'react-native-webview';
import CookieManager from '@react-native-community/cookies';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceUserAgent from '../PobOnlineUpdated/UserAgentProvider'
import UrlHelper from './URLHelper'
import SplashScreen from 'react-native-splash-screen'
import BackHandlerHelper from '../PobOnlineUpdated/BackHandlerHelper'
import RNShareFile from 'react-native-share-pdf';

let domain= "https://www.pobonline.ro"

export default class HomeScreen extends Component {

  static navigationOptions = {
    headerShown: false
}

    constructor(props) {
        super(props);
        this.currentUrl = '';
        this.myWebView = null
        this.state = {
          refreshing: false,
          isReady: false,
          cookiesString: '',
          enableRefresh: true,
        };
      }

      jsonCookiesToCookieString = (json) => {
        let cookiesString = '';
        for (let [key, value] of Object.entries(json)) {
          cookiesString += `${key}=${value.value}; `;
        }
        return cookiesString;
      };
    
      UNSAFE_componentWillMount() {
        CookieManager.clearAll().then((success) => {
          this.provideMeSavedCookies().then(async (savedCookies) => {
            let cookiesString = this.jsonCookiesToCookieString(savedCookies);
              this.setState({cookiesString, isReady: true});
          })
          .catch((e) => {
              this.setState({isReady: true});
          });
        })
        .catch((e) => {
          this.provideMeSavedCookies().then(async (savedCookies) => {
            let cookiesString = this.jsonCookiesToCookieString(savedCookies);
              this.setState({cookiesString, isReady: true});
          })
          .catch((e) => {
              this.setState({isReady: true});
          });
        });      
      }

      componentDidMount(): void {
        setTimeout(SplashScreen.hide, 1000)
        BackHandlerHelper.addEvent(this.onNativeBack)
      }

      componentWillUnmount(): void {
        // BackHandlerHelper.removeEvent(this.onNativeBack)
      }

      onNativeBack = () => {
        let action = 'androidNativeBackButton'
        const data = {
          action : action,
        }
        let jsonData = JSON.stringify(data)
        let x = `shellNms.invoke(${jsonData});`
        this.myWebView.injectJavaScript(x)
        return true
      }

     componentDidUpdate(prevProps): void {
        const codul = this.props.route.params?.scannedData;
        if (codul) {
          let action = 'barCodeScanner'
          const data = {
            action : action,
            data : codul,
          }
          let jsonData = JSON.stringify(data)
          let x = `shellNms.invoke(${jsonData});`
          this.myWebView.injectJavaScript(x)
          this.props.navigation.setParams({'scannedData': null})
        }
      }

      provideMeSavedCookies = async () => {
        try {
          let value = await AsyncStorage.getItem('savedCookies');
          if (value !== null) {
            return Promise.resolve(JSON.parse(value));
          }
        } catch (error) {
          return {}
        }
      };
    
      onShouldStartLoadWithRequest = e => {
        let successUrl = `${domain}/pages/home.php`;
        let logoutUrl = `${domain}/logout.php`;
        let loginUrl = `${domain}/login.php`;
        const {cookiesString, isReady} = this.state;

        if (e.url === successUrl) {
            CookieManager.get(e.url).then((res) => {
              let jsonRes = JSON.stringify(res)
              if (jsonRes.indexOf('logSysrememberMe') !== -1) {
                let uti = jsonRes.split(`,"PHPSESSID"`)[0] + '}'
                AsyncStorage.setItem('savedCookies', uti);
              } else {
                // Do nothing
              }
            });
        } else if (e.url === logoutUrl || e.url === loginUrl) {
          AsyncStorage.removeItem('savedCookies')
          CookieManager.clearAll().then((success) => {
                this.setState({cookiesString: '', isReady: true});
              })
            .catch((e) => {
              this.setState({isReady: true});
            });
        } 

        const urlParameters = UrlHelper.getParams(e.url)
        const urlWithoutParameters = e.url.split('?')[0]

        if (urlParameters.openinbrowser === 'true') {
            Linking.openURL(urlWithoutParameters)
            return false
        }
    
        return true
      }
    
      _handleMessage = ({nativeEvent}) => {
         let flashOn = true
         let vibrateOn = true
         const {data} = nativeEvent
         let message = JSON.parse(data)
         let params = message.params

         if (params) {
          flashOn = params.flashOn
          vibrateOn = params.vibrateOn
         }

          switch(message.action) {
            case 'barCodeScanner':
              this.props.navigation.navigate('BarcodeScreen', { flashOn: flashOn,
                                                                vibrateOn: vibrateOn, })
              break
            case 'share':
              let pdf = message.pdf
              if (Platform.OS === 'ios') {
                let url = `data:application/pdf;base64,${pdf}`
                Share.share({ url });
              } else {
                const showError = RNShareFile.sharePDF(pdf, 'Document.pdf');
                if (showError) {
                  // Do something with the error
                }
              }
            break
          return;
        }
      }

      static generateCookieString(name, value, days, endpoint) {
        let newDomain = domain.replace('https://','')
    
        let expires = ''
        if (days) {
          const date = new Date()
          date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
          expires = `; expires=${date.toUTCString()}`
        }
        return `${name}=${value || ''}${expires}; domain=${newDomain}; path=/`
      }

      generateCookiesJs() {
        const { cookiesString } = this.state

        if (!cookiesString) {
          return false
        }
        const codePlaceholder = `(function(){
                  {{injectedCode}}
                   return true;
                })()`
        let code = ''
        if (cookiesString) {
          // const cookiesObject = cookie.parse(cookiesString)
          // _.each(cookiesObject, (item, index) => {
          //   code += `document.cookie='${HomeScreen.generateCookieString(index, item, 20, domain)}';`
          // })
        }
        return codePlaceholder.replace('{{injectedCode}}', code)
      }
    
      injectSessionCookies() {
        const jsCode = this.generateCookiesJs()
        if (!jsCode) {
          return
        }
        this.myWebView.injectJavaScript(jsCode)
      }

      onLoadStart = () => {
        this.injectSessionCookies()
      }
    
      onLoadEnd = () => {
        this.injectSessionCookies()
      }

      onRefresh = () => {
        this.setState({refreshing:true})
        let action = 'swipeDown'
        const data = {
          action : action,
          data : "refresh",
        }
        let jsonData = JSON.stringify(data)
        let x = `shellNms.invoke(${jsonData});`
        this.myWebView.injectJavaScript(x)
      }

      onLoadProgress = e => {
        if (e.nativeEvent.progress === 1) {
          this.setState({
            refreshing: false,
          });
        }
      }

      onScroll = ({nativeEvent}) => {
        this.setState({enableRefresh: nativeEvent.contentOffset.y == 0})
      }

      render() {
        const {cookiesString, isReady} = this.state;
        const userAgent = DeviceUserAgent
        
        if (!isReady) {
          return null;
        }
        return (
          <SafeAreaView style={styles.container}>
            <ScrollView
              contentContainerStyle={{flex: 1}}
              refreshControl={<RefreshControl  
                              refreshing={this.state.refreshing}
                              titleColor={'black'}
                              title={'Refreshing...'}
                              enabled={this.state.enableRefresh}
                              colors={['brown', 'green']}
                              progressBackgroundColor={'white'}
                              tintColor={'green'}
                              onRefresh={this.onRefresh} />} 
              scrollEnabled={Platform.OS === 'ios' ? true : false} 
              onLayout={(ev)=>this.setState({scrollViewHeight:ev.nativeEvent.layout.height})}>
              <WebView
                ref={r => (this.myWebView = r)}
                source={{
                  uri: `${domain}`,
                  headers: {
                    Cookie: cookiesString,
                  },
                }}
                onScroll={this.onScroll}
                keyboardDisplayRequiresUserAction={false}
                style={styles.WebViewStyle}
                onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                onMessage={this._handleMessage}
                userAgent={userAgent}
                onLoadProgress={this.onLoadProgress}
                setSupportMultipleWindows={true}
                onLoadEnd={this.onLoadEnd}
                onLoadStart={this.onLoadStart}
              />
              </ScrollView>
            </SafeAreaView>
        );
      }
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#ffffff',
      },
      WebViewStyle: {
        flex: 1,
        resizeMode: 'cover',
      },
    });

    // enableNavigate={false}             
    // javaScriptEnabled={true}
    // domStorageEnabled={true}    
    // startInLoadingState={false}                           
    // scalesPageToFit={true}
    // setSupportMultipleWindows={true}