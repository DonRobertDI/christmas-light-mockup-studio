import { Router } from "express";
import {
  createCustomer,
  getCustomer,
  listCustomers,
} from "../controllers/customer.controller.js";

export const customerRouter = Router();

customerRouter.route("/").get(listCustomers).post(createCustomer);
customerRouter.get("/:id", getCustomer);
