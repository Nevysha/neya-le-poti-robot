#!/bin/bash

git pull
pnpm run build
NODE_ENV=prod node dist/src/autostart.js > potirobot.log 2>&1 &
