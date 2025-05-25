export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  port: process.env.BACKEND_PORT,
});
