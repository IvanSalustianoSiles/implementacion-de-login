import { usersModel } from "./models/users.model.js";

// Clase para controlar los métodos referentes a los usuarios.
class UserManager {
  constructor(model) {
    this.productsArray = [];
    this.path = `./../jsons/product.json`;
    this.getting = false;
    this.model = model;
  }
  isRegistered = (focusRoute, returnObject, req, res) => {
    return req.session.user
      ? res.render(focusRoute, returnObject)
      : res.redirect("/login");
  };
  findUser = async (emailValue) => {
    let myUser = await usersModel.findOne({ email: emailValue }).lean();
    return myUser;
  };
  addUser = async (user) => {
    await this.model.create({ ...user });
  };
}

// Métodos a utilizar:
// isRegistered (focusRoute, returnObject, req, res)
// findUser (emailValue)
// addUser (user)

let UserMDBManager = new UserManager(usersModel);

export default UserMDBManager;
