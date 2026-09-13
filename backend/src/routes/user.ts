import { Hono } from "hono";
import { PrismaClient } from "../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { verify } from "hono/jwt";
import { signinInput, signupInput} from "@aarjav-shukla/medium-common";

type Bindings = {
DATABASE_URL: string;
JWT_SECRET: string;
};

export const userRouter = new Hono<{
Bindings: Bindings;
}>();

userRouter.post("/signup", async (c) => {
try {
    const body = await c.req.json();
    const {success}=signupInput.safeParse(body);
    if(!success){
        return c.json({
            message:"inputs not valid"
        },411)
    }
    const prisma = new PrismaClient({
accelerateUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const user = await prisma.user.create({
data: {
        email: body.email,
        password: body.password,
},
    });

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.json({
jwt: token,
    });
} catch (error) {
    console.error("Signup error:", error);

    return c.json(
{
        message: "Signup failed",
},
500,
    );
}
});
userRouter.post("/signin", async (c) => {
const prisma = new PrismaClient({
    accelerateUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate());
const body = await c.req.json();
const { success } = signinInput.safeParse(body);
if (!success) {
  return c.json(
    {
      message: "inputs not valid",
    },
    411,
  );
}
const user = await prisma.user.findUnique({
    where: {
email: body.email,
    },
});
if (!user) {
    c.status(403);
    return c.json({
error: "user not found",
    });
}
if (user.password !== body.password) {
    return c.json(
{
        message: "Invalid password",
},
401,
    );
}
const token = await sign({ id: user.id }, c.env.JWT_SECRET);
return c.json({
    jwt: token,
    message: "User successfully signed in!",
});
});