import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getFriendsForUser, FriendsResponseDto } from "../api/community";
import { createGroup } from "../api/friendGroup";

const CreateGroup: React.FC = () => {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [friends, setFriends] = useState<FriendsResponseDto[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const friendsList = await getFriendsForUser();
      setFriends(friendsList);
    } catch (error: any) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (userId: string) => {
    setSelectedFriends((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleCreateGroup = async () => {
    // Validate inputs
    if (!groupName.trim()) {
      console.error("Group name is required");
      return;
    }

    const friendIds = Array.from(selectedFriends);
    if (friendIds.length === 0) {
      console.error("At least one friend must be selected");
      return;
    }

    try {
      setCreating(true);
      const groupId = await createGroup({
        groupName: groupName.trim(),
        memberIds: friendIds,
      });
      console.log("Group created successfully with ID:", groupId);
      // Navigate back on success
      router.back();
    } catch (error: any) {
      console.error("Error creating group:", error);
    } finally {
      setCreating(false);
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
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Group Name</Text>
          <BlurView intensity={60} tint="dark" style={styles.inputBarContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Group Name"
              placeholderTextColor="#6b7280"
              value={groupName}
              onChangeText={setGroupName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </BlurView>
        </View>

        {/* Friends List */}
        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>Select Friends</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          ) : friends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No friends available</Text>
            </View>
          ) : (
            <View style={styles.friendsListContainer}>
              {friends.map((friend) => {
                const isSelected = selectedFriends.has(friend.userId);
                return (
                  <TouchableOpacity
                    key={friend.userId}
                    style={styles.friendItem}
                    onPress={() => toggleFriendSelection(friend.userId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.friendInfo}>
                      {friend.profilePictureUrl ? (
                        <Image
                          source={{ uri: friend.profilePictureUrl }}
                          style={styles.profilePicture}
                        />
                      ) : (
                        <View style={styles.profilePicturePlaceholder}>
                          <Text style={styles.profilePictureText}>
                            {friend.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.friendName}>{friend.name}</Text>
                    </View>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Create Group Button */}
        <TouchableOpacity
          style={[styles.createButtonContainer, creating && styles.createButtonDisabled]}
          onPress={handleCreateGroup}
          activeOpacity={0.8}
          disabled={creating}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurView}>
            <LinearGradient
              colors={["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.2)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientOverlay}
            >
              <View style={styles.buttonInner}>
                {creating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Create Group</Text>
                )}
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(59, 130, 246, 0.2)",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  inputBarContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    overflow: "hidden",
    backgroundColor: "rgba(22, 27, 34, 0.6)",
  },
  input: {
    color: "#fff",
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  friendsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
  },
  friendsListContainer: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    borderRadius: 12,
    padding: 12,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(156, 163, 175, 0.3)",
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePicturePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  profilePictureText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  friendName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxSelected: {
    backgroundColor: "rgba(59, 130, 246, 0.8)",
    borderColor: "rgba(59, 130, 246, 1)",
  },
  createButtonContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 32,
  },
  blurView: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientOverlay: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buttonInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
});

export default CreateGroup;

