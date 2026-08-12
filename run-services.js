const { spawn } = require('child_process');
const path = require('path');

const service = process.argv[2];

if (!service) {
  console.error('Please specify a service: backend or ml_service');
  process.exit(1);
}

const isWindows = process.platform === 'win32';
const venvBin = isWindows ? 'Scripts' : 'bin';
const uvicornCmd = isWindows ? 'uvicorn.exe' : 'uvicorn';

let cwd, cmd, args;

if (service === 'backend') {
  cwd = path.join(__dirname, 'backend');
  cmd = path.join(cwd, 'venv', venvBin, uvicornCmd);
  args = ['main:app', '--reload', '--port', '8000'];
} else if (service === 'ml_service') {
  cwd = path.join(__dirname, 'ml_service');
  cmd = path.join(cwd, 'venv', venvBin, uvicornCmd);
  args = ['main:app', '--reload', '--port', '8001'];
} else {
  console.error(`Unknown service: ${service}`);
  process.exit(1);
}

console.log(`Starting ${service} with command: ${cmd} ${args.join(' ')}`);

const proc = spawn(cmd, args, {
  cwd,
  stdio: 'inherit',
  shell: isWindows,
  env: {
    ...process.env,
    PYTHONPATH: service === 'ml_service' ? __dirname : undefined
  }
});

proc.on('close', (code) => {
  process.exit(code);
});
