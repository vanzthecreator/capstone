import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Modal, TextInput, Alert, ActivityIndicator, FlatList, useWindowDimensions } from 'react-native';
import Header from '../components/Header';
import Chat from './Chat';
import { Plus, X, Send, Image as ImageIcon, UserPlus, Users, Trash2 } from 'lucide-react-native';
import { collection, query, onSnapshot, where, orderBy, addDoc, serverTimestamp, doc, setDoc, deleteDoc, getDoc, or, and, documentId } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../config/firebase';
import { AuthContext } from '../App';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

function Message({ navigation }) {
  const { user: currentUser } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const isSplitView = width > 768;
  const [selectedContact, setSelectedContact] = useState(null);

  const [users, setUsers] = useState([]); // This will now hold FRIENDS
  const [friendIds, setFriendIds] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [stories, setStories] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [viewingStory, setViewingStory] = useState(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [newStoryText, setNewStoryText] = useState('');
  const [storyImage, setStoryImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Note Feature State
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [myNote, setMyNote] = useState(null);

  // 0. Fetch My Note
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
      if (doc.exists()) {
        setMyNote(doc.data().note);
      }
    });
    return unsub;
  }, [currentUser]);
  // Fetch Last Messages (Optimized)
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'messages'),
      or(
        where('senderId', '==', currentUser.uid),
        where('receiverId', '==', currentUser.uid)
      ),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.senderId === currentUser.uid || data.receiverId === currentUser.uid) {
          const otherId = data.senderId === currentUser.uid ? data.receiverId : data.senderId;
          // Since we ordered by desc, the first one we find is the latest
          if (!msgs[otherId]) {
            msgs[otherId] = {
              text: data.text,
              createdAt: data.createdAt,
              senderId: data.senderId,
              isRead: data.isRead
            };
          }
        }
      });
      setLastMessages(msgs);
    });

    return unsubscribe;
  }, [currentUser]);

  // 1. Fetch Friend IDs
  useEffect(() => {
    if (!currentUser) return;
    
    const qFriends = collection(db, `users/${currentUser.uid}/friends`);
    const unsubscribe = onSnapshot(qFriends, (snapshot) => {
      setFriendIds(snapshot.docs.map(doc => doc.id));
    });

    return unsubscribe;
  }, [currentUser]);

  // 1.5 Fetch Friend Details (Real-time, Optimized)
  useEffect(() => {
    if (friendIds.length === 0) {
      setUsers([]);
      return;
    }

    // Firestore 'in' limit is 30. Taking first 30 for safety/performance.
    const safeFriendIds = friendIds.slice(0, 30);
    
    const qUsers = query(
      collection(db, 'users'), 
      where(documentId(), 'in', safeFriendIds)
    );
    
    const unsubscribe = onSnapshot(qUsers, (snapshot) => {
       const friendsList = snapshot.docs.map(doc => {
         const data = doc.data();
         let note = data.note;
         
         // Check for note expiration
         if (note && data.noteUpdatedAt) {
           const now = new Date();
           const noteTime = data.noteUpdatedAt?.toDate ? data.noteUpdatedAt.toDate() : new Date(data.noteUpdatedAt);
           const diffInHours = (now - noteTime) / (1000 * 60 * 60);
           
           if (diffInHours >= 24) {
             note = null;
           }
         } else {
            note = null;
         }

         return { 
           id: doc.id, 
           ...data,
           note // Override note with checked value
         };
       });
       setUsers(friendsList);
    });
      
    return unsubscribe;
  }, [friendIds]);

  // 2. Fetch Incoming Friend Requests
  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(
      collection(db, 'friend_requests'),
      where('receiverId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFriendRequests(requests);
    });

    return unsubscribe;
  }, [currentUser]);

  // 3. Handle Accept Request
  const handleAccept = async (request) => {
    try {
      // Add to my friends
      await setDoc(doc(db, `users/${currentUser.uid}/friends/${request.senderId}`), {
        friendSince: serverTimestamp()
      });

      // Add me to their friends
      await setDoc(doc(db, `users/${request.senderId}/friends/${currentUser.uid}`), {
        friendSince: serverTimestamp()
      });

      // Delete request
      await deleteDoc(doc(db, 'friend_requests', request.id));
      
      Alert.alert("Connected", `You and ${request.senderName} are now friends!`);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not accept request.");
    }
  };

  // 4. Handle Decline Request
  const handleDecline = async (requestId) => {
    try {
      await deleteDoc(doc(db, 'friend_requests', requestId));
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch Stories (from friends only + self) - simplified for now to all stories
  useEffect(() => {
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
       const storiesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       // Filter: Show only stories from friends or self
       // We need the friends list for this.
       // For now, let's just show all stories (Discovery mode) or filter if we had friends state accessible here easily.
       setStories(storiesList);
    });
    return unsubscribe;
  }, []);

  // ... (Keep existing Image Picker and Add Story logic) ...


  // 5. Handle Post Note
  const handlePostNote = async () => {
    if (!noteText.trim()) return;
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        note: noteText,
        noteUpdatedAt: serverTimestamp()
      }, { merge: true });
      setNoteModalVisible(false);
      setNoteText('');
      Alert.alert("Success", "Note shared!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not share note.");
    }
  };

  // 6. Handle Add Story (Image/Video)
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setStoryImage(result.assets[0].uri);
    }
  };

  // Handle Add Story
  const handleAddStory = async () => {
    if (!newStoryText.trim() && !storyImage) {
      Alert.alert("Error", "Please add some text or an image.");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = null;

      if (storyImage) {
        // Compress story image with timeout and fallback
        let finalUri = storyImage;
        try {
          const compressionPromise = ImageManipulator.manipulateAsync(
             storyImage,
             [{ resize: { width: 1080 } }], // Resize for story
             { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Compression timeout')), 5000)
          );

          const manipResult = await Promise.race([compressionPromise, timeoutPromise]);
          finalUri = manipResult.uri;
        } catch (e) {
          console.log("Compression skipped:", e);
          // Fallback to original
        }

        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError("Network request failed"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", finalUri, true);
          xhr.send(null);
        });

        const filename = `stories/${currentUser.uid}/${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);
        
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'stories'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'User',
        content: newStoryText,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      setIsAddingStory(false);
      setNewStoryText('');
      setStoryImage(null);
      Alert.alert('Success', 'Story added!');
    } catch (error) {
      console.error("Error adding story: ", error);
      Alert.alert('Error', 'Could not add story. ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    Alert.alert(
      "Delete Story",
      "Are you sure you want to delete this story?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "stories", storyId));
              setViewingStory(null);
            } catch (error) {
              console.error("Error deleting story:", error);
              Alert.alert("Error", "Could not delete story.");
            }
          }
        }
      ]
    );
  };

  const getStoryForUser = (userId) => {
    return stories.find(s => s.userId === userId);
  };

  const renderChatItem = ({ item: user }) => {
    const userStory = getStoryForUser(user.id);
    const hasStory = !!userStory;
    return (
      <TouchableOpacity
        style={[
          styles.chatItem, 
          isSplitView && selectedContact?.id === user.id && styles.activeChatItem
        ]}
        onPress={() => {
          if (isSplitView) {
            setSelectedContact(user);
          } else {
            navigation.navigate('Chat', { contact: user });
          }
        }}
      >
        <View style={styles.chatImageContainer}>
          <Image 
            source={{ uri: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random` }} 
            style={[styles.chatImage, hasStory && styles.hasStoryBorder]}
          />
          {user.isOnline && <View style={styles.chatOnlineBadge} />}
        </View>
        
        <View style={{flex: 1}}>
          <Text style={styles.chatName}>
            {user.displayName || 'Unknown User'}
          </Text>
          <Text 
            style={[
              styles.chatStatus, 
              lastMessages[user.id]?.senderId !== currentUser.uid && !lastMessages[user.id]?.isRead && { fontWeight: 'bold', color: 'white' }
            ]} 
            numberOfLines={1}
          >
            {lastMessages[user.id]?.text 
              ? (
                  (lastMessages[user.id].senderId === currentUser.uid ? 'You: ' : '') + 
                  (lastMessages[user.id].text.length > 30 
                    ? lastMessages[user.id].text.substring(0, 30) + '...' 
                    : lastMessages[user.id].text)
                )
              : (user.isOnline ? 'Active now' : 'Offline')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput 
          placeholder="Search" 
          style={styles.searchInput}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Friend Requests Section */}
      {friendRequests.length > 0 && (
        <View style={styles.requestsContainer}>
          <Text style={styles.sectionTitle}>Friend Requests</Text>
          {friendRequests.map(req => (
            <View key={req.id} style={styles.requestItem}>
               <Image 
                 source={{ uri: req.senderPhoto || `https://ui-avatars.com/api/?name=${req.senderName}&background=random` }} 
                 style={styles.requestAvatar}
               />
               <View style={styles.requestInfo}>
                 <Text style={styles.requestName}>{req.senderName}</Text>
                 <View style={styles.requestActions}>
                   <TouchableOpacity 
                     style={styles.acceptButton}
                     onPress={() => handleAccept(req)}
                   >
                     <Text style={styles.acceptText}>Confirm</Text>
                   </TouchableOpacity>
                   <TouchableOpacity 
                     style={styles.declineButton}
                     onPress={() => handleDecline(req.id)}
                   >
                     <Text style={styles.declineText}>Delete</Text>
                   </TouchableOpacity>
                 </View>
               </View>
            </View>
          ))}
        </View>
      )}

      {/* Stories Section */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.storiesContainer}
        contentContainerStyle={styles.storiesContent}
      >
        {/* Current User Note / Add Story */}
        <View style={styles.storyItem}>
          <TouchableOpacity 
            style={styles.noteBubble} 
            onPress={() => setNoteModalVisible(true)}
          >
            <Text style={styles.noteText} numberOfLines={2}>
              {myNote || "Drop a thought"}
            </Text>
            <View style={styles.bubbleTail} />
            <View style={styles.bubbleTailSmall} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.currentUserAvatarContainer}
            onPress={() => setIsAddingStory(true)}
          >
             <Image 
                source={{ uri: currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'User'}` }} 
                style={styles.currentUserAvatar}
              />
              <TouchableOpacity 
                style={styles.addStoryBadge}
                onPress={() => setNoteModalVisible(true)}
              >
                <Plus size={14} color="white" strokeWidth={3} />
              </TouchableOpacity>
          </TouchableOpacity>
          <Text style={styles.storyLabel}>Your Note</Text>
        </View>

        {/* User Bubbles */}
        {users.map((u) => {
          const userStory = getStoryForUser(u.id);
          const hasStory = !!userStory;
          const hasNote = u.note && u.note.trim().length > 0;
          
          return (
            <TouchableOpacity 
              key={u.id} 
              style={styles.storyItem}
              onPress={() => hasStory ? setViewingStory(userStory) : null}
            >
              {hasNote && (
                <View style={styles.noteBubble}>
                  <Text style={styles.noteText} numberOfLines={2}>{u.note}</Text>
                  <View style={styles.bubbleTail} />
                  <View style={styles.bubbleTailSmall} />
                </View>
              )}

              <View style={[styles.storyImageContainer, hasStory && styles.hasStoryBorder]}>
                <Image 
                  source={{ uri: u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}&background=random` }} 
                  style={styles.storyImage}
                />
                {u.isOnline && <View style={styles.onlineBadge} />}
              </View>
              <Text style={styles.storyName} numberOfLines={1}>{u.displayName?.split(' ')[0]}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <View style={{flex: 1, maxWidth: isSplitView ? 380 : undefined, borderRightWidth: isSplitView ? 1 : 0, borderRightColor: '#e2e8f0'}}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity 
          style={styles.addFriendButton}
          onPress={() => navigation.navigate('AddFriend')}
        >
          <UserPlus size={24} color="#0084ff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderChatItem}
        ListHeaderComponent={renderHeader}
        // style={styles.content} // Removing potentially undefined style
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Add Note Modal */}
      <Modal visible={noteModalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={() => setNoteModalVisible(false)} 
          />
          <View style={styles.noteModalContent}>
            <Text style={styles.modalTitle}>New Note</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Share a thought..."
              value={noteText}
              onChangeText={setNoteText}
              maxLength={60}
              autoFocus
            />
            <Text style={{textAlign: 'right', color: '#94a3b8', fontSize: 12, marginBottom: 12}}>
              {noteText.length}/60
            </Text>
            
            <View style={styles.noteButtonRow}>
              <TouchableOpacity 
                style={[styles.noteButton, styles.keepItButton]} 
                onPress={() => setNoteModalVisible(false)}
              >
                <Text style={styles.keepItText}>Keep it</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.noteButton, styles.shareButton]} 
                onPress={handlePostNote}
              >
                <Text style={styles.shareButtonText}>Share thought</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Story Modal */}
      <Modal visible={isAddingStory} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Story</Text>
              <TouchableOpacity onPress={() => setIsAddingStory(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.storyInput}
              placeholder="What's happening?"
              value={newStoryText}
              onChangeText={setNewStoryText}
              multiline
            />

            <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
              <ImageIcon color="#3b82f6" size={24} />
              <Text style={styles.imagePickerText}>
                {storyImage ? 'Change Image' : 'Add Image'}
              </Text>
            </TouchableOpacity>

            {storyImage && (
              <Image source={{ uri: storyImage }} style={styles.previewImage} />
            )}

            <TouchableOpacity style={styles.postButton} onPress={handleAddStory} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.postButtonText}>Post Story</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* View Story Modal */}
      <Modal visible={!!viewingStory} animationType="fade" transparent>
        <View style={styles.fullScreenModal}>
          <TouchableOpacity style={styles.closeStoryButton} onPress={() => setViewingStory(null)}>
            <X size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.storyContent}>
        {viewingStory?.imageUrl && (
          <Image 
            source={{ uri: viewingStory.imageUrl }} 
            style={styles.storyFullImage} 
            resizeMode="contain" 
          />
        )}
        {viewingStory?.content ? (
          <Text style={styles.storyText}>{viewingStory.content}</Text>
        ) : null}
        <Text style={styles.storyAuthor}>Posted by {viewingStory?.userName}</Text>
        
        {currentUser && viewingStory?.userId === currentUser.uid && (
          <TouchableOpacity 
            style={styles.deleteStoryButton} 
            onPress={() => handleDeleteStory(viewingStory.id)}
          >
            <Trash2 size={24} color="#ef4444" />
            <Text style={{color: '#ef4444', fontWeight: 'bold', marginLeft: 8}}>Delete Story</Text>
          </TouchableOpacity>
        )}
      </View>
        </View>
      </Modal>
        </View>

        {isSplitView && (
          <View style={{flex: 2, backgroundColor: '#fff'}}>
            {selectedContact ? (
              <Chat contact={selectedContact} />
            ) : (
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc'}}>
                 <View style={{backgroundColor: '#e2e8f0', padding: 20, borderRadius: 50, marginBottom: 16}}>
                    <Users size={48} color="#94a3b8" />
                 </View>
                <Text style={{color: '#64748b', fontSize: 18, fontWeight: '500'}}>Select a chat to start messaging</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  addFriendButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 12,
    color: 'white',
  },
  requestsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0f172a',
  },
  requestItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  requestAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#0084ff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  acceptText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  declineButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  declineText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 14,
  },
  storiesContainer: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  storiesContent: {
    gap: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1100,
  },
  storyItem: {
    alignItems: 'center',
    gap: 8,
  },
  storyLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  storyImageContainer: {
    position: 'relative',
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'black',
  },
  storyName: {
    color: 'white',
    fontSize: 12,
    maxWidth: 60,
  },
  hasStoryBorder: {
    borderColor: '#FF3B30',
    borderWidth: 3,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#22c55e',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'black',
  },
  chatStatus: {
    color: '#94a3b8',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  storyInput: {
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 20,
  },
  postButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeStoryButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  storyContent: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  storyFullImage: {
    width: '100%',
    height: '70%',
    marginBottom: 20,
    borderRadius: 10,
  },
  storyText: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  storyAuthor: {
    color: '#94a3b8',
    fontSize: 14,
    position: 'absolute',
    bottom: 80,
  },
  deleteStoryButton: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 20,
  },
  imagePickerText: {
    marginLeft: 8,
    color: '#3b82f6',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 8,
  },
  emptyAction: {
    fontSize: 16,
    color: '#0084ff',
    fontWeight: '600',
  },
  chatList: {
    paddingHorizontal: 16,
    gap: 24,
    paddingBottom: 100,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1100,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  activeChatItem: {
    backgroundColor: '#334155', // Darker highlight for dark mode
    borderLeftWidth: 4,
    borderLeftColor: '#0084ff',
  },
  chatImageContainer: {
    position: 'relative',
  },
  chatImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatOnlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: '#22c55e',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'black',
  },
  chatName: {
    fontWeight: '600',
    fontSize: 14,
    color: 'white',
    textTransform: 'uppercase',
  },
  storyInput: {
    height: 100,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  imagePickerText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  postButton: {
    backgroundColor: '#0084ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // New Styles for Notes
  noteBubble: {
    backgroundColor: '#333',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    maxWidth: 80,
    alignItems: 'center',
    position: 'relative',
    minWidth: 40,
  },
  noteText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -3,
    left: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
  },
  bubbleTailSmall: {
    position: 'absolute',
    bottom: -6,
    left: 6,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#333',
  },
  currentUserAvatarContainer: {
    position: 'relative',
    width: 60,
    height: 60,
  },
  currentUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white', // Ensure it stands out
  },
  addStoryBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    backgroundColor: '#0f172a',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  noteModalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  noteInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  noteButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  noteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepItButton: {
    backgroundColor: '#f1f5f9',
  },
  keepItText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 16,
  },
  shareButton: {
    backgroundColor: '#0084ff',
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Message;
