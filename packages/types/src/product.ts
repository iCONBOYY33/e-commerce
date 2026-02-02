import { z } from "zod";
import type { Product, Category } from "@repo/product-db";

export type ProductType = Product;
export type CategoryType = Category;

export type StripeProductType = {
  id: string;
  name: string;
  price: number;
};
// export type ProductsType = ProductType[];
export const colors = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "gray",
  "black",
  "white",
] as const;

export const sizes = [
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
] as const;

export const ProductFormSchema = z
  .object({
    name: z.string().min(1, { message: "Product name is required!" }),
    shortDescription: z
      .string()
      .min(1, { message: "Short description is required!" })
      .max(60),
    description: z.string().min(1, { message: "Description is required!" }),
    price: z.number().min(1, { message: "Price is required!" }),
    categorySlug: z.string().min(1, { message: "Category is required!" }),
    sizes: z.array(z.enum(sizes)).min(1, { message: "Size is required!" }),
    colors: z.array(z.enum(colors)).min(1, { message: "Color is required!" }),
    images: z.record(
      z.enum(colors),
      z.string({ message: "Image is required!" })
    ),
  })
  .refine(
    (data) => {
      const missingImages = data.colors.filter(
        (color: (typeof colors)[number]) => !data.images?.[color]
      );
      return missingImages.length === 0;
    },
    {
      message: "Image is required for each selected color!",
      path: ["images"],
    }
  );

export const CategoryFormSchema = z.object({
  name: z.string().min(1, { message: "Name is Required!" }),
  slug: z.string().min(1, { message: "Slug is Required!" }),
});
