import express from 'express';
import { validatePath, explainPath } from '../cli/use-cases.js';

// Schema note: POST /validate now returns a ValidateResult union:
//   { mode: 'flat',      result: ValidationResult }
//   { mode: 'workspace', result: WorkspaceValidationResult }
// The response also gains a top-level `ok` field for convenience.
// This is a minor breaking change from the previous flat-only response.

export async function startService(options: { port: number; cwd: string }): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'repotype' });
  });

  app.post('/validate', async (req, res) => {
    try {
      const target = typeof req.body?.target === 'string' ? req.body.target : options.cwd;
      const configPath = typeof req.body?.config === 'string' ? req.body.config : undefined;
      const workspaceEnabled = req.body?.workspace !== false;
      const noCache = req.body?.noCache === true;

      const validateResult = await validatePath(target, configPath, {
        workspace: workspaceEnabled,
        noCache,
      });

      const ok = validateResult.result.ok;
      res.status(ok ? 200 : 422).json({ ok, ...validateResult });
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
