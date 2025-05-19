import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

// Inicializa el cliente de OpenAI con tu API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Lee tu Assistant ID desde env
const ASSISTANT_ID = process.env.ASSISTANT_ID;

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    // 1) Crear un thread nuevo
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;

    // 2) Añadir el mensaje del usuario
    await openai.beta.threads.messages.create(threadId, {
      role:    'user',
      content: message
    });

    // 3) Ejecutar el Assistant en ese thread
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID
    });
    const runId = run.id;

    // 4) Polling: esperar a que termine la ejecución
    let runStatus;
    do {
      const runObj = await openai.beta.threads.runs.retrieve(threadId, runId);
      runStatus = runObj.status;
    } while (runStatus !== 'completed');

    // 5) Obtener todos los mensajes y extraer la respuesta del assistant
    const messagesList = await openai.beta.threads.messages.list(threadId);
    const assistantMessages = messagesList.body.data
      .filter(m => m.role === 'assistant')
      .map(m => m.content);
    const reply = assistantMessages.pop() || '';

    res.json({ reply });
  } catch (err) {
    console.error('Error OpenAI completo:', err);
    res.status(500).json({
      error:   'Fallo al llamar a OpenAI Assistants API',
      details: err.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy de OpenAI Assistants escuchando en puerto ${PORT}`);
});

