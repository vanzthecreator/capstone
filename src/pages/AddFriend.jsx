import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, UserPlus, Check } from 'lucide-react-native';
import { collection, query, onSnapshot, where, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../App';

export default function AddFriend({ navigation }) {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    // 1. Fetch Sent Requests to know who we already requested
    const qRequests = query(
      collection(db, 'friend_requests'),
      where('senderId', '==', currentUser.uid)
    );
    
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
      setSentRequests(snapshot.docs.map(doc => doc.data().receiverId));
    });

    // 2. Fetch Existing Friends
    const qFriends = query(collection(db, `users/${currentUser.uid}/friends`));
    const unsubscribeFriends = onSnapshot(qFriends, (snapshot) => {
      setFriends(snapshot.docs.map(doc => doc.id));
    });

    // 3. Fetch All Users
    const qUsers = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const allUsers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== currentUser.uid); // Exclude self
      setUsers(allUsers);
      setLoading(false);
    });

    return () => {
      unsubscribeRequests();
      unsubscribeFriends();
      unsubscribeUsers();
    };
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
      Alert.alert('Success', 'Friend request sent!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not send request.');
    }
  };

  const renderItem = ({ item }) => {
    const isFriend = friends.includes(item.id);
    const isRequested = sentRequests.includes(item.id);

    // If already friend, maybe hide or show "Friend"
    // If requested, show "Requested"
    
    return (
      <View style={styles.userItem}>
        <Image 
          source={{ uri: item.photoURL || `https://ui-avatars.com/api/?name=${item.displayName}&background=random` }} 
          style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.displayName || 'Unknown'}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>

        {isFriend ? (
          <View style={styles.friendBadge}>
            <Text style={styles.friendText}>Friend</Text>
          </View>
        ) : isRequested ? (
          <View style={styles.requestedBadge}>
            <Text style={styles.requestedText}>Requested</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => handleAddFriend(item)}
          >
            <UserPlus size={20} color="white" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color="#0084ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find People</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0084ff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#e2e8f0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0084ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '600',
  },
  requestedBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  requestedText: {
    color: '#64748b',
    fontWeight: '600',
  },
  friendBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  friendText: {
    color: '#166534',
    fontWeight: '600',
  },
});