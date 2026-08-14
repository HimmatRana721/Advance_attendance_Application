const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Server!' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
