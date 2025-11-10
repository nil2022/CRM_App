// configs/server.config.js
import env from "#configs/env";

let PORT = 3000

// If app is running in production or staging, use the PORT from env variables
if (env.NODE_ENV !== 'development') {
  PORT = env.PORT
}

export default PORT;
