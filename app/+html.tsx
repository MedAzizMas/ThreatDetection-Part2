import { View } from 'react-native';
import SpeechRecognition from '../components/speech/SpeechRecognition';

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Your existing layout content */}
      <SpeechRecognition />
    </View>
  );
}