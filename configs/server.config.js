import env from "#configs/env";

// configs/server.config.js
let PORT = 3000

if (env.NODE_ENV !== 'development') {
  PORT = env.PORT
}

export default PORT;
