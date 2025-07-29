import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import uuid from 'react-native-uuid';
import { AppColors, AppGradients } from '../../assets/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const OBS_REQUEST_TIMEOUT = 5000;
const SCENES = [
  {
    name: 'mainScene',
    inputSettings: {
      url: `http://34.47.150.57:8081/api/v1/overlay/0b81375a-a800-4365-88c1-fe4b7075fb90?type=standard`,
      width: '100vw',
      height: 300,
      positionX: 0,
      positionY: 0,
    },
  },
  {
    name: 'boundaryScene',
    inputSettings: {
      url: `http://34.47.150.57:8081/api/v1/overlay/0b81375a-a800-4365-88c1-fe4b7075fb90?type=standard`,
      width: '100vw',
      height: 300,
      positionX: 0,
      positionY: 0,
    },
  },
  {
    name: 'sixScene',
    inputSettings: {
      url: `http://34.47.150.57:8081/api/v1/overlay/0b81375a-a800-4365-88c1-fe4b7075fb90?type=standard`,
      width: '100vw',
      height: 300,
      positionX: 0,
      positionY: 0,
    },
  },
  {
    name: 'wicketScene',
    inputSettings: {
      url: `http://34.47.150.57:8081/api/v1/overlay/0b81375a-a800-4365-88c1-fe4b7075fb90?type=standard`,
      width: '100vw',
      height: 300,
      positionX: 0,
      positionY: 0,
    },
  },
  {
    name: 'newBowlerScene',
    inputSettings: {
      url: `http://34.47.150.57:8081/api/v1/overlay/0b81375a-a800-4365-88c1-fe4b7075fb90?type=standard`,
      width: '100vw',
      height: 300,
      positionX: 0,
      positionY: 0,
    },
  },
  {
    name: 'newBatsmanScene',
    inputSettings: {
      url: `http://34.47.150.57:8081/api/v1/overlay/0b81375a-a800-4365-88c1-fe4b7075fb90?type=standard`,
      width: '100vw',
      height: 300,
      positionX: 0,
      positionY: 0,
    },
  },
  {
    name: 'scoreCardScene',
    inputSettings: {
      url: `http://34.47.150.57:8081/api/v1/overlay/0b81375a-a800-4365-88c1-fe4b7075fb90?type=standard`,
      width: '100vw',
      height: 300,
      positionX: 0,
      positionY: 0,
    },
  },
  {
    name: 'playingTeamsScene',
    inputSettings: {
      url: `http://34.47.150.57:8081/api/v1/overlay/0b81375a-a800-4365-88c1-fe4b7075fb90?type=standard`,
      width: '100vw',
      height: 300,
      positionX: 0,
      positionY: 0,
    },
  },
  {
    name: 'firstInningsCompleteScene',
    inputSettings: {
      url: `http://34.47.150.57:8081/api/v1/overlay/0b81375a-a800-4365-88c1-fe4b7075fb90?type=standard`,
      width: '100vw',
      height: 300,
      positionX: 0,
      positionY: 0,
    },
  },
  {
    name: 'playingXIScene',
    inputSettings: {
      url: `http://34.47.150.57:8081/api/v1/overlay/0b81375a-a800-4365-88c1-fe4b7075fb90?type=playingXI`,
      width: '100vw',
      height: 300,
      positionX: 0,
      positionY: 0,
    },
  },
];

const manualScenes = [
  'wicketScene',
  'newBowlerScene',
  'newBatsmanScene',
  'scoreCardScene',
  'playingTeamsScene',
  'firstInningsCompleteScene',
];

const ConnectLiveStream = () => {
  const [obsIp, setObsIp] = useState('192.168.1.X');
  const [obsPassword, setObsPassword] = useState('');
  const [isObsConnected, setIsObsConnected] = useState(false);
  const [obsConnectionLoading, setObsConnectionLoading] = useState(false);
  const [obsConfigLoading, setObsConfigLoading] = useState(false);
  const [availableScenes, setAvailableScenes] = useState([]);

  const wsRef = useRef(null);
  const pendingRequestsRef = useRef({});

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const generateAuthToken = useCallback(async (password, salt, challenge) => {
    const secret = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + salt,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    return Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      secret + challenge,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
  }, []);

  const sendOBSEvent = useCallback((eventData, timeout = OBS_REQUEST_TIMEOUT) => {
    return new Promise((resolve, reject) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return reject(new Error('Not connected to OBS'));
      const requestId = uuid.v4();
      const timer = setTimeout(() => {
        delete pendingRequestsRef.current[requestId];
        reject(new Error('OBS request timeout'));
      }, timeout);
      pendingRequestsRef.current[requestId] = {
        resolve: (data) => {
          clearTimeout(timer);
          resolve(data);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      };
      ws.send(JSON.stringify({
        op: 6,
        d: { requestType: eventData.requestType, requestId, requestData: eventData.params || {} },
      }));
    });
  }, []);

  const connectToOBS = useCallback(() => {
    if (!obsIp) return Alert.alert('Enter OBS IP');
    setObsConnectionLoading(true);
    const socket = new WebSocket(`ws://${obsIp}:4455`);

    socket.onopen = () => { wsRef.current = socket; };
    socket.onerror = () => {
      Alert.alert('Connection Error', 'Ensure OBS is running and WebSocket is enabled.');
      setObsConnectionLoading(false);
    };
    socket.onclose = () => {
      wsRef.current = null;
      setIsObsConnected(false);
      setObsConnectionLoading(false);
    };
    socket.onmessage = async (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.op === 0) {
          const identifyPayload = { op: 1, d: { rpcVersion: 1 } };
          if (data.d.authentication?.challenge) {
            const auth = await generateAuthToken(
              obsPassword,
              data.d.authentication.salt,
              data.d.authentication.challenge
            );
            identifyPayload.d.authentication = auth;
          }
          socket.send(JSON.stringify(identifyPayload));
        } else if (data.op === 2) {
          setIsObsConnected(true);
          setObsConnectionLoading(false);
          fetchAvailableScenes();
        } else if (data.op === 7) {
          const { requestId, requestStatus, responseData } = data.d;
          const pending = pendingRequestsRef.current[requestId];
          if (pending) {
            if (requestStatus.result) pending.resolve(responseData);
            else pending.reject(new Error(requestStatus.comment));
            delete pendingRequestsRef.current[requestId];
          }
        }
      } catch (err) {
        console.error('OBS message error:', err);
      }
    };
  }, [obsIp, obsPassword, generateAuthToken]);

  const fetchAvailableScenes = useCallback(async () => {
    try {
      const result = await sendOBSEvent({ requestType: 'GetSceneList' });
      setAvailableScenes(result.scenes.map((scene) => scene.sceneName));
    } catch (error) {
      console.error('Fetching scenes failed:', error);
    }
  }, [sendOBSEvent]);

  const configureOBS = useCallback(async () => {
    if (!isObsConnected) return Alert.alert('Connect to OBS first.');
    setObsConfigLoading(true);
    try {
      for (const scene of SCENES) {
        try {
          await sendOBSEvent({
            requestType: 'CreateScene',
            params: { sceneName: scene.name },
          });
        } catch (e) {
          if (!e.message.includes('scene already exists')) throw e;
        }

        await sendOBSEvent({
          requestType: 'CreateInput',
          params: {
            sceneName: scene.name,
            inputName: `${scene.name}_browser`,
            inputKind: 'browser_source',
            inputSettings: scene.inputSettings,
          },
        });

        const { sceneItemId } = await sendOBSEvent({
          requestType: 'GetSceneItemId',
          params: {
            sceneName: scene.name,
            sourceName: `${scene.name}_browser`,
          },
        });

        await sendOBSEvent({
          requestType: 'SetSceneItemTransform',
          params: {
            sceneName: scene.name,
            sceneItemId,
            sceneItemTransform: {
              positionX: 0,
              positionY: 780,
            },
          },
        });
      }

      await sendOBSEvent({
        requestType: 'CreateInput',
        params: {
          sceneName: 'mainScene',
          inputName: 'Webcam',
          inputKind: 'dshow_input',
          inputSettings: {
            device_name: 'OBS Virtual Camera',
          },
        },
      });

      await sendOBSEvent({ requestType: 'SetCurrentProgramScene', params: { sceneName: 'mainScene' } });
      fetchAvailableScenes();
      Alert.alert('Success', 'Scenes configured');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setObsConfigLoading(false);
    }
  }, [sendOBSEvent, isObsConnected, fetchAvailableScenes]);

  const switchScene = async (sceneName) => {
    try {
      await sendOBSEvent({ requestType: 'SetCurrentProgramScene', params: { sceneName } });
    } catch (error) {
      Alert.alert('Scene Error', error.message);
    }
  };

  const disconnectFromOBS = () => {
    if (wsRef.current) wsRef.current.close();
    wsRef.current = null;
    setIsObsConnected(false);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.background} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <View style={styles.section}>
            <LinearGradient style={styles.card} colors={AppGradients.primaryCard}>
              <MaterialCommunityIcons name="cast-connected" color="white" size={120} />
              <Text style={styles.sectionTitle}>OBS Studio Configuration</Text>
              <Text style={styles.inputLabel}>IP Address:</Text>
              <TextInput
                style={styles.input}
                placeholder="OBS IP (e.g., 192.168.1.X)"
                placeholderTextColor="black"
                value={obsIp}
                onChangeText={setObsIp}
                keyboardType="numeric"
              />
            </LinearGradient>

            {!isObsConnected ? (
              <TouchableOpacity style={[styles.button, styles.obsButton]} onPress={connectToOBS}>
                {obsConnectionLoading ? <ActivityIndicator color="black" /> : (
                  <>
                    <MaterialCommunityIcons name="connection" size={20} color="#2196F3" />
                    <Text style={styles.buttonText}> Connect to OBS</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.connectionStatusContainer}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.connectionStatusText}>Connected to OBS</Text>
                </View>

                <TouchableOpacity style={[styles.button, styles.configureButton]} onPress={configureOBS}>
                  {obsConfigLoading ? <ActivityIndicator color="black" /> : (
                    <>
                      <MaterialCommunityIcons name="cog" size={20} color="#fff" />
                      <Text style={styles.buttonText}> Configure OBS</Text>
                    </>
                  )}
                </TouchableOpacity>

                {manualScenes.map((scene) => (
                  <TouchableOpacity key={scene} style={[styles.button, styles.obsButton]} onPress={() => switchScene(scene)}>
                    <MaterialCommunityIcons name="monitor" size={20} color="#fff" />
                    <Text style={styles.buttonText}> Show {scene}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.button, styles.disconnectButton]} onPress={disconnectFromOBS}>
                  <MaterialCommunityIcons name="connection-off" size={20} color="#fff" />
                  <Text style={styles.buttonText}> Disconnect</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default ConnectLiveStream;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  section: {
    marginTop: 20,
    marginBottom: 15,
    width: '100%',
    padding: 10,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.75,
    shadowRadius: 4,
    elevation: 5,
  },
  card: {
    flex: 1,
    borderRadius: 15,
    marginVertical: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.75,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sectionTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    color: 'black',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'rgb(255, 255, 255)',
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.75,
    shadowRadius: 4,
    elevation: 5,
    fontSize: 16,
  },
  inputLabel: {
    width: '100%',
    fontSize: 16,
    textAlign: 'left',
    color: 'white',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  obsButton: {
    backgroundColor: '#2196F3',
  },
  configureButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  connectionStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  connectionStatusText: {
    color: '#4CAF50',
    fontSize: 16,
    marginLeft: 5,
  },
});
