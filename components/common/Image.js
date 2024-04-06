import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Text } from 'react-native';

const ProfileImage = ({ mainImageUri, width = 200, height = 200, handlePress, name, fontSize, color }) => {
  const borderRadius = width / 2;

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  return (
    <TouchableOpacity onPress={handlePress} >
      {mainImageUri ? (
        <Image
          source={{ uri: mainImageUri }}
          style={{ ...styles.image, width, height, borderRadius,backgroundColor:'whitesmoke' }}
        />
      ) : (
        <View style={[styles.defaultImageContainer, { width, height, borderRadius, backgroundColor: color ? color : '#ccc' }]}>
          <Text style={[styles.initials, { fontSize: fontSize }]}>{getInitials(name)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'blue',
  },
  image: {
    resizeMode: 'cover',
    borderRadius: 10,
  },
  defaultImageContainer: {
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ProfileImage;