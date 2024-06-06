import { Router } from "express";
import config from "../config.js";
import UserMDBManager from "../dao/userManager.mdb.js";

const router = Router();
const adminAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role != "admin")
    return res
      .status(401)
      .send({ origin: config.SERVER, payload: "Usuario no autorizado." });
  next();
};

router.get("/session", async (req, res) => {
  try {
    if (req.session.counter) {
      req.session.counter++;
      res.status(200).send({
        origin: config.SERVER,
        payload: `${req.session.counter} visualizaciones!`,
      });
    } else {
      req.session.counter = 1;
      res.status(200).send({
        origin: config.SERVER,
        payload: `Bienvenido! Eres la primera visualización.`,
      });
    }
  } catch {
    res.send({
      origin: config.SERVER,
      payload: null,
      error: "Error de sessions.",
    });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let myUser = await UserMDBManager.findUser(email);

    console.log(myUser);

    if (myUser.password == password) {
      req.session.user = { ...myUser };
      res.redirect("/products");
    } else {
      res.status(401).send("Datos no encontrados.");
    }
  } catch {
    res.send("Session error.");
  }
});
router.post("/register", async (req, res) => {
  try {
    let dbUser = await UserMDBManager.findUser(req.body.email);
    let myUser = req.body;
    if (dbUser) {
      return res
        .status(200)
        .send("El correo y/o la contraseña ya están ocupados.");
    }
    req.session.user = { ...myUser };
    let dbUser2 = await UserMDBManager.addUser(myUser);
    req.session.user.role = dbUser2.role;
    res.redirect("/products");
  } catch {
    res.send("Session error.");
  }
});
router.get("/private", adminAuth, async (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else if (req.session.user.role == "admin") {
    try {
      res.status(200).send("Bienvenido, admin.");
    } catch {
      res.status(500).send("Session error.");
    }
  } else {
    try {
      res.status(401).send("Acceso no autorizado.");
    } catch {
      res.status(500).send("Session error.");
    }
  }
});
router.get("/logout", async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err)
        return res.status(500).send({
          origin: config.SERVER,
          payload: "Error al ejecutar logout.",
        });
      res.redirect("/login");
    });
  } catch {
    res.status(200).send({
      origin: config.SERVER,
      payload: null,
      error: "Error de sesión.",
    });
  }
});
export default router;
