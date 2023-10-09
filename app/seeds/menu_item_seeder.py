from sqlalchemy import text
from ..models import db, MenuItem, MenuItemImg, environment, SCHEMA
from random import randint

image_urls = {

    "drinks": {
        "Cappuccino": f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/cappuccino/img_{randint(1, 5)}.jpeg",
        "Gotham Red Wine": f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/gotham_red_wine/img_{randint(1, 5)}.jpeg",
        "Margarita": f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/margarita/img_{randint(1, 5)}.jpeg",
        "Redbull": f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/redbull/img_{randint(1, 5)}.jpeg",
        "Seven and Seven":  f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/seven_and_seven/img_{randint(1, 5)}.jpeg",
        "Sprite": f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/sprite/img_{randint(1, 5)}.jpeg",
        "Gotham White Wine": f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/gotham_white_wine/img_{randint(1, 5)}.jpeg",
        "Lemonade": f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/lemonade/img_{randint(1, 5)}.jpeg",
        "Martini": f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/martini/img_{randint(1, 5)}.jpeg",
        "Root Beer": f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/root_beer/img_{randint(1, 5)}.jpeg",
        "Shirley Temple":  f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/shirley_temple/img_{randint(1, 5)}.jpeg",
        "Coffee":  f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/Coffee/img_{randint(1, 5)}.jpeg",
        "Gotham Beer": f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/gotham_beer/img_{randint(1, 5)}.jpeg",
        "Long Island Iced Tea":  f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/long_island_iced_tea/img_{randint(1, 5)}.jpeg",
        "Pepsi":  f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/pepsi/img_{randint(1, 5)}.jpeg",
        "Rum and Coke":  f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/rum_and_coke/img_{randint(1, 5)}.jpeg",
        "Smoothie": f"https://flask3.s3.amazonaws.com/menu_item_images/drinks/smoothie/img_{randint(1, 5)}.jpeg",
    },
    "entrees": {
        "Buffalo Chicken Sandwich": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/buffalo_chicken_sandwich/img_{randint(1, 5)}.jpeg",
        "Chicken Tenders": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/chicken_tenders/img_{randint(1, 5)}.jpeg",
        "Lasagna": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/lasagna/img_{randint(1, 5)}.jpeg",
        "Philly Cheesesteak": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/philly_cheesesteak/img_{randint(1, 5)}.jpeg",
        "Spaghetti": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/spaghetti/img_{randint(1, 5)}.jpeg",
        "Chicken Fajita": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/chicken_fajita/img_{randint(1, 5)}.jpeg",
        "Fettuccine Alfredo": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/fettuccine_alfredo/img_{randint(1, 5)}.jpeg",
        "Gyro": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/gyro/img_{randint(1, 5)}.jpeg",
        "Lobster": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/lobster/img_{randint(1, 5)}.jpeg",
        "Steak": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/steak/img_{randint(1, 5)}.jpeg",
        "BBQ Ribs": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/bbq_ribs/img_{randint(1, 5)}.jpeg",
        "Chicken Parm": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/chicken_parmesean/img_{randint(1, 5)}.jpeg",
        "Fish & Chips": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/fish_and_chips/img_{randint(1, 5)}.jpeg",
        "Hamburger": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/hamburger/img_{randint(1, 5)}.jpeg",
        "Meatball Sandwich": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/meatball_sandwich/img_{randint(1, 5)}.jpeg",
        "Shish Kebab": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/shish_kebab/img_{randint(1, 5)}.jpeg",
        "Fish Tacos": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/fish_tacos/img_{randint(1, 5)}.jpeg",
        "Pizza": f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/pizza/img_{randint(1, 5)}.jpeg"
    },
    "desserts": {
        'Blueberry tart': f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/blueberry_tart/img_{randint(1, 5)}.jpeg",
        "Chocolate Chip Cookie": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/blueberry_tart/img_{randint(1, 5)}.jpeg",
        "Lava Cake": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/lava_cake/img_{randint(1, 5)}.jpeg",
        "Pumpkin pie": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/pumpkin_pie/img_{randint(1, 5)}.jpeg",
        'Carrot Cake': f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/carrot_cake/img_{randint(1, 5)}.jpeg",
        "Chocolate Mousse": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/chocolate_mousse/img_{randint(1, 5)}.jpeg",
        "Milkshake": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/milkshake/img_{randint(1, 5)}.jpeg",
        "Strawberry Shortcake": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/strawberry_shortcake/img_{randint(1, 5)}.jpeg",
        'Apple Pie': f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/apple_pie/img_{randint(1, 5)}.jpeg",
        "Cheesecake": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/cheesecake/img_{randint(1, 5)}.jpeg",
        "Cupcake": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/cupcake/img_{randint(1, 5)}.jpeg",
        "Peach Cobbler": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/peach_cobbler/img_{randint(1, 5)}.jpeg",
        "Tiramisu": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/tiramisu/img_{randint(1, 5)}.jpeg",
        "Banana Split": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/banana_split/img_{randint(1, 5)}.jpeg",
        "Chocolate Brownie": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/chocolate_brownie/img_{randint(1, 5)}.jpeg",
        "Flan": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/flan/img_{randint(1, 5)}.jpeg",
        "Pistachio Gelato": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/pistachio_gelato/img_{randint(1, 5)}.jpeg",
        "Vanilla IceCream": f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/vanilla_icecream/img_{randint(1, 5)}.jpeg"
    },
    "sides": {
        "Chicken Wings": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/chicken_wings/img_{randint(1, 5)}.jpeg",
        "Fried Rice": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/fried_rice/img_{randint(1, 5)}.jpeg",
        "Green Beans": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/green_beans/img_{randint(1, 5)}.jpeg",
        "Mozarella Sticks": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/mozarella_sticks/img_{randint(1, 5)}.jpeg",
        "Roasted Veggies": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/roasted_veggies/img_{randint(1, 5)}.jpeg",
        "Corn on the Cob": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/corn_on_the_cob/img_{randint(1, 5)}.jpeg",
        "Fries": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/fries/img_{randint(1, 5)}.jpeg",
        "Lo Mein": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/lo_mein/img_{randint(1, 5)}.jpeg",
        "Nachos": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/nachos/img_{randint(1, 5)}.jpeg",
        "Sweet Potato Fries": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/sweet_potato_fries/img_{randint(1, 5)}.jpeg",
        "Baked Potato": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/baked_potato/img_{randint(1, 5)}.jpeg",
        "Creamed Spinach": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/creamed_spinach/img_{randint(1, 5)}.jpeg",
        "Garden Salad": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/garden_salad/img_{randint(1, 5)}.jpeg",
        "Mac and Cheese": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/mac_and_cheese/img_{randint(1, 5)}.jpeg",
        "Onion Rings": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/onion_rings/img_{randint(1, 5)}.jpeg",
        "Tater Tots": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/tater_tots/img_{randint(1, 5)}.jpeg",
        "Breadsticks": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/breadsticks/img_{randint(1, 5)}.jpeg",
        "Edemame": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/edemame/img_{randint(1, 5)}.jpeg",
        "Garlic Bread": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/garlic_bread/img_{randint(1, 5)}.jpeg",
        "Mashed_Potatoes": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/mashed_potatoes/img_{randint(1, 5)}.jpeg",
        "Roasted Cauliflower": f"https://flask3.s3.amazonaws.com/menu_item_images/sides/roasted_cauliflower/img_{randint(1, 5)}.jpeg"
    },
}

drinks = [
    {"name": "Cappuccino", "description": "A rich and creamy coffee beverage topped with foamy milk.", "price": 3.99},
    {"name": "Gotham Red Wine", "description": "A fine red wine sourced from the vineyards of Gotham.", "price": 6.99},
    {"name": "Margarita", "description": "A classic cocktail blending tequila with lime and triple sec.", "price": 5.99},
    {"name": "Redbull", "description": "Energize your day with a can of Redbull.", "price": 3.50},
    {"name": "Seven and Seven", "description": "A whiskey-based cocktail mixed with lemon-lime soda.", "price": 5.49},
    {"name": "Sprite", "description": "A refreshing lemon-lime soda.", "price": 2.50},
    {"name": "Gotham White Wine", "description": "A refreshing white wine with hints of apple and pear.", "price": 6.99},
    {"name": "Lemonade", "description": "A sweet and tangy beverage made from fresh lemons.", "price": 2.99},
    {"name": "Martini", "description": "A classic cocktail with gin and vermouth.", "price": 6.49},
    {"name": "Root Beer", "description": "A sweet carbonated beverage with a distinct root flavor.", "price": 2.50},
    {"name": "Shirley Temple", "description": "A non-alcoholic mixed drink made with ginger ale and grenadine.", "price": 3.49},
    {"name": "Coffee", "description": "Freshly brewed coffee to kickstart your day.", "price": 2.99},
    {"name": "Gotham Beer", "description": "A locally brewed beer from Gotham's finest brewery.", "price": 4.99},
    {"name": "Long Island Iced Tea", "description": "A cocktail made with a blend of several different spirits and topped with cola.", "price": 7.49},
    {"name": "Pepsi", "description": "A popular carbonated soft drink.", "price": 2.50},
    {"name": "Rum and Coke", "description": "A simple cocktail mixing rum with cola.", "price": 5.99},
    {"name": "Smoothie", "description": "A blended beverage made from fresh fruits.", "price": 4.49},
]
entrees = [
    {"name": "Buffalo Chicken Sandwich", "description": "Spicy buffalo chicken in a bun.", "price": 8.99},
    {"name": "Chicken Tenders", "description": "Crispy and tender chicken strips.", "price": 7.99},
    {"name": "Lasagna", "description": "Layered pasta with meat and cheese.", "price": 9.99},
    {"name": "Philly Cheesesteak", "description": "Sliced beefsteak with melted cheese.", "price": 8.49},
    {"name": "Spaghetti", "description": "Spaghetti pasta with tomato sauce.", "price": 8.99},
    {"name": "Chicken Fajita", "description": "Grilled chicken with peppers and onions.", "price": 9.49},
    {"name": "Fettuccine Alfredo", "description": "Creamy pasta with parmesan cheese.", "price": 9.99},
    {"name": "Gyro", "description": "Wrap filled with meat, sauce, and veggies.", "price": 7.49},
    {"name": "Lobster", "description": "Freshly cooked lobster.", "price": 24.99},
    {"name": "Steak", "description": "Grilled beef steak.", "price": 19.99},
    {"name": "BBQ Ribs", "description": "Tender ribs with BBQ sauce.", "price": 14.99},
    {"name": "Chicken Parm", "description": "Breaded chicken with cheese and tomato sauce.", "price": 9.99},
    {"name": "Fish & Chips", "description": "Fried fish with crispy chips.", "price": 8.99},
    {"name": "Hamburger", "description": "Beef burger with lettuce, tomato, and onion.", "price": 7.49},
    {"name": "Meatball Sandwich", "description": "Meatballs in a sandwich with sauce.", "price": 7.99},
    {"name": "Shish Kebab", "description": "Grilled meat and vegetables on skewers.", "price": 8.49},
    {"name": "Fish Tacos", "description": "Fish-filled tacos with toppings.", "price": 7.99},
    {"name": "Pizza", "description": "Baked flatbread with various toppings.", "price": 9.99},
]

desserts = [
    {"name": "Blueberry tart", "description": "Sweet blueberries in a flaky tart.", "price": 4.99},
    {"name": "Chocolate Chip Cookie", "description": "A classic cookie with chocolate chips.", "price": 2.50},
    {"name": "Lava Cake", "description": "Rich chocolate cake with molten center.", "price": 5.99},
    {"name": "Pumpkin pie", "description": "Spiced pie with pumpkin filling.", "price": 4.49},
    {"name": "Carrot Cake", "description": "Moist cake made with fresh carrots.", "price": 5.50},
    {"name": "Chocolate Mousse", "description": "Decadent chocolate dessert.", "price": 4.99},
    {"name": "Milkshake", "description": "Creamy milkshake in various flavors.", "price": 3.99},
    {"name": "Strawberry Shortcake", "description": "Light cake with strawberries and cream.", "price": 5.49},
    {"name": "Apple Pie", "description": "Classic pie with a spiced apple filling.", "price": 4.99},
    {"name": "Cheesecake", "description": "Creamy cheesecake with a graham cracker crust.", "price": 6.50},
    {"name": "Cupcake", "description": "Small cake designed to serve one person.", "price": 2.99},
    {"name": "Peach Cobbler", "description": "Baked dessert with peach filling.", "price": 4.99},
    {"name": "Tiramisu", "description": "Italian dessert with coffee, mascarpone, and cocoa.", "price": 6.49},
    {"name": "Banana Split", "description": "Ice cream dessert with bananas and toppings.", "price": 5.99},
    {"name": "Chocolate Brownie", "description": "Rich chocolate baked dessert.", "price": 3.99},
    {"name": "Flan", "description": "Creamy caramel custard dessert.", "price": 4.49},
    {"name": "Pistachio Gelato", "description": "Creamy Italian-style ice cream with pistachios.", "price": 4.49},
    {"name": "Vanilla IceCream", "description": "Classic ice cream flavor.", "price": 3.49}
]


sides = [
    {"name": "Chicken Wings", "description": "Crispy fried chicken wings with various sauces.", "price": 5.99},
    {"name": "Fried Rice", "description": "Stir-fried rice with vegetables and optional protein.", "price": 4.49},
    {"name": "Green Beans", "description": "Freshly steamed or sautéed green beans.", "price": 3.49},
    {"name": "Mozarella Sticks", "description": "Breaded mozzarella fried to perfection.", "price": 5.49},
    {"name": "Roasted Veggies", "description": "Assorted vegetables roasted with herbs.", "price": 4.99},
    {"name": "Corn on the Cob", "description": "Steamed or grilled corn with butter.", "price": 2.99},
    {"name": "Fries", "description": "Golden fried potato strips.", "price": 3.49},
    {"name": "Lo Mein", "description": "Stir-fried noodles with veggies and optional meat.", "price": 5.99},
    {"name": "Nachos", "description": "Tortilla chips with cheese and various toppings.", "price": 6.49},
    {"name": "Sweet Potato Fries", "description": "Fried sweet potato strips.", "price": 3.99},
    {"name": "Baked Potato", "description": "Baked potato with various fillings.", "price": 3.99},
    {"name": "Creamed Spinach", "description": "Spinach in a creamy sauce.", "price": 4.49},
    {"name": "Garden Salad", "description": "Fresh greens with various vegetables.", "price": 5.49},
    {"name": "Mac and Cheese", "description": "Creamy pasta with a cheese sauce.", "price": 5.99},
    {"name": "Onion Rings", "description": "Breaded and fried onion rings.", "price": 4.49},
    {"name": "Tater Tots", "description": "Fried grated potato bites.", "price": 4.49},
    {"name": "Breadsticks", "description": "Soft breadsticks with optional garlic or cheese.", "price": 3.99},
    {"name": "Edemame", "description": "Steamed young soybeans in the pod.", "price": 4.49},
    {"name": "Garlic Bread", "description": "Toasted bread with garlic and butter.", "price": 3.99},
    {"name": "Mashed Potatoes", "description": "Creamy mashed potatoes with optional gravy.", "price": 3.99},
    {"name": "Roasted Cauliflower", "description": "Cauliflower florets roasted with herbs.", "price": 4.49},
]

def create_menu_items(restaurant_id, type, items):
    return [MenuItem(restaurant_id=restaurant_id, name=item["name"], description=item["description"], type=type, price=item["price"]) for item in items]

def seed_menu_items():
    # 1. Initialize empty lists to collect all menu items and all menu item images.
    all_menu_items = []
    all_images = []

    # 2. Loop through numbers 1 to 50 (representing restaurant IDs).
    for restaurant_id in range(1, 51):
        # 3. For each restaurant ID, create menu items for each type (drink, entree, dessert, sides).
        # The resulting 'menu_items' is a combined list of all types of items for the current restaurant.
        menu_items = create_menu_items(restaurant_id, "drinks", drinks) + \
                     create_menu_items(restaurant_id, "entrees", entrees) + \
                     create_menu_items(restaurant_id, "desserts", desserts) + \
                     create_menu_items(restaurant_id, "sides", sides)

        # 4. Extend the 'all_menu_items' list with the items we just created for the current restaurant.
        all_menu_items.extend(menu_items)

        # 5. For each item in the 'menu_items' list for the current restaurant:
        for item in menu_items:
            # 6. Extract the item's type (e.g., drink, entree, etc.)
            # item_type = item.type
            item_type = item.type


            # 7. Check if the name of the item exists in our predefined image URLs for the respective type.
            if item.name in image_urls[item_type]:
                # 8. If it does, create an image instance for that menu item with the appropriate image URL.
                img_instance = MenuItemImg(menu_item_id=item.id, image_path=image_urls[item_type][item.name])

                # 9. Append this image instance to our 'all_images' list.
                all_images.append(img_instance)

    # 10. Add all the menu items we collected into the database session.
    db.session.add_all(all_menu_items)
    # 11. Flush the session to ensure all items are given an ID before we associate images.
    db.session.flush()
    # 12. Add all the image instances we collected into the database session.
    db.session.add_all(all_images)
    # 13. Commit the session to save everything to the database.
    db.session.commit()


def undo_menu_items():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.menu_items RESTART IDENTITY CASCADE;")
        db.session.execute(f"TRUNCATE table {SCHEMA}.menu_item_images RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM menu_items"))
        db.session.execute(text("DELETE FROM menu_item_images"))
    db.session.commit()
