from icecream import ic




# def fetch_filtered_menu_items(restaurant_id, menu_item_type, min_price=None, max_price=None):
#     from ..models import MenuItem
#     query = MenuItem.query.filter_by(restaurant_id=restaurant_id, type=menu_item_type)
#     if min_price is not None:
#         query = query.filter(MenuItem.price >= min_price)
#     if max_price is not None:
#         query = query.filter(MenuItem.price <= max_price)

#     filtered_items = query.all()
#     return [item.to_dict() for item in filtered_items]


def fetch_filtered_menu_items(restaurant_id, menu_item_types, min_price=None, max_price=None):
    from ..models import MenuItem

    query = MenuItem.query.filter_by(restaurant_id=restaurant_id)
    if menu_item_types:
        query = query.filter(MenuItem.type.in_(menu_item_types))
    if min_price is not None:
        query = query.filter(MenuItem.price >= min_price)
    if max_price is not None:
        query = query.filter(MenuItem.price <= max_price)

    filtered_items = query.all()
    return [item.to_dict() for item in filtered_items]
