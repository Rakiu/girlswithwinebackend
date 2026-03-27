module.exports = {
  apps: [
    {
      name: "api4",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        BASE_URL: "https://api4.girlswithwine.in",
      },
    },
  ],
};
