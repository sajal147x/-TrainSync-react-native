import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { searchUser, sendFriendRequest, getReceivedRequests, acceptFriendRequest, UserSearchResponseDto } from "../api/friendRequest";

const AddFriend: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<UserSearchResponseDto | "User Not Found" | null>(null);
  const [receivedRequests, setReceivedRequests] = useState<UserSearchResponseDto[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const handleGo = async () => {
    if (!userName.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    setLoading(true);
    setSearchResult(null);
    try {
      const result = await searchUser(userName.trim());
      setSearchResult(result);
    } catch (error: any) {
      console.error("Error searching for user:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to search for user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (searchResult === "User Not Found" || searchResult === null) {
      return;
    }

    setLoading(true);
    try {
      await sendFriendRequest(searchResult.userId);
      // Refresh by re-searching the user to get updated status
      const updatedResult = await searchUser(userName.trim());
      setSearchResult(updatedResult);
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send friend request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedRequests = async () => {
    setLoadingRequests(true);
    try {
      const requests = await getReceivedRequests();
      setReceivedRequests(requests);
    } catch (error: any) {
      console.error("Error fetching received requests:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch received requests. Please try again."
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchReceivedRequests();
  }, []);

  const handleAcceptRequest = async (request: UserSearchResponseDto) => {
    if (!request.requestId) {
      Alert.alert("Error", "Request ID is missing");
      return;
    }

    setLoadingRequests(true);
    try {
      await acceptFriendRequest(request.requestId);
      // Refresh the received requests list
      await fetchReceivedRequests();
      Alert.alert("Success", "Request Accepted");
    } catch (error: any) {
      console.error("Error accepting friend request:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to accept friend request. Please try again."
      );
    } finally {
      setLoadingRequests(false);
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
        <Text style={styles.headerTitle}>Add Friend</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Text style={styles.label}>Search by Username</Text>
          <BlurView intensity={60} tint="dark" style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter Username"
              placeholderTextColor="#6b7280"
              value={userName}
              onChangeText={setUserName}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          </BlurView>
        </View>

        <TouchableOpacity
          style={[styles.goButtonContainer, loading && styles.goButtonDisabled]}
          onPress={handleGo}
          activeOpacity={0.8}
          disabled={loading}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurView}>
            <LinearGradient
              colors={["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.2)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientOverlay}
            >
              <View style={styles.buttonInner}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Go</Text>
                )}
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>

        {searchResult === "User Not Found" && (
          <View style={styles.errorMessageContainer}>
            <Text style={styles.errorMessage}>User Not Found</Text>
          </View>
        )}

        {searchResult !== null && searchResult !== "User Not Found" && (
          <View style={styles.userCardContainer}>
            <BlurView intensity={60} tint="dark" style={styles.userCard}>
              <View style={styles.userCardContent}>
                {searchResult.profilePictureUrl && (
                  <Image
                    source={{ uri: searchResult.profilePictureUrl }}
                    style={styles.profilePicture}
                  />
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{searchResult.name}</Text>
                </View>
                {searchResult.requestStatus === "NONE" ? (
                  <TouchableOpacity
                    style={styles.sendRequestButton}
                    onPress={handleSendRequest}
                    activeOpacity={0.8}
                  >
                    <BlurView intensity={80} tint="dark" style={styles.sendRequestBlurView}>
                      <LinearGradient
                        colors={["rgba(59, 130, 246, 0.3)", "rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.3)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.sendRequestGradient}
                      >
                        <Text style={styles.sendRequestText}>Send Request</Text>
                      </LinearGradient>
                    </BlurView>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.statusButton}>
                    <BlurView intensity={80} tint="dark" style={styles.sendRequestBlurView}>
                      <LinearGradient
                        colors={["rgba(107, 114, 128, 0.3)", "rgba(107, 114, 128, 0.2)", "rgba(107, 114, 128, 0.3)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.sendRequestGradient}
                      >
                        <Text style={styles.statusText}>{searchResult.requestStatus}</Text>
                      </LinearGradient>
                    </BlurView>
                  </View>
                )}
              </View>
            </BlurView>
          </View>
        )}

        <View style={styles.receivedRequestsSection}>
          <Text style={styles.sectionHeader}>Received Requests</Text>
          
          {loadingRequests ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          ) : receivedRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No received requests</Text>
            </View>
          ) : (
            receivedRequests.map((request) => (
              <View key={request.userId} style={styles.userCardContainer}>
                <BlurView intensity={60} tint="dark" style={styles.userCard}>
                  <View style={styles.userCardContent}>
                    {request.profilePictureUrl && (
                      <Image
                        source={{ uri: request.profilePictureUrl }}
                        style={styles.profilePicture}
                      />
                    )}
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{request.name}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptRequest(request)}
                      activeOpacity={0.8}
                      disabled={loadingRequests}
                    >
                      <BlurView intensity={80} tint="dark" style={styles.sendRequestBlurView}>
                        <LinearGradient
                          colors={["rgba(34, 197, 94, 0.3)", "rgba(34, 197, 94, 0.2)", "rgba(34, 197, 94, 0.3)"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.sendRequestGradient}
                        >
                          <Text style={styles.acceptText}>Accept</Text>
                        </LinearGradient>
                      </BlurView>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
            ))
          )}
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
  searchContainer: {
    marginBottom: 32,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    overflow: "hidden",
    backgroundColor: "rgba(22, 27, 34, 0.6)",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 16,
  },
  goButtonContainer: {
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
  goButtonDisabled: {
    opacity: 0.6,
  },
  errorMessageContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  errorMessage: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "500",
  },
  userCardContainer: {
    marginTop: 24,
  },
  userCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    overflow: "hidden",
    backgroundColor: "rgba(22, 27, 34, 0.6)",
  },
  userCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.4)",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  sendRequestButton: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    minWidth: 120,
  },
  sendRequestBlurView: {
    borderRadius: 12,
    overflow: "hidden",
  },
  sendRequestGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  sendRequestText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statusButton: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(107, 114, 128, 0.4)",
    minWidth: 120,
    opacity: 0.7,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  receivedRequestsSection: {
    marginTop: 32,
    paddingBottom: 32,
  },
  sectionHeader: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
  },
  acceptButton: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.4)",
    minWidth: 120,
  },
  acceptText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default AddFriend;

