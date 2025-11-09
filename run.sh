#!/bin/bash

git pull
pnpm run build
node dist/index.js > potirobot.log 2>&1 &