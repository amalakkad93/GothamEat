import React, { useState } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Link } from "react-router-dom";
import OpenModalButton from "../../Modals/OpenModalButton/index";
import DeleteMenuItem from "../DeleteMenuItem";
import EditMenuItemForm from "../MenuItemForm/EditMenuItemForm";
import "./MenuItem1.css"; // or your correct CSS file

export default function MenuItem({ item, menuItemImages, setReloadPage, restaurantId }) {
  console.log("MenuItem component - item: ", item);
  console.log("MenuItem component - menuItemImages: ", menuItemImages);

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

  return (
    <div className="menu-item-main-container">
    <li className="menu-item">
      <Link
        to={`/restaurant/${item.restaurant_id}/menu-item/${item.id}`}
        style={{ textDecoration: "none", color: "var(--black)" }}
      >
        {imageToDisplay && (
          <img
            src={`${imageToDisplay}?timestamp=${new Date().getTime()}`}
            alt={item?.name}
            className="menu-item-image"
          />
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
                imageId={item?.menu_item_img_ids[0]}
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
};

// import React, { useState, useEffect, useRef } from "react";
// import { useSelector, shallowEqual } from "react-redux";
// import { Link } from "react-router-dom";
// import OpenModalButton from "../../Modals/OpenModalButton/index";
// import DeleteMenuItem from "../DeleteMenuItem";
// import EditMenuItemForm from "../MenuItemForm/EditMenuItemForm";
// // import "./MenuItem.css";
// import "./MenuItem1.css";

// // export default function MenuItem({ item, menuItemImgs, setReloadPage }) {
// export default function MenuItem({
//   item,
//   menuItemImages,
//   setReloadPage,
//   restaurantId,
// }) {
//   // const menuItemImgs = useSelector((state) => state.menuItems.menuItemImages, shallowEqual); //
//   // const menuItemImgs = useSelector(state => state.menuItems.menuItemImages || { byId: {}, allIds: [] }, shallowEqual);

//   console.log(
//     "🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ file:  MenuItem.js: MenuItem component item: ",
//     item
//   );
//   console.log(
//     "🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ file:  MenuItem.js: MenuItem component menuItemImages: ",
//     menuItemImages
//   );
//   console.log(
//     "🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ file:  MenuItem.js:12 ~ MenuItem ~ restaurantId:",
//     restaurantId
//   );
//   // const menuItemImgs = useSelector(state => state.menuItemImages || { byId: {}, allIds: [] }, shallowEqual);

//   // console.log("Menu item images in component:",  menuItemImgs);
//   const [, forceUpdate] = useState();

//   // Call this function where you want to force a re-render
//   const update = () => {
//     forceUpdate({});
//   };

//   // console.log("..........menuItemImgs:", menuItemImgs);
//   const currentUser = useSelector((state) => state.session?.user, shallowEqual);
//   const restaurant = useSelector(
//     (state) => state.restaurants?.singleRestaurant?.byId[restaurantId],
//     shallowEqual
//   );
//   // let menuItemImg;
//   // if (item?.menu_item_img_ids?.length > 0)
//   //   menuItemImg = menuItemImages.byId[item.menu_item_img_ids[0]];

//   let menuItemImg;
//   if (item?.menu_item_img_ids?.length > 0) {
//     const imgId = item.menu_item_img_ids[0]; // Get the first image ID
//     menuItemImg = menuItemImages.byId[imgId]; // Access the image using the ID
//     console.log("MenuItem component - menuItemImg: ", menuItemImg);
//   }

//   console.log("---------menuItemImgIds:", item?.menu_item_img_ids);
//   console.log("---------menuItemImages.byId:", menuItemImages.byId);

//   console.log("---------Menu Item Images:", menuItemImages);
//   console.log("---------Current Item:", item);

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
//           <img
//             src={`${menuItemImg?.image_path}?timestamp=${new Date().getTime()}`}
//             alt={item?.name}
//             className="menu-item-image"
//             key={menuItemImg?.image_path}
//           />
//         )}

//         {item.images && (
//           <img
//             src={`${item.images.image_path}?timestamp=${new Date().getTime()}`}
//             alt={item?.name}
//             className="menu-item-image"
//             key={item.images.image_path}
//           />
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
//         {currentUser && restaurant?.owner_id === currentUser?.id && (
//           <>
//             <OpenModalButton
//               buttonText="Edit"
//               modalComponent={
//                 <EditMenuItemForm
//                   restaurantId={item?.restaurant_id}
//                   menuItemId={item?.id}
//                   imageId={menuItemImg ? menuItemImg?.id : null}
//                   setReloadPage={setReloadPage}
//                 />
//               }
//             />

//             {/* Delete MenuItem Modal */}
//             <OpenModalButton
//               buttonText="Delete"
//               modalComponent={
//                 <DeleteMenuItem
//                   menuItemId={item?.id}
//                   imageId={item?.menu_item_img_ids[0]}
//                   restaurantId={item?.restaurant_id}
//                   setReloadPage={setReloadPage}
//                 />
//               }
//             />
//           </>
//         )}
//       </div>
//       {/* )} */}
//     </li>
//   );
// }
// // import React, { useState, useEffect, useRef } from "react";
// // import { useSelector, shallowEqual } from "react-redux";
// // import { Link } from "react-router-dom";
// // import OpenModalButton from "../../Modals/OpenModalButton/index";
// // import DeleteMenuItem from "../DeleteMenuItem";
// // import EditMenuItemForm from "../MenuItemForm/EditMenuItemForm";
// // import "./MenuItem.css";

// // // export default function MenuItem({ item, menuItemImgs, setReloadPage }) {
// //   export default function MenuItem({ item, menuItemImages, setReloadPage }) {
// //   // const menuItemImgs = useSelector((state) => state.menuItems.menuItemImages, shallowEqual); //
// //   // const menuItemImgs = useSelector(state => state.menuItems.menuItemImages || { byId: {}, allIds: [] }, shallowEqual);

// // console.log("Menu item images in component:", menuItemImages);
// //   // const menuItemImgs = useSelector(state => state.menuItemImages || { byId: {}, allIds: [] }, shallowEqual);

// //   // console.log("Menu item images in component:",  menuItemImgs);
// //   const [, forceUpdate] = useState();

// // // Call this function where you want to force a re-render

// //   // console.log("..........menuItemImgs:", menuItemImgs);
// //   const currentUser = useSelector((state) => state.session?.user, shallowEqual);

// //   let menuItemImg;
// //   if (item?.menu_item_img_ids?.length > 0) menuItemImg = menuItemImages.byId[item.menu_item_img_ids[0]];

// //   // console.log("Current menu item image:", menuItemImg?.image_path);
// //   // Inside the MenuItem component

// //   // console.log("+++Full menuItemImg object:", menuItemImg);
// //   // console.log("++Rendering MenuItem with image:", menuItemImg?.image_path);

// //   return (
// //     <li className="menu-item">
// //       <Link
// //         to={`/restaurant/${item.restaurant_id}/menu-item/${item.id}`}
// //         style={{ textDecoration: "none", color: "var(--black)" }}
// //       >
// //         {menuItemImg && (
// //           // <img src={menuItemImg?.image_path} alt={item?.name} className="menu-item-image" />
// //           <img src={`${menuItemImg?.image_path}?timestamp=${new Date().getTime()}`} alt={item?.name} className="menu-item-image"  key={menuItemImg?.image_path}/>
// //         )}

// //         <div className="menu-item-name-price">
// //           <p className="menu-item-name">{item?.name}</p>
// //           <p className="menu-item-price">${item?.price}</p>
// //         </div>

// //         <p className="menu-item-description">{item?.description}</p>
// //       </Link>

// //       {/* {currentUser?.id === item?.restaurant?.owner_id && ( */}
// //       <div className="menu-item-actions">
// //         {/* Edit MenuItem Modal */}
// //         <OpenModalButton
// //           buttonText="Edit"
// //           modalComponent={
// //             <EditMenuItemForm
// //               restaurantId={item.restaurant_id}
// //               menuItemId={item.id}
// //               imageId={menuItemImg ? menuItemImg.id : null}
// //               setReloadPage={setReloadPage}
// //             />
// //           }
// //         />

// //         {/* Delete MenuItem Modal */}
// //         <OpenModalButton
// //           buttonText="Delete"
// //           modalComponent={
// //             <DeleteMenuItem
// //               menuItemId={item.id}
// //               imageId={item.menu_item_img_ids[0]}
// //               restaurantId={item.restaurant_id}
// //               setReloadPage={setReloadPage}
// //             />
// //           }
// //         />
// //       </div>
// //       {/* )} */}
// //     </li>
// //   );
// // }
