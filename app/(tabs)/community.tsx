import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl } from "react-native";
import { Link, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { getFriendsForUser, FriendsResponseDto } from "../api/community/community";
import { getGroupsForUser, FriendGroupSummaryDto } from "../api/community/friendGroup";

const Community: React.FC = () => {
  const router = useRouter();
  const [friends, setFriends] = useState<FriendsResponseDto[]>([]);
  const [groups, setGroups] = useState<FriendGroupSummaryDto[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchGroups();
  }, []);

  const fetchFriends = async () => {
    try {
      setFriendsLoading(true);
      const friendsList = await getFriendsForUser();
      setFriends(friendsList);
    } catch (error: any) {
      console.error("Error fetching friends:", error);
    } finally {
      setFriendsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setGroupsLoading(true);
      const groupsList = await getGroupsForUser();
      setGroups(groupsList);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
    } finally {
      setGroupsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchFriends(), fetchGroups()]);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#3b82f6"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Community</Text>
        
        <View style={styles.buttonsRow}>
          <Link href="/community/addFriend" asChild>
            <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8}>
              <BlurView intensity={80} tint="dark" style={styles.blurView}>
                <LinearGradient
                  colors={["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.2)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientOverlay}
                >
                  <View style={styles.buttonInner}>
                    <Text style={styles.buttonText}>Add Friend</Text>
                  </View>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </Link>

          <Link href="/community/createGroup" asChild>
            <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8}>
              <BlurView intensity={80} tint="dark" style={styles.blurView}>
                <LinearGradient
                  colors={["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.2)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientOverlay}
                >
                  <View style={styles.buttonInner}>
                    <Text style={styles.buttonText}>Create Group</Text>
                  </View>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
          <View style={styles.friendsListContainer}>
            {friendsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            ) : friends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No friends yet</Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.friendsScrollView}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {friends.map((friend) => (
                  <Link
                    key={friend.userId}
                    href={{
                      pathname: "/community/FriendDetails",
                      params: {
                        userId: friend.userId,
                        name: friend.name,
                        profilePictureUrl: friend.profilePictureUrl || "",
                      },
                    }}
                    asChild
                  >
                    <TouchableOpacity style={styles.friendItem} activeOpacity={0.7}>
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
                    </TouchableOpacity>
                  </Link>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        <View style={styles.groupsSection}>
          <Text style={styles.sectionTitle}>Groups ({groups.length})</Text>
          <View style={styles.groupsListContainer}>
            {groupsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            ) : groups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No groups yet</Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.groupsScrollView}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {groups.map((group) => (
                  <TouchableOpacity
                    key={group.groupId}
                    style={styles.groupItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      router.push({
                        pathname: "/community/Group" as any,
                        params: {
                          groupId: group.groupId,
                          groupName: group.groupName,
                          profilePictureUrl: group.profilePictureUrl || "",
                        },
                      });
                    }}
                  >
                    {group.profilePictureUrl ? (
                      <Image
                        source={{ uri: group.profilePictureUrl }}
                        style={styles.profilePicture}
                      />
                    ) : (
                      <View style={styles.profilePicturePlaceholder}>
                        <Text style={styles.profilePictureText}>
                          {group.groupName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.groupName}>{group.groupName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  buttonContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  blurView: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientOverlay: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  buttonInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  friendsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  friendsListContainer: {
    maxHeight: 300,
    padding: 12,
  },
  friendsScrollView: {
    flexGrow: 0,
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
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(156, 163, 175, 0.3)",
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
  groupsSection: {
    marginTop: 32,
  },
  groupsListContainer: {
    maxHeight: 300,
    padding: 12,
  },
  groupsScrollView: {
    flexGrow: 0,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(156, 163, 175, 0.3)",
  },
  groupName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
});

export default Community;

