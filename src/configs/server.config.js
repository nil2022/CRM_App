let PORT = 4500

if (process.env.NODE_ENV !== 'development') {
  PORT = process.env.PORT
}

export default PORT;
