// frontend/src/store/maps.js
// import { fetch } from './csrf';

const LOAD_API_KEY = 'maps/LOAD_API_KEY';

const loadApiKey = (key) => ({
  type: LOAD_API_KEY,
  payload: key,
});

export const getKey = () => async (dispatch) => {
  const res = await fetch('/api/maps/key', {
    method: 'POST',
  });
  if (res.ok) {
    const data = await res.json();
    dispatch(loadApiKey(data.google_maps_api_key));
  } else {
    console.error("Failed to load API key:", await res.text());
  }
};


const initialState = { key: null };

const mapsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_API_KEY:
      return { key: action.payload };
    default:
      return state;
  }
};

export default mapsReducer;
