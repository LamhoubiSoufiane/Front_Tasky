import React, { memo } from 'react';
import { Marker } from 'react-native-maps';

const UserLocationMarker = memo(({ location }) => {
  if (!location) return null;
  
  return (
    <Marker
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      title="Ma position"
      pinColor="blue"
    />
  );
});

export default UserLocationMarker;
