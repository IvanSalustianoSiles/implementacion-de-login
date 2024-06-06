import { Router } from "express";
import { usersModel } from "../dao/models/users.model.js";
// import { uploader } from "../uploader.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    // const users = await usersModel.aggregate([
    //     {$match: {role: "premium"}},
    //     {$group: {_id: "$region", totalGrade: {$sum: "$grade"}}},
    //     {$sort: {totalGrade: -1}}
    // ]);
    const users = await usersModel.paginate(
      { role: "admin" },
      { page: 1, limit: 5 }
    );
    res.send({ status: 1, payload: users });
  } catch {
    res.send({
      status: 0,
      payload:
        "Lo sentimos, ha ocurrido un error al intentar recibir los usuarios.",
    });
  }
});
router.post("/", async (req, res) => {
  try {
    const process = await usersModel.create(req.body);

    res.status(200).send({ status: 1, payload: process });
  } catch (err) {
    res
      .status(500)
      .send({
        status: 0,
        payload: null,
        error: "Lo sentimos, ha ocurrido un error al cargar el usuario.",
      });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const update = req.body;
    const options = { new: true };
    const process = await usersModel.findOneAndUpdate(filter, update, options);

    res.status(200).send({ origin: config.SERVER, payload: process });
  } catch (err) {
    res
      .status(500)
      .send({
        origin: config.SERVER,
        payload: null,
        error:
          "Lo sentimos, ha ocurrido un error al intentar actualizar el usuario.",
      });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const process = await usersModel.findOneAndDelete(filter);

    res.status(200).send({ origin: config.SERVER, payload: process });
  } catch (err) {
    res
      .status(500)
      .send({
        origin: config.SERVER,
        payload: null,
        error:
          "Lo sentimos, ha ocurrido un error al intentar eliminar el usuario.",
      });
  }
});
export default router;
