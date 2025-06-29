import { createWebHeraldServer } from "./index";

// TODO: Implement no-ip update logic here
// Example: await updateNoIp({ ... });

process.env.NODE_ENV = 'production';

// Configure for nginx proxy setup
// The server will run on localhost:3000 and nginx will handle SSL termination
createWebHeraldServer({ 
  port: 3000,
  hostname: "127.0.0.1" // Bind to localhost only since nginx handles external connections
}); 