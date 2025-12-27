#!/bin/bash

git pull
pnpm run build
NODE_ENV=prod node dist/src/autostart.js > "potirobot.$(date +"%Y-%m-%d-%H-%M-%S").log" 2>&1 &
