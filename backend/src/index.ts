import { Hono } from 'hono'
import { PrismaClient } from '../generated/prisma/edge';
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt';

//ts type declaration
type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

const app = new Hono<{
  Bindings: Bindings;
}>();
// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })
app.post('/api/v1/signup', async (c) => {
  try {
    const body = await c.req.json()

    const prisma = new PrismaClient({
      accelerateUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    })

    const token = await sign(
      { id: user.id },
      c.env.JWT_SECRET
    )

    return c.json({
      jwt: token,
    })

  } catch (error) {
    console.error("Signup error:", error)

    return c.json({
      message: "Signup failed",
    }, 500)
  }
})
app.post('/api/v1/signin',(c)=>{
  return c.text("User successfully signed in")
})
app.post('/api/v1/blog',(c)=>{
  return c.text("User created a blog")
})
app.put('/api/v1/blog',(c)=>{
  return c.text("User updated the blog")
})
app.get ('/api/v1/blog/:id',(c)=>{
  return c.text("User fetched the blog")
})

export default app
