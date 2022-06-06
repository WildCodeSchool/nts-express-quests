const MovieRouter = require('./MovieRouter');
const UserRouter = require('./UserRouter');

const setupRoutes = (app) => {
  app.get('/', (request, response) => {
    response.status(200).send("Welcome to my favourite movie list")
  })

  app.use('/api/movies', MovieRouter);
  app.use('/api/users', UserRouter);
};

module.exports = setupRoutes;
