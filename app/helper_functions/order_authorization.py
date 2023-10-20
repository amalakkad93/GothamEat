def is_authorized_to_access_order(user, order_id):
    """
    Check if the user is authorized to access a specific order.

    This function queries the database to retrieve the order by its ID. It then checks
    if the user is either the one who placed the order or the owner of the restaurant
    that processed the order. This ensures that only relevant parties can access
    order details.

    Args:
        user (User): The user object to check.
        order_id (int): The ID of the order.

    Returns:
        tuple: The order object and a boolean indicating if the user is authorized.

    Example:
    >>> is_authorized_to_access_order(user_obj, 5)
    (<Order instance>, True)
    """

    # Import necessary models locally to avoid circular import issues
    from ..models import Order, OrderItem, MenuItem, db

    # Query the database to fetch the order and its associated menu item
    # This is done by joining the Order, OrderItem, and MenuItem tables
    order = (db.session.query(Order, MenuItem)
             .join(OrderItem, Order.id == OrderItem.order_id)
             .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
             .filter(Order.id == order_id)
             .first())

    # If the order does not exist, return None and False
    if not order:
        return None, False

    # Extract the order and menu item instances from the query result
    order_instance, menu_item_instance = order

    # Check if the user is either the one who placed the order or the owner of the restaurant
    # If so, return the order instance and True (indicating authorization)
    if user.id == order_instance.user_id or user.id == menu_item_instance.restaurant_id:
        return order_instance, True

    # If the user is not authorized, return None and False
    return None, False

