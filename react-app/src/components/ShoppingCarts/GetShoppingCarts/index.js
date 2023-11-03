/**
 * ShoppingCart Component
 *
 * This component provides an interface to view all items in the user's shopping cart.
 * It fetches and displays the current shopping cart items, and for each item, it renders
 * a DeleteShoppingCart component to allow item deletion.
 */
import React, { useEffect } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { thunkFetchCurrentCart } from "../../../store/shoppingCarts";
import DeleteShoppingCart from '../DeleteShoppingCart';
import "./ShoppingCart.css";

export default function ShoppingCart() {
    // Hook to allow component to dispatch actions to the Redux store
    const dispatch = useDispatch();

    // Redux state selectors to extract necessary data from the Redux store
    const cartItems = useSelector((state) => state.shoppingCarts.items, shallowEqual);
    const menuItemNames = useSelector((state) => state.shoppingCarts.menuItemNames, shallowEqual);
    const error = useSelector((state) => state.shoppingCarts.error, shallowEqual);

    // Effect to fetch the current shopping cart when the component is mounted
    useEffect(() => {
        dispatch(thunkFetchCurrentCart());
    }, [dispatch]);

    // Error handling: Show an error message if there's an issue fetching the shopping cart
    if (error) return <p>Error: {error}</p>;

    // Render the shopping cart and its items
    return (
        <div className="shopping-cart-container">
            {/* Title for the shopping cart */}
            <h1>Your Shopping Cart</h1>
            {Object.values(cartItems).length ? (
                <ul>
                    {/* Iterate over each cart item and render the DeleteShoppingCart component */}
                    {Object.values(cartItems).map((item) => (
                        <DeleteShoppingCart key={item.id} item={item} itemName={menuItemNames[item.menu_item_id]} />
                    ))}
                </ul>
            ) : (
                // Message displayed when the cart is empty
                <p>Your cart is empty.</p>
            )}
        </div>
    );
}
