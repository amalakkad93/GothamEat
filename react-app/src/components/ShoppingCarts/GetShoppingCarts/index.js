import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { thunkFetchCurrentCart } from "../../../store/shoppingCarts";
import DeleteShoppingCart from '../DeleteShoppingCart';
import "./ShoppingCart.css";

export default function ShoppingCart() {
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.shoppingCarts.items);
    const menuItemNames = useSelector((state) => state.shoppingCarts.menuItemNames);
    const error = useSelector((state) => state.shoppingCarts.error);

    useEffect(() => {
        dispatch(thunkFetchCurrentCart());
    }, [dispatch]);

    if (error) return <p>Error: {error}</p>;

    return (
        <div className="shopping-cart-container">
            <h1>Your Shopping Cart</h1>
            {Object.values(cartItems).length ? (
                <ul>
                    {Object.values(cartItems).map((item) => (
                        <DeleteShoppingCart key={item.id} item={item} itemName={menuItemNames[item.menu_item_id]} />
                    ))}
                </ul>
            ) : (
                <p>Your cart is empty.</p>
            )}
        </div>
    );
}
