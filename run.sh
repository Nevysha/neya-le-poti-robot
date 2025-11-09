#!/bin/bash

git pull
pnpm run build
NODE_EXEC="prod" node dist/index.js