// // GenericFavoritesComponent.js
// import React from 'react';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faHeart as solidHeart, faHeart as regularHeart } from "@fortawesome/free-solid-svg-icons";
// import { useFavorites } from '../../context/FavoritesContext';

// export default function GenericFavoritesComponent({ items, renderItem }) {
//   const { toggleFavorite, isFavorited } = useFavorites();

//   return (
//     <div className="items-list">
//       {items.map((item) => {
//         const favorited = isFavorited(item.id);

//         return (
//           <div key={item.id} className="item-card">
//             {renderItem(item)}
//             <FontAwesomeIcon
//               icon={favorited ? solidHeart : regularHeart}
//               className={`favorite-heart ${favorited ? "favorited" : ""}`}
//               onClick={() => toggleFavorite(item.id)}
//             />
//           </div>
//         );
//       })}
//     </div>
//   );
// }
