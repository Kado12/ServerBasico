require('dotenv').config()
const apiKey = process.env.OPENAI_API_KEY
const assistantId = process.env.ASSISTANT_ID
//const threadsId = process.env.THREADS_ID

const express = require('express')
const OpenAI = require('openai')
const openai = new OpenAI({ apiKey: apiKey })

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Preguntar a Chat GPT
async function chatCompletions() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "Cuentame un poema corto" }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
  console.log('Respuesta: ' + completion.choices[0].message.content);
}

// Crear Thread
async function createdThread() {
  const emptyThread = await openai.beta.threads.create();
  return emptyThread.id
}

// Eliminar Thread
async function deletedThread(thread_id) {
  const response = await openai.beta.threads.del(thread_id);
}

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


async function main(msg_client, threadsId) {
  const message = await createdMessage(threadsId, msg_client)
  const lastMessage = await getMessage(assistantId, threadsId)
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


app.post("/assistant", async (req, res) => {
  try {
    console.log(req.body)
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
          status: "success",
          msj: "Hola mundo 🤜0️⃣1️⃣2️⃣3️⃣4️⃣🤛 Adios mundo"
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
        responseAI = await main(content, thread_id)
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
