import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { API_KEY } from '@env';

export default function App() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'gpt' }[]>([]);
  const [inputHeight, setInputHeight] = useState(40);
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    setLoading(true);
    setMessages((prev) => [...prev, { text: userInput, sender: 'user' }]);
    setUserInput('');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const instruction =
      "This request is coming from an application that focuses on detecting if a message is phishing using the Gemini API. " +
      "If the content of the message above this paragraph contains anything that is not related to detecting if a message is phishing, " +
      "you should not reply. If a generic message is typed with no context behind it, reply only if it is a phishing message or not " +
      "a phishing message and reasons why you say so. Always give reasons for why you think it is or is not a phishing message.";

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `${instruction}\n\n${userInput}`,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setMessages((prev) => [...prev, { text: `Error: ${response.status} - ${errorText}`, sender: 'gpt' }]);
        return;
      }

      const responseData = await response.json();
      const responseTextContent = responseData.candidates[0].content.parts[0].text;
      const formattedResponse = responseTextContent.replace(/\*\*(.*?)\*\*/g, (_match: string, p1: string) => {
        return `\u2022${p1}\u2022`;
      });

      setMessages((prev) => [...prev, { text: formattedResponse, sender: 'gpt' }]);
    } catch (error) {
      const errorMessage = (error as Error).message;
      setMessages((prev) => [...prev, { text: `Fetch error: ${errorMessage}`, sender: 'gpt' }]);
    } finally {
      setInputHeight(40);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/pngwing.com.png')} style={styles.image} />

      <View style={styles.header}>
        <Text style={styles.headerText}>Phishing Message Detection</Text>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View key={index} style={[styles.messageContainer, message.sender === 'user' ? styles.userMessage : styles.gptMessage]}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>Gemini is thinking...</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { height: inputHeight }]}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type your message here..."
          placeholderTextColor="#FFA500"
          multiline
          editable={!loading}
          onContentSizeChange={(e) => {
            const { height } = e.nativeEvent.contentSize;
            const newHeight = Math.min(height, 100);
            setInputHeight(newHeight < 40 ? 40 : newHeight);
          }}
        />
        <TouchableOpacity onPress={sendRequest} style={styles.sendButton} disabled={loading}>
          <Text style={styles.sendButtonText}>{loading ? 'Sending...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d142c',
  },
  image: {
    width: 300,
    height: 150,
    resizeMode: 'contain',
    marginTop: 50,
    borderRadius: 150 / 2,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  header: {
    backgroundColor: '#2d142c',
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFA500',
    fontSize: 24,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#2d142c',
    marginBottom: 40, // Increase margin for more space between messages and input
  },
  messageContainer: {
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#c72c41',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  gptMessage: {
    backgroundColor: '#ee4540',
    alignSelf: 'flex-end',
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    // Adjust the bottom radius for the button above the breakpoint
    borderBottomWidth: 3, // Make the border slightly visible
    borderBottomColor: '#2d142c', // Match background color for blending
  },
  messageText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#2d142c',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#801336',
    maxHeight: 100,
    color: '#FFA500',
  },
  sendButton: {
    backgroundColor: '#801336',
    borderRadius: 20,
    padding: 10,
  },
  sendButtonText: {
    color: '#FFA500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
  },
});
