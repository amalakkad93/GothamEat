import { Link } from "react-router-dom";
import './MenuItem.css'

export default function MenuItem({ item, menuItemImgs }) {
  let menuItemImg;

  // Directly accessing the image using the ID from menuItemImgs
  if (item?.menu_item_img_ids?.length > 0) {
    menuItemImg = menuItemImgs[item.menu_item_img_ids[0]];
  }

  return (
    <li className="menu-item">
      <Link to={`/restaurant/${item.restaurant_id}/menu-item/${item.id}`}
            style={{ textDecoration: "none", color: "var(--black)" }}>
        {menuItemImg && (
          <img
            src={menuItemImg?.image_path}
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
