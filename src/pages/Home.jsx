import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, Modal, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import Header from '../components/Header';
import { Video as VideoIcon, Image as ImageIcon, UserPlus, X, Camera, Send, Trash2, Heart } from 'lucide-react-native';
import { collection, query, getDocs, limit, where, addDoc, serverTimestamp, onSnapshot, orderBy, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { AuthContext } from '../App';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Video, ResizeMode } from 'expo-av';

const { width } = Dimensions.get('window');

function Home() {
  const { user: currentUser } = useContext(AuthContext);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  
  // Create Post State
  const [modalVisible, setModalVisible] = useState(false);
  const [postText, setPostText] = useState('');
  const [mediaList, setMediaList] = useState([]); // Array of { type: 'image' | 'video', uri: string }
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch Suggestions
    const fetchSuggestions = async () => {
      try {
        const friendsSnap = await getDocs(collection(db, `users/${currentUser.uid}/friends`));
        const friendIds = friendsSnap.docs.map(doc => doc.id);
        
        const requestsSnap = await getDocs(query(
          collection(db, 'friend_requests'), 
          where('senderId', '==', currentUser.uid)
        ));
        const requestedIds = requestsSnap.docs.map(doc => doc.data().receiverId);

        const excludeIds = [currentUser.uid, ...friendIds, ...requestedIds];

        const usersSnap = await getDocs(query(collection(db, 'users'), limit(20)));
        const suggestions = usersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => !excludeIds.includes(u.id))
          .slice(0, 10);

        setSuggestedUsers(suggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    fetchSuggestions();

    // Real-time Posts Listener
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(fetchedPosts);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddFriend = async (targetUser) => {
    try {
      await addDoc(collection(db, 'friend_requests'), {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'User',
        senderPhoto: currentUser.photoURL || null,
        receiverId: targetUser.id,
        receiverName: targetUser.displayName || 'User',
        receiverPhoto: targetUser.photoURL || null,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuggestedUsers(prev => prev.filter(u => u.id !== targetUser.id));
      Alert.alert('Success', 'Request sent!');
    } catch (error) {
      Alert.alert('Error', 'Could not send request.');
    }
  };

  const removeSuggestion = (id) => {
    setSuggestedUsers(prev => prev.filter(u => u.id !== id));
  };

  // Post Creation Logic
  const pickMedia = async (type) => {
    let result;
    if (type === 'camera') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: micStatus } = await ImagePicker.requestMicrophonePermissionsAsync();
      
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required.');
        return;
      }
      
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
        videoMaxDuration: 60,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required to upload photos or videos.');
        return;
      }

      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.8,
        videoMaxDuration: 60,
      });
    }

    if (!result.canceled) {
      const newMedia = result.assets.map(asset => ({
        type: asset.type,
        uri: asset.uri
      }));
      setMediaList(prev => [...prev, ...newMedia]);
    }
  };

  const handlePost = async () => {
    if (!postText.trim() && mediaList.length === 0) {
      Alert.alert('Empty Post', 'Please write something or add media.');
      return;
    }

    setUploading(true);

    // Safety timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out. Please try again.')), 30000)
    );

    try {
      const uploadTask = async () => {
        // 1. Process Media (Compress Images)
        const processedMedia = await Promise.all(mediaList.map(async (media) => {
          if (media.type === 'image') {
             try {
               // Try compression, fallback to original if fails or takes too long
               const compressionPromise = ImageManipulator.manipulateAsync(
                  media.uri,
                  [{ resize: { width: 1080 } }], 
                  { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
               );
               
               // 5-second timeout for compression per image
               const timeoutCompression = new Promise((_, reject) => setTimeout(() => reject(new Error('Compression timeout')), 5000));
               
               const manipResult = await Promise.race([compressionPromise, timeoutCompression]);
               return { ...media, uri: manipResult.uri };
             } catch (e) {
               console.log('Compression skipped/failed:', e);
               return media; // Use original if compression fails
             }
          }
          return media;
        }));

        // 2. Upload to Firebase Storage (Parallel)
        const uploadPromises = processedMedia.map(async (media) => {
          try {
            // Use XMLHttpRequest for reliable blob creation in React Native
            const blob = await new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.onload = function () {
                resolve(xhr.response);
              };
              xhr.onerror = function (e) {
                console.log('XHR Error:', e);
                reject(new TypeError("Network request failed"));
              };
              xhr.responseType = "blob";
              xhr.open("GET", media.uri, true);
              xhr.send(null);
            });

            const filename = `${currentUser.uid}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const storageRef = ref(storage, `posts/${filename}`);
            
            await uploadBytes(storageRef, blob);
            
            // Free up memory
            // blob.close() is not always available/necessary but good practice if supported, 
            // usually manual GC handles it, but we let it be.

            const downloadUrl = await getDownloadURL(storageRef);
            return {
              url: downloadUrl,
              type: media.type
            };
          } catch (e) {
             console.error('Upload failed for item:', media.uri, e);
             throw e;
          }
        });

        const uploadedMedia = await Promise.all(uploadPromises);

        await addDoc(collection(db, 'posts'), {
          userId: currentUser.uid,
          userName: currentUser.displayName || 'User',
          userAvatar: currentUser.photoURL || null,
          content: postText,
          media: uploadedMedia, // New array format
          // Keep old format for backward compatibility (using the first image)
          mediaUrl: uploadedMedia.length > 0 ? uploadedMedia[0].url : null,
          mediaType: uploadedMedia.length > 0 ? uploadedMedia[0].type : null,
          createdAt: serverTimestamp(),
          likes: [],
          comments: 0
        });
      };

      // Race against timeout
      await Promise.race([uploadTask(), timeoutPromise]);

      setModalVisible(false);
      setPostText('');
      setMediaList([]);
      Alert.alert('Posted!', 'Your report has been shared.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to upload post. ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              // Optimistic update
              setPosts(prev => prev.filter(p => p.id !== postId));
              await deleteDoc(doc(db, "posts", postId));
              Alert.alert("Deleted", "Report has been removed.");
            } catch (error) {
              console.error("Error deleting post:", error);
              Alert.alert("Error", "Could not delete report.");
            }
          }
        }
      ]
    );
  };

  const handleLike = async (post) => {
    if (!currentUser) return;
    const postRef = doc(db, 'posts', post.id);
    const isLiked = post.likes?.includes(currentUser.uid);

    // Optimistic Update
    setPosts(currentPosts => currentPosts.map(p => {
        if (p.id === post.id) {
            const newLikes = isLiked 
                ? p.likes.filter(id => id !== currentUser.uid)
                : [...(p.likes || []), currentUser.uid];
            return { ...p, likes: newLikes };
        }
        return p;
    }));

    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
      });
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = (now - date) / 1000; // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const renderHeader = () => (
    <>
      <Header theme="light" enableLocationNav />

      {/* Create Post Trigger */}
      <View style={styles.inputBarContainer}>
        <TouchableOpacity style={styles.inputBar} onPress={() => setModalVisible(true)}>
          <View style={styles.avatar}>
            <Image 
              source={{ uri: currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'User'}` }} 
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          </View>
          <View style={styles.inputPlaceholder}>
            <Text style={styles.placeholderText}>Write an accident report...</Text>
          </View>
          <View style={styles.iconGroup}>
            <VideoIcon size={20} color="#3b82f6" />
            <ImageIcon size={20} color="#3b82f6" />
          </View>
        </TouchableOpacity>
      </View>

      {/* People You May Know */}
      {suggestedUsers.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.sectionTitle}>People You May Know</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
            {suggestedUsers.map(user => (
              <View key={user.id} style={styles.suggestionCard}>
                <TouchableOpacity onPress={() => removeSuggestion(user.id)} style={styles.closeSuggestion}>
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
                <Image 
                  source={{ uri: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random` }} 
                  style={styles.suggestionAvatar} 
                />
                <Text style={styles.suggestionName} numberOfLines={1}>{user.displayName}</Text>
                <TouchableOpacity 
                  style={styles.addFriendButton}
                  onPress={() => handleAddFriend(user)}
                >
                  <UserPlus size={16} color="#0084ff" />
                  <Text style={styles.addFriendText}>Add</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );

  const renderPost = ({ item: post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image 
          source={{ uri: post.userAvatar || `https://ui-avatars.com/api/?name=${post.userName}` }} 
          style={styles.postAvatar}
        />
        <View>
          <Text style={styles.userName}>{post.userName}</Text>
          <Text style={styles.userRole}>{formatTime(post.createdAt)}</Text>
        </View>
        
        {currentUser && post.userId === currentUser.uid && (
          <TouchableOpacity 
            onPress={() => handleDeletePost(post.id)}
            style={{ marginLeft: 'auto', padding: 4 }}
          >
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {post.content ? (
        <Text style={styles.postContent}>{post.content}</Text>
      ) : null}

      {/* Media Grid */}
      {(post.media || post.mediaUrl) && (
         <View style={styles.mediaContainer}>
            {renderMediaGrid(post)}
         </View>
      )}
      
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleLike(post)}
        >
          <Heart 
            size={24} 
            color={post.likes?.includes(currentUser?.uid) ? "#ef4444" : "#64748b"} 
            fill={post.likes?.includes(currentUser?.uid) ? "#ef4444" : "transparent"} 
          />
          <Text style={[
            styles.actionText, 
            post.likes?.includes(currentUser?.uid) && { color: "#ef4444" }
          ]}>
            {post.likes?.length || 0}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 20 }}>No reports yet.</Text>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Create Post Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#0f172a" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create Report</Text>
              <TouchableOpacity 
                onPress={handlePost} 
                disabled={uploading}
                style={[styles.postButton, uploading && { opacity: 0.5 }]}
              >
                {uploading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.userInfo}>
                <Image 
                  source={{ uri: currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'User'}` }} 
                  style={styles.userAvatarSmall}
                />
                <Text style={styles.userNameSmall}>{currentUser?.displayName || 'User'}</Text>
              </View>

              <TextInput
                style={styles.textInput}
                placeholder="What's happening? (Accident Report)"
                multiline
                value={postText}
                onChangeText={setPostText}
                placeholderTextColor="#94a3b8"
              />

              {mediaList.length > 0 && (
                <ScrollView horizontal style={styles.previewList} contentContainerStyle={{gap: 10, paddingRight: 20}}>
                  {mediaList.map((item, index) => (
                      <View key={index} style={styles.previewItemContainer}>
                          {item.type === 'video' ? (
                              <Video source={{ uri: item.uri }} style={styles.previewItem} resizeMode={ResizeMode.COVER} />
                          ) : (
                              <Image source={{ uri: item.uri }} style={styles.previewItem} />
                          )}
                          <TouchableOpacity 
                              style={styles.removeMediaSmall}
                              onPress={() => setMediaList(prev => prev.filter((_, i) => i !== index))}
                          >
                            <X size={12} color="white" />
                          </TouchableOpacity>
                      </View>
                  ))}
                </ScrollView>
              )}
            </ScrollView>

            <View style={styles.toolbar}>
              <TouchableOpacity style={styles.toolbarButton} onPress={() => pickMedia('library')}>
                <ImageIcon size={24} color="#3b82f6" />
                <Text style={styles.toolbarText}>Photo/Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarButton} onPress={() => pickMedia('camera')}>
                <Camera size={24} color="#ef4444" />
                <Text style={styles.toolbarText}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  inputBarContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: {
    marginRight: 12,
  },
  inputPlaceholder: {
    flex: 1,
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 16,
  },
  iconGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    marginBottom: 8,
    marginHorizontal: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
    color: '#0f172a',
  },
  suggestionsScroll: {
    paddingLeft: 16,
  },
  suggestionCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  closeSuggestion: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },
  suggestionAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    backgroundColor: '#e2e8f0',
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  addFriendText: {
    color: '#0084ff',
    fontSize: 12,
    fontWeight: '600',
  },
  feedContainer: {
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: 'white',
    marginBottom: 8,
    paddingVertical: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e2e8f0',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  userRole: {
    fontSize: 12,
    color: '#64748b',
  },
  postContent: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  mediaContainer: {
    width: '100%',
    height: 300,
    backgroundColor: 'black',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 500, // Limit width on web/tablets
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginTop: 0, 
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  postButton: {
    backgroundColor: '#0084ff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userNameSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  textInput: {
    fontSize: 18,
    color: '#0f172a',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  previewList: {
    marginTop: 20,
    maxHeight: 150,
  },
  previewItemContainer: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f1f5f9',
  },
  previewItem: {
    width: '100%',
    height: '100%',
  },
  removeMediaSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 12,
  },
  toolbar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 20,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  toolbarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
});

export default Home;