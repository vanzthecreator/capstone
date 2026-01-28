import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, FlatList } from 'react-native';
import {
  Settings,
  ChevronLeft,
  Heart,
  Download,
  Globe,
  MapPin,
  Trash2,
  Clock,
  LogOut,
  ChevronRight,
  Camera,
  Activity,
  Video as VideoIcon,
  Image as ImageIcon
} from 'lucide-react-native';
import { AuthContext } from '../App';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Video, ResizeMode } from 'expo-av';

function Profile({ navigation }) {
  const { user } = useContext(AuthContext);
  const [view, setView] = useState('main'); // 'main' | 'likes'
  const [likedPosts, setLikedPosts] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  const renderMediaItem = (item) => {
     if (item.type === 'video') {
         return <Video source={{ uri: item.url }} style={styles.mediaFull} useNativeControls resizeMode={ResizeMode.COVER} />;
     }
     return <Image source={{ uri: item.url }} style={styles.mediaFull} resizeMode="cover" />;
  };

  const renderMediaGrid = (post) => {
    let mediaItems = [];
    if (post.media && Array.isArray(post.media)) {
        mediaItems = post.media;
    } else if (post.mediaUrl) {
        mediaItems = [{ url: post.mediaUrl, type: post.mediaType }];
    }
    
    if (mediaItems.length === 0) return null;

    const count = mediaItems.length;

    // 1 Item
    if (count === 1) {
        return (
            <View style={styles.grid1}>
                {mediaItems[0].type === 'video' ? (
                     <Video source={{ uri: mediaItems[0].url }} style={styles.mediaFull} useNativeControls resizeMode={ResizeMode.CONTAIN} isLooping />
                ) : (
                     <Image source={{ uri: mediaItems[0].url }} style={styles.mediaFull} resizeMode="cover" />
                )}
            </View>
        );
    }

    // 2 Items
    if (count === 2) {
        return (
            <View style={styles.grid2}>
                {mediaItems.map((item, index) => (
                    <View key={index} style={styles.grid2Item}>
                         {renderMediaItem(item)}
                    </View>
                ))}
            </View>
        );
    }

    // 3 Items
    if (count === 3) {
         return (
            <View style={styles.grid3}>
                <View style={styles.grid3Top}>
                     {renderMediaItem(mediaItems[0])}
                </View>
                <View style={styles.grid3Bottom}>
                     <View style={styles.grid3Item}>{renderMediaItem(mediaItems[1])}</View>
                     <View style={styles.grid3Item}>{renderMediaItem(mediaItems[2])}</View>
                </View>
            </View>
         );
    }

    // 4+ Items
    const displayItems = mediaItems.slice(0, 4);
    const remaining = mediaItems.length - 4;

    return (
        <View style={styles.grid4}>
            {displayItems.map((item, index) => (
                <View key={index} style={styles.grid4Item}>
                    {renderMediaItem(item)}
                    {index === 3 && remaining > 0 && (
                        <View style={styles.moreOverlay}>
                            <Text style={styles.moreText}>+{remaining}</Text>
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
  };

  const fetchLikedPosts = async () => {
    if (!user) return;
    setLoadingLikes(true);
    try {
      const q = query(
        collection(db, 'posts'),
        where('likes', 'array-contains', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLikedPosts(posts);
      setView('likes');
    } catch (error) {
      console.error("Error fetching liked posts:", error);
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const menuItems = [
    { icon: Heart, label: 'LIKES', action: fetchLikedPosts },
    { icon: Download, label: 'SAVED', action: () => console.log('Saved clicked') },
    { divider: true },
    { icon: Globe, label: 'Languages', action: () => console.log('Languages clicked') },
    { icon: MapPin, label: 'Location', action: () => navigation.navigate('Location') },
    { divider: true },
    { icon: Trash2, label: 'Clear Cache', action: () => console.log('Cache clicked') },
    { icon: Clock, label: 'Clear History', action: () => console.log('History clicked') },
    { icon: LogOut, label: 'Log Out', action: handleLogout },
  ];

  const renderLikedPosts = () => {
    if (loadingLikes) {
      return <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 20 }} />;
    }

    if (likedPosts.length === 0) {
      return <Text style={{ textAlign: 'center', marginTop: 20, color: '#64748b' }}>No liked posts yet.</Text>;
    }

    return (
      <View style={styles.postsContainer}>
        {likedPosts.map(post => (
          <View key={post.id} style={styles.postCard}>
             <View style={styles.postHeader}>
                <Image 
                  source={{ uri: post.userAvatar || `https://ui-avatars.com/api/?name=${post.userName}` }} 
                  style={styles.postAvatar}
                />
                <View>
                  <Text style={styles.postUserName}>{post.userName}</Text>
                  <Text style={styles.postDate}>{post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now'}</Text>
                </View>
             </View>
             {post.content ? <Text style={styles.postContent}>{post.content}</Text> : null}
             {/* Media Grid */}
             {(post.media || post.mediaUrl) && (
               <View style={styles.mediaContainer}>
                  {renderMediaGrid(post)}
               </View>
             )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => view === 'likes' ? setView('main') : navigation.goBack()}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{view === 'likes' ? 'LIKED POSTS' : 'MY PROFILE'}</Text>
          <TouchableOpacity>
            <Settings size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {view === 'main' ? (
        <>
          {/* Profile Info */}
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
                ) : (
                  <View style={styles.avatarPlaceholder} />
                )}
              </View>
              <View style={styles.cameraButton}>
                <Camera size={14} color="white" />
              </View>
            </TouchableOpacity>
            
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
            
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Menu List */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                {item.divider ? (
                  <View style={styles.divider} />
                ) : (
                  <TouchableOpacity 
                    onPress={item.action}
                    style={styles.menuItem}
                  >
                    <View style={styles.menuItemLeft}>
                      <item.icon size={22} color="#1e293b" strokeWidth={1.5} />
                      <Text style={styles.menuItemLabel}>
                        {item.label}
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </React.Fragment>
            ))}
          </View>
        </>
      ) : (
        renderLikedPosts()
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingTop: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1100,
  },
  headerTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#cbd5e1',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#64748b',
    borderRadius: 50,
    padding: 6,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  userEmail: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 32,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  menuContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  postsContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postUserName: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  postDate: {
    fontSize: 12,
    color: '#64748b',
  },
  postContent: {
    color: '#334155',
    marginBottom: 8,
  },
  mediaPreview: {
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  mediaContainer: {
    width: '100%',
    height: 300,
    backgroundColor: 'black',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  mediaFull: {
    width: '100%',
    height: '100%',
  },
  // Grid Styles
  grid1: {
    width: '100%',
    height: '100%',
  },
  grid2: {
    flexDirection: 'row',
    height: '100%',
  },
  grid2Item: {
    flex: 1,
    height: '100%',
    borderRightWidth: 1,
    borderColor: 'white',
  },
  grid3: {
    height: '100%',
  },
  grid3Top: {
    flex: 2, // 2/3 height,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: 'white',
  },
  grid3Bottom: {
    flex: 1, // 1/3 height,
    flexDirection: 'row',
  },
  grid3Item: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: 'white',
  },
  grid4: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: '100%',
  },
  grid4Item: {
    width: '50%',
    height: '50%',
    borderWidth: 0.5,
    borderColor: 'white',
  },
  moreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Profile;
