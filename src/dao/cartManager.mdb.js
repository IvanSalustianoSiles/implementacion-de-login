import { cartsModel } from "./models/carts.model.js";

class CartMDBManager {
  constructor(model) {
    this.carts = [];
    this.products = [];
    this.model = model;
  }

  createCartMDB = async () => {
    try {
      let toSendObject = await this.model.create({ products: [] });
      let toSendID = JSON.parse(JSON.stringify(toSendObject["_id"]));
      return { msg: "Carrito creado en la base de datos.", ID: toSendID };
    } catch {
      return "Error al crear el carrito. Por favor, inténtalo de nuevo.";
    }
  };
  addProductMDB = async (pid, cid) => {
    let newProduct = {
      _id: pid,
      quantity: 1,
    };
    if (!Object.values(newProduct).includes(undefined)) {
      let myCart = await this.model.findById(cid);
      if (myCart) {
        let myProduct = myCart["products"].find(
          (product) => product._id == pid
        );
        if (myProduct) {
          myProduct["quantity"] = myProduct["quantity"] + newProduct.quantity;
          await this.model.findOneAndUpdate(
            { _id: cid, "products._id": pid },
            { $set: { "products.$.quantity": myProduct.quantity } }
          );
          return `Ahora hay ${myProduct["quantity"]} productos de ID ${pid} en el carrito de ID ${cid}.`;
        } else {
          await this.model.findByIdAndUpdate(
            { _id: cid },
            { $set: { products: [...myCart.products, newProduct] } }
          );
          let updatedCart = await this.model.findById(cid);
          return updatedCart;
        }
      } else {
        return `El carrito de ID ${cid} no fue encontrado.`;
      }
    } else {
      return `El producto que intentabas ingresar no contiene las propiedades adecuadas.`;
    }
  };
  deleteProductMDB = async (pid, cid) => {
    if (pid && cid) {
      let myCart = await this.model.findById(cid);
      if (myCart) {
        let myProduct = myCart["products"].find(
          (product) => product._id == pid
        );
        if (myProduct) {
          await this.model.findByIdAndUpdate(
            { _id: cid },
            { $pull: { products: { _id: pid } } }
          );
          return `Producto de ID "${pid}" eliminado en el carrito de ID "${cid}".`;
        } else {
          return `Producto de ID "${pid}" no encontrado en el carrito.`;
        }
      } else {
        return `El carrito de ID "${cid}" no fue encontrado.`;
      }
    } else {
      return `El producto o el carrito no contienen las propiedades adecuadas.`;
    }
  };
  getCartById = async (cid) => {
    try {
      let cartById = await this.model.find({ _id: cid });
      return cartById;
    } catch (error) {
      return "Lo sentimos, ha ocurrido un error enviando la información que intentó capturar.";
    }
  };
  updateCartById = async (cid, preUpdatedData) => {
    let updatedProducts = [];
    let toSendObject;
    try {
      this.model.findOneAndUpdate({ _id: cid }, { $set: { products: [] } });
      preUpdatedData.forEach(async (product) => {
        let updatedProduct = {
          _id: product._id,
          quantity: product.quantity,
        };
        updatedProducts.push(updatedProduct);
      });
      await this.model.findOneAndUpdate(
        { _id: cid },
        { $set: { products: updatedProducts } }
      );
      const updatedCart = await this.model.findById(cid);
      return (toSendObject = {
        status: 1,
        payload: updatedCart,
      });
    } catch {
      return "Lo sentimos, ha ocurrido un error al actualizar el carrito.";
    }
  };
  updateQuantity = async (pid, cid, objectQuantity) => {
    if (pid && cid && objectQuantity) {
      let myCart = await this.model.findById(cid);
      if (myCart) {
        let myProduct = myCart["products"].find(
          (product) => product._id == pid
        );
        if (myProduct) {
          myProduct["quantity"] = objectQuantity.quantity;
          await this.model.findOneAndUpdate(
            { _id: cid, "products._id": pid },
            { $set: { "products.$.quantity": myProduct.quantity } }
          );
          return `Ahora hay ${myProduct["quantity"]} productos de ID ${pid} en el carrito de ID ${cid}.`;
        } else {
          return `Producto de ID "${pid}" no encontrado en el carrito.`;
        }
      } else {
        return `El carrito de ID "${cid}" no fue encontrado.`;
      }
    } else {
      return `El producto que intentabas ingresar no contiene las propiedades adecuadas.`;
    }
  };
  deleteAllProducts = async (cid) => {
    try {
      await this.model.findOneAndUpdate(
        { _id: cid },
        { $set: { products: [] } }
      );

      return `Carrito de ID ${cid} limpiado.`;
    } catch {
      return `Error al intentar limpiar el carrito de ID ${cid}`;
    }
  };
};

const cartsCollection = new CartMDBManager(cartsModel);

export default cartsCollection;
