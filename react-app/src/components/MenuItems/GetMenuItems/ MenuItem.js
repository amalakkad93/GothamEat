import React, { useState, useEffect, useRef } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Link } from "react-router-dom";
import OpenModalButton from "../../Modals/OpenModalButton/index";
import DeleteMenuItem from "../DeleteMenuItem";
import EditMenuItemForm from "../MenuItemForm/EditMenuItemForm";
import "./MenuItem.css";

// export default function MenuItem({ item, menuItemImgs, setReloadPage }) {
  export default function MenuItem({ item, menuItemImages, setReloadPage }) {
  // const menuItemImgs = useSelector((state) => state.menuItems.menuItemImages, shallowEqual); //
  // const menuItemImgs = useSelector(state => state.menuItems.menuItemImages || { byId: {}, allIds: [] }, shallowEqual);


console.log("Menu item images in component:", menuItemImages);
  // const menuItemImgs = useSelector(state => state.menuItemImages || { byId: {}, allIds: [] }, shallowEqual);

  // console.log("Menu item images in component:",  menuItemImgs);
  const [, forceUpdate] = useState();

// Call this function where you want to force a re-render
const update = () => {
  forceUpdate({});
};



  // console.log("..........menuItemImgs:", menuItemImgs);
  const currentUser = useSelector((state) => state.session?.user, shallowEqual);

  let menuItemImg;
  if (item?.menu_item_img_ids?.length > 0) menuItemImg = menuItemImages.byId[item.menu_item_img_ids[0]];

  // console.log("Current menu item image:", menuItemImg?.image_path);
  // Inside the MenuItem component


  // console.log("+++Full menuItemImg object:", menuItemImg);
  // console.log("++Rendering MenuItem with image:", menuItemImg?.image_path);

  return (
    <li className="menu-item">
      <Link
        to={`/restaurant/${item.restaurant_id}/menu-item/${item.id}`}
        style={{ textDecoration: "none", color: "var(--black)" }}
      >
        {menuItemImg && (
          // <img src={menuItemImg?.image_path} alt={item?.name} className="menu-item-image" />
          <img src={`${menuItemImg?.image_path}?timestamp=${new Date().getTime()}`} alt={item?.name} className="menu-item-image"  key={menuItemImg?.image_path}/>
        )}

        <div className="menu-item-name-price">
          <p className="menu-item-name">{item?.name}</p>
          <p className="menu-item-price">${item?.price}</p>
        </div>

        <p className="menu-item-description">{item?.description}</p>
      </Link>

      {/* {currentUser?.id === item?.restaurant?.owner_id && ( */}
      <div className="menu-item-actions">
        {/* Edit MenuItem Modal */}
        <OpenModalButton
          buttonText="Edit"
          modalComponent={
            <EditMenuItemForm
              restaurantId={item.restaurant_id}
              menuItemId={item.id}
              imageId={menuItemImg ? menuItemImg.id : null}
              setReloadPage={setReloadPage}
            />
          }
        />

        {/* Delete MenuItem Modal */}
        <OpenModalButton
          buttonText="Delete"
          modalComponent={
            <DeleteMenuItem
              menuItemId={item.id}
              imageId={item.menu_item_img_ids[0]}
              restaurantId={item.restaurant_id}
              setReloadPage={setReloadPage}
            />
          }
        />
      </div>
      {/* )} */}
    </li>
  );
}

// /**
//  * MenuItem Component
//  *
//  * This component is responsible for rendering individual menu items within a restaurant's menu.
//  * Each menu item is displayed with its image, name, price, and description.
//  * Clicking on a menu item will navigate to its detailed view.
//  *
//  * @param {Object} item - The menu item data.
//  * @param {Object} menuItemImgs - The images associated with menu items.
//  */
// import { Link } from "react-router-dom";
// import './MenuItem.css'

// export default function MenuItem({ item, menuItemImgs }) {
//   console.log(".........Item:", item);
// console.log(".........Image IDs:", item.menu_item_img_ids);
// console.log(".........All Menu Item Images:", menuItemImgs);

//   let menuItemImg;

//   // Directly accessing the image using the ID from menuItemImgs
//   if (item?.menu_item_img_ids?.length > 0) {
//     menuItemImg = menuItemImgs.byId[item.menu_item_img_ids[0]];
// }

//   return (
//     <li className="menu-item">
//       {/* Link to navigate to the detailed view of the menu item */}
//       <Link to={`/restaurant/${item.restaurant_id}/menu-item/${item.id}`}
//             style={{ textDecoration: "none", color: "var(--black)" }}>

//         {/* Display the image of the menu item, if available */}
//         {menuItemImg && (
//           <img
//             src={menuItemImg?.image_path}
//             alt={item?.name}
//             className="menu-item-image"
//           />
//         )}

//         {/* Display the name and price of the menu item */}
//         <div className="menu-item-name-price">
//           <p className="menu-item-name">{item?.name}</p>
//           <p className="menu-item-price">${item?.price}</p>
//         </div>

//         {/* Display the description of the menu item */}
//         <p className="menu-item-description">{item?.description}</p>
//       </Link>
//     </li>
//   );
// }

// import { Link } from "react-router-dom";
// import './MenuItem.css'
// export default function MenuItem({ item, menuItemImgs }) {
//   console.log("====item in MenuItem:", item);
//   console.log("====menuItemImgs in MenuItem:", menuItemImgs);
//   console.log("====image ID:", item?.menu_item_img_ids?.[0]);
//   let menuItemImg;

//   // Directly accessing the image using the ID from menuItemImgs
//   if (item?.menu_item_img_ids?.length > 0) {
//     menuItemImg = menuItemImgs[item.menu_item_img_ids[0]];
//   }

//   return (
//     <li className="menu-item">
//       <Link  to={`/menu-item/${item.id}`} style={{ textDecoration: "none", color: "var(--black)" }}>
//       {menuItemImg && (
//         <img
//           src={menuItemImg?.image_path}
//           alt={item?.name}
//           className="menu-item-image"
//         />
//       )}
//       <div className="menu-item-name-price">
//         <p className="menu-item-name">{item?.name}</p>
//         <p className="menu-item-price">${item?.price}</p>
//       </div>
//       <p className="menu-item-description">{item?.description}</p>
//     </Link>
//     </li>
//   );
// }
