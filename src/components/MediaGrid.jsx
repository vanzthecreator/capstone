import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const MediaGrid = ({ post }) => {
  const renderMediaItem = (item) => {
     if (item.type === 'video') {
         return <Video source={{ uri: item.url }} style={styles.mediaFull} useNativeControls resizeMode={ResizeMode.COVER} />;
     }
     return <Image source={{ uri: item.url }} style={styles.mediaFull} resizeMode="cover" />;
  };

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
  return (
      <View style={styles.grid4}>
           {mediaItems.slice(0, 4).map((item, index) => (
               <View key={index} style={styles.grid4Item}>
                    {renderMediaItem(item)}
                    {index === 3 && count > 4 && (
                        <View style={styles.moreOverlay}>
                            <Text style={styles.moreText}>+{count - 4}</Text>
                        </View>
                    )}
               </View>
           ))}
      </View>
  );
};

const styles = StyleSheet.create({
  mediaFull: {
    width: '100%',
    height: '100%',
  },
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
    flex: 2, 
    width: '100%',
    borderBottomWidth: 1,
    borderColor: 'white',
  },
  grid3Bottom: {
    flex: 1,
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

export default MediaGrid;
