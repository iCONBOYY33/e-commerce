import stripe from "./stripe";
import Stripe from "stripe";
import { StripeProductType } from "@repo/types";

export const createStripeProduct = async (item: StripeProductType) => {
  try {
    const product = await stripe.products.create({
      id: item.id,
      name: item.name,
      default_price_data: {
        currency: "usd",
        unit_amount: item.price * 100,
      },
    });
    return product;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createStripePrice = async (productId: number) => {
  try {
    const res = await stripe.prices.list({
      // product: "prod_TcbGRfuTu4kEHd",
      product: productId.toString(),
    });
    return res.data[0]?.unit_amount;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getStripeProduct = async (productId: number) => {
  try {
    const product = await stripe.products.retrieve(productId.toString(), {
      expand: ["default_price"],
    });
    return product;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteStripeProduct = async (productId: number) => {
  try {
    const product = await stripe.products.del(productId.toString());
    return product;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
