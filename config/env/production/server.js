module.exports = ({ env }) => ({
  url: env("HEROKU_URL"),
  proxy: true,
  app: {
    keys: env.array("APP_KEYS", [
      "DATABASE_URL",
      "HEROKU_POSTGRESQL_MAROON_URL",
    ]),
  },
});
