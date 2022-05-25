module.exports = {
  apps: [
    {
      name: "twitter-bot",
      script: "dist/index.js",
      node_args: "-r dotenv/config --experimental-specifier-resolution=node",
    },
  ],
};
