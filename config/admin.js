module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '239dd70265206d07693952c770e8f454'),
  },
});
