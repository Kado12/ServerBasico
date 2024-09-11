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
    let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjIwMzA0ZjI1ZWEzMjY4MmNjZjU2ZDI5NzVmMzYzZmFhYTlhMDg1YmJmOTNjMzdiMmM0OGI4ZDg2MTM0ZDZhNjA5NzdjOGZiNTk0ZDZmMjYzIn0.eyJhdWQiOiJjZjVhNjI5MS00YTE1LTQ2NzctYTkzZi1lM2ZiZmVjZTZhNjQiLCJqdGkiOiIyMDMwNGYyNWVhMzI2ODJjY2Y1NmQyOTc1ZjM2M2ZhYWE5YTA4NWJiZjkzYzM3YjJjNDhiOGQ4NjEzNGQ2YTYwOTc3YzhmYjU5NGQ2ZjI2MyIsImlhdCI6MTcyNjA5NjMyMCwibmJmIjoxNzI2MDk2MzIwLCJleHAiOjE3NDEzOTIwMDAsInN1YiI6IjkyOTUyOTkiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzI2NDAyNTUsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiI1NmY0YWQ4NC04ZDE5LTRmZTMtYmM4ZS0yZWZmYTBkZTUzNzciLCJhcGlfZG9tYWluIjoiYXBpLWMua29tbW8uY29tIn0.OyyES79zV1lvzTlgt2L_U_IlSd4UNf7iZER_1MAHg4YqnBJ9_uA6Hr4tZq3QqUs3JiWZxkowAQeDx-Vng_-ZUsavoMzoW0SfKqqN5bjEkx9vH-T-bGtDNs_V3SExbqgD3tap60vCt8uQzMlThl4QnfkusL7e3fExcPWdATq6Wh72PNW6ND77w_gvKYHLHiJGR26r4XPjVOTnSDeZR1O6-Vq47v7fQETLK1vRiH821B1C5QK_SrqO4Fxw9KAsHTk6rZSPM_XU-HSR47XO1778sXKYCSgPUQxrnEKgypoe00Wi5bRSWUXcsM-RSKaQnJovT4HHLba8rFLUvbmdfRB_bg'
    const response = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        data: {
          status: "success",
          msj: "Hola mundo 🤜🤛 Alex imbecil"
        }
      })
    })
    console.log(response)
    res.sendStatus(200)
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