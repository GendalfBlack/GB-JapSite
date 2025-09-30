const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json()); // Allow JSON data

const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Site is running!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));