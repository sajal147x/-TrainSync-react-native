import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Keyboard, Platform, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Client, IMessage } from '@stomp/stompjs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getGroupMessages, GroupMessageDto, sendGroupMessage } from '../../api/community/groupMessaging';
import { flagContent } from '../../api/objectionableContent';

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
  const router = useRouter();
  const [messages, setMessages] = useState<GroupMessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const stompClientRef = useRef<Client | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const textInputRef = useRef<TextInput | null>(null);
  const insets = useSafeAreaInsets();
  const [flagDialogVisible, setFlagDialogVisible] = useState(false);
  const [flagReportText, setFlagReportText] = useState('');
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [reportSubmittedDialogVisible, setReportSubmittedDialogVisible] = useState(false);

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

  // Handle keyboard show/hide
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 250);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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

  const openFlagDialog = () => {
    setFlagReportText('');
    setFlagDialogVisible(true);
  };

  const closeFlagDialog = () => {
    setFlagDialogVisible(false);
    setFlagReportText('');
    setFlagSubmitting(false);
  };

  const handleSubmitReport = async () => {
    if (!groupId) return;
    const trimmed = flagReportText.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Please explain the issue before submitting.');
      return;
    }
    try {
      setFlagSubmitting(true);
      await flagContent({ groupId, text: trimmed });
      closeFlagDialog();
      setReportSubmittedDialogVisible(true);
    } catch (error: any) {
      console.error('Error flagging content:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setFlagSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.flagHeader}>
        <TouchableOpacity style={styles.flagButton} onPress={openFlagDialog}>
          <Ionicons name="flag-outline" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.flagButtonText}>Flag content</Text>
        </TouchableOpacity>
      </View>
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
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 100 : 100 }
          ]}
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

      <View style={[
        styles.inputContainer,
        { 
          marginBottom: keyboardHeight > 0 ? keyboardHeight - (Platform.OS === 'android' ? insets.bottom : 0) : 0,
          paddingBottom: Platform.OS === 'android' ? 12 + insets.bottom : 12,
        }
      ]}>
        <TextInput
          ref={textInputRef}
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#6b7280"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={flagDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFlagDialog}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.flagModalOverlay}
          onPress={closeFlagDialog}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.flagModalContent}>
            <Text style={styles.flagModalTitle}>Flag content</Text>
            <Text style={styles.flagModalPrompt}>Please explain the issue:</Text>
            <Text style={styles.flagModalBlockHint}>You can block users from the Community tab via Friends and their profile.</Text>
            <TouchableOpacity
              onPress={() => {
                closeFlagDialog();
                router.dismissTo('/(tabs)/community');
              }}
              style={styles.flagModalBlockLink}
            >
              <Ionicons name="ban-outline" size={16} color="rgba(59, 130, 246, 0.9)" />
              <Text style={styles.flagModalBlockLinkText}>Block User(s)</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.flagModalInput}
              placeholder="Describe the objectionable content..."
              placeholderTextColor="#6b7280"
              value={flagReportText}
              onChangeText={setFlagReportText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!flagSubmitting}
            />
            <View style={styles.flagModalActions}>
              <TouchableOpacity style={styles.flagModalCancel} onPress={closeFlagDialog} disabled={flagSubmitting}>
                <Text style={styles.flagModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.flagModalSubmit, flagSubmitting && styles.flagModalSubmitDisabled]}
                onPress={handleSubmitReport}
                disabled={flagSubmitting}
              >
                {flagSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.flagModalSubmitText}>Submit report</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={reportSubmittedDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportSubmittedDialogVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.flagModalOverlay}
          onPress={() => setReportSubmittedDialogVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.reportSubmittedDialogContent}
          >
            <Text style={styles.flagModalTitle}>Report submitted</Text>
            <TouchableOpacity
              style={styles.reportSubmittedOkButton}
              onPress={() => setReportSubmittedDialogVisible(false)}
            >
              <Text style={styles.flagModalSubmitText}>OK</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
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
  flagHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  flagModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  flagModalContent: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  flagModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  flagModalPrompt: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 10,
  },
  flagModalBlockLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingVertical: 6,
  },
  flagModalBlockLinkText: {
    color: 'rgba(59, 130, 246, 0.9)',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  flagModalBlockHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  flagModalInput: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    minHeight: 100,
    marginBottom: 16,
  },
  flagModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  flagModalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  flagModalCancelText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
  },
  flagModalSubmit: {
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  flagModalSubmitDisabled: {
    opacity: 0.7,
  },
  flagModalSubmitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  reportSubmittedDialogContent: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
  },
  reportSubmittedOkButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
    minWidth: 80,
    alignItems: 'center',
  },
});

