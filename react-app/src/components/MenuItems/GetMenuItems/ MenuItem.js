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
// import React, { useState, useEffect, useRef } from "react";
// import { useSelector, shallowEqual } from "react-redux";
// import { Link } from "react-router-dom";
// import OpenModalButton from "../../Modals/OpenModalButton/index";
// import DeleteMenuItem from "../DeleteMenuItem";
// import EditMenuItemForm from "../MenuItemForm/EditMenuItemForm";
// import "./MenuItem.css";

// // export default function MenuItem({ item, menuItemImgs, setReloadPage }) {
//   export default function MenuItem({ item, menuItemImages, setReloadPage }) {
//   // const menuItemImgs = useSelector((state) => state.menuItems.menuItemImages, shallowEqual); //
//   // const menuItemImgs = useSelector(state => state.menuItems.menuItemImages || { byId: {}, allIds: [] }, shallowEqual);


// console.log("Menu item images in component:", menuItemImages);
//   // const menuItemImgs = useSelector(state => state.menuItemImages || { byId: {}, allIds: [] }, shallowEqual);

//   // console.log("Menu item images in component:",  menuItemImgs);
//   const [, forceUpdate] = useState();

// // Call this function where you want to force a re-render




//   // console.log("..........menuItemImgs:", menuItemImgs);
//   const currentUser = useSelector((state) => state.session?.user, shallowEqual);

//   let menuItemImg;
//   if (item?.menu_item_img_ids?.length > 0) menuItemImg = menuItemImages.byId[item.menu_item_img_ids[0]];

//   // console.log("Current menu item image:", menuItemImg?.image_path);
//   // Inside the MenuItem component


//   // console.log("+++Full menuItemImg object:", menuItemImg);
//   // console.log("++Rendering MenuItem with image:", menuItemImg?.image_path);

//   return (
//     <li className="menu-item">
//       <Link
//         to={`/restaurant/${item.restaurant_id}/menu-item/${item.id}`}
//         style={{ textDecoration: "none", color: "var(--black)" }}
//       >
//         {menuItemImg && (
//           // <img src={menuItemImg?.image_path} alt={item?.name} className="menu-item-image" />
//           <img src={`${menuItemImg?.image_path}?timestamp=${new Date().getTime()}`} alt={item?.name} className="menu-item-image"  key={menuItemImg?.image_path}/>
//         )}

//         <div className="menu-item-name-price">
//           <p className="menu-item-name">{item?.name}</p>
//           <p className="menu-item-price">${item?.price}</p>
//         </div>

//         <p className="menu-item-description">{item?.description}</p>
//       </Link>

//       {/* {currentUser?.id === item?.restaurant?.owner_id && ( */}
//       <div className="menu-item-actions">
//         {/* Edit MenuItem Modal */}
//         <OpenModalButton
//           buttonText="Edit"
//           modalComponent={
//             <EditMenuItemForm
//               restaurantId={item.restaurant_id}
//               menuItemId={item.id}
//               imageId={menuItemImg ? menuItemImg.id : null}
//               setReloadPage={setReloadPage}
//             />
//           }
//         />

//         {/* Delete MenuItem Modal */}
//         <OpenModalButton
//           buttonText="Delete"
//           modalComponent={
//             <DeleteMenuItem
//               menuItemId={item.id}
//               imageId={item.menu_item_img_ids[0]}
//               restaurantId={item.restaurant_id}
//               setReloadPage={setReloadPage}
//             />
//           }
//         />
//       </div>
//       {/* )} */}
//     </li>
//   );
// }
