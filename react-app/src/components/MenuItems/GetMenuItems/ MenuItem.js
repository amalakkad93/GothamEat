import React, { useState } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Link } from "react-router-dom";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import OpenModalButton from "../../Modals/OpenModalButton/index";
import DeleteMenuItem from "../DeleteMenuItem";
import EditMenuItemForm from "../MenuItemForm/EditMenuItemForm";
import "./MenuItem.css";

export default function MenuItem({
  item,
  menuItemImages,
  setReloadPage,
  restaurantId,
  isEagerLoading,
}) {
  // Determine the image to be displayed
  let imageToDisplay;
  if (item?.menu_item_img_ids?.length > 0) {
    // If there are image IDs, use the first one from menuItemImages.byId
    const imgId = item.menu_item_img_ids[0];
    imageToDisplay = menuItemImages.byId[imgId]?.image_path;
  } else if (item?.images) {
    // If item.images is available, use that instead
    imageToDisplay = item.images.image_path;
  }

  const currentUser = useSelector((state) => state.session?.user, shallowEqual);
  const restaurant = useSelector(
    (state) => state.restaurants?.singleRestaurant?.byId[restaurantId],
    shallowEqual
  );

  // const imageSrc = `${imageToDisplay}?timestamp=${new Date().getTime()}`;
  const imageSrc = imageToDisplay;
  return (
    <div className="menu-item-main-container">
      <li className="menu-item">
        <Link
          to={`/restaurant/${item.restaurant_id}/menu-item/${item.id}`}
          style={{ textDecoration: "none", color: "var(--black)" }}
        >

          {imageToDisplay && (
            isEagerLoading
              ? <img src={imageSrc} alt={item?.name} className="menu-item-image" />
              : <LazyLoadImage src={imageSrc} alt={item?.name} effect="blur" className="menu-item-image" />
          )}
          <div className="menu-item-name-price">
            <p className="menu-item-name">{item?.name}</p>
            <p className="menu-item-price">${item?.price}</p>
          </div>
          <p className="menu-item-description">{item?.description}</p>
        </Link>
        {currentUser && restaurant?.owner_id === currentUser?.id && (
          <div className="menu-item-actions">
            <OpenModalButton
              buttonText="Edit"
              modalComponent={
                <EditMenuItemForm
                  restaurantId={item?.restaurant_id}
                  menuItemId={item?.id}
                  imageId={imageToDisplay ? imageToDisplay.id : null}
                  setReloadPage={setReloadPage}
                />
              }
            />
            <OpenModalButton
              buttonText="Delete"
              modalComponent={
                <DeleteMenuItem
                  menuItemId={item?.id}
                  imageId={item?.menu_item_img_ids?.[0]}
                  restaurantId={item?.restaurant_id}
                  setReloadPage={setReloadPage}
                />
              }
            />
          </div>
        )}
      </li>
    </div>
  );
}
