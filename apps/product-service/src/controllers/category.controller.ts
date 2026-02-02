import { Request, Response } from "express";
import { Prisma, prisma } from "@repo/product-db";

export const createCategory = async (req: Request, res: Response) => {
  const data: Prisma.CategoryCreateInput = req.body;

  const category = await prisma.category.create({ data });

  return res.status(201).json(category);
};
export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: Prisma.CategoryUpdateInput = req.body;
  const category = await prisma.category.update({
    where: { id: Number(id) },
    data,
  });
  return res.status(200).json(category);
};
export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await prisma.category.delete({
    where: { id: Number(id) },
  });
  return res.status(200).json(category);
};

export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany();
  return res.status(200).json(categories);
};
