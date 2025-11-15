#!/bin/bash

git pull
pnpm run build
NODE_ENV=prod node dist/index.js > potirobot.log 2>&1 &
