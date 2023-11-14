/**
 *
 *
 * In the components, you'd use these selectors like this:
import { useSelector } from 'react-redux';
import * as selectors from './selectors';

const sessionUser = useSelector(selectors.selectSessionUser);
const userId = useSelector(selectors.selectUserId);


For selectors that need parameters (like selectOrderDetails and selectPaymentDetails), you can use them like this:
const orderId = your orderId;
const orderDetails = useSelector(state => selectors.selectOrderDetails(state)(orderId));
const paymentDetails = useSelector(state => selectors.selectPaymentDetails(state)(orderId));

 */


// Maps
export const selectApiKey = state => state.maps.key;

// Session
export const selectSessionUser = state => state.session.user;
export const selectUserId = state => state.session.user?.id;

// Menu Items
export const selectAllMenuItemIds = state => state.menuItems.singleMenuItem.allIds;
export const selectMenuItemById = (state, menuItemId) => state.menuItems.singleMenuItem.byId[menuItemId];
export const selectMenuItemImgs = state => state.menuItems?.menuItemImages?.byId || {};

// Orders
export const selectOrderDetails = state => orderId => state.orders.orders[orderId];
export const selectPaymentDetails = state => orderId => state.payments.payments.find(payment => payment.order_id === parseInt(orderId));
export const selectOrdersLoading = state => state.orders.isLoading;
export const selectOrdersError = state => state.orders.error;
export const selectAllOrders = state => Object.values(state.orders.orders);

// Payments
export const selectAllPayments = state => state.payments.payments;
/**
 * Selects a payment based on the order ID.
 * @param {object} state - The entire Redux state.
 * @param {number} orderId - The ID of the order for which to find the payment.
 * @returns {object|null} - The payment object if found, otherwise null.
 */
export const selectPaymentByOrderId = (state, orderId) => {
  const { payments } = state.payments;
  const paymentArray = Object.values(payments); // Convert payments object to array
  return paymentArray.find(payment => payment.order_id === parseInt(orderId)) || null;
};

// Favorites
export const selectFavoritesById = state => state.favorites?.byId;
export const selectAllFavoriteRestaurants = state => {
  const favoriteRestaurants = state.favorites.favoriteRestaurants || {};
  return Object.values(favoriteRestaurants);
};

// Restaurants
export const selectOwnerRestaurantsById = state => state.restaurants.owner?.byId || {};
export const selectNearbyRestaurantsById = state => state.restaurants.nearby?.byId || {};
export const selectRestaurantDetails = (state, ownerMode) => ownerMode ? selectOwnerRestaurantsById(state) : selectNearbyRestaurantsById(state);
export const selectSingleRestaurantData = state => state.restaurants?.singleRestaurant;

// Menu Items by Restaurant
export const selectMenuItemsByRestaurant = (state, restaurantId) => state.menuItems?.menuItemsByRestaurant?.[restaurantId] || {};

// Review Images
export const selectReviewImages = state => state.reviews.reviewImages || {};

// Reviews
export const selectReviews = state => state.reviews?.reviews || {};
export const selectReviewError = state => state.reviews.error;
export const selectUserHasReview = (state, currentUser) => currentUser
  ? Object.values(state.reviews.reviews).some((review) => review.user_id === currentUser.id)
  : false;

// Shopping Carts
export const selectCartItemsById = state => state.shoppingCarts.items.byId;
export const selectShoppingCart = state => ({
  cartTotalPrice: state.shoppingCarts?.totalPrice,
  cartItemIds: state.shoppingCarts.items?.allIds,
  cartItemsById: state.shoppingCarts.cartItems?.byId,
  menuItem: state.shoppingCarts.menuItemsInfo?.byId,
  restaurantId: state.shoppingCarts?.restaurantId,
  restaurantData: state.restaurants?.singleRestaurant?.byId[state.shoppingCarts?.restaurantId] || null,
  isLoading: state.shoppingCarts.isLoading,
  error: state.shoppingCarts.error,
});

// Menu Item Images
export const selectMenuItemImagesById = state => state.menuItems.menuItemImages.byId;
