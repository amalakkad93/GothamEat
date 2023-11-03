// frontend/src/components/Maps/index.js
import { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { getKey } from '../../store/maps';
import Maps from './Maps';

const MapContainer = () => {
  const key = useSelector((state) => state.maps.key, shallowEqual);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!key) {
      dispatch(getKey());
    }
  }, [dispatch, key]);

  if (!key) {
    return null;
  }

  return (
    <Maps apiKey={key} />
  );
};

export default MapContainer;
