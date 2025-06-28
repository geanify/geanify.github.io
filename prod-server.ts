import { createWebHeraldServer } from "./index";

// TODO: Implement no-ip update logic here
// Example: await updateNoIp({ ... });

process.env.NODE_ENV = 'production';

createWebHeraldServer({ port: 80 }); 