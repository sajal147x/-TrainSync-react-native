import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { getGroupLeaderboard, GroupLeaderboardDto } from '../../api/community/friendGroup';

export default function Leaderboard() {
  const { groupName, groupId } = useLocalSearchParams<{ groupName: string; groupId: string }>();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<GroupLeaderboardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (groupId) {
      fetchLeaderboard();
    }
  }, [groupId, selectedPeriod]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getGroupLeaderboard(groupId, selectedPeriod);
      setLeaderboard(data);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>{groupName || 'Group'}</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        <View style={styles.periodButtons}>
          <TouchableOpacity
            style={[styles.periodButton, styles.periodButtonFirst, selectedPeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, styles.periodButtonMiddle, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, styles.periodButtonLast, selectedPeriod === 'year' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('year')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'year' && styles.periodButtonTextActive]}>
              Yearly
            </Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No leaderboard data available</Text>
          </View>
        ) : (
          <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
            {leaderboard.map((member, index) => (
              <View key={member.userId} style={styles.leaderboardItem}>
                {member.profilePictureUrl ? (
                  <Image
                    source={{ uri: member.profilePictureUrl }}
                    style={styles.profilePicture}
                    contentFit="cover"
                    cachePolicy="disk"
                  />
                ) : (
                  <View style={styles.profilePicturePlaceholder}>
                    <Text style={styles.profilePictureText}>
                      {member.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.memberInfo}>
                  <Text style={styles.rankNumber}>{index + 1}. </Text>
                  <Text style={styles.memberName}>{member.name}</Text>
                </View>
                <Text style={styles.workoutsCount}>
                  {member.workoutsThisWeek}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    paddingBottom: 60,
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
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  periodButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonFirst: {
    marginRight: 8,
  },
  periodButtonMiddle: {
    marginRight: 8,
  },
  periodButtonLast: {
    marginRight: 0,
  },
  periodButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  periodButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  leaderboardList: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  rankNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    marginRight: 12,
  },
  profilePicturePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profilePictureText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutsCount: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
});

