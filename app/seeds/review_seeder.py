from ..models import db, Review, environment, SCHEMA
from sqlalchemy import text



def seed_reviews():
    reviews_list = [
        {"restaurant_id":1, "user_id":1, "review":"The service was as meticulous as I am with Master Wayne's suits. Quite splendid.", "stars":4},
        {"restaurant_id":1, "user_id":2, "review":"Puddin' would have loved the desserts here! Teehee!", "stars":5},
        {"restaurant_id":1, "user_id":3, "review":"Great spot for a quick bite after patrol. Felt right at home.", "stars":4},

        {"restaurant_id":2, "user_id":1, "review":"Reminds me of the lavish dinners in Wayne Manor. Top-notch.", "stars":5},
        {"restaurant_id":2, "user_id":2, "review":"Not chaotic enough for my taste, but the food's not bad.", "stars":3},
        {"restaurant_id":2, "user_id":3, "review":"Had a quiet corner perfect for keeping an eye on the entrance. Food was great too.", "stars":4},

        {"restaurant_id":3, "user_id":1, "review":"A bit too noisy, but the tea was brewed perfectly.", "stars":4},
        {"restaurant_id":3, "user_id":2, "review":"Oh, the colors! Loved the vibrant atmosphere. More candy, please!", "stars":5},
        {"restaurant_id":3, "user_id":3, "review":"They've got a rooftop seating. Perfect view for any activities.", "stars":5},

        {"restaurant_id":4, "user_id":1, "review":"Their soup of the day took me back to London.", "stars":4},
        {"restaurant_id":4, "user_id":2, "review": "Had a blast with their musical chairs! Food's yum too.", "stars":5},
        {"restaurant_id":4, "user_id":3, "review": "Lighting was a bit too bright for my taste. Food was decent.", "stars":3},

        {"restaurant_id":5, "user_id":1, "review": "Their classic English breakfast was heartwarming.", "stars":4},
        {"restaurant_id":5, "user_id":2, "review": "Fun and lively! Could use more sprinkles though.", "stars":4},
        {"restaurant_id":5, "user_id":3, "review": "Convenient location for those late-night stakeouts.", "stars":3},

        {"restaurant_id":6, "user_id":1, "review": "The wine selection is nothing short of exquisite.", "stars":5},
        {"restaurant_id":6, "user_id":2, "review": "Meh, needed more pizzazz! But the pie was good.", "stars":3},
        {"restaurant_id":6, "user_id":3, "review": "Relaxing ambiance. Could use this as a good meetup spot.", "stars":4},

        {"restaurant_id":7, "user_id":1, "review": "The ambiance reminds me of the old days, quite nostalgic.", "stars":4},
        {"restaurant_id":7, "user_id":2, "review": "A rollercoaster of flavors! Whee!", "stars":5},
        {"restaurant_id":7, "user_id":3, "review": "A decent place to chill. The espresso shot was on point.", "stars":4},

        {"restaurant_id":8, "user_id":1, "review": "Subtle and refined flavors. Quite the culinary experience.", "stars":5},
        {"restaurant_id":8, "user_id":2, "review": "Boop-oop-a-doop! I liked the carnival theme!", "stars":5},
        {"restaurant_id":8, "user_id":3, "review": "Good rooftop views, and the food wasn't half bad.", "stars":4},

        {"restaurant_id":9, "user_id":1, "review": "Reminded me of the cafes in Paris. Delightful!", "stars":5},
        {"restaurant_id":9, "user_id":2, "review": "Could use a mallet on their menu, but overall fun!", "stars":4},
        {"restaurant_id":9, "user_id":3, "review": "Fast service. Got my meal and was out in a flash.", "stars":4},

        {"restaurant_id":10, "user_id":1, "review": "A serene experience, away from the chaos of Gotham.", "stars":4},
        {"restaurant_id":10, "user_id":2, "review": "Wacky interiors! And oh, those cupcakes!", "stars":5},
        {"restaurant_id":10, "user_id":3, "review": "Solid meal options. Keeps my energy up for the night.", "stars":4},

        {"restaurant_id":11, "user_id":1, "review": "A culinary orchestra of flavors. Impressed.", "stars":5},
        {"restaurant_id":11, "user_id":2, "review": "Twirls and swirls! Loved their ice cream selection.", "stars":5},
        {"restaurant_id":11, "user_id":3, "review": "Bit crowded, but a decent place to hang with the crew.", "stars":3},

        {"restaurant_id":12, "user_id":1, "review": "An exquisite fusion of Eastern and Western flavors.", "stars":5},
        {"restaurant_id":12, "user_id":2, "review": "Hee-hee! Their live band was just my kind of crazy!", "stars":5},
        {"restaurant_id":12, "user_id":3, "review": "Perfectly balanced meals. Great for staying in shape.", "stars":4},
    ]

    for review_data in reviews_list:
        review = Review(restaurant_id=review_data["restaurant_id"], user_id=review_data["user_id"], review=review_data["review"], stars=review_data["stars"])
        db.session.add(review)

    db.session.commit()

def undo_reviews():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.reviews RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM reviews"))
    db.session.commit()



# from ..models import db, Review, environment, SCHEMA
# from sqlalchemy import text



# def seed_reviews():
#     reviews_list = [
#         {"restaurant_id":1, "user_id":1, "review":"The service was as meticulous as I am with Master Wayne's suits. Quite splendid.", "stars":4},
#         {"restaurant_id":1, "user_id":2, "review":"Puddin' would have loved the desserts here! Teehee!", "stars":5},
#         {"restaurant_id":1, "user_id":3, "review":"Great spot for a quick bite after patrol. Felt right at home.", "stars":4},

#         {"restaurant_id":2, "user_id":1, "review":"Reminds me of the lavish dinners in Wayne Manor. Top-notch.", "stars":5},
#         {"restaurant_id":2, "user_id":2, "review":"Not chaotic enough for my taste, but the food's not bad.", "stars":3},
#         {"restaurant_id":2, "user_id":3, "review":"Had a quiet corner perfect for keeping an eye on the entrance. Food was great too.", "stars":4},

#         {"restaurant_id":3, "user_id":1, "review":"A bit too noisy, but the tea was brewed perfectly.", "stars":4},
#         {"restaurant_id":3, "user_id":2, "review":"Oh, the colors! Loved the vibrant atmosphere. More candy, please!", "stars":5},
#         {"restaurant_id":3, "user_id":3, "review":"They've got a rooftop seating. Perfect view for any activities.", "stars":5},

#         {"restaurant_id":4, "user_id":1, "review":"Their soup of the day took me back to London.", "stars":4},
#         {"restaurant_id":4, "user_id":2, "review": "Had a blast with their musical chairs! Food's yum too.", "stars":5},
#         {"restaurant_id":4, "user_id":3, "review": "Lighting was a bit too bright for my taste. Food was decent.", "stars":3},

#         {"restaurant_id":5, "user_id":1, "review": "Their classic English breakfast was heartwarming.", "stars":4},
#         {"restaurant_id":5, "user_id":2, "review": "Fun and lively! Could use more sprinkles though.", "stars":4},
#         {"restaurant_id":5, "user_id":3, "review": "Convenient location for those late-night stakeouts.", "stars":3},

#         {"restaurant_id":6, "user_id":1, "review": "The wine selection is nothing short of exquisite.", "stars":5},
#         {"restaurant_id":6, "user_id":2, "review": "Meh, needed more pizzazz! But the pie was good.", "stars":3},
#         {"restaurant_id":6, "user_id":3, "review": "Relaxing ambiance. Could use this as a good meetup spot.", "stars":4},

#         {"restaurant_id":7, "user_id":1, "review": "The ambiance reminds me of the old days, quite nostalgic.", "stars":4},
#         {"restaurant_id":7, "user_id":2, "review": "A rollercoaster of flavors! Whee!", "stars":5},
#         {"restaurant_id":7, "user_id":3, "review": "A decent place to chill. The espresso shot was on point.", "stars":4},

#         {"restaurant_id":8, "user_id":1, "review": "Subtle and refined flavors. Quite the culinary experience.", "stars":5},
#         {"restaurant_id":8, "user_id":2, "review": "Boop-oop-a-doop! I liked the carnival theme!", "stars":5},
#         {"restaurant_id":8, "user_id":3, "review": "Good rooftop views, and the food wasn't half bad.", "stars":4},

#         {"restaurant_id":9, "user_id":1, "review": "Reminded me of the cafes in Paris. Delightful!", "stars":5},
#         {"restaurant_id":9, "user_id":2, "review": "Could use a mallet on their menu, but overall fun!", "stars":4},
#         {"restaurant_id":9, "user_id":3, "review": "Fast service. Got my meal and was out in a flash.", "stars":4},

#         {"restaurant_id":10, "user_id":1, "review": "A serene experience, away from the chaos of Gotham.", "stars":4},
#         {"restaurant_id":10, "user_id":2, "review": "Wacky interiors! And oh, those cupcakes!", "stars":5},
#         {"restaurant_id":10, "user_id":3, "review": "Solid meal options. Keeps my energy up for the night.", "stars":4},

#         {"restaurant_id":11, "user_id":1, "review": "A culinary orchestra of flavors. Impressed.", "stars":5},
#         {"restaurant_id":11, "user_id":2, "review": "Twirls and swirls! Loved their ice cream selection.", "stars":5},
#         {"restaurant_id":11, "user_id":3, "review": "Bit crowded, but a decent place to hang with the crew.", "stars":3},

#         {"restaurant_id":12, "user_id":1, "review": "An exquisite fusion of Eastern and Western flavors.", "stars":5},
#         {"restaurant_id":12, "user_id":2, "review": "Hee-hee! Their live band was just my kind of crazy!", "stars":5},
#         {"restaurant_id":12, "user_id":3, "review": "Perfectly balanced meals. Great for staying in shape.", "stars":4},

#         {"restaurant_id":13, "user_id":1, "review": "Simple, yet elegant. Reminds me of home.", "stars":4},
#         {"restaurant_id":13, "user_id":2, "review": "Could use a bit more chaos, but the food was explosive!", "stars":4},
#         {"restaurant_id":13, "user_id":3, "review": "Diverse menu. Something for every kind of night out.", "stars":4},

#         {"restaurant_id":14, "user_id":1, "review": "A delightful gourmet experience. Felt like a trip around the world.", "stars":5},
#         {"restaurant_id":14, "user_id":2, "review": "So many shiny things! And oh, the cakes were good too.", "stars":5},
#         {"restaurant_id":14, "user_id":3, "review": "Nice and quiet. Perfect for some downtime after action.", "stars":4},

#         {"restaurant_id":15, "user_id":1, "review": "Their selection of teas is unparalleled. A comforting experience.", "stars":5},
#         {"restaurant_id":15, "user_id":2, "review": "Bright, colorful, and sparkly! Just like moi!", "stars":5},
#         {"restaurant_id":15, "user_id":3, "review": "Healthy options. Keeps me agile and ready.", "stars":4},

#         {"restaurant_id":16, "user_id":1, "review": "A fine dining experience reminiscent of European elegance.", "stars":5},
#         {"restaurant_id":16, "user_id":2, "review": "Boom! Pow! Their spicy dishes packed a punch!", "stars":4},
#         {"restaurant_id":16, "user_id":3, "review": "A good mix of protein-packed dishes. Excellent for training.", "stars":4},

#         {"restaurant_id":17, "user_id":1, "review": "Quite the cozy spot with a vintage touch. Lovely.", "stars":4},
#         {"restaurant_id":17, "user_id":2, "review": "Playful and quirky! Their dessert menu was a riot!", "stars":5},
#         {"restaurant_id":17, "user_id":3, "review": "Open space, easy exits. And the food's great too.", "stars":4},

#         {"restaurant_id":18, "user_id":1, "review": "Top-tier service and a delightful culinary presentation.", "stars":5},
#         {"restaurant_id":18, "user_id":2, "review": "More sprinkles! But the juggling waiter was fun.", "stars":4},
#         {"restaurant_id":18, "user_id":3, "review": "Comfort food that hits the spot. Just what I needed.", "stars":4},

#         {"restaurant_id":19, "user_id":1, "review": "Their afternoon tea set is second to none.", "stars":5},
#         {"restaurant_id":19, "user_id":2, "review": "Pop! Bang! Zing! Loved the sizzlers!", "stars":5},
#         {"restaurant_id":19, "user_id":3, "review":"Feels like a place where you can just be yourself. Good vibes.", "stars":4},

#         {"restaurant_id":20, "user_id":1, "review":"Perhaps a bit too modern for my old taste, but the cuisine is impeccable.", "stars":4},
#         {"restaurant_id":20, "user_id":2, "review":"Wish they had a bigger dessert menu, but the ambiance was fun!", "stars":4},
#         {"restaurant_id":20, "user_id":3, "review":"Solid place to grab a meal. Would come back.", "stars":4},

#         {"restaurant_id":21, "user_id":1, "review":"A bit too avant-garde for my liking, but impeccably presented dishes.", "stars":3},
#         {"restaurant_id":21, "user_id":2, "review":"Hee hee! Their funky drinks were something else!", "stars":4},
#         {"restaurant_id":21, "user_id":3, "review":"A bit fancy, but the food was top-notch.", "stars":4},

#         {"restaurant_id":22, "user_id":1, "review":"The chefs truly understand the essence of traditional cooking.", "stars":5},
#         {"restaurant_id":22, "user_id":2, "review":"More glitter, please! But the burgers were to die for.", "stars":4},
#         {"restaurant_id":22, "user_id":3, "review":"Liked their quick service. Ideal for a quick refuel.", "stars":4},

#         {"restaurant_id":23, "user_id":1, "review":"A lovely establishment reminiscent of countryside inns.", "stars":4},
#         {"restaurant_id":23, "user_id":2, "review":"Teehee! Their fun-themed nights are a blast!", "stars":5},
#         {"restaurant_id":23, "user_id":3, "review":"The outdoor seating is great for people-watching.", "stars":4},

#         {"restaurant_id":24, "user_id":1, "review":"The seafood selection was exquisite. Very fresh.", "stars":5},
#         {"restaurant_id":24, "user_id":2, "review":"I'd prefer more pinks and reds, but the pie! Yum!", "stars":4},
#         {"restaurant_id":24, "user_id":3, "review":"Had a hearty meal. Would recommend the steak.", "stars":4},

#         {"restaurant_id":25, "user_id":1, "review":"The sommelier's choices were impeccable.", "stars":5},
#         {"restaurant_id":25, "user_id":2, "review":"Not enough fireworks in their dishes, but tasty!", "stars":3},
#         {"restaurant_id":25, "user_id":3, "review":"Good spot to discuss strategies with the team.", "stars":4},

#         {"restaurant_id":26, "user_id":1, "review":"The dessert menu took me on a trip down memory lane.", "stars":5},
#         {"restaurant_id":26, "user_id":2, "review":"Pop, fizz, and sparkle! Loved their soda selection.", "stars":5},
#         {"restaurant_id":26, "user_id":3, "review":"Quick bites perfect for the on-the-go lifestyle.", "stars":4},

#         {"restaurant_id":27, "user_id":1, "review":"The live piano performance added a touch of class.", "stars":4},
#         {"restaurant_id":27, "user_id":2, "review":"Dance floor + snacks : Perfect evening!", "stars":5},
#         {"restaurant_id":27, "user_id":3, "review":"A mix of casual and classy. Liked the balance.", "stars":4},

#         {"restaurant_id":28, "user_id":1, "review":"An ambiance that takes one back to the glory days.", "stars":5},
#         {"restaurant_id":28, "user_id":2, "review":"More toys would be fun, but the candy was delish!", "stars":4},
#         {"restaurant_id":28, "user_id":3, "review":"The salad bar was diverse and fresh. Kudos!", "stars":4},

#         {"restaurant_id":29, "user_id":1, "review":"Their fusion dishes are a treat for the taste buds.", "stars":4},
#         {"restaurant_id":29, "user_id":2, "review":"Twisty, twirly, fun desserts! More, please!", "stars":5},
#         {"restaurant_id":29, "user_id":3, "review":"The lighting set the mood right. And great food to boot.", "stars":4},

#         {"restaurant_id":30, "user_id":1, "review":"An elegant evening guaranteed. Top-tier service.", "stars":5},
#         {"restaurant_id":30, "user_id":2, "review":"Loved the quirky interiors! And the jello!", "stars":5},
#         {"restaurant_id":30, "user_id":3, "review":"Stealthy corner spots and good food. Win-win.", "stars":4},

#         {"restaurant_id":31, "user_id":1, "review":"The tapas here are reminiscent of my travels to Spain.", "stars":4},
#         {"restaurant_id":31, "user_id":2, "review":"Whoopee! The dance performances added to the dining experience.", "stars":5},
#         {"restaurant_id":31, "user_id":3, "review":"Good portion sizes. Fuel up before the mission.", "stars":4},

#         {"restaurant_id":32, "user_id":1, "review":"The wine pairing was impeccable. A treat for the senses.", "stars":5},
#         {"restaurant_id":32, "user_id":2, "review":"Bright lights and fun drinks! My kinda place.", "stars":5},
#         {"restaurant_id":32, "user_id":3, "review":"Efficient and quiet. Can strategize while dining.", "stars":4},

#         {"restaurant_id":33, "user_id":1, "review":"The sushi chef is a master of his craft.", "stars":5},
#         {"restaurant_id":33, "user_id":2, "review":"More glittery sushi rolls, please! But oh, the taste!", "stars":4},
#         {"restaurant_id":33, "user_id":3, "review":"Healthy options, keeps me in top form.", "stars":4},

#         {"restaurant_id":34, "user_id":1, "review":"The pastries are as delightful as an English morning.", "stars":5},
#         {"restaurant_id":34, "user_id":2, "review":"Twirl and spin! Loved the live music and cake.", "stars":5},
#         {"restaurant_id":34, "user_id":3, "review":"Quiet nooks to relax and enjoy the brew.", "stars":4},

#         {"restaurant_id":35, "user_id":1, "review":"The handcrafted cocktails are the highlight.", "stars":5},
#         {"restaurant_id":35, "user_id":2, "review":"Fireworks and fizzes! What an exciting menu!", "stars":5},
#         {"restaurant_id":35, "user_id":3, "review":"A great selection of protein dishes. Keeps me going.", "stars":4},

#         {"restaurant_id":36, "user_id":1, "review":"The truffles here are second to none.", "stars":5},
#         {"restaurant_id":36, "user_id":2, "review":"Bouncy and bubbly! Loved the atmosphere.", "stars":4},
#         {"restaurant_id":36, "user_id":3, "review":"High-quality ingredients make for a great meal.", "stars":4},

#         {"restaurant_id":37, "user_id":1, "review":"Every dish tells a story. An epicurean journey.", "stars":5},
#         {"restaurant_id":37, "user_id":2, "review":"Swoosh and splash! Their water-themed night was a blast.", "stars":5},
#         {"restaurant_id":37, "user_id":3, "review":"Plenty of greens and lean meats. Ideal.", "stars":4},

#         {"restaurant_id":38, "user_id":1, "review":"Their caviar selection is world-class.", "stars":5},
#         {"restaurant_id":38, "user_id":2, "review":"Wish there was a slide, but the food made up for it!", "stars":4},
#         {"restaurant_id":38, "user_id":3, "review":"A discreet spot with outstanding dishes.", "stars":4},

#         {"restaurant_id":39, "user_id":1, "review":"The chef's tasting menu was a revelation.", "stars":5},
#         {"restaurant_id":39, "user_id":2, "review":"Zap! Pow! Their spicy noodles are electrifying!", "stars":5},
#         {"restaurant_id":39, "user_id":3, "review":"The balance of flavors is just right. Keeps the senses sharp.", "stars":4},

#         {"restaurant_id":40, "user_id":1, "review":"A gastronomic wonderland. Truly a delight.", "stars":5},
#         {"restaurant_id":40, "user_id":2, "review":"Rollercoaster of tastes and textures! Wee!", "stars":5},
#         {"restaurant_id":40, "user_id":3, "review":"Prime spot for recon and food both.", "stars":4},

#         {"restaurant_id":41, "user_id":1, "review":"A taste of authentic Mediterranean cuisine. A pleasant surprise.", "stars":4},
#         {"restaurant_id":41, "user_id":2, "review":"Juggling olives and twirling pasta! Such a festive mood.", "stars":5},
#         {"restaurant_id":41, "user_id":3, "review":"Nutritious dishes that don't compromise on flavor.", "stars":4},

#         {"restaurant_id":42, "user_id":1, "review":"The aged cheeses here remind me of the old European charm.", "stars":5},
#         {"restaurant_id":42, "user_id":2, "review":"Whee! The pizza spinning show was exhilarating!", "stars":5},
#         {"restaurant_id":42, "user_id":3, "review":"Carb-rich menu. Good for an energy boost.", "stars":4},

#         {"restaurant_id":43, "user_id":1, "review":"The coffee brews are sourced from the finest beans.", "stars":5},
#         {"restaurant_id":43, "user_id":2, "review":"More froth, more fun! Their lattes are a treat.", "stars":4},
#         {"restaurant_id":43, "user_id":3, "review":"A good vantage point and a strong brew. Ideal combination.", "stars":4},

#         {"restaurant_id":44, "user_id":1, "review":"Their seafood platter is fresh from the ocean.", "stars":5},
#         {"restaurant_id":44, "user_id":2, "review":"Splash and dash! Loved the marine-themed night.", "stars":5},
#         {"restaurant_id":44, "user_id":3, "review":"High in Omega-3. Perfect for brain and brawn.", "stars":4},

#         {"restaurant_id":45, "user_id":1, "review":"The sommelier's recommendations were on point.", "stars":5},
#         {"restaurant_id":45, "user_id":2, "review":"Pop the cork and let's dance! Vivacious atmosphere.", "stars":5},
#         {"restaurant_id":45, "user_id":3, "review":"Balanced meals with a good range of wine. Ideal for a night out.", "stars":4},

#         {"restaurant_id":46, "user_id":1, "review":"The desserts are both delicate and rich. A fine balance.", "stars":5},
#         {"restaurant_id":46, "user_id":2, "review":"Spin, twirl, and dessert whirl! A carnival of sweetness.", "stars":4},
#         {"restaurant_id":46, "user_id":3, "review":"Sweet treats that keep the spirits high.", "stars":4},

#         {"restaurant_id":47, "user_id":1, "review":"The charcuterie board was a symphony of flavors.", "stars":5},
#         {"restaurant_id":47, "user_id":2, "review":"Jazz and cheese, please! What a combination.", "stars":5},
#         {"restaurant_id":47, "user_id":3, "review":"Good protein options and easy access. Will return.", "stars":4},

#         {"restaurant_id":48, "user_id":1, "review":"The vegan options are crafted with care.", "stars":5},
#         {"restaurant_id":48, "user_id":2, "review":"Green, clean, and oh so fun! The plant-based menu rocks.", "stars":5},
#         {"restaurant_id":48, "user_id":3, "review":"Healthy and delicious. Keeps me agile.", "stars":4},

#         {"restaurant_id":49, "user_id":1, "review":"The dishes evoke memories of my travels in Asia.", "stars":5},
#         {"restaurant_id":49, "user_id":2, "review":"Bam! Pow! The spices hit just right.", "stars":5},
#         {"restaurant_id":49, "user_id":3, "review":"Variety of cuisines. Keeps things interesting.", "stars":4},

#         {"restaurant_id":50, "user_id":1, "review":"The gourmet burger here is a class apart.", "stars":5},
#         {"restaurant_id":50, "user_id":2, "review":"Flip, flop, and hop! Burger nights are the best.", "stars":5},
#         {"restaurant_id":50, "user_id":3, "review":"Quick bites that pack a punch. Energizing.", "stars":4}
#     ]

#     for review_data in reviews_list:
#         review = Review(restaurant_id=review_data["restaurant_id"], user_id=review_data["user_id"], review=review_data["review"], stars=review_data["stars"])
#         db.session.add(review)

#     db.session.commit()




# def undo_reviews():
#     if environment == "production":
#         db.session.execute(f"TRUNCATE table {SCHEMA}.reviews RESTART IDENTITY CASCADE;")
#     else:
#         db.session.execute(text("DELETE FROM reviews"))
#     db.session.commit()
