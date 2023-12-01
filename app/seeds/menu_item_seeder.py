from sqlalchemy import text
from ..models import db, MenuItem, MenuItemImg, environment, SCHEMA
from random import randint

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
    {"name": "Chicken Parmesan", "description": "Breaded chicken with cheese and tomato sauce.", "price": 9.99},
    {"name": "Fish and Chips", "description": "Fried fish with crispy chips.", "price": 8.99},
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
# Define your menu item categories and their corresponding items
menu_categories = {
    'drinks': ["Cappuccino", "Gotham Red Wine", "Margarita", "Redbull", "Seven and Seven", "Sprite", "Gotham White Wine", "Lemonade", "Martini", "Root Beer", "Shirley Temple", "Coffee", "Gotham Beer", "Long Island Iced Tea", "Pepsi", "Rum and Coke", "Smoothie"],
    'entrees': ["Buffalo Chicken Sandwich", "Chicken Tenders", "Lasagna", "Philly Cheesesteak", "Spaghetti", "Chicken Fajita", "Fettuccine Alfredo", "Gyro", "Lobster", "Steak", "BBQ Ribs", "Chicken Parmesan", "Fish and Chips", "Hamburger", "Meatball Sandwich", "Shish Kebab", "Fish Tacos", "Pizza"],
    'desserts': ["Blueberry tart", "Chocolate Chip Cookie", "Lava Cake", "Pumpkin pie", "Carrot Cake", "Chocolate Mousse", "Milkshake", "Strawberry Shortcake", "Apple Pie", "Cheesecake", "Cupcake", "Peach Cobbler", "Tiramisu", "Banana Split", "Chocolate Brownie", "Flan", "Pistachio Gelato", "Vanilla IceCream"],
    'sides': ["Chicken Wings", "Fried Rice", "Green Beans", "Mozarella Sticks", "Roasted Veggies", "Corn on the Cob", "Fries", "Lo Mein", "Nachos", "Sweet Potato Fries", "Baked Potato", "Creamed Spinach", "Garden Salad", "Mac and Cheese", "Onion Rings", "Tater Tots", "Breadsticks", "Edemame", "Garlic Bread", "Mashed Potatoes", "Roasted Cauliflower"]
}

base_url = "https://flask3.s3.amazonaws.com/menu_item_images"

# Function to generate image URL

def generate_image_url(restaurant_id, category, item_name):
    # Special case for 'Coffee' where the folder name starts with a capital letter
    if item_name == "Coffee":
        item_name_formatted = "Coffee"
    else:
        item_name_formatted = item_name.replace(' ', '_').lower()

    image_number = ((restaurant_id - 1) * len(menu_categories[category]) + menu_categories[category].index(item_name)) % 5 + 1
    return f"{base_url}/{category}/{item_name_formatted}/img_{image_number}.jpeg"


# Function to create menu item objects
def create_menu_item(restaurant_id, item_details, category, image_url):
    new_menu_item = MenuItem(
        restaurant_id=restaurant_id,
        name=item_details['name'],
        description=item_details['description'],
        type=category,
        price=item_details['price']
    )
    db.session.add(new_menu_item)
    db.session.flush() # Flush to get the menu item ID

    new_image = MenuItemImg(
        menu_item_id=new_menu_item.id,
        image_path=image_url
    )
    db.session.add(new_image)

# Function to seed menu items and images
def seed_menu_items():
    restaurant_count = 50  # Number of restaurants
    menu_categories = {
        'drinks': drinks,
        'entrees': entrees,
        'desserts': desserts,
        'sides': sides
    }

    for restaurant_id in range(1, restaurant_count + 1):
        for category, items in menu_categories.items():
            for item in items:
                image_url = generate_image_url(restaurant_id, category, item['name'])
                create_menu_item(restaurant_id, item, category, image_url)

    db.session.commit() # Commit all changes at the end

# Function to undo menu items
def undo_menu_items():
    def table_exists(table_name):
        if environment == "production":
            query = f"SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '{SCHEMA}' AND table_name = '{table_name}');"
        else:
            query = f"SELECT EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='{table_name}');"
        result = db.engine.execute(query).scalar()
        return result

    if table_exists("menu_items"):
        if environment == "production":
            db.session.execute(f"TRUNCATE table {SCHEMA}.menu_items RESTART IDENTITY CASCADE;")
        else:
            db.session.execute(text("DELETE FROM menu_items"))
    if table_exists("menu_item_images"):
        if environment == "production":
            db.session.execute(f"TRUNCATE table {SCHEMA}.menu_item_images RESTART IDENTITY CASCADE;")
        else:
            db.session.execute(text("DELETE FROM menu_item_images"))
    db.session.commit()
