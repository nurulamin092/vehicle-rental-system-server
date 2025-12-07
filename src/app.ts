import express, { Request, Response } from "express";
import initDb from "./config/database";
import { userRouter } from "./modules/users/user.routes";
import { vehicleRouter } from "./modules/vehicles/vehicle.routes";

const app = express();

initDb();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome Vehicle Rental Management System!");
});

//User Router
app.use("/api/v1/users", userRouter);

app.use("/api/v1/vehicles", vehicleRouter);

export default app;
