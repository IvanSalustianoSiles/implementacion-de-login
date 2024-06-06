import { Router } from "express";
import CartManagerFS from "../dao/cartManager.fs.js";
import CartMDBManager from "../dao/cartManager.mdb.js";

let toSendObject = {};
const router = Router();

router.get("/", async (req, res) => {
  try {
    const cart = await cartsModel.find().lean();
    res.send({ status: 1, payload: cart });
  } catch {
    res.send({
      status: 0,
      payload:
        "Lo sentimos, ha ocurrido un error al intentar recibir el carrito.",
    });
  }
});
router.post("/", async (req, res) => {
  toSendObject = await CartMDBManager.createCartMDB();
  CartManagerFS.createCart(toSendObject.ID);
  res.status(200).send(toSendObject);
});
router.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  toSendObject = await CartMDBManager.getCartById(cid);
  res.status(200).send(toSendObject);
});
router.post("/:cid/product/:pid", async (req, res) => {
  const { pid, cid } = req.params;
  CartManagerFS.addProduct(pid, cid);
  toSendObject = await CartMDBManager.addProductMDB(pid, cid);
  res.status(200).send(toSendObject);
});
router.delete("/:cid/product/:pid", async (req, res) => {
  const { pid, cid } = req.params;
  toSendObject = await CartMDBManager.deleteProductMDB(pid, cid);
  console.log(toSendObject);
  res.status(200).send(toSendObject);
});
router.put("/:cid", async (req, res) => {
  // Formato del body: [{"quantity": Number, "_id:" String},...]
  const { cid } = req.params;
  toSendObject = await CartMDBManager.updateCartById(cid, req.body);
  console.log(toSendObject);
  res.status(200).send(toSendObject);
});
router.put("/:cid/product/:pid", async (req, res) => {
  // Formato del body: {"quantity": Number}
  const { pid, cid } = req.params;
  toSendObject = await CartMDBManager.updateQuantity(pid, cid, req.body);
  res.status(200).send(toSendObject);
});
router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
  toSendObject = await CartMDBManager.deleteAllProducts(cid);
  res.status(200).send(toSendObject);
});

export default router;
