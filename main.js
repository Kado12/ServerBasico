const express = require('express')

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hola mundo' });
});

app.post("/pruebas", async (req, res) => {
  try {
    console.log(req.body)
    console.log(req.data)
    console.log('Hola mundo')
    res.status(200).json(req.body)
  } catch (error) {
    console.log(error)
  }
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// {{message_text}}

// {{lead.id}}