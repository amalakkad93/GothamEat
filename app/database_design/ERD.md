# Entity Relationship Diagram (ERD) Explanations

The following sections explain the structure and relationships between entities within the system. Each table represents an entity and is connected to others via primary (PK) and foreign keys (FK). Primary keys are unique identifiers for records in their respective tables, while foreign keys create links between tables, establishing relationships and allowing for complex queries.

---
## User
Represents the user of the platform. They can be a customer, a restaurant owner, or both.
- **id** (PK)
- first_name: varchar
- last_name: varchar
- username: varchar (Unique)
- email: varchar (Unique)
- hashed_password: varchar

---

## Favorites
Represents a user's favorite restaurants. The `user_id` and `restaurant_id` are foreign keys referring to the User and Restaurant tables, respectively, establishing which restaurants a user has marked as favorites.
- **id** (PK)
- user_id (FK -> User)
- restaurant_id (FK -> Restaurant)
- created_at: datetime
- updated_at: datetime

---
## Restaurant
Each restaurant is owned by a user. The `owner_id` establishes a foreign key relationship with the User table. This means each restaurant is associated with a user (the owner).
- **id** (PK)
- owner_id (FK -> User)
- banner_image_path: varchar
- street_address: varchar
- city: varchar
- state: varchar
- postal_code: varchar
- country: varchar
- name: varchar
- description: Text
- opening_time: Time
- closing_time: Time

---

## Review
Users can leave reviews for restaurants. The `user_id` and `restaurant_id` are foreign keys referring to the User and Restaurant tables, respectively. This establishes which user wrote the review and for which restaurant.
- **id** (PK)
- user_id (FK -> User)
- restaurant_id (FK -> Restaurant)
- review: Text
- stars: float

---

## MenuItem
Represents the individual items offered by a restaurant. The `restaurant_id` is a foreign key to the Restaurant table, linking each menu item to a specific restaurant.
- **id** (PK)
- restaurant_id (FK -> Restaurant)
- name: varchar
- description: Text
- type: varchar
- price: float

---

## MenuItemImg
Stores images related to menu items. The `menu_item_id` is a foreign key that links the image to a particular MenuItem.
- **id** (PK)
- menu_item_id (FK -> MenuItem)
- image_path: varchar

---

## Order
Represents an order placed by a user. The `user_id` is a foreign key linking the order to a user.
- **id** (PK)
- user_id (FK -> User)
- total_price: float
- status: varchar
- created_at: timestamp
- updated_at: timestamp

---

## OrderItem
Represents individual menu items within an order. It contains `menu_item_id` and `order_id` as foreign keys linking to the MenuItem and Order tables, respectively.
- **id** (PK)
- menu_item_id (FK -> MenuItem)
- order_id (FK -> Order)
- quantity: int

---

## ShoppingCart
Represents the shopping cart for a user. The `user_id` is a foreign key linking the cart to a specific user.
- **id** (PK)
- user_id (FK -> User)

---

## ShoppingCartItem
Represents individual menu items within a shopping cart. It contains `menu_item_id` and `shopping_cart_id` as foreign keys, linking to the MenuItem and ShoppingCart tables respectively.
- **id** (PK)
- menu_item_id (FK -> MenuItem)
- shopping_cart_id (FK -> ShoppingCart)
- quantity: int

---

## Payment
Represents a record of payments associated with each order. Each order has a corresponding payment record. The  `order_id` is a foreign key linking the payment to a specific order.
- **id** (PK)
- order_id (FK -> Order)
- method: varchar (E.g., 'Credit Card', 'PayPal')
- status: varchar (E.g., 'Completed', 'Pending', 'Failed')
- created_at: datetime
- updated_at: datetime

---

In summary, the ERD provides a visual representation and explanation of the data model, emphasizing the relationships and attributes of each entity. Properly understanding these relationships is pivotal for database querying and the overall functionality of the system.
