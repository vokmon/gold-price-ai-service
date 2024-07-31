import express from 'express';

// Set up express to keep the app running in the background in docker container
const app = express();
const port = process.env.PORT || 8888;

app.get('/', (_req, res) => {
  res.send('App is running');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});