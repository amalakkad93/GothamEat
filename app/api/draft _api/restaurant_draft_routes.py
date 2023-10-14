# *******************************Get All Restaurants*******************************
# @restaurant_routes.route('/')
# def get_all_restaurants():
#     try:
#         page = request.args.get('page', 1, type=int)
#         per_page = request.args.get('per_page', 10, type=int)

#         restaurants = (
#             db.session.query(Restaurant)
#             .order_by(Restaurant.average_rating.desc())
#             .limit(per_page)
#             .offset((page - 1) * per_page)
#             .all()
#         )

#         if not restaurants:
#             return jsonify([])

#         all_restaurants_list = [restaurant.to_dict() for restaurant in restaurants]
#         return jsonify({"Restaurants": all_restaurants_list})

#     except Exception as e:
#         print(str(e))
#         return jsonify({"error": "An error occurred while fetching the restaurants."}), 500


# # *******************************Get Restaurants of Current User*******************************
# @restaurant_routes.route('/current')
# def get_restaurants_of_current_user():
#     try:
#         restaurants = (db.session.query(Review)
#                        .options(joinedload(Review.reviews))
#                        .filter(Review.owner_id == current_user.id)
#                        .all())

#         all_restaurants_of_current_user_list = [restaurant.to_dict() for restaurant in restaurants]
#         return jsonify({"Restaurants": all_restaurants_of_current_user_list})

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "An error occurred while fetching the restaurants."}), 500
# *******************************Get Details of a Restaurant by Id*******************************
# @restaurant_routes.route('/<int:id>')
# def get_restaurant_detail(id):
#     try:
#         restaurant = Restaurant.query.get(id)

#         if restaurant is None:
#             return jsonify({"error": "Restaurant not found."}), 404

#         menu_items = (MenuItem.query
#                       .options(joinedload(MenuItem.menu_item_imgs))
#                       .filter_by(restaurant_id=id)
#                       .all())

#         menu_items_list = [item.to_dict() for item in menu_items]

#         owner = restaurant.owner.to_dict()

#         restaurant_dict = restaurant.to_dict()
#         restaurant_dict["MenuItems"] = menu_items_list
#         restaurant_dict["Owner"] = owner

#         return jsonify(restaurant_dict)

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "An error occurred while fetching restaurant detail."}), 500
