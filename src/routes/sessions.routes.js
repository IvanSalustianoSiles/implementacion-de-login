import { Router } from "express";
import config from "../config.js";

const router = Router();

const adminAuth = (req, res, next) => {
  if (req.session.user.role == !admin)
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
router.get("/login", async (req, res) => {
  try {
    const user = {
      mail: "silesivansalustiano@gmail.com",
      password: "Coki-2011",
    }; // Esto vendría de un req.body
    const dbMail = "silesiansalustiano@gmail.com";
    const dbPassword = "Coki-2011";
    if ((user.mail === dbMail) & (user.password === dbPassword)) {
      req.session.user = { ...user, role: "admin" };
      res.status(200).send("Válido. Ingresando...");
    } else {
      res.status(401).send("Datos no encontrados.");
    }
  } catch {
    res.send("Session error.");
  }
});
router.get("/private", adminAuth, async (req, res) => {
  try {
    res.status(200).send("Bienvenido, admin.");
  } catch {
    res.status(500).send("Session error.");
  }
});
router.get("/logout", async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err)
        return res
        .status(500)
        .send({
            origin: config.SERVER,
            payload: "Error al ejecutar logout.",
        });
      res
      .status(200)
      .send({ origin: config.SERVER, payload: "Usuario desconectado." });
    });
  } catch {
    res
    .status(200)
    .send({
      origin: config.SERVER,
      payload: null,
      error: "Error de sesión.",
    });
  }
});
export default router;
