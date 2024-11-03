import sys
import requests
import os
from openai import OpenAI
from twilio.rest import Client
import numpy as np
import librosa
import tensorflow as tf
from tensorflow.keras.models import load_model
import pickle
import warnings
import logging
from dotenv import load_dotenv

load_dotenv()

##### start of emotion detection 

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow logging
warnings.filterwarnings('ignore')  # Suppress all warnings
logging.getLogger('tensorflow').setLevel(logging.ERROR)  # Only show errors, not warnings
# ... keep all your imports and initial setup ...

def setup_environment():
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    warnings.filterwarnings('ignore')
    logging.getLogger('tensorflow').setLevel(logging.ERROR)

def load_models(model_path, encoder_path):
    loaded_model = load_model(model_path)
    with open(encoder_path, 'rb') as f:
        loaded_le = pickle.load(f)
    return loaded_model, loaded_le

def emotion_to_number(emotion):
    emotion_number_mapping = {
        'FEA': 3,  # Fear
        'SAD': 2,  # Sad
        'ANG': 1,  # Angry
        'HAP': 0,  # Happy
        'DIS': 0,  # Disgust
        'NEU': 0,  # Neutral
        'SUR': 0   # Surprise
    }
    return emotion_number_mapping.get(emotion, 0)  # Default to 0 if emotion not found

def extract_features(data):
    # Make sure the audio is long enough
    if len(data) < 22050:  # if less than 0.5 seconds
        data = np.pad(data, (0, 22050 - len(data)))

    # Zero Crossing Rate
    result = np.array([])
    zcr = np.mean(librosa.feature.zero_crossing_rate(y=data).T, axis=0)
    result = np.hstack((result, zcr))

    # Chroma_stft (with adjusted n_fft)
    n_fft = min(512, len(data))  # Adjust n_fft based on signal length
    stft = np.abs(librosa.stft(data, n_fft=n_fft))
    chroma_stft = np.mean(librosa.feature.chroma_stft(
        S=stft,
        sr=44100,
        n_fft=n_fft
    ).T, axis=0)
    result = np.hstack((result, chroma_stft))

    # MFCC (with adjusted parameters)
    mfcc = np.mean(librosa.feature.mfcc(
        y=data,
        sr=44100,
        n_fft=n_fft,
        n_mels=128  # Increased number of mel bands
    ).T, axis=0)
    result = np.hstack((result, mfcc))

    # MelSpectogram (with adjusted parameters)
    mel = np.mean(librosa.feature.melspectrogram(
        y=data,
        sr=44100,
        n_fft=n_fft,
        n_mels=128  # Increased number of mel bands
    ).T, axis=0)
    result = np.hstack((result, mel))

    # Tonnetz
    tonnetz = np.mean(librosa.feature.tonnetz(
        y=librosa.effects.harmonic(data),
        sr=44100
    ).T, axis=0)
    result = np.hstack((result, tonnetz))

    return result

def predict_emotion_from_file(audio_path, loaded_model, loaded_le):
    try:
        # Load and preprocess the audio file
        data, sr = librosa.load(audio_path, sr=44100, duration=3.0)  # Load max 3 seconds

        # Extract features
        features = extract_features(data)

        # Reshape features
        features = np.expand_dims(features, axis=0)
        features = np.expand_dims(features, axis=2)

        # Predict
        prediction = loaded_model.predict(features, verbose=0)
        predicted_emotion = loaded_le.inverse_transform([np.argmax(prediction[0])])[0]

        return predicted_emotion, prediction[0]
    except Exception as e:
        print(f"Error during prediction: {e}")
        return None, None
def emotion_detection():
    # Add this mapping at the start of the function
    emotion_mapping = {
        'FEA': 'Fear',
        'SAD': 'Sadness',
        'ANG': 'Anger',
        'HAP': 'Happiness',
        'DIS': 'Disgust',
        'NEU': 'Neutral',
        'SUR': 'Surprise'
    }
    
    # Setup paths
    model_path = os.getenv('MODEL_PATH')
    encoder_path = os.getenv('ENCODER_PATH')
    test_file = os.getenv('RECORDING_PATH')

    # Load models
    loaded_model, loaded_le = load_models(model_path, encoder_path)

    # Get prediction
    emotion, probs = predict_emotion_from_file(test_file, loaded_model, loaded_le)
    
    if emotion is not None:
        # Get numerical representation
        emotion_number = emotion_to_number(emotion)
        
        # Get maximum probability emotion
        max_prob_index = np.argmax(probs)
        max_emotion = loaded_le.classes_[max_prob_index]
        max_probability = probs[max_prob_index]
        
        # Print results
        print(f"\nEmotion Number: {emotion_number}")
        print(f"Strongest emotion detected: {emotion_mapping.get(max_emotion, max_emotion)} ({max_probability*100:.2f}%)")
        
        return emotion_number
    else:
        return 0
    return 0  # Return 0 if there's an error

setup_environment()
result = emotion_detection()

####finish of it 




# Initialize the OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Replace Twilio constants
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_MESSAGING_SERVICE_SID = os.getenv('TWILIO_MESSAGING_SERVICE_SID')
TO_PHONE_NUMBER = os.getenv('TWILIO_TO_PHONE_NUMBER')

def send_twilio_message(message):
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    try:
        message = client.messages.create(
            messaging_service_sid=TWILIO_MESSAGING_SERVICE_SID,
            to=TO_PHONE_NUMBER,
            body=message
        )
        print(f"Message sent: {message.sid}")
    except Exception as e:
        print(f"Error sending message: {str(e)}")

def check_violence_threat(text):
    try:
        messages = [
            {"role": "system", "content": "You are an emergency call responder. Respond with 'Yes' if the text contains violent/threatening/dangerous language or someone is in distress,asking to be saved / rescued and 'No' if it is safe/normal situation. Dont provide an explanation.use only one word"},
            {"role": "user", "content": f"Analyze this text: {text}"}
        ]

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
        )

        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in threat detection: {str(e)}")
        return "Error"

def transcribe_audio(audio_file_path):
    url = "https://openai-whisper-speech-to-text-api.p.rapidapi.com/transcribe"

    # Verify file exists and get size
    file_size = os.path.getsize(audio_file_path)
    #print(f"Audio file size: {file_size} bytes")

    # Open and prepare the audio file
    with open(audio_file_path, 'rb') as audio_file:
        files = {
            'file': ('audio.wav', audio_file, 'audio/wav')
        }

        payload = {
            'type': 'RAPID',
            'response_format': 'JSON',
            'language': 'en'  # Added language specification
        }

        headers = {
            "x-rapidapi-key": os.getenv('RAPIDAPI_KEY'),
            "x-rapidapi-host": "openai-whisper-speech-to-text-api.p.rapidapi.com"
        }

        try:
            #print("Sending request to API...")
            response = requests.post(url, files=files, data=payload, headers=headers)
            """
            print(f"Response Status Code: {response.status_code}")
            print(f"Response Headers: {response.headers}")
            """
            try:
                result = response.json()
                print(result)
                # Check for nested response structure
                if 'response' in result and 'text' in result['response']:
                    transcribed_text = result['response']['text']
                    print(transcribed_text)
                    threat_result = check_violence_threat(transcribed_text)
                    print(threat_result)
                    #here
                    emotion_number = emotion_detection()
                    risk_score = calculate_risk_score(threat_result, emotion_number)
                    danger_message = determine_danger_level(risk_score)

                    print(f"Threat Result: {threat_result}")
                    print(f"Emotion Score: {emotion_number}")
                    print(f"Risk Score: {risk_score:.2f}")
                    print(f"Sending message: {danger_message}")

                    send_twilio_message(danger_message)
                    return threat_result
                elif 'text' in result:
                    transcribed_text = result['text']
                    print(transcribed_text)
                    return transcribed_text
                else:
                    print("No text field found in response")
                    return None
                
            except requests.exceptions.JSONDecodeError:
                print(f"Raw Response Content: {response.text}")
                return None
            
        except requests.exceptions.RequestException as e:
            print(f"Error during API request: {e}")
            print(f"Response status code: {response.status_code}")
            print(f"Response text: {response.text}")
            return None

def calculate_risk_score(threat_result, emotion_number):
    # Convert threat_result to a binary value
    threat_binary = 1 if threat_result.strip().lower() == 'yes' else 0
    
    # Weight factors (can be adjusted)
    THREAT_WEIGHT = 0.8  # 80% weight to threat detection
    EMOTION_WEIGHT = 0.2  # 20% weight to emotion detection
    
    # Normalize emotion_number (assuming max is 3 from your mapping)
    normalized_emotion = emotion_number / 3.0
    
    # Calculate combined risk score (0 to 1)
    risk_score = (THREAT_WEIGHT * threat_binary) + (EMOTION_WEIGHT * normalized_emotion)
    
    return risk_score

def determine_danger_level(risk_score):
    if risk_score >= 0.8:
        return "CRITICAL: Immediate danger detected!"
    elif risk_score >= 0.6:
        return "HIGH ALERT: I am in serious danger"
    elif risk_score >= 0.4:
        return "WARNING: I might be in danger"
    elif risk_score >= 0.2:
        return "CAUTION: Situation unclear but concerning"
    else:
        return "I am safe"

if __name__ == "__main__":
    if len(sys.argv) != 2:
        #print("Usage: python transcribe.py <path_to_audio_file>")
        #print("Example: python transcribe.py ./recordings/audio.wav")
        sys.exit(1)

    audio_file_path = sys.argv[1]
    try:
        transcribe_audio(audio_file_path)
    except FileNotFoundError:
        print(f"Error: Audio file not found at path: {audio_file_path}")
    except Exception as e:
        print(f"Unexpected error: {e}")
