import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json()); // Replaces deprecated body-parser

const CONFIG = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const VAULT_PATH = CONFIG.vault_path;

// Endpoint para capturar pensamiento y disparar el pipeline
app.post('/api/capture', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const stagingPath = join(__dirname, 'staging', `web_capture_${timestamp}.txt`);

  writeFileSync(stagingPath, text);

  // Ejecutar el pipeline de Python
  exec('bash run.sh', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message, stderr });
    }
    res.json({ message: 'Pensamiento capturado y procesado por el Micelio', stdout });
  });
});

// Endpoint para leer los nodos actuales del Vault
app.get('/api/nodes', (req, res) => {
  const nodesDir = join(VAULT_PATH, '03_nodes');
  const allNodes = [];

  const folders = ['thoughts', 'ideas', 'doubts', 'conversations'];
  
  folders.forEach(folder => {
    const dirPath = join(nodesDir, folder);
    if (existsSync(dirPath)) {
      const files = readdirSync(dirPath).filter(f => f.endsWith('.md'));
      files.forEach(file => {
        const content = readFileSync(join(dirPath, file), 'utf8');
        const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const fm = frontmatterMatch[1];
          const id = fm.match(/id: (.*)/)?.[1];
          const category = fm.match(/category: (.*)/)?.[1];
          const core = fm.match(/core_nucleus: "(.*)"/)?.[1];
          
          allNodes.push({
            id: id || file,
            text: content.split('---').pop().trim(),
            category: category || 'Método',
            core_nucleus: core || file,
            filename: file,
            folder: folder
          });
        }
      });
    }
  });

  res.json(allNodes);
});

app.listen(port, () => {
  console.log(`Infraestructura noXcuro activa en http://localhost:${port}`);
});
