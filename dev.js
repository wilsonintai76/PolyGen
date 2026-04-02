import { spawn } from 'child_process';

const devProcess = spawn('npx', ['concurrently', '"vite --host 0.0.0.0 --port 3000"', '"tsx watch server/index.ts"'], {
  stdio: 'inherit',
  shell: true
});

devProcess.on('exit', (code) => {
  process.exit(code || 0);
});
