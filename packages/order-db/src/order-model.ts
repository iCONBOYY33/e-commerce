import mongoose, { InferSchemaType } from "mongoose";
const { Schema } = mongoose;
export const orderStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    products: {
      type: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          quantity: { type: Number, required: true },
        },
      ],
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(orderStatus),
      default: orderStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);
export type orderSchemaType = InferSchemaType<typeof orderSchema>;

export const Order = mongoose.model<orderSchemaType>("Order", orderSchema);
