/**
 * Past You Screen
 * Main chat interface with Past You
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MemoryEngine } from '../modules/pastYou/services/MemoryEngine';
import { SemanticSearch } from '../modules/pastYou/services/SemanticSearch';
import { ResponseGenerator } from '../modules/pastYou/services/ResponseGenerator';
import { ConversationMessage } from '../modules/pastYou/types/pastYou.types';
import { TOPIC_PROMPTS } from '../modules/pastYou/constants/pastYou.constants';

const memoryEngine = new MemoryEngine();
const semanticSearch = new SemanticSearch();
const responseGenerator = new ResponseGenerator();

export function PastYouScreen({ navigation }: { navigation: any }) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeMemories();
    addWelcomeMessage();
  }, []);

  const initializeMemories = async () => {
    await memoryEngine.aggregateAllMemories();
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      role: 'past_you',
      content: `💭 Hey there! It's Past You.\n\nI've been through a lot with you. I remember the decisions, the struggles, the victories, the lessons.\n\nWhat do you want to talk about?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setShowPrompts(false);
    setLoading(true);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    const searchResults = await semanticSearch.search(messageText);
    const response = responseGenerator.generateResponse(messageText, searchResults);

    const pastYouMessage: ConversationMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'past_you',
      content: response,
      timestamp: new Date(),
      sourceMemories: searchResults.map((r) => r.memory),
    };

    setMessages((prev) => [...prev, pastYouMessage]);
    setLoading(false);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleTopicSelect = async (topicId: string) => {
    setShowPrompts(false);
    setLoading(true);

    const results = await semanticSearch.searchByTopic(topicId);
    const topic = TOPIC_PROMPTS.find((t) => t.id === topicId);

    if (results.length > 0) {
      const response = `I found ${results.length} memories about ${topic?.category.toLowerCase()}.\n\nHere's what stands out:\n\n${results.slice(0, 3).map((r, i) => `${i + 1}. ${r.memory.context}\n"${r.memory.content.substring(0, 100)}..."`).join('\n\n')}\n\nWhat specifically do you want to know?`;

      const pastYouMessage: ConversationMessage = {
        id: `msg_${Date.now()}`,
        role: 'past_you',
        content: response,
        timestamp: new Date(),
        sourceMemories: results.map((r) => r.memory),
      };

      setMessages((prev) => [...prev, pastYouMessage]);
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.title}>💭 Past You</Text>
        <Text style={styles.subtitle}>Wisdom from your own experience</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.pastYouBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.role === 'user' ? styles.userText : styles.pastYouText,
              ]}
            >
              {message.content}
            </Text>
            <Text style={styles.messageTime}>
              {message.timestamp.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={[styles.messageBubble, styles.pastYouBubble]}>
            <Text style={styles.pastYouText}>Searching memories...</Text>
          </View>
        )}

        {showPrompts && messages.length === 1 && (
          <View style={styles.promptsContainer}>
            <Text style={styles.promptsTitle}>What do you want to ask?</Text>
            {TOPIC_PROMPTS.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicCard}
                onPress={() => handleTopicSelect(topic.id)}
              >
                <Text style={styles.topicIcon}>{topic.icon}</Text>
                <View style={styles.topicContent}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicExample}>{topic.examples[0]}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask Past You anything..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212121' },
  subtitle: { fontSize: 14, color: '#757575', marginTop: 4 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#4CAF50' },
  pastYouBubble: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' },
  messageText: { fontSize: 15, lineHeight: 20 },
  userText: { color: '#FFFFFF' },
  pastYouText: { color: '#212121' },
  messageTime: { fontSize: 11, color: '#999', marginTop: 4 },
  promptsContainer: { marginTop: 16 },
  promptsTitle: { fontSize: 18, fontWeight: '600', color: '#212121', marginBottom: 16 },
  topicCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  topicIcon: { fontSize: 32, marginRight: 16 },
  topicContent: { flex: 1 },
  topicTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  topicExample: { fontSize: 14, color: '#757575' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  input: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, maxHeight: 100, fontSize: 15 },
  sendButton: { backgroundColor: '#4CAF50', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: '#CCCCCC' },
  sendButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});
