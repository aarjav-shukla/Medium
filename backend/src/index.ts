import { Hono } from 'hono'
import { PrismaClient } from '../generated/prisma/edge';
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verifyWithJwks } from 'hono/jwt';
import { verify } from 'hono/jwt';

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
app.use('/api/v1/blog/*', async (c,next) => {
const header=c.req.header("Authorization");
if(!header){
  return c.json({
    error:"No tokens provided"
  },401)
};
const token=header.split(" ")[1];
const response = await verify(token, c.env.JWT_SECRET, "HS256");
if(response.id){
  next()
}
else{
  return c.json({
    message:"unauthorised"
  })
}
})

app.post('/api/v1/user/signup', async (c) => {
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
app.post('/api/v1/user/signin',async(c)=>{
   const prisma = new PrismaClient({
     accelerateUrl: c.env.DATABASE_URL,
   }).$extends(withAccelerate());
 
   const body = await c.req.json();
   const user=await prisma.user.findUnique({
    where:{
      email:body.email
    }
   })
   if(!user){
    c.status(403);
    return c.json({
      error:"user not found"
    })
   }
   if(user.password!==body.password){
    return c.json({
      message:"Invalid password"
    },401);
   }
   const token=await sign({id:user.id},c.env.JWT_SECRET);
   return c.json({
    jwt:token
   })

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
app.get ('/api/v1/blog/bulk',(c)=>{
  return c.text("User fetched the blog")
})

export default app
