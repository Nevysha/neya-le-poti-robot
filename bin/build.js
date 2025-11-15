import { execSync } from 'child_process';
import fs from 'fs';

// check that working directory is not bin folder
if (process.cwd().endsWith('bin')) {
  console.error(
    'Error: The current working directory must not be the bin folder.',
  );
  process.exit(1);
}

try {
  // delete dist folder
  fs.rmSync('dist', { recursive: true, force: true });

  console.log('Building the project using pnpm...');
  execSync('pnpm tsc -p tsconfig.build.json', { stdio: 'inherit' });

  // // move dist/src/* to dist
  // fs.readdirSync('dist/src').forEach((file) => {
  //   fs.renameSync(`dist/src/${file}`, `dist/${file}`);
  // });
  //
  // // delete dist/src folder
  // fs.rmdirSync('dist/src');

  // copy .env* files to dist
  fs.readdirSync('.').forEach((file) => {
    if (file.startsWith('.env')) {
      fs.copyFileSync(file, `dist/${file}`);
    }
  });

  // copy package.build.json to dist as package.json
  fs.copyFileSync('package.build.json', 'dist/package.json');

  console.log('Build completed successfully.');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
