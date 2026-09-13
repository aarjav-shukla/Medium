import { Hono } from 'hono'
import { PrismaClient } from '../generated/prisma/edge';
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign} from 'hono/jwt';
import { verify } from 'hono/jwt';
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';

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
app.route("/api/v1/user",userRouter)
app.route("/api/v1/blog",blogRouter)



export default app
