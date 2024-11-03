import { Image, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import SpeechRecognition from '@/components/speech/SpeechRecognition';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Color palette
const COLORS = {
  primary: '#6A0DAD',    // Deep Purple
  secondary: '#89CFF0',  // Soft Blue
  accent: '#FF69B4',     // Bright Pink
  background: '#F5F5F5', // Light Gray
  text: '#1A1A1A',       // Dark Navy
};

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <Image 
        source={require('@/assets/images/womenn.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <ThemedView style={styles.overlay}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText style={styles.titleText}>
            Threat Detection{'\n'}System
          </ThemedText>
        </ThemedView>
        <SpeechRecognition />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
    justifyContent: 'space-between',
    paddingBottom: 80,
  },
  titleContainer: {
    backgroundColor: 'rgba(106, 13, 173, 0.7)', // Using COLORS.primary with opacity
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginTop: 240,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // for Android shadow
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 35,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});