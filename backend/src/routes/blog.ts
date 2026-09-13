import { asyncWrapProviders } from "async_hooks";
import { PrismaClient } from "../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { verify } from "hono/jwt";
import { createBlog, updateblog } from "@aarjav-shukla/medium-common";


type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};
type Variables ={
    userId:string;
}
export const blogRouter = new Hono<{
  Bindings: Bindings;
  Variables:Variables;
}>();

blogRouter.use('/*', async (c,next) => {
const header=c.req.header("Authorization");
if(!header){
  return c.json({
    error:"No tokens provided"
  },401)
};
const response= await verify(header,c.env.JWT_SECRET,"HS256");
if(typeof response.id==="string"){
    c.set("userId",response.id)
  await next()
}
else{
  return c.json({
    message:"unauthorised"
  },403)
}
})

blogRouter.post('/',async(c)=>{
     const prisma = new PrismaClient({
       accelerateUrl: c.env.DATABASE_URL,
     }).$extends(withAccelerate());
    try {
         const authorId = c.get("userId");
         const body = await c.req.json();
         const {success}=createBlog.safeParse(body);
             if(!success){
                 return c.json({
                     message:"inputs not valid"
                 },411)
             }
         const blog = await prisma.blog.create({
           data: {
             title: body.title,
             content: body.content,
             authorId: authorId,
           },
         });
         return c.json({
           id: blog.id,
         });
        
    } catch (error) {
        console.log(error);
        return c.json({
            message:"failed to create the post" 
        })
    }
})

blogRouter.put('/',async(c)=>{
     const prisma = new PrismaClient({
       accelerateUrl: c.env.DATABASE_URL,
     }).$extends(withAccelerate());
 
const body = await c.req.json();
const {success}=updateblog.safeParse(body);
    if(!success){
        return c.json({
            message:"inputs not valid"
        },411)
    }
const blog = await prisma.blog.update({
    where:{
        id:body.id
    },
    data:{
        title:body.title,
        content:body.content
    }
})

  return c.json({
    id:blog.id,
    blog:blog
  })
})

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    accelerateUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blogs = await prisma.blog.findMany();
  return c.json({
    blogs: blogs,
  });
});

blogRouter.get ('/:id',async(c)=>{
    const prisma = new PrismaClient({
      accelerateUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const id= c.req.param("id");
    const blog = await prisma.blog.findFirst({
      where: {
        id: Number(id),
      },
    });

  return c.json({
    blog:blog
  })
        
    } catch (error) {
        return c.json({
            error:"Failed to fetch the blog"
        },411)
        
    }
})
