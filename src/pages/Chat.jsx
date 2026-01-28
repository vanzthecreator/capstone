import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ChevronLeft, Send, MoreVertical } from 'lucide-react-native';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, writeBatch, arrayUnion, or, and } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { AuthContext } from '../App';

export default function Chat({ route, navigation, contact: propContact }) {
  const { user } = useContext(AuthContext);
  const contact = propContact || route?.params?.contact || { displayName: 'Chat', id: null };
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  
  // If used as a component (propContact exists), we might not want the back button
  const isEmbedded = !!propContact;

  useEffect(() => {
    if (!user || !contact.id) return;

    // Create a query for messages between these two users
    // Note: Firestore doesn't support logical OR in a single query easily for this structure
    // We will query ALL messages involving the current user, then filter client-side for this conversation
    // Alternatively, a better structure is 'conversations/{convId}/messages'
    // For simplicity now, we'll query 'messages' collection
    
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter messages for this conversation
      const conversationMessages = allMessages.filter(m => 
        ((m.senderId === user.uid && m.receiverId === contact.id) ||
        (m.senderId === contact.id && m.receiverId === user.uid)) &&
        !m.deletedFor?.includes(user.uid) // Filter out messages deleted for me
      );

      setMessages(conversationMessages);

      // Mark unread messages from them as read
      const unreadMessages = conversationMessages.filter(m => m.senderId === contact.id && !m.isRead);
      if (unreadMessages.length > 0) {
        const batch = writeBatch(db);
        unreadMessages.forEach(m => {
          const msgRef = doc(db, 'messages', m.id);
          batch.update(msgRef, { isRead: true });
        });
        batch.commit().catch(err => console.error("Error marking messages as read:", err));
      }
    });

    return unsubscribe;
  }, [user, contact.id]);

  const send = async () => {
    if (!draft.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: draft.trim(),
        senderId: user.uid,
        receiverId: contact.id,
        createdAt: serverTimestamp(),
        isRead: false,
      });
      setDraft('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const deleteMessage = async (messageId, type) => {
    const msgRef = doc(db, 'messages', messageId);
    try {
      if (type === 'forEveryone') {
        await updateDoc(msgRef, {
          text: 'Message unsent',
          type: 'deleted'
        });
      } else {
        await updateDoc(msgRef, {
          deletedFor: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      Alert.alert("Error", "Could not delete message.");
    }
  };

  const handleLongPress = (message) => {
    if (message.type === 'deleted') return; // Cannot delete already unsent message

    const isMe = message.senderId === user.uid;
    
    if (isMe) {
      Alert.alert(
        "Delete Message",
        "Choose an option",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete for me", 
            onPress: () => deleteMessage(message.id, 'forMe') 
          },
          { 
            text: "Delete for everyone", 
            style: 'destructive',
            onPress: () => deleteMessage(message.id, 'forEveryone') 
          }
        ]
      );
    } else {
      Alert.alert(
        "Delete Message",
        "Delete this message for you?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: 'destructive',
            onPress: () => deleteMessage(message.id, 'forMe') 
          }
        ]
      );
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <View style={styles.header}>
        {!isEmbedded && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={28} color="#0084ff" />
          </TouchableOpacity>
        )}
        
        <View style={[styles.headerInfo, isEmbedded && { marginLeft: 16 }]}>
           <Image 
             source={{ uri: contact.photoURL || `https://ui-avatars.com/api/?name=${contact.displayName}&background=random` }} 
             style={styles.headerAvatar} 
           />
           <View>
             <Text style={styles.headerTitle}>{contact.displayName}</Text>
             <Text style={styles.headerStatus}>
                {contact.isOnline ? 'Active now' : 'Offline'}
             </Text>
           </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.thread}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((m) => {
          const isMe = m.senderId === user.uid;
          const isDeleted = m.type === 'deleted';
          
          return (
            <View
              key={m.id}
              style={[
                styles.bubbleWrapper,
                isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperThem,
              ]}
            >
              {!isMe && (
                <Image 
                  source={{ uri: contact.photoURL || `https://ui-avatars.com/api/?name=${contact.displayName}&background=random` }} 
                  style={styles.bubbleAvatar} 
                />
              )}
              
              {isMe && (
                <TouchableOpacity 
                  onPress={() => handleLongPress(m)}
                  style={styles.moreIcon}
                >
                  <MoreVertical size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onLongPress={() => handleLongPress(m)}
                activeOpacity={0.8}
                style={[
                  styles.bubble,
                  isMe ? styles.bubbleMe : styles.bubbleThem,
                  isDeleted && styles.bubbleDeleted
                ]}
              >
                <Text style={[
                  styles.bubbleText, 
                  isMe ? styles.bubbleTextMe : styles.bubbleTextThem,
                  isDeleted && styles.bubbleTextDeleted
                ]}>
                  {m.text}
                </Text>
              </TouchableOpacity>

              {!isMe && (
                <TouchableOpacity 
                  onPress={() => handleLongPress(m)}
                  style={styles.moreIcon}
                >
                  <MoreVertical size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Aa"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={send}
          style={styles.sendBtn}
          disabled={!draft.trim()}
        >
          <Send size={24} color={draft.trim() ? "#0084ff" : "#cbd5e1"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 60,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }
  },
  backBtn: {
    padding: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#e2e8f0',
  },
  headerTitle: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
  headerStatus: {
    color: '#64748b',
    fontSize: 12,
  },
  thread: {
    flex: 1,
    backgroundColor: 'white',
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  bubbleWrapperMe: {
    justifyContent: 'flex-end',
  },
  bubbleWrapperThem: {
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#e2e8f0',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleMe: {
    backgroundColor: '#0084ff', // Messenger Blue
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: '#f1f5f9', // Light Gray
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  bubbleTextMe: {
    color: 'white',
  },
  bubbleTextThem: {
    color: 'black',
  },
  moreIcon: {
    padding: 8,
    alignSelf: 'center',
    marginBottom: 10,
  },
  bubbleDeleted: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bubbleTextDeleted: {
    fontStyle: 'italic',
    color: '#94a3b8',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: 'black',
    marginRight: 10,
  },
  sendBtn: {
    padding: 8,
  },
});
