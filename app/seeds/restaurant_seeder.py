from app.models import db, Restaurant, environment, SCHEMA
from sqlalchemy.sql import text
from datetime import time
from random import choice, randint

menu_item_image_bases = [
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/buffalo_chicken_sandwich/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/chicken_tenders/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/lasagna/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/philly_cheesesteak/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/spaghetti/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/chicken_fajita/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/fettuccine_alfredo/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/gyro/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/lobster/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/steak/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/bbq_ribs/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/chicken_parmesean/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/fish_and_chips/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/hamburger/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/meatball_sandwich/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/shish_kebab/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/fish_tacos/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/pizza/img_",

     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/blueberry_tart/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/blueberry_tart/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/lava_cake/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/pumpkin_pie/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/carrot_cake/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/chocolate_mousse/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/milkshake/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/strawberry_shortcake/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/apple_pie/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/cheesecake/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/cupcake/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/peach_cobbler/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/tiramisu/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/banana_split/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/chocolate_brownie/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/flan/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/pistachio_gelato/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/vanilla_icecream/img_",

     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/chicken_wings/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/fried_rice/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/green_beans/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/mozarella_sticks/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/roasted_veggies/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/corn_on_the_cob/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/fries/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/lo_mein/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/nachos/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/sweet_potato_fries/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/baked_potato/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/creamed_spinach/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/garden_salad/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/mac_and_cheese/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/onion_rings/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/tater_tots/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/breadsticks/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/edemame/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/garlic_bread/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/mashed_potatoes/img_",
     f"https://flask3.s3.amazonaws.com/menu_item_images/sides/roasted_cauliflower/img_",
]

# latitude = "40.730610", longitude = ""

def seed_restaurants():
    restaurants = [
        Restaurant(owner_id=1, street_address="Wayne Manor 1", city="Upland", state="California", postal_code="91784", country="United States",  latitude = 34.1371,  longitude = -117.6599,  name="Alfred's Gourmet Dining", description="Savor exquisite dishes crafted by the legendary butler himself.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
        Restaurant(owner_id=1, street_address="Butler's Lane 1", city="Upland", state="California", postal_code="91786", country="United States",  latitude = 34.1371,  longitude = -117.6599,  name="Alfred's Fine Eats", description="Fine dining and impeccable service in Wayne Manor.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
        Restaurant(owner_id=2, street_address="Mad Love Street 5", city="Upland", state="California", postal_code="91785", country="United States",  latitude = 34.1371,  longitude = -117.6599,  name="Harley's Circus Grill", description="A chaotic dining experience with a touch of madness.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
        Restaurant(owner_id=2, street_address="Quinn Square 8", city="Upland", state="California", postal_code="91787", country="United States",  latitude = 34.1371,  longitude = -117.6599,  name="Harley's Hysterical Diner", description="Unleash your inner wild card and savor explosive flavors. Enjoy chaotic culinary delights inspired by Upland’s Queen of Anarchy in a whimsically themed setting.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
        Restaurant(owner_id=3, street_address="Acrobat Avenue 8", city="New York ", state="New York ", postal_code="10038", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Nightwing's Night Bites", description="A place for acrobats to dine in style.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
        Restaurant(owner_id=4, street_address="Chaos Court 0", city="New York ", state="New York ", postal_code="10014", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Joker's Juice Bar", description="Get ready to have a blast with the colorful and unpredictable beverages!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
        Restaurant(owner_id=5, street_address="Feline Alley 7", city="New York ", state="New York ", postal_code="10012", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Catwoman's Feline Feast", description="Elegant and sleek, this restaurant offers gourmet dishes, quick thefts not included.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
        Restaurant(owner_id=6, street_address="Iceberg Lounge 13", city="New York ", state="New York ", postal_code="10034", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Penguin's Seafood Soiree", description="Dine like royalty with New York 's shrewdest bird.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
        Restaurant(owner_id=7, street_address="Mystery Street 42", city="New York ", state="New York ", postal_code="10026", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Riddler's Enigma Eats", description="Solve culinary conundrums while you dine!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
        Restaurant(owner_id=8, street_address="Double-Dealing Drive 5", city="New York ", state="New York ", postal_code="10033", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Heads or Tails Tavern", description="Will your meal be good or bad? Leave it to chance!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
        Restaurant(owner_id=9, street_address="Subzero St 32", city="New York ", state="New York ", postal_code="10016", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Mr. Freeze's Chill Lounge", description="Cool down with ice-cold beverages and frozen delights in a sub-zero environment.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
        Restaurant(owner_id=10, street_address="Fear Farm 13", city="New York ", state="New York ", postal_code="10011", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Scarecrow's Straw Bistro", description="A rustic bistro where fear is the main ingredient. Not for the faint-hearted!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
    ]
    def get_random_image_url(base_url):
        return f"{base_url}{randint(1, 5)}.jpeg"
    
    for restaurant in restaurants:
      restaurant.banner_image_path = get_random_image_url(choice(menu_item_image_bases))

    db.session.add_all(restaurants)
    db.session.commit()

def undo_restaurants():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.restaurants RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM restaurants"))

    db.session.commit()



# from app.models import db, Restaurant, environment, SCHEMA
# from sqlalchemy.sql import text
# from datetime import time
# from random import choice, randint

# menu_item_image_bases = [
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/buffalo_chicken_sandwich/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/chicken_tenders/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/lasagna/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/philly_cheesesteak/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/spaghetti/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/chicken_fajita/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/fettuccine_alfredo/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/gyro/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/lobster/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/steak/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/bbq_ribs/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/chicken_parmesean/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/fish_and_chips/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/hamburger/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/meatball_sandwich/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/shish_kebab/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/fish_tacos/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/entrees/pizza/img_",

#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/blueberry_tart/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/blueberry_tart/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/lava_cake/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/pumpkin_pie/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/carrot_cake/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/chocolate_mousse/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/milkshake/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/strawberry_shortcake/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/apple_pie/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/cheesecake/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/cupcake/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/peach_cobbler/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/tiramisu/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/banana_split/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/chocolate_brownie/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/flan/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/pistachio_gelato/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/desserts/vanilla_icecream/img_",

#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/chicken_wings/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/fried_rice/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/green_beans/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/mozarella_sticks/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/roasted_veggies/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/corn_on_the_cob/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/fries/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/lo_mein/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/nachos/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/sweet_potato_fries/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/baked_potato/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/creamed_spinach/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/garden_salad/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/mac_and_cheese/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/onion_rings/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/tater_tots/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/breadsticks/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/edemame/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/garlic_bread/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/mashed_potatoes/img_",
#      f"https://flask3.s3.amazonaws.com/menu_item_images/sides/roasted_cauliflower/img_",
# ]

# # latitude = "40.730610", longitude = ""

# def seed_restaurants():
#     restaurants = [

#         Restaurant(owner_id=1, street_address="Wayne Manor 1", city="Upland", state="California", postal_code="91784", country="United States",  latitude = 34.1371,  longitude = -117.6599,  name="Alfred's Gourmet Dining", description="Savor exquisite dishes crafted by the legendary butler himself.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=1, street_address="Butler's Lane 1", city="Upland", state="California", postal_code="91786", country="United States",  latitude = 34.1371,  longitude = -117.6599,  name="Alfred's Fine Eats", description="Fine dining and impeccable service in Wayne Manor.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),

#         Restaurant(owner_id=1, street_address="Butler Way 3", city="New York ", state="New York ", postal_code="10009", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Alfred's Greenhouse Gourmet", description="Enjoy exquisite dining surrounded by rare and beautifully curated flora!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=1, street_address="Servitude Street 88", city="New York ", state="New York ", postal_code="10015", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="The Butler's Banquet", description="Indulge in a plethora of hearty and meticulously prepared meals, fit for the Wayne family!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=1, street_address="Elegant Avenue 25", city="New York ", state="New York ", postal_code="10017", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Pennyworth's Posh Café", description="Treat your taste buds to Alfred's eclectic and elegant menu, a symphony of flavors!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=1, street_address="Refinement Road 66", city="New York ", state="New York ", postal_code="10018", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Wayne Manor Grills", description="Ignite your senses with the smoky and fiery flavors, all prepared under Alfred's watchful eyes.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=1, street_address="Manor Lane 10", city="New York ", state="New York ", postal_code="10019", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Alfred's Afternoon Tea", description="Immerse yourself in the rich and bewildering array of teas, accompanied by Alfred's signature pastries.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=1, street_address="Valet Vale 8", city="New York ", state="New York ", postal_code="10020", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Pennyworth's Quick Platter", description="Experience the swift and stealthy takeout options, designed for the hurried and the hungry.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=1, street_address="Gourmet Grove 77", city="New York ", state="New York ", postal_code="10021", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Alfred's Culinary Magic", description="Be enchanted by Alfred's magical concoctions of pizza and meticulously crafted salads.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=1, street_address="Serving Lane 15", city="New York ", state="New York ", postal_code="10022", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Pennyworth's Night Bistro", description="Delight in nocturnal gourmet in an environment curated by the iconic butler himself.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=1, street_address="Cityscape Street 45", city="Metropolis", state="New York", postal_code="10023", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Metropolis Manor Munch", description="Savor the flavors of meticulously prepared superfoods and cuisine, all curated by Alfred.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=1, street_address="Culinary Court 29", city="New York ", state="New York ", postal_code="10025", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Butler's Brave Bites", description="Brace yourself for Alfred's spicy and bold creations, a true conquest of flavors!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=1, street_address="Chill Chamber 7", city="New York ", state="New York ", postal_code="10027", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Alfred's Frosty Confections", description="Relax with Alfred's specially crafted frozen delights and cool culinary specialties.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=2, street_address="Mad Love Street 5", city="Upland", state="California", postal_code="91785", country="United States",  latitude = 34.1371,  longitude = -117.6599,  name="Harley's Circus Grill", description="A chaotic dining experience with a touch of madness.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=2, street_address="Quinn Square 8", city="Upland", state="California", postal_code="91787", country="United States",  latitude = 34.1371,  longitude = -117.6599,  name="Harley's Hysterical Diner", description="Unleash your inner wild card and savor explosive flavors. Enjoy chaotic culinary delights inspired by Upland’s Queen of Anarchy in a whimsically themed setting.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),

#         Restaurant(owner_id=3, street_address="Acrobat Avenue 8", city="New York ", state="New York ", postal_code="10038", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Nightwing's Night Bites", description="A place for acrobats to dine in style.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=4, street_address="Chaos Court 0", city="New York ", state="New York ", postal_code="10014", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Joker's Juice Bar", description="Get ready to have a blast with the colorful and unpredictable beverages!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=4, street_address="Chaos Court 8", city="New York ", state="New York ", postal_code="10030", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Joker's Ha-Ha Hut", description="Laugh and dine at the craziest restaurant in town!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=4, street_address="Joker's Funhouse 11", city="New York ", state="New York ", postal_code="10042", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Joker's Laugh Lounge", description="Where the joke's on you, and the food's on the house.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=5, street_address="Feline Alley 7", city="New York ", state="New York ", postal_code="10012", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Catwoman's Feline Feast", description="Elegant and sleek, this restaurant offers gourmet dishes, quick thefts not included.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=5, street_address="Feline Alley 12", city="New York ", state="New York ", postal_code="10031", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Catwoman's Catnip Cafe", description="Purr-fectly delicious dishes for cat lovers.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=5, street_address="Feline Alley 4", city="New York ", state="New York ", postal_code="10043", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Catwoman's Cat Cafe", description="Purr-fectly brewed coffee and cunning pastries.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=6, street_address="Iceberg Lounge 13", city="New York ", state="New York ", postal_code="10034", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Penguin's Seafood Soiree", description="Dine like royalty with New York 's shrewdest bird.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=6, street_address="Iceberg Lounge 9", city="New York ", state="New York ", postal_code="10046", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Penguin's Fish and Chips", description="Feast on the finest seafood in the city, with a side of underworld charm.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=6, street_address="Cobblepot Lane 11", city="New York ", state="New York ", postal_code="10101", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Penguin's Umbrella Eats", description="Indulge in an array of dishes so good, it's criminal. Dive into villainous flavors and explore the decadent menu inspired by New York 's master of fowl play.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=7, street_address="Mystery Street 42", city="New York ", state="New York ", postal_code="10026", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Riddler's Enigma Eats", description="Solve culinary conundrums while you dine!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=7, street_address="Riddle Lane 2", city="New York ", state="New York ", postal_code="10044", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="The Riddler's Enigma Eats", description="Puzzle your taste buds with enigmatic dishes.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=7, street_address="Enigma Blvd 42", city="New York ", state="New York ", postal_code="10008", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Riddler's Riddle Room", description="Solve riddles to get your food in this mysterious, enigma-filled diner.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=8, street_address="Duality Dr 50", city="New York ", state="New York ", postal_code="10010", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Two-Face's Coin Toss Tavern", description="Experience the duality, make decisions by a coin toss, and enjoy the thematic drinks and meals!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=8, street_address="Double-Dealing Drive 5", city="New York ", state="New York ", postal_code="10033", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Heads or Tails Tavern", description="Will your meal be good or bad? Leave it to chance!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=8, street_address="Two-Face Drive 7", city="New York ", state="New York ", postal_code="10047", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Two-Face's Diner", description="A coin toss decides your meal's fate: delicious or daring?", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=9, street_address="Subzero St 32", city="New York ", state="New York ", postal_code="10016", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Mr. Freeze's Chill Lounge", description="Cool down with ice-cold beverages and frozen delights in a sub-zero environment.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),

#         Restaurant(owner_id=9, street_address="Cold Storage 12", city="New York ", state="New York ", postal_code="10045", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Mr. Freeze's Icy Delights", description="Chill out with frozen treats and frosty beverages.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=10, street_address="Fear Farm 13", city="New York ", state="New York ", postal_code="10011", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Scarecrow's Straw Bistro", description="A rustic bistro where fear is the main ingredient. Not for the faint-hearted!", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),

#         Restaurant(owner_id=10, street_address="Fear Street 4", city="New York ", state="New York ", postal_code="10048", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Scarecrow's Haunted Cafe", description="Dine in your deepest fears and darkest nightmares.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=11, street_address="Dawes Lane 6", city="New York ", state="New York ", postal_code="10049", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Rachel's Bistro", description="Elegant dining with a touch of New York 's grace.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=11, street_address="Dawes Lane 45", city="New York ", state="New York ", postal_code="10028", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Rachel's Justice Bistro", description="A place that honors the spirit of Rachel Dawes, offering a selection of fair, just, and ethically sourced dishes to remind us of the values she stood for.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=11, street_address="Harbor View 22", city="New York ", state="New York ", postal_code="10029", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Dawes Harbor Cafe", description="Overlooking the harbor, Rachel's Harbor Cafe serves fresh, seasonal, and sustainable seafood dishes, a nod to her tireless work in protecting New York 's harbor district.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=12, street_address="Innovation Avenue 21", city="New York ", state="New York ", postal_code="10029", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Lucius's Techno Bistro", description="Cutting-edge cuisine for the tech-savvy heroes.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=12, street_address="Fox Lane 8", city="New York ", state="New York ", postal_code="10050", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Lucius's Tech Cafe", description="A tech-savvy dining experience with cutting-edge cuisine.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=13, street_address="Oracle's Insight 9", city="New York ", state="New York ", postal_code="10035", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Oracle's Virtual Cafe", description="Sip and byte your way through the digital world.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=13, street_address="Oracle Plaza 2", city="New York ", state="New York ", postal_code="10051", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Oracle's Cyber Cafe", description="Connect with the digital world while savoring delicious bites.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=14, street_address="Wayne Manor 2", city="New York ", state="New York ", postal_code="10032", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Tim's Batwing Bistro", description="A dining experience inspired by the Dark Knight's sidekick.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=14, street_address="Drake Street 1", city="New York ", state="New York ", postal_code="10052", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Tim's Comic Cafe", description="Comic books, coffee, and delicious treats for every hero.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=15, street_address="Batty Lane 6", city="New York ", state="New York ", postal_code="10039", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="RedHood's Roastery", description="Serving up a blend of justice and great coffee.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=15, street_address="Red Hood Alley 5", city="New York ", state="New York ", postal_code="10053", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Red Hood's Hideout", description="A haven for anti-heroes with a taste for great food and justice.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=16, street_address="Demon's Lair 7", city="New York ", state="New York ", postal_code="10040", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Damian's Ninja Noodles", description="Exquisite noodles crafted by the League of Assassins.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=16, street_address="Wayne Manor 1", city="New York ", state="New York ", postal_code="10054", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Damian's Gourmet Grub", description="Fine dining fit for the youngest heir of Wayne Enterprises.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=17, street_address="Batty Lane 6", city="New York ", state="New York ", postal_code="10041", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Batgirl's Bat Bites", description="Fueling vigilantes one bite at a time.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#         Restaurant(owner_id=17, street_address="Gordon Avenue 3", city="New York ", state="New York ", postal_code="10055", country="United States",  latitude = 40.730610,  longitude = -73.935242,  name="Batgirl's Diner", description="Superhero-inspired snacks for the crime-fighter in you.", opening_time=time(hour=10), closing_time=time(hour=20, minute=30), food_type="American"),
#     ]
#     def get_random_image_url(base_url):
#         return f"{base_url}{randint(1, 5)}.jpeg"

#     # for restaurant in restaurants:
#     #     db.session.add(restaurant)
#     for restaurant in restaurants:
#       restaurant.banner_image_path = get_random_image_url(choice(menu_item_image_bases))

#     db.session.add_all(restaurants)
#     db.session.commit()

# def undo_restaurants():
#     if environment == "production":
#         db.session.execute(f"TRUNCATE table {SCHEMA}.restaurants RESTART IDENTITY CASCADE;")
#     else:
#         db.session.execute(text("DELETE FROM restaurants"))

#     db.session.commit()
