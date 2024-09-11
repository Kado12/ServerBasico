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


app.listen(3000, () => {
  console.log("Server listen on port 3000");

});

// {{message_text}}

// {{lead.id}}