let PORT = 3000

if (process.env.NODE_ENV !== 'development') {
  PORT = process.env.PORT
}

export default PORT;
