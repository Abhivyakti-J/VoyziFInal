import { View, TextInput, ScrollView, Image, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from './AppText';
import { BlurView } from 'expo-blur';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

const HomeScreen = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const navigation = useNavigation();

  const categoryData = [
    { name: 'Music Shows', image: require('./assets/images/music_shows.jpg') },
    { name: 'Comedy', image: require('./assets/images/samay-raina.jpg') },
    { name: 'Gatherings', image: require('./assets/images/gatherings.jpeg') },
    { name: 'Arts', image: require('./assets/images/lifestyle-working-arts-crafts.jpg') },
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Permission denied');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      let coords = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (coords.length > 0) {
        setLocation(`${coords[0].city}`);
      } else {
        setLocation('Location not found');
      }
      setLoading(false);
    })();

    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <ImageBackground
      source={require('./assets/images/050 Snow Again.png')} 
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 130 ,paddingTop: 15, scrollEnabled: true}} showsVerticalScrollIndicator={false}>
          {/* Location */}
          <View style={styles.locationRow}>
            <View>
              <AppText style={{ fontSize: 15, color: 'black' }}>Location</AppText>
              {loading ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <AppText weight="bold" style={{ fontSize: 22 }}>{location}</AppText>
              )}
            </View>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="black" style={{ marginRight: 10 }} />
            <TextInput placeholder="Search Events" style={{ size: 18, flex: 1, fontFamily: 'Poppins_400Regular',color: "black" }} />
            <MaterialIcons name="tune" size={20} color="black" />
          </View>

          {/* Categories */}
          <View style={{ marginBottom: 20 }}>
            <AppText weight="bold" style={{ fontSize: 30, marginBottom: 15, marginTop: 15 }}>Popular Categories</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {categoryData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryBox}
                  onPress={() => navigation.navigate('CategoryEvents', { category: item.name })}
                >
                  <ImageBackground
                    source={item.image}
                    style={styles.categoryImage}
                    imageStyle={{ borderRadius: 15 }}
                  >
                    <View style={styles.categoryOverlay} />
                    <AppText weight="bold" style={styles.categoryText}>
                      {item.name}
                    </AppText>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Upcoming Events */}
          <AppText weight="bold" style={{ fontSize: 28, marginTop: 10, marginBottom: 18 }}>
            Upcoming Events
          </AppText>

          {/* Fetched Events from Firestore */}
          {events.map((event) => (
            <TouchableOpacity
              key={event.id}
              onPress={() => navigation.navigate('EventDetails', { event })}
              style={styles.eventCardWrapper}
            >
              <BlurView intensity={0} tint="light" style={styles.blurContainer}>
                <AppText weight="bold" style={{ fontSize: 18 }}>{event.name}</AppText>
                <AppText>{event.location || 'No location provided'}</AppText>
              </BlurView>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <Ionicons name="home" size={24} color="#ff7f50" />
          <Ionicons name="heart-outline" size={24} color="#888" />
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-outline" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 70,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(63, 54, 64, 0.32)',
    borderRadius: 10,
    padding: 10,
    marginVertical: 17,
    paddingTop: 15,
    paddingLeft: 20,
    paddingRight:20  },

  categoryBox: {
    height: 200,
    width: 300,
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
  },
  categoryImage: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 15,
  },
  categoryText: {
    color: '#fff',
    fontSize: 35,
    textAlign: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  eventCardWrapper: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  blurContainer: {
    padding: 14,
    borderRadius: 15,
    backgroundColor: 'rgba(63, 54, 64, 0.32)',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: '#fff',
  },
});

export default HomeScreen;
