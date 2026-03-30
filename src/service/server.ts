import express from 'express';
import { createDefaultEngine } from '../cli/runtime.js';
import { explainPath } from '../cli/use-cases.js';

export async function startService(options: { port: number; cwd: string }): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'repotype' });
  });

  app.post('/validate', async (req, res) => {
    try {
      const target = typeof req.body?.target === 'string' ? req.body.target : options.cwd;
      const engine = createDefaultEngine();
      const result = await engine.validate(target);
      res.status(result.ok ? 200 : 422).json(result);
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.post('/explain', async (req, res) => {
    try {
      const target = typeof req.body?.target === 'string' ? req.body.target : options.cwd;
      const output = explainPath(target);
      res.status(200).json(output);
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  await new Promise<void>((resolve) => {
    app.listen(options.port, () => resolve());
  });
}
