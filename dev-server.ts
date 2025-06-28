import 'dotenv/config';
process.env.NODE_ENV = 'development';
import { createWebHeraldServer } from "./index";

createWebHeraldServer({ port: 3000 }); 