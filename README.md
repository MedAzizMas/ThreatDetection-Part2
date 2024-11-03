# Welcome to your Expo app 👋

# Safeher

A comprehensive mobile application built to detect voice input by a user and determine if the output represents a violent encounter , hostile or potentially threatning situation to the user based on the content of the conversations recorded (translated by gtp 3.5 turbo api) and through the tone of voices recorded (to determine the mental/emotional state of the speaker) with the use of our own model inspired by https://www.kaggle.com/code/eward96/speech-emotion-detection#visual  and trained on a new dataset present in the previous link.
![image](https://github.com/user-attachments/assets/4b7e475c-c176-4510-a5fa-492b83d9a44a)

The output of this pipline concludes by an sos signal sent through an sms in the case of a violent encounter.

![image](https://github.com/user-attachments/assets/8ac1d767-6f1c-4342-8b81-d55f21737368)

![image](https://github.com/user-attachments/assets/28b00a66-84fe-42a6-a5a4-02992ff2d56d)



This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.


### AI model
https://colab.research.google.com/drive/179kwk21_rG7qzeeqJ88imb0aruc0xQCe?usp=sharing

This project explores speech emotion detection using a deep learning model implemented in Keras. Inspired by the work available on Kaggle by eward96, this notebook adapts and customizes the methodology to suit the Toronto Emotional Speech Set (TESS), specifically the OAF subset. The TESS dataset comprises 1000 .wav audio files, representing 5 distinct emotions, with each emotion containing 200 samples. The model architecture, a convolutional neural network (CNN), leverages multiple Conv1D and MaxPooling1D layers, followed by dense layers with dropout for improved generalization. The model is compiled using categorical cross-entropy loss and optimized with RMSprop for efficient training. This adaptation aims to provide robust emotion classification from audio signals with high accuracy.

![image](https://github.com/user-attachments/assets/38dd4070-f48c-4cb6-a181-5787b19123f7)


## Conclusion 
Our solutions aims to prevent women from getting into dangerous situations and strives to get them help if they happen to get into one ; It's both a precaution and a solution.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
