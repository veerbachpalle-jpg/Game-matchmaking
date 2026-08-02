export const getCorsOptions = () => {
  const envOrigin = process.env.CORS_ORIGIN || '*';

  if (envOrigin === '*') {
    return {
      origin: true,
      credentials: true
    };
  }

  const allowedOrigins = envOrigin
    .split(',')
    .map(url => url.trim().replace(/\/$/, ''));

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS Error: Origin ${origin} is not allowed by CORS policy.`));
      }
    },
    credentials: true
  };
};
