return (
  <div className="shopping-cart-container">

    {cartItemIds.length > 0 ? (
      <>

        <ul className="shopping-cart-ul">
          {/* Iterate over each cart item */}
          {cartItemIds.map((itemId) => {
            const item = cartItemsById[itemId];
            const itemName = menuItemNamesById[item.menu_item_id];


            return (
              <li key={itemId} className="cart-item">
                <div className="cart-item-name">
                  <span>{itemName}</span>
                  {/* Small image next to item name */}
                </div>
                <div className="cart-item-details">
                  <EditShoppingCart itemId={itemId} /> {/* Dropdown for quantity */}
                  <span>${item.price}</span> {/* Price of the menu item */}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="shopping-cart-total">
          <strong>Subtotal</strong>
          <span>${totalPrice}</span>
        </div>
        <button onClick={handleCreateOrder} className="checkout-button">
          Go to checkout
        </button>
        <button onClick={handleAddItems} className="add-items-button">
          Add items
        </button>
      </>
    ) : (
      <p>Your cart is empty.</p>
    )}
  </div>
);
