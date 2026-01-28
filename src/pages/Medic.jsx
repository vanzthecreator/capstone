import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, useWindowDimensions, Linking } from 'react-native';
import Header from '../components/Header';
import { Search, AlertTriangle } from 'lucide-react-native';

function Medic({ navigation }) {
  const { width } = useWindowDimensions();
  const columns = width >= 1200 ? 3 : width >= 700 ? 2 : 1;
  const cardWidth = columns === 1 ? '100%' : columns === 2 ? '47%' : '31%';
  const cardHeight = columns === 1 ? 200 : columns === 2 ? 180 : 160;
  const categories = [
    {
      id: 1,
      title: 'CONTROL BLEEDING',
      image: 'https://placehold.co/150x150/e9d5ff/7e22ce?text=Bleeding',
      color: '#e9d5ff',
      slug: 'control-bleeding'
    },
    {
      id: 2,
      title: 'CPR (Heart Beating Stop)',
      image: 'https://placehold.co/150x150/dcfce7/15803d?text=CPR',
      color: '#dcfce7',
      slug: 'cpr'
    },
    {
      id: 3,
      title: 'SEIZURES',
      image: 'https://placehold.co/150x150/bae6fd/0369a1?text=Seizures',
      color: '#bae6fd',
      slug: 'seizures'
    },
    {
      id: 4,
      title: 'INSECT BITE',
      image: 'https://placehold.co/150x150/fecdd3/be123c?text=Insect+Bite',
      color: '#fecdd3',
      slug: 'insect-bite'
    },
    {
      id: 5,
      title: 'DOG BITE',
      image: 'https://placehold.co/150x150/ffedd5/c2410c?text=Dog+Bite',
      color: '#ffedd5',
      slug: 'dog-bite'
    },
    {
      id: 6,
      title: 'CHOKING',
      image: 'https://placehold.co/150x150/fef9c3/a16207?text=Choking',
      color: '#fef9c3',
      slug: 'choking'
    },
    {
      id: 7,
      title: 'FEVER',
      image: 'https://placehold.co/150x150/ffedd5/c2410c?text=Fever',
      color: '#ffedd5',
      slug: 'fever'
    },
    {
      id: 8,
      title: 'COUGH',
      image: 'https://placehold.co/150x150/dcfce7/15803d?text=Cough',
      color: '#dcfce7',
      slug: 'cough'
    }
  ];
  const [query, setQuery] = useState('');

  const normalized = (s) => s.toLowerCase().trim();
  const q = normalized(query);
  const synonyms = {
    'control-bleeding': ['bleeding', 'blood', 'wound', 'hemorrhage', 'stop bleeding'],
    cpr: ['heart', 'cardiac', 'resuscitation', 'breathing', 'pulse'],
    seizures: ['epilepsy', 'convulsion', 'fits'],
    'insect-bite': ['insect', 'bite', 'sting', 'bee', 'mosquito'],
    'dog-bite': ['dog', 'animal bite', 'rabies'],
    choking: ['choke', 'airway', 'blocked', 'heimlich'],
    fever: ['temperature', 'hot', 'cold', 'flu', 'sick'],
    cough: ['cold', 'flu', 'sick', 'throat'],
  };
  const tokens = q.split(/\s+/).filter(Boolean);
  const filtered = q
    ? categories.filter((c) => {
        const base = `${normalized(c.title)} ${normalized(c.slug)} ${(synonyms[c.slug] || []).map(normalized).join(' ')}`;
        return tokens.every((t) => base.includes(t));
      })
    : categories;

  const onSearch = () => {
    if (!q) return;
    const first = filtered[0];
    if (first) {
      navigation.navigate('FirstAidDetail', { slug: first.slug });
    }
  };

  const handleGoogleSearch = () => {
    if (!query.trim()) return;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    Linking.openURL(searchUrl);
  };

  return (
    <ScrollView style={styles.container}>
      <Header theme="light" enableLocationNav />

      {/* Hero / Intro */}
      <View style={[styles.hero, styles.centerContent]}>
        <Text style={styles.title}>First Aid</Text>
        <Text style={styles.subtitle}>
          Use the following guides to help someone in case of an emergency!
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, styles.centerContent]}>
        <View style={styles.searchBar}>
          <TextInput 
            placeholder="Search a symptom / procedure..." 
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
            <Search size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Google Search Option */}
        {query.length > 0 && (
          <TouchableOpacity style={styles.googleSearchButton} onPress={handleGoogleSearch}>
            <Text style={styles.googleSearchText}>Search "{query}" on Google</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Grid */}
      <View style={[styles.grid, styles.centerContent]}>
        {filtered.length === 0 && (
          <Text style={{ color: 'white' }}>No results</Text>
        )}
        {filtered.map((cat) => (
          <TouchableOpacity 
            key={cat.id} 
            onPress={() => navigation.navigate('FirstAidDetail', { slug: cat.slug })}
            style={[styles.card, { backgroundColor: cat.color, width: cardWidth, height: cardHeight }]}
          >
            {/* Image */}
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: cat.image }} 
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.cardTitle}>
              {cat.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#93c5fd',
  },
  hero: {
    padding: 32,
    paddingTop: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    maxWidth: 300,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: 'white',
  },
  searchButton: {
    backgroundColor: '#ef4444',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleSearchButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    alignItems: 'center',
  },
  googleSearchText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  grid: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 100,
  },
  centerContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1100,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    height: 180,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    fontWeight: '800',
    fontSize: 14,
    color: '#1e293b',
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 17,
  },
});

export default Medic;
