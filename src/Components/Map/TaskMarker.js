import React, { memo } from 'react';
import { Marker } from 'react-native-maps';

const TaskMarker = memo(({ task }) => {
  return (
    <Marker
      key={task.id}
      coordinate={{
        latitude: task.location.latitude,
        longitude: task.location.longitude,
      }}
      title={task.nom}
      description={task.description}
      pinColor={task.priority === 'URGENT' ? 'red' : 'orange'}
    />
  );
});

export default TaskMarker;
