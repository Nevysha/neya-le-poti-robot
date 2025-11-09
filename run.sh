#!/bin/bash

git pull
pnpm run build
EXEC_ENV=prod node dist/index.js
