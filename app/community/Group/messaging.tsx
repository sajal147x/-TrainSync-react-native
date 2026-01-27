import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Client, IMessage } from '@stomp/stompjs';
import { getGroupMessages, GroupMessageDto, sendGroupMessage } from '../../api/community/groupMessaging';

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  }
}

export default function Messaging() {
  const { groupId } = useLocalSearchParams<{ 
    groupId: string;
  }>();
  const [messages, setMessages] = useState<GroupMessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const stompClientRef = useRef<Client | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchMessages();
      connectWebSocket();
    }

    // Cleanup on unmount or when groupId changes
    return () => {
      disconnectWebSocket(); 
    };
  }, [groupId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages, loading]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getGroupMessages(groupId);
      setMessages(data);
      // Scroll to bottom after messages are loaded
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = async () => {
    // Disconnect any existing connection first
    disconnectWebSocket();

    try {
      // Get API_BASE URL from environment
      const API_BASE = process.env.EXPO_PUBLIC_API_URL;
      if (!API_BASE) {
        console.error('EXPO_PUBLIC_API_URL is not set');
        return;
      }

      if (!groupId) {
        console.error('groupId is not available for WebSocket connection');
        return;
      }

      // Convert HTTP URL to WebSocket URL
      // Note: Spring WebSocket with .withSockJS() might not accept native WebSocket directly
      // You may need to update backend to also support native WebSocket:
      // registry.addEndpoint("/api/ws").setAllowedOriginPatterns("*").withSockJS();
      // registry.addEndpoint("/api/ws").setAllowedOriginPatterns("*"); // for native WebSocket
      let wsUrl = API_BASE.replace(/^http/, 'ws').replace(/\/$/, '') + '/ws';

      console.log('Attempting WebSocket connection to:', wsUrl);

      // Create STOMP client with native WebSocket
      // React Native specific options needed for proper STOMP + WebSocket behavior
      const client = new Client({
        brokerURL: wsUrl,
        // No JWT authentication needed for WebSocket
        connectHeaders: {},
        // Use native WebSocket for React Native
        webSocketFactory: () => {
          const ws = new WebSocket(wsUrl);
          ws.onerror = (error) => {
            console.error('Raw WebSocket error:', error);
          };
          ws.onopen = () => {
            console.log('Raw WebSocket opened');
          };
          ws.onclose = (event) => {
            console.log('Raw WebSocket closed:', event.code, event.reason);
          };
          return ws;
        },
        // React Native specific options to ensure proper frame handling
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          // Uncomment for debugging: console.log('STOMP:', str);
        },
      });

      // Handle connection
      client.onConnect = () => {
        
        // Subscribe to group messages topic
        const topic = `/topic/groups/${groupId}`;
        const subscription = client.subscribe(topic, (message: IMessage) => {
          try {
            // When a message is received, refresh the messages
            console.log('New message received via WebSocket for group:', groupId);
            fetchMessages();
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
          }
        });

        // Store subscription reference for cleanup if needed
        if (!stompClientRef.current) {
          stompClientRef.current = client;
        }
      };

      // Handle errors
      client.onStompError = (frame) => {
        console.error('STOMP error:', frame.headers['message'], frame.body);
      };

      client.onWebSocketError = (event: any) => {
        
        // You may need to add this to your backend WebSocketConfig:
        // registry.addEndpoint("/api/ws").setAllowedOriginPatterns("*"); // for native WebSocket
      };

      client.onDisconnect = () => {
      };

      // Activate the client
      client.activate();
      stompClientRef.current = client;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      try {
        if (stompClientRef.current.connected) {
          stompClientRef.current.deactivate();
        }
        stompClientRef.current = null;
        console.log('WebSocket disconnected on cleanup');
      } catch (error) {
        console.error('Error disconnecting WebSocket:', error);
        stompClientRef.current = null;
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !groupId) {
      return;
    }

    try {
      await sendGroupMessage({
        groupId,
        message: messageText.trim(),
      });
      
      // Clear the input
      setMessageText('');
      
      // Refresh messages
      await fetchMessages();
      
      // Scroll to bottom after sending
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (error: any) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        ) : (
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (!loading && messages.length > 0) {
                scrollViewRef.current?.scrollToEnd({ animated: false });
              }
            }}
          >
            {messages.map((msg, index) => {
              const isSentByMe = msg.isSentByLoggedInUser === 'true' || msg.isSentByLoggedInUser === 'True';
              return (
                <View
                  key={index}
                  style={[
                    styles.messageWrapper,
                    isSentByMe ? styles.messageWrapperRight : styles.messageWrapperLeft,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isSentByMe ? styles.messageBubbleRight : styles.messageBubbleLeft,
                    ]}
                  >
                    <Text style={styles.messageText}>{msg.message}</Text>
                  </View>
                  <View style={styles.messageFooter}>
                    <Text style={styles.messageName}>{msg.userDto.name}</Text>
                    <Text style={styles.messageTime}>
                      {' • '}
                      {formatMessageTime(msg.sentAt)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#6b7280"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 80,
  },
  messageWrapper: {
    marginBottom: 12,
    maxWidth: '50%',
  },
  messageWrapperLeft: {
    alignSelf: 'flex-start',
  },
  messageWrapperRight: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  messageBubbleLeft: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderTopLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    borderTopRightRadius: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 18,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  messageName: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.2)',
    backgroundColor: '#0d1117',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

