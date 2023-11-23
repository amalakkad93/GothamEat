import React, { useState, useEffect, useRef } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { useModal } from "../../../context/Modal";
import MenuItemForm from './index';
import { thunkGetMenuItemDetails } from '../../../store/menuItems';

export default function EditMenuItemForm({ restaurantId, imageId, menuItemId, setReloadPage }) {

    const dispatch = useDispatch();
    const menuItem = useSelector(state => state.menuItems.singleMenuItem.byId[menuItemId], shallowEqual);

    useEffect(() => {
        if (menuItemId) {
            dispatch(thunkGetMenuItemDetails(menuItemId));
        }
    }, [dispatch, menuItemId]);

    if (!menuItem) return <div>Loading...</div>;
    return (
        <MenuItemForm
            formType="Edit"
            restaurantId={restaurantId}
            setReloadPage={setReloadPage}
            menuItemId={menuItemId}
            imageId={imageId}
            initialData={menuItem}
        />
    );
}
