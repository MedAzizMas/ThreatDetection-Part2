import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';

const SpeechRecognition = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Request audio permissions
    Audio.requestPermissionsAsync();
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  const startRecording = async () => {
    try {
      // Configure recording options for WAV format
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 768000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 768000,
          linearPCM: true,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 768000,
        }
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (!uri) {
        console.log('No URI found');
        return;
      }
      
      console.log('Recording URI:', uri);
      
      // Test if the file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('File info:', fileInfo);

      console.log('Converting to base64...');
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Base64 length:', base64Audio.length);

      console.log('Attempting to send to server...');
      const SERVER_IP = '192.168.68.187:3000';  // Updated to match your WiFi IP
      const response = await fetch(`http://${SERVER_IP}/save-audio`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          filename: 'latest_recording.wav'
        })
      });

      const result = await response.json();
      if (result.transcript) {
        if (result.transcript.includes("Error in prediction")) {
          // Don't show the error message container
          setTranscript('Situation unclear but concerning');
          setError('');
        } else {
          setTranscript(result.transcript);
          setError('');
        }
      }

    } catch (error: unknown) {
      setError('Failed to process audio');
      setTranscript('');
      if (error instanceof Error) {
        console.error('Detailed error:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('Unknown error:', error);
      }
    }
  };

  const testServerConnection = async () => {
    try {
      console.log('Testing server connection...');
      const SERVER_IP = '192.168.68.187'; // Update this to match your computer's IP address
      const response = await fetch(`http://${SERVER_IP}:3000/`);
      const text = await response.text();
      console.log('Server response:', text);
    } catch (error) {
      console.error('Server test failed:', error);
    }
  };

  // Call this function when component mounts
  useEffect(() => {
    testServerConnection();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.recordButton,
          isRecording && styles.recordingActive
        ]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <View style={styles.innerCircle}>
          <MaterialIcons 
            name={isRecording ? "stop" : "mic"} 
            size={32} 
            color="#F5F5F5" 
          />
        </View>
      </TouchableOpacity>
      
      {transcript && !error && (
        <View style={styles.resultContainer}>
          <Text style={styles.label}>Transcript</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6A0DAD',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordingActive: {
    backgroundColor: '#FF69B4',
  },
  innerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  label: {
    fontSize: 14,
    color: '#6A0DAD',
    fontWeight: '600',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
    marginBottom: 15,
  },
  threatIndicator: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  threatText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SpeechRecognition;