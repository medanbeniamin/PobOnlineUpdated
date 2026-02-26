import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevices, useCodeScanner, getCameraDevice } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';

const BarcodeScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const devices = useCameraDevices();
  const device = getCameraDevice(devices, 'back');
  const navigation = useNavigation();

  useEffect(() => {
    const getPermissions = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === "granted");
    };

    getPermissions();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['code-128', 'code-93', 'codabar','ean-13','ean-8','itf','upc-e' ,'upc-a' ,'qr',],
    onCodeScanned: (codes) => {
      for (const code of codes) {
        setIsScanning(false);
        navigation.navigate('Home', { scannedData: code.value })
      }
    },
  });

  if (device == null) return <Text>Loading camera...</Text>;
  if (!hasPermission) return <Text>No camera permission</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessorFps={2}
        codeScanner={isScanning ? codeScanner : undefined}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Point the camera at a code</Text>
      </View>
    </SafeAreaView>
  );
};

export default BarcodeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  infoText: {
    color: 'white',
    fontSize: 16,
  },
});
