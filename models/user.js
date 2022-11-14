const mongodb = require("mongodb");
const Product = require("./product");
const getDB = require("../util/database").getDB;

class User {
  constructor(username, email, cart, userId) {
    this.username = username;
    this.email = email;
    this.cart = cart;
    this.userId = userId;
  }
  save() {
    const db = getDB();
    return db
      .collection("users")
      .insertOne(this)
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getCart() {
    const db = getDB();
    const productsId = this.cart.items.map((item) => {
      return item.productId;
    });
    return db
      .collection("products")
      .find({ _id: { $in: productsId } })
      .toArray()
      .then((products) => {
        return products.map((product) => {
          return {
            ...product,
            quantity: this.cart.items.find((item) => {
              return item.productId.toString() === product._id.toString();
            }).quantity,
          };
        });
      })
      .then((cartItems) => {
        // console.log("cart items ==>", cartItems);
        return cartItems;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() == product._id.toString();
    });
    // console.log(cartProductIndex);
    let newQuantity = 1;
    let updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
      newQuantity = updatedCartItems[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(product._id),
        quantity: 1,
      });
    }
    const db = getDB();
    const updatedCart = {
      items: updatedCartItems,
    };
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this.userId) },
        { $set: { cart: updatedCart } }
      );
  }

  deleteFromCart(prodId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== prodId.toString();
    });
    const db = getDB();
    const updatedCart = {
      items: updatedCartItems,
    };
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this.userId) },
        { $set: { cart: updatedCart } }
      );
  }

  addOrder() {
    const db = getDB();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: new mongodb.ObjectId(this.userId),
            username: this.username,
          },
        };
        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new mongodb.ObjectId(this.userId) },
            { $set: { cart: this.cart } }
          );
      })
      .catch((err) => {
        console.log(err);
      });
  }
  getOrders() {
    const db = getDB();
    return db
      .collection("orders")
      .find({ "user._id": new mongodb.ObjectId(this.userId) })
      .toArray();
  }

  static findById(userId) {
    const db = getDB();
    // console.log("inside model user ==>", userId);
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userId) })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = User;
