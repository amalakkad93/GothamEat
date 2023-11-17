import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from '../../../context/Modal';
import { thunkCreateMenuItem, thunkGetMenuItemDetails, thunkUpdateMenuItem } from '../store/menuItems';



useEffect(() => {
  const fetchData = async () => {
    // Start Loading: The loading state is set to true, indicating that data fetching has started.
    setLoading(true); // 1

    // Concurrent Promises: Promise.all is used to handle multiple promises concurrently.
    // This means that the dispatch calls inside it are executed at the same time.
    await Promise.all([ // 2
    // Dispatch Actions: These are asynchronous actions to fetch restaurant details and menu items.
    // They're executed concurrently.
      dispatch(thunkGetRestaurantDetails(restaurantId)), // 3
      dispatch(thunkGetMenuItemsByRestaurantId(restaurantId)) // 4
    ]);

    // Stop Loading: Once both promises resolve, the loading state is set to false.
    // This happens irrespective of whether the component has finished rendering the updated state.
    setLoading(false); // 5
  };

// Execute Fetch Data: The fetchData function is called immediately when the component mounts or
// when any of the dependencies (dispatch, restaurantId, userId) change.
  fetchData(); // 6

  // Fetching Favorites: If the user is logged in (userId is present), fetch the user's favorite restaurants.
  // This is done after the fetchData call, not concurrently with it.
  if (userId && isMountedRef.current) { // 7
    dispatch(thunkFetchAllFavorites(userId)); // 8
  }

  //  Cleanup Function: When the component unmounts, the reference isMountedRef.current is set to false.
  // This is a way to track if the component is still mounted when asynchronous operations complete.
  return () => { // 9
    isMountedRef.current = false; // 10
  };
}, [dispatch, restaurantId, userId]);


useEffect(() => {
  const fetchData = async () => {
    // Start Loading: Similar to the first approach, the loading state is set to true.
    setLoading(true); // 1

    // Sequential Dispatch Actions: Here, the dispatch calls are awaited one after the other (sequentially).
    // The second dispatch will not execute until the first one has completed.
    await dispatch(thunkGetRestaurantDetails(restaurantId)); // 2
    await dispatch(thunkGetMenuItemsByRestaurantId(restaurantId)); // 3

    // Check Component Mount Status and Stop Loading: Loading is set to false only if the component is still mounted.
    // This prevents updating state on an unmounted component and ensures that the state is updated only after
    // both dispatch actions have completed.
    if (isMountedRef.current) { // 4
      setLoading(false); // 5
    }
  };

  // Execute Fetch Data: Similar to the first approach, but this time the data fetching is sequential.
  fetchData(); // 6

  // Dependencies: The effect is re-run if dispatch, restaurantId, or reloadPage changes.
}, [dispatch, restaurantId, reloadPage]); // 7


/**
 Key Differences and Why It Matters:
Concurrent vs Sequential:
In the first approach, Promise.all executes dispatch actions concurrently,
which could lead to a race condition where the component updates its state from one dispatch before
the other completes. In the second approach, dispatch actions are executed sequentially, ensuring each
action's effect on the state is processed before the next begins.

State Update Timing:
React's state updates are asynchronous. In the first approach,
it's possible that setLoading(false) is called before the state updates from dispatches are processed by React,
leading to a scenario where your component renders with stale data. In the second approach, because actions are
awaited sequentially, it's more likely that state updates are processed in order, reducing the chance of rendering
stale data.

Conclusion:
In scenarios where the order of state updates is important (like fetching and displaying data),
sequential execution of dispatch actions can provide more predictable results, ensuring that the
component's state and UI are always in sync. This is likely why you see the correct behavior without
needing a page refresh in the second approach.

 */
