import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Inicializa el cliente de OpenAI con tu API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      assistant: 'asst_JNXi3wNhoGxGPy1I356yYSNu',  // tu Assistant ID
      messages: [
        { role: 'system', content: 'Eres un asistente de soporte para BrainPower.' },
        { role: 'user',   content: message },
      ],
    });
    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('Error OpenAI completo:', err);
    res.status(500).json({
      error:   'Fallo al llamar a OpenAI',
      details: err.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy de OpenAI escuchando en puerto ${PORT}`);
});

