/**
 * MenuItem Component
 *
 * This component is responsible for rendering individual menu items within a restaurant's menu.
 * Each menu item is displayed with its image, name, price, and description.
 * Clicking on a menu item will navigate to its detailed view.
 *
 * @param {Object} item - The menu item data.
 * @param {Object} menuItemImgs - The images associated with menu items.
 */
import { Link } from "react-router-dom";
import './MenuItem.css'

export default function MenuItem({ item, menuItemImgs }) {
  console.log(".........Item:", item);
console.log(".........Image IDs:", item.menu_item_img_ids);
console.log(".........All Menu Item Images:", menuItemImgs);

  let menuItemImg;

  // Directly accessing the image using the ID from menuItemImgs
  if (item?.menu_item_img_ids?.length > 0) {
    menuItemImg = menuItemImgs.byId[item.menu_item_img_ids[0]];
}


  return (
    <li className="menu-item">
      {/* Link to navigate to the detailed view of the menu item */}
      <Link to={`/restaurant/${item.restaurant_id}/menu-item/${item.id}`}
            style={{ textDecoration: "none", color: "var(--black)" }}>

        {/* Display the image of the menu item, if available */}
        {menuItemImg && (
          <img
            src={menuItemImg?.image_path}
            alt={item?.name}
            className="menu-item-image"
          />
        )}

        {/* Display the name and price of the menu item */}
        <div className="menu-item-name-price">
          <p className="menu-item-name">{item?.name}</p>
          <p className="menu-item-price">${item?.price}</p>
        </div>

        {/* Display the description of the menu item */}
        <p className="menu-item-description">{item?.description}</p>
      </Link>
    </li>
  );
}

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
