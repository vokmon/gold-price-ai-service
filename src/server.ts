import express from 'express';


const app = express();
const port = process.env.PORT || 8888;

app.get('/', (_req, res) => {
  res.send('App is running');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});