require('dotenv').config()
const apiKey = process.env.OPENAI_API_KEY
const assistantId = process.env.ASSISTANT_ID
const assistantId4K = process.env.ASSISTANT_ID_ELEMENTO4K
const assistantId4KJuego = process.env.ASSISTANT_ID_ELEMENTO4K_JUEGO

const express = require('express')
const OpenAI = require('openai')
const openai = new OpenAI({ apiKey: apiKey })

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Preguntar a Chat GPT

async function chatCompletions(text) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: text }],
    model: "gpt-4o-mini",
  });

  console.log(completion.choices[0]);
  console.log('Respuesta: ' + completion.choices[0].message.content);
  return completion.choices[0].message.content
}

// Crear Thread
async function createdThread() {
  const emptyThread = await openai.beta.threads.create();
  return emptyThread.id
}

// Eliminar Thread correspondiente
async function deletedThread(thread_id) {
  const response = await openai.beta.threads.del(thread_id);
}

// Crear Mensaje en el Thread correspondiente
async function createdMessage(threads, message) {
  const messagesResponse = await openai.beta.threads.messages.create(
    threads,
    {
      role: "user",
      content: message
    }
  );
  return messagesResponse
}

// Obtener el último mensaje hecho por el Asistente correspondiente en el Thread correspondiente
async function getMessage(assistant, thread) {
  console.log('Thinking...')
  const run = await openai.beta.threads.runs.create(
    thread,
    {
      assistant_id: assistant
    }
  )
  let runInfo
  while (true) {
    runInfo = await openai.beta.threads.runs.retrieve(thread, run.id)
    if (runInfo.status === "completed") {
      break
    }
    console.log('Waiting 1sec...')
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  const message = await openai.beta.threads.messages.list(thread)
  const messageContent = message.data[0].content[0].text.value
  return messageContent
}

// Función Main para la ejecución de las demás funciones
async function main(msg_client, threadsId, assistant_Id) {
  const message = await createdMessage(threadsId, msg_client)
  const lastMessage = await getMessage(assistant_Id, threadsId)
  return lastMessage
}

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

// IA Conversation Kommo Partners
app.post("/confirmation", async (req, res) => {
  try {
    console.log(req.body)
    let url = req.body.return_url
    let token = process.env.TOKEN_WIDGET_KOMMO
    let msj = await chatCompletions(req.body.data.msj_1)
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
          msj: msj
        }
      })
    })
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    let url = req.body.return_url
    let token = process.env.TOKEN_WIDGET_KOMMO
    const response = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        data: {
          status: "failed"
        }
      })
    })
    res.status(500).json({ message: 'Error al procesar la solicitud' })
  }
})

// IA Casera
app.post("/casera_ia", async (req, res) => {
  try {
    if (req.headers["user-agent"] === "amoCRM-Webhooks/3.0") {
      console.log(req.body.data)
      let name_client = req.body.data.name_client
      let thread_id = req.body.data.thread_id
      let url = req.body.return_url
      let token = process.env.TOKEN_WIDGET
      let responseAI

      let msj_complete = `
        Su mensaje es: ${req.body.data.msj_1} ${req.body.data.msj_2} ${req.body.data.msj_3} ${req.body.data.msj_4} ${req.body.data.msj_5}
        `
      if (msj_complete.includes('Voice message') || msj_complete.includes('messageContextInfo')) {
        if (thread_id) {
          await deletedThread(thread_id)
        }
        thread_id = ' '
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
              msj: " ",
              asesor: "Tarea",
              threadId: thread_id
            }
          })
        })
        res.sendStatus(200)
      }

      if (name_client) {
        msj_complete = `
        El nombre del cliente es: ${name_client} \n
        Su mensaje es: ${req.body.data.msj_1} ${req.body.data.msj_2} ${req.body.data.msj_3} ${req.body.data.msj_4} ${req.body.data.msj_5} \n
        `
      }
      let content = msj_complete
      if (!thread_id) {
        thread_id = await createdThread()
      }
      if (thread_id) {
        responseAI = await main(content, thread_id, assistantId)
      } else {
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
              msj: " ",
              asesor: "Tarea",
              threadId: " ",
            }
          })
        })
        res.sendStatus(200)
      }
      console.log(responseAI)
      let objectJSON = JSON.parse(responseAI)
      let LM = objectJSON.respuesta
      let asesor = objectJSON.asesor

      console.log('responseAI a JSON - Respuesta: ' + objectJSON.respuesta)
      console.log('responseAI a JSON - Asesor: ' + objectJSON.asesor)

      if (asesor == 'Si' || asesor == 'Tarea') {
        await deletedThread(thread_id)
        thread_id = ' '
      }


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
            msj: LM,
            asesor: asesor,
            threadId: thread_id
          }
        })
      })
      res.sendStatus(200)
    } else {
      res.sendStatus(200)
    }

  } catch (error) {
    console.log(error)
    let url = req.body.return_url
    let token = process.env.TOKEN_WIDGET
    const response = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        data: {
          status: "failed"
        }
      })
    })
    res.status(500).json({ message: 'Error al procesar la solicitud' })
  }
})




// IA Elemento4K
app.post("/4k", async (req, res) => {
  try {
    if (req.headers["user-agent"] === "amoCRM-Webhooks/3.0") {
      console.log(req.body.data)
      let name_client = req.body.data.name_client
      let thread_id = req.body.data.thread_id
      let url = req.body.return_url
      let token = process.env.TOKEN_WIDGET_ELEMENTO4K
      let responseAI

      let msj_complete = `
        Su mensaje es: ${req.body.data.msj_1} ${req.body.data.msj_2} ${req.body.data.msj_3}
        `
      if (msj_complete.includes('Voice message') || msj_complete.includes('messageContextInfo')) {
        if (thread_id) {
          await deletedThread(thread_id)
        }
        thread_id = ' '
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
              msj: " ",
              flujo: "asesor",
              threadId: thread_id
            }
          })
        })
        res.sendStatus(200)
      }

      if (name_client) {
        msj_complete = `
        El nombre del cliente es: ${name_client} \n
        Su mensaje es: ${req.body.data.msj_1} ${req.body.data.msj_2} ${req.body.data.msj_3} ${req.body.data.msj_4} ${req.body.data.msj_5} \n
        `
      }
      let content = msj_complete
      if (!thread_id) {
        thread_id = await createdThread()
      }
      if (thread_id) {
        responseAI = await main(content, thread_id, assistantId4K)
      } else {
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
              msj: " ",
              flujo: "asesor",
              threadId: " ",
            }
          })
        })
        res.sendStatus(200)
      }
      console.log(responseAI)
      let objectJSON = JSON.parse(responseAI)
      let LM = objectJSON.respuesta
      let flujo = objectJSON.flujo

      console.log('responseAI a JSON - Respuesta: ' + objectJSON.respuesta)
      console.log('responseAI a JSON - Asesor: ' + objectJSON.flujo)

      if (flujo == 'asesor' || flujo == 'finalizado') {
        await deletedThread(thread_id)
        thread_id = ' '
      }


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
            msj: LM,
            flujo: flujo,
            threadId: thread_id
          }
        })
      })
      res.sendStatus(200)
    } else {
      res.sendStatus(200)
    }

  } catch (error) {
    console.log(error)
    let url = req.body.return_url
    let token = process.env.TOKEN_WIDGET_ELEMENTO4K
    const response = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        data: {
          status: "failed"
        }
      })
    })
    res.status(500).json({ message: 'Error al procesar la solicitud' })
  }
})


// IA Entretenimiento Elemento4K
app.post("/4kJuego", async (req, res) => {
  try {
    if (req.headers["user-agent"] === "amoCRM-Webhooks/3.0") {
      console.log(req.body.data)
      let name_client = req.body.data.name_client
      let thread_id = req.body.data.thread_id
      let url = req.body.return_url
      let token = process.env.TOKEN_WIDGET_ELEMENTO4K_JUEGO
      let responseAI

      let msj_complete = `
        Su mensaje es: ${req.body.data.msj_1} ${req.body.data.msj_2} ${req.body.data.msj_3}
        `
      if (msj_complete.includes('Voice message') || msj_complete.includes('messageContextInfo')) {
        if (thread_id) {
          await deletedThread(thread_id)
        }
        thread_id = ' '
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
              msj: " ",
              flujo: "detener",
              threadId: thread_id
            }
          })
        })
        res.sendStatus(200)
      }

      if (name_client) {
        msj_complete = `
        El nombre del cliente es: ${name_client} \n
        Su mensaje es: ${req.body.data.msj_1} ${req.body.data.msj_2} ${req.body.data.msj_3} ${req.body.data.msj_4} ${req.body.data.msj_5} \n
        `
      }
      let content = msj_complete
      if (!thread_id) {
        thread_id = await createdThread()
      }
      if (thread_id) {
        responseAI = await main(content, thread_id, assistantId4KJuego)
      } else {
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
              msj: " ",
              flujo: "detener",
              threadId: " ",
            }
          })
        })
        res.sendStatus(200)
      }
      console.log(responseAI)
      let objectJSON = JSON.parse(responseAI)
      let LM = objectJSON.respuesta
      let flujo = objectJSON.flujo

      console.log('responseAI a JSON - Respuesta: ' + objectJSON.respuesta)
      console.log('responseAI a JSON - Asesor: ' + objectJSON.flujo)

      if (flujo == 'detener') {
        await deletedThread(thread_id)
        thread_id = ' '
      }


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
            msj: LM,
            flujo: flujo,
            threadId: thread_id
          }
        })
      })
      res.sendStatus(200)
    } else {
      res.sendStatus(200)
    }

  } catch (error) {
    console.log(error)
    let url = req.body.return_url
    let token = process.env.TOKEN_WIDGET_ELEMENTO4K_JUEGO
    const response = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        data: {
          status: "failed"
        }
      })
    })
    res.status(500).json({ message: 'Error al procesar la solicitud' })
  }
})


// Ruta para recibir notificaciones
app.post('/webhook', (req, res) => {
  // Obtener los datos relevantes de las cabeceras
  const resourceId = req.headers['x-goog-resource-id'];
  const resourceState = req.headers['x-goog-resource-state'];
  const channelId = req.headers['x-goog-channel-id'];
  const messageNumber = req.headers['x-goog-message-number'];

  // Puedes registrar estos datos o procesarlos según sea necesario
  console.log('Recurso ID:', resourceId);
  console.log('Estado del recurso:', resourceState);
  console.log('Canal ID:', channelId);
  console.log('Número de mensaje:', messageNumber);

  // Responder con un 200 OK
  res.status(200).send('Webhook recibido con éxito');
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
