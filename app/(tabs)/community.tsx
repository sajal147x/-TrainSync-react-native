import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { getFriendsForUser, FriendsResponseDto } from "../api/community";

const Community: React.FC = () => {
  const [friends, setFriends] = useState<FriendsResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Community</Text>
        
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

        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>Friends</Text>
          <View style={styles.friendsListContainer}>
            {loading ? (
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
                  <View key={friend.userId} style={styles.friendCard}>
                    <BlurView intensity={60} tint="dark" style={styles.friendCardBlur}>
                      <View style={styles.friendCardContent}>
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
                    </BlurView>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonContainer: {
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
    maxHeight: 400,
    borderRadius: 16,
    overflow: "hidden",
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
  friendCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  friendCardBlur: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(22, 27, 34, 0.6)",
  },
  friendCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.4)",
  },
  profilePicturePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.4)",
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
});

export default Community;

