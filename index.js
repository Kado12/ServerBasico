const express = require('express')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const htmlResponse = `
    <html>
      <head>
        <title>NodeJS y Express en Vercel</title>
      </head>
      <body>
        <h1>Hola mundo Backend</h1>
      </body>
    </html>
  `
  res.send(htmlResponse)
})

app.post("/pruebas", async (req, res) => {
  try {
    console.log(req.body)
    console.log(req.headers)
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