import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

function FirstAidDetail({ route, navigation }) {
  const { slug } = route.params || {};

  const details = {
    'control-bleeding': {
      title: 'CONTROL BLEEDING',
      image: 'https://news.wbhm.org/media/2018/05/StopTheBleedVert_4561-e1526958372527.jpg?_gl=1*1tqcxol*_ga*MTI1ODkxOTgwOS4xNzY5NTgzMTEy*_ga_1PKECLRF5E*czE3Njk1ODMxMTIkbzEkZzAkdDE3Njk1ODMxMTIkajYwJGwwJGgw&_ga=2.77269904.466953134.1769583113-1258919809.1769583112',
      steps: [
        'Apply direct pressure on the wound with a clean cloth or bandage.',
        'Elevate the injured area above the heart if possible.',
        'Do not remove the cloth if it soaks through; add more layers.',
        'Apply a tourniquet only if bleeding is severe and not stopping with pressure.',
        'Seek medical attention immediately.'
      ]
    },
    'cpr': {
      title: 'CPR (Heart Beating Stop)',
      image: 'https://www.shutterstock.com/image-vector/emergency-first-aid-cpr-step-by-1185304927?trackingId=973331fe-4f20-4d57-9df9-90a37eaf36f4&listId=searchResults',
      steps: [
        'Check for responsiveness and breathing.',
        'Call emergency services immediately.',
        'Place hands on the center of the chest.',
        'Push hard and fast (100-120 compressions per minute).',
        'Allow chest to recoil completely between compressions.',
        'Continue until help arrives or the person starts breathing.'
      ]
    },
    'seizures': {
      title: 'SEIZURES',
      image: 'https://placehold.co/320x520/bae6fd/0369a1?text=Seizures',
      steps: [
        'Ease the person to the floor.',
        'Turn the person gently onto one side (recovery position).',
        'Clear the area of hard or sharp objects.',
        'Place something soft and flat under their head.',
        'Remove eyeglasses and loosen ties or anything around the neck.',
        'Time the seizure. Call emergency if it lasts longer than 5 minutes.'
      ]
    },
    'dog-bite': {
      title: 'DOG BITE',
      image: 'https://placehold.co/320x520/ffedd5/c2410c?text=Dog+Bite',
      steps: [
        'Wash the wound thoroughly with soap and warm water.',
        'Apply an antibiotic cream to prevent infection.',
        'Cover with a sterile bandage.',
        'Seek medical attention to assess risk of infection or rabies.',
        'Report the bite to local animal control if necessary.'
      ]
    },
    'insect-bite': {
      title: 'INSECT BITE',
      image: 'https://placehold.co/320x520/fecdd3/be123c?text=Insect+Bite',
      steps: [
        'Remove the stinger if present (scrape it out, do not pinch).',
        'Wash the area with soap and water.',
        'Apply a cold pack to reduce swelling.',
        'Apply hydrocortisone cream or take an antihistamine for itching.',
        'Watch for signs of allergic reaction (trouble breathing, swelling).'
      ]
    },
    'choking': {
      title: 'CHOKING',
      image: 'https://placehold.co/320x520/fef9c3/a16207?text=Choking',
      steps: [
        'Encourage the person to cough forcefully.',
        'If they cannot cough/breathe: Give 5 back blows between shoulder blades.',
        'Give 5 abdominal thrusts (Heimlich maneuver).',
        'Alternate between 5 blows and 5 thrusts until object is dislodged.',
        'If the person becomes unconscious, start CPR.'
      ]
    },
    'fever': {
      title: 'FEVER MANAGEMENT',
      image: 'https://placehold.co/320x200/ffedd5/c2410c?text=Fever+Care',
      steps: [
        'Rest and drink plenty of fluids.',
        'Take acetaminophen or ibuprofen to lower temperature if uncomfortable.',
        'Dress in light clothing.',
        'Keep the room comfortable, not too hot or cold.',
        'Seek medical help if fever is above 39°C (102°F) or lasts more than 3 days.'
      ]
    },
    'cough': {
      title: 'COUGH RELIEF',
      image: 'https://placehold.co/320x200/dcfce7/15803d?text=Cough+Relief',
      steps: [
        'Stay hydrated with water, tea, or broth.',
        'Use honey (for adults and children over 1 year) to soothe throat.',
        'Use a humidifier or take a steamy shower.',
        'Rest and elevate your head while sleeping.',
        'Consult a doctor if you have difficulty breathing or cough up blood.'
      ]
    }
  };

  const info = details[slug] || {
    title: 'FIRST AID',
    image: 'https://placehold.co/320x520/f3f4f6/374151?text=First+Aid'
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{info.title}</Text>
        </View>

        <View style={styles.imageCard}>
          <Image
            source={{ uri: info.image }}
            style={styles.image}
            resizeMode="contain"
          />
          {info.steps && (
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsTitle}>What to do:</Text>
              {info.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <Text style={styles.stepNumber}>{index + 1}.</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fb7185',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    maxWidth: 460,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#1f2937',
    fontSize: 16,
  },
  imageCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 520,
    borderRadius: 12,
  },
  stepsContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 8,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  stepNumber: {
    fontWeight: 'bold',
    color: '#dc2626',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default FirstAidDetail;
