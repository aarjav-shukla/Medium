import z from "zod";

export const signupInput = z.object({
  email: z.email(),
  password: z.string().min(6),
  username: z.string().optional(),
});
export type signupInput = z.infer<typeof signupInput>;
export const signinInput = z.object({
  email: z.email(),
  password: z.string().min(6),
  username: z.string().optional(),
});
export type signinInput=z.infer<typeof signinInput>;
export const createBlog = z.object({
  title:z.string().min(1).max(20),
  content: z.string().min(5),
});
export type createBlog=z.infer<typeof createBlog>;
export const updateblog = z.object({
  title:z.string().min(1).max(20),
  content: z.string().min(5),

});
export type updateblog=z.infer<typeof updateblog>;
