import React from 'react';
import { useDispatch } from 'react-redux';
import { thunkDeleteItemFromCart } from "../../../store/shoppingCarts";

const DeleteShoppingCart = ({ item, itemName }) => {
    const dispatch = useDispatch();

    const handleDeleteItem = () => {
        dispatch(thunkDeleteItemFromCart(item.id));
    }

    return (
        <li className="cart-item">
            <span>
                {itemName} (Quantity: {item.quantity})
            </span>
            <button onClick={handleDeleteItem}>Delete</button>
        </li>
    );
}

export default DeleteShoppingCart;
