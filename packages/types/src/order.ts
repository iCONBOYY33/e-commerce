import { orderSchemaType } from "@repo/order-db";

export type OrderType = orderSchemaType & {
  _id: string;
};

export type OrderVarChartType = {
  month: string;
  total: number;
  successful: number;
};
