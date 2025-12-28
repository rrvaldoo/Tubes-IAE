import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
// Camera is dynamically imported on native platforms only
import QRCode from 'react-native-qrcode-svg';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

export default function QRISScreen({ navigation }) {
  const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof window.document !== 'undefined');
  const [CameraComponent, setCameraComponent] = useState(null);
  const [hasPermission, setHasPermission] = useState(isWeb ? false : null);
  const [scanned, setScanned] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('DosWallet:QRIS:1234567890'); // Placeholder

  React.useEffect(() => {
    if (isWeb) return;

    (async () => {
      const { Camera } = await import('expo-camera');
      setCameraComponent(() => Camera);
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, [isWeb]);

  const handleBarCodeScanned = ({ type, data }) => {
    if (!scanned) {
      setScanned(true);
      Alert.alert('QR Code Scanned', `Data: ${data}`, [
        {
          text: 'OK',
          onPress: () => {
            // Process QRIS payment here
            Alert.alert('Info', 'QRIS payment processing will be implemented');
            setScanned(false);
          },
        },
      ]);
    }
  };

  if (!isWeb && hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!isWeb && hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showQR ? (
        <View style={styles.qrContainer}>
          <Text style={styles.title}>Your QRIS Code</Text>
          <View style={styles.qrCodeContainer}>
            <QRCode
              value={qrData}
              size={width * 0.7}
              color={colors.text}
              backgroundColor={colors.surface}
            />
          </View>
          <Text style={styles.qrText}>{qrData}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowQR(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.scannerContainer}>
          <Text style={styles.title}>Scan QRIS Code</Text>
          {isWeb ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={styles.text}>Camera scanning is not available on web.</Text>
              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={() => setShowQR(true)}
              >
                <Text style={styles.buttonText}>Show My QR</Text>
              </TouchableOpacity>
            </View>
          ) : (
            CameraComponent && (
              <CameraComponent
                style={styles.camera}
                type={CameraComponent.Constants.Type.back}
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
            )
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.buttonText}>Scan Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setShowQR(true)}
            >
              <Text style={styles.buttonText}>Show My QR</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scannerContainer: {
    flex: 1,
    padding: 20,
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  qrCodeContainer: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 50,
  },
});

