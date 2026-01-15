import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import { getGroupMembers, editGroup, GroupMemberDto } from '../../api/community/friendGroup';

export default function Settings() {
  const { groupName, groupId, profilePictureUrl } = useLocalSearchParams<{ 
    groupName: string; 
    groupId: string;
    profilePictureUrl?: string;
  }>();
  const router = useRouter();
  
  const [members, setMembers] = useState<GroupMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [removedUserIds, setRemovedUserIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [currentProfilePicUrl, setCurrentProfilePicUrl] = useState<string | null>(
    profilePictureUrl || null
  );

  useEffect(() => {
    if (groupId) {
      fetchMembers();
    }
  }, [groupId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const membersList = await getGroupMembers(groupId);
      setMembers(membersList);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      Alert.alert('Error', 'Failed to load group members');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need access to your photos to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        if (result.assets[0].base64) {
          setSelectedImageBase64(result.assets[0].base64);
        }
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleToggleMemberRemoval = (userId: string) => {
    setRemovedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedImage(null);
    setSelectedImageBase64(null);
    setRemovedUserIds(new Set());
  };

  const handleSave = async () => {
    if (!groupId) {
      Alert.alert('Error', 'Group ID is missing');
      return;
    }

    setSaving(true);
    try {
      // Send base64 string directly if a new image was selected, otherwise send the current URL
      const profilePicToSend = selectedImageBase64 
        ? selectedImageBase64 
        : currentProfilePicUrl || null;

      await editGroup({
        groupId,
        profilePictureBase64: profilePicToSend,
        toRemoveUserIds: Array.from(removedUserIds),
      });

      // Refresh the page
      await fetchMembers();
      // If a new image was uploaded, the API should return the new URL
      // For now, we'll clear the selected image and let the next fetch update it
      if (selectedImageBase64) {
        // The backend should return the new profile picture URL in the response
        // For now, we'll just clear the selected image
        setCurrentProfilePicUrl(null); // Will be updated on next fetch
      }

      setIsEditing(false);
      setSelectedImage(null);
      setSelectedImageBase64(null);
      setRemovedUserIds(new Set());

      Alert.alert('Success', 'Group updated successfully!');
    } catch (error: any) {
      console.error('Error updating group:', error);
      Alert.alert('Error', 'Failed to update group. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const displayImage = selectedImage || currentProfilePicUrl;

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
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={24} color="#3b82f6" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={isEditing ? handlePickImage : undefined}
            disabled={!isEditing}
            activeOpacity={isEditing ? 0.7 : 1}
            style={styles.profilePictureContainer}
          >
            {displayImage ? (
              <ExpoImage
                source={{ uri: displayImage }}
                style={styles.profilePicture}
                contentFit="cover"
                cachePolicy="disk"
              />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Text style={styles.profilePictureText}>
                  {(groupName || 'G').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {isEditing && (
              <View style={styles.editPictureIconOverlay}>
                <Ionicons name="create-outline" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Members ({members.filter(m => !removedUserIds.has(m.userId)).length})</Text>
        <View style={styles.membersListContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          ) : members.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No members</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.membersScrollView}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {members
                .filter(m => !removedUserIds.has(m.userId))
                .map((member) => (
                  <TouchableOpacity
                    key={member.userId}
                    style={styles.memberItem}
                    activeOpacity={0.7}
                    onPress={() => isEditing && handleToggleMemberRemoval(member.userId)}
                    disabled={!isEditing}
                  >
                    {member.profilePictureUrl ? (
                      <Image
                        source={{ uri: member.profilePictureUrl }}
                        style={styles.memberProfilePicture}
                      />
                    ) : (
                      <View style={styles.memberProfilePicturePlaceholder}>
                        <Text style={styles.memberProfilePictureText}>
                          {member.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.memberName}>{member.name}</Text>
                    {isEditing && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleToggleMemberRemoval(member.userId)}
                      >
                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>
          )}
        </View>

        {isEditing && (
          <View style={styles.editButtonsContainer}>
            <TouchableOpacity
              style={[styles.editButtonAction, styles.cancelButton]}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButtonAction, styles.saveButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  editButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profilePictureContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePictureText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '600',
  },
  editPictureIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0d1117',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  membersListContainer: {
    maxHeight: 400,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  membersScrollView: {
    flexGrow: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.3)',
  },
  memberProfilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberProfilePicturePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberProfilePictureText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  memberName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  editButtonAction: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.4)',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

