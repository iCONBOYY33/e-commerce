import { Request, Response } from "express";
import { Prisma, prisma } from "@repo/product-db";
import { producer } from "../utils/kafka";
import { StripeProductType, ProductFormSchema } from "@repo/types";
import redis from "../utils/redis";

const clearProductCache = async (id?: string) => {
  if (id) {
    await redis.del(`product:${id}`);
  }
  const keys = await redis.keys("products:*");
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const result = ProductFormSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const data = result.data;

  const product = await prisma.product.create({ data });

  const stripeProduct: StripeProductType = {
    id: product.id.toString(),
    name: product.name,
    price: product.price,
  };
  await producer.send("product.created", { value: stripeProduct });

  await clearProductCache();

  return res.status(201).json(product);
};
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = `product:${id}`;
  const cachedProduct = await redis.get(cacheKey);
  if (cachedProduct) {
    return res.status(200).json(JSON.parse(cachedProduct));
  }

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (product) {
    await redis.set(cacheKey, JSON.stringify(product), "EX", 3600); // Cache for 1 hour
  }

  return res.status(200).json(product);
};

export const getAllProducts = async (req: Request, res: Response) => {
  const { sort, category, search, limit } = req.query;

  const cacheKey = `products:${JSON.stringify(req.query)}`;
  const cachedProducts = await redis.get(cacheKey);

  if (cachedProducts) {
    return res.status(200).json(JSON.parse(cachedProducts));
  }
  const orderBy = (() => {
    switch (sort) {
      case "asc":
        return { price: Prisma.SortOrder.asc };

      case "desc":
        return { price: Prisma.SortOrder.desc };
      case "oldest":
        return { createdAt: Prisma.SortOrder.asc };
      default:
        return { createdAt: Prisma.SortOrder.desc };
    }
  })();
  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: category as string,
      },
      name: {
        contains: search as string,
      },
    },
    orderBy,
    take: limit ? Number(limit) : undefined,
  });

  await redis.set(cacheKey, JSON.stringify(products), "EX", 60); // Cache for 60 seconds

  return res.status(200).json(products);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: Prisma.ProductUpdateInput = req.body;
  const product = await prisma.product.update({
    where: { id: Number(id) },
    data,
  });
  await clearProductCache(id);
  return res.status(200).json(product);
};
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.delete({
    where: { id: Number(id) },
  });
  await producer.send("product.deleted", { value: Number(id) });

  await clearProductCache(id);

  return res.status(200).json(product);
};
