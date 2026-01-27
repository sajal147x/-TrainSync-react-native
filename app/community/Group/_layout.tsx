import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Leaderboard from './leaderboard';
import Messaging from './messaging';
import Settings from './settings';

export default function GroupHomeLayout() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    groupName: string;
    groupId: string;
    profilePictureUrl?: string;
    initialTab?: string;
  }>();
  
  const { groupName, groupId, profilePictureUrl, initialTab } = params;
  const [activeTab, setActiveTab] = useState<'Leaderboard' | 'Messaging' | 'Settings'>(
    (initialTab === 'Messaging' ? 'Messaging' : initialTab === 'Settings' ? 'Settings' : 'Leaderboard') as 'Leaderboard' | 'Messaging' | 'Settings'
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
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

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('Leaderboard')}
            style={[
              styles.tab,
              activeTab === 'Leaderboard' && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Leaderboard' && styles.tabTextActive,
              ]}
            >
              Leaderboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('Messaging')}
            style={[
              styles.tab,
              activeTab === 'Messaging' && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Messaging' && styles.tabTextActive,
              ]}
            >
              Messaging
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('Settings')}
            style={[
              styles.tab,
              activeTab === 'Settings' && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Settings' && styles.tabTextActive,
              ]}
            >
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'Leaderboard' && (
            <Leaderboard />
          )}
          {activeTab === 'Messaging' && (
            <Messaging />
          )}
          {activeTab === 'Settings' && (
            <Settings />
          )}
        </View>
      </View>
    </SafeAreaView>
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
    paddingTop: 12,
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#161b22',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 0,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#1f6feb',
  },
  tabText: {
    color: '#8b949e',
    fontSize: 16,
    fontWeight: '400',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});

