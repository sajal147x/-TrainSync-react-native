import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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
  const { groupName, groupId, profilePictureUrl } = useLocalSearchParams<{ 
    groupName: string;
    groupId: string;
    profilePictureUrl?: string;
  }>();
  const router = useRouter();
  const [messages, setMessages] = useState<GroupMessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (groupId) {
      fetchMessages();
    }
  }, [groupId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getGroupMessages(groupId);
      setMessages(data);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
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
    } catch (error: any) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          {profilePictureUrl ? (
            <Image
              source={{ uri: profilePictureUrl }}
              style={styles.headerProfilePicture}
              contentFit="cover"
              cachePolicy="disk"
            />
          ) : (
            <View style={styles.headerProfilePicturePlaceholder}>
              <Text style={styles.headerProfilePictureText}>
                {(groupName || 'G').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.headerTitle}>{groupName || 'Group'}</Text>
        </View>
        <View style={styles.placeholder} />
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
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerProfilePicture: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  headerProfilePicturePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProfilePictureText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
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
    paddingBottom: 60,
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

