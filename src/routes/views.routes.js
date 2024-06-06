import { Router } from "express";
import { uploader } from "../uploader.js";
import CartMDBManager from "../dao/cartManager.mdb.js";
import ProductMDBManager from "../dao/productManager.mdb.js";
import ProductManagerFS from "../dao/productManager.fs.js";
import UserMDBManager from "../dao/userManager.mdb.js";
let toSendObject = {};
const router = Router();

router.get("/welcome", (req, res) => {
  const user = {
    name: "Iván",
    surname: "Siles",
  };
  UserMDBManager.isRegistered("index", user, req, res);
});
router.get("/products", async (req, res) => {
  let paginated = await ProductMDBManager.getAllProducts(
    req.query.limit,
    req.query.page,
    req.query.query,
    req.query.sort,
    req.query.available,
    "/products"
  );
  let toSendArray = paginated.payload.docs.map((product, index) => {
    const {
      title,
      description,
      price,
      code,
      stock,
      category,
      status,
      thumbnail,
    } = product;
    const parsedId = JSON.stringify(paginated.payload.docs[index]._id);
    return {
      _id: parsedId.replace(/"/g, ""),
      title: title,
      description: description,
      price: price,
      code: code,
      stock: stock,
      category: category,
      status: status,
      thumbnail: thumbnail,
    };
  });
  let toSendObject = { ...paginated };
  !toSendObject.nextLink
    ? (toSendObject["nextLink"] = "undefined")
    : toSendObject.nextLink;
  !toSendObject.prevLink
    ? (toSendObject["prevLink"] = "undefined")
    : toSendObject.prevLink;
  Object.values(toSendObject.payload).forEach((payloadValue, index) => {
    let payloadKey = Object.keys(toSendObject.payload)[index];
    if (!payloadValue) {
      toSendObject.payload[payloadKey] = "x";
    }
  });
  UserMDBManager.isRegistered("home", { toSendArray: toSendArray, toSendObject: toSendObject, ...req.session.user }, req, res);
});
router.post("/products", async (req, res) => {
  const { add, ID } = req.body;
  if (add) {
    await CartMDBManager.createCartMDB().then((res) => {
      CartMDBManager.addProductMDB(ID, res.ID);
    });
  }
});
router.get("/carts/:cid", async (req, res) => {
  const { cid } = req.params;
  let completeCartResponse = await cartsModel.find({ _id: cid }).lean();
  const cart = completeCartResponse[0];
  let cartResponse = await CartMDBManager.getCartById(cid);
  const toSendObject = JSON.parse(JSON.stringify(cartResponse[0].products));
  for (let i = 0; i < Object.values(toSendObject).length; i++) {
    let myProducts = JSON.parse(JSON.stringify({ ...cart })).products[i]._id;
    toSendObject[i] = { ...toSendObject[i], ...myProducts };
  }
  UserMDBManager.isRegistered("cart", { toSendObject: toSendObject }, req, res);
});
router.get("/realtimeproducts", (req, res) => {
  toSendObject = ProductManagerFS.readFileAndSave();
  UserMDBManager.isRegistered("realTimeProducts", { toSendObject: toSendObject }, req, res);
});
router.post("/realtimeproducts", uploader.single("archivo"), (req, res) => {
  const socketServer = req.app.get("socketServer");
  const { newProduct, productAction } = JSON.parse(req.body.json);
  const { id } = newProduct;
  if (productAction == "add") {
    let toAddProduct = {
      ...newProduct,
      thumbnail: req.file.filename,
      status: true,
    };
    ProductManagerFS.addProduct(toAddProduct);
    let toAddId =
      ProductManagerFS.readFileAndSave()[
        ProductManagerFS.readFileAndSave().length - 1
      ]._id;
    socketServer.emit("addConfirmed", { msg: "Producto agregado.", toAddId });
  } else if (productAction == "delete") {
    ProductManagerFS.deleteProductById(id);

    socketServer.emit("deleteConfirmed", {
      msg: `Producto de ID ${id} eliminado.`,
      pid: id,
    });
  }
  res.render("realTimeProducts", { toSendObject: toSendObject });
});
router.get("/chat", (req, res) => {
  UserMDBManager.isRegistered("chat", {}, req, res);
});
router.get("/login", (req, res) => {
  !req.session.user ? res.render("login", {}) : res.redirect("/profile");
});
router.get("/profile", (req, res) => {
  UserMDBManager.isRegistered("profile", {user: req.session.user}, req, res);
});
router.get("/register", (req, res) => {
  !req.session.user ? res.render("register", {user: req.session.user}) : res.send("Ya has ingresado.");
});

export default router;
