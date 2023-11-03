import React, { useState, useEffect, useRef } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { useModal } from "../../../context/Modal";
import MenuItemForm from './index';
import { thunkGetMenuItemDetails } from '../../../store/menuItems';

export default function EditMenuItemForm({ restaurantId, imageId, menuItemId, setReloadPage }) {
    // const { restaurantId, menuItemId } = useParams();
    const dispatch = useDispatch();
    // const { closeModal } = useModal();
    const menuItem = useSelector(state => state.menuItems.singleMenuItem.byId[menuItemId], shallowEqual);
console.log("************EditMenuItemForm: imageId", imageId);

// console.log("************EditMenuItemForm: restaurantId", restaurantId);
// console.log("************EditMenuItemForm: menuItemId", menuItemId);
// console.log("************EditMenuItemForm: menuItem", menuItem);
    useEffect(() => {
        if (menuItemId) {
            console.log("Dispatching thunkGetMenuItemDetails from EditMenuItemForm", menuItemId);
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


// export default function EditMenuItemForm() {
//     const { restaurantId, menuItemId } = useParams();

//     return (
//         <MenuItemForm
//             formType="Edit"
//             restaurantId={restaurantId}
//             menuItemId={menuItemId}
//         />
//     );
// }
