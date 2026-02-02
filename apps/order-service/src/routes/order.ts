import { shouldBeAdmin, shouldBeUser } from "../middleware/auth";
import { FastifyInstance } from "fastify";
import { Order } from "@repo/order-db";
import { startOfMonth, subMonths } from "date-fns";
import { OrderVarChartType } from "@repo/types";

export const orderRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    "/user-orders",
    { preHandler: shouldBeUser },
    async (request, reply) => {
      const orders = await Order.find({ userId: request.userId });
      return reply.send({ orders });
    }
  );

  fastify.get(
    "/orders",
    { preHandler: shouldBeAdmin },
    async (request, reply) => {
      const { limit } = request.query as { limit: number };
      const orders = await Order.find().limit(limit).sort({ createdAt: -1 });
      return reply.send({ orders });
    }
  );

  fastify.get(
    "/orders-varchart",
    { preHandler: shouldBeAdmin },
    async (request, reply) => {
      // { month: "January", total: 186, successful: 80 },
      const now = new Date();
      const twelveMonthsAgo = startOfMonth(subMonths(now, 12));
      const raw = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: twelveMonthsAgo,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: {
              $sum: 1,
            },
            successful: {
              $sum: {
                $cond: {
                  if: { $eq: ["$status", "completed"] },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            year: "$_id.year",
            total: 1,
            successful: 1,
          },
        },
      ]);
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      // Create a list of the last 12 months with 0 values
      const last12Months: OrderVarChartType[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = subMonths(now, i);
        const mIndex = d.getMonth();
        const year = d.getFullYear();
        last12Months.push({
          month: `${monthNames[mIndex]} ${year % 100}`,
          total: 0,
          successful: 0,
        });
      }

      // Merge aggregation data into the 12-month template
      const data = last12Months.map((blankMonth) => {
        const parts = blankMonth.month.split(" ");
        const mName = parts[0] || "";
        const yShort = parts[1] || "0";

        const mIndex = monthNames.indexOf(mName) + 1;
        const yFull = 2000 + parseInt(yShort);

        const realData = raw.find(
          (r) => r.month === mIndex && r.year === yFull
        );

        if (realData) {
          return {
            ...blankMonth,
            total: realData.total,
            successful: realData.successful,
          };
        }
        return blankMonth;
      });

      return reply.send({ data });
    }
  );

  fastify.delete(
    "/order/:id",
    { preHandler: shouldBeAdmin },
    async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        console.log("Delete request for order ID:", id);
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
          console.log("Order not found:", id);
          return reply.status(404).send({ message: "Order not found" });
        }
        console.log("Order deleted successfully:", id);
        return reply.send({ message: "Order deleted successfully" });
      } catch (error) {
        console.error("Error deleting order:", error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
