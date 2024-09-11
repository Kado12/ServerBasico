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

// app.post("/pruebas", async (req, res) => {
//   try {
//     console.log(req.body)
//     fetch('https://example.com/api/endpoint', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         key: 'value',
//         foo: 'bar'
//       })
//     })
//       .then(response => response.json())
//       .then(data => console.log(data))
//       .catch(error => console.error(error));
//     res.status(200).json(req.body)
//   } catch (error) {
//     console.log(error)
//   }
// })


app.post("/pruebas", async (req, res) => {
  try {
    console.log(req.body)
    let url = req.body.return_url
    let token = req.body.token
    console.log(url, token)
    const response = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        data: {
          status: "success"
        }
      })
    })
    const data = await response.json()
    console.log(data)
    res.status(200).json(req.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al procesar la solicitud' })
  }
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// {{message_text}}

// {{lead.id}}