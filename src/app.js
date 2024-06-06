// Imports
import express from "express";
import mongoose from "mongoose";
import handlebars from "express-handlebars";
import productRoutes from "./routes/products.routes.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import config from "./config.js";
import initSocket from "./sockets.js";
import cartRoutes from "./routes/carts.routes.js";
import viewRoutes from "./routes/views.routes.js";
import userRoutes from "./routes/users.routes.js";
import cookiesRoutes from "./routes/cookies.routes.js";
import sessionsRoutes from "./routes/sessions.routes.js";
// import FileStore from "session-file-store";

// Server init
// const fileStorage = FileStore(session);
const app = express();
const httpServer = app.listen(config.PORT, async () => {
  await mongoose.connect(config.MONGO_URL); // Lo manejamos con promesas, como hacíamos con Firebase en React.
  console.log(
    `Servidor activo en el puerto ${config.PORT}, conectado a DB '${config.SERVER}'.`
  );
});
const socketServer = initSocket(httpServer);
// Settings & app middlewares:

// General
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.SECRET));
app.use(
  session({
    secret: config.SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: config.MONGO_URL,
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 28800,
    }),
    // store: new fileStorage({path: "./sessions", ttl: 3600000, retries: 0})
  })
);
app.set("socketServer", socketServer);

// Views
app.engine("handlebars", handlebars.engine());
app.set("views", `${config.DIRNAME}/views`);
app.set("view engine", "handlebars");

// Routes
app.use(viewRoutes);
app.use("/api/products/", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cookies", cookiesRoutes);
app.use("/api/sessions", sessionsRoutes);

// Static
app.use("/static", express.static(`${config.DIRNAME}/public`));
