#!/bin/bash

git pull
pnpm run build
node dist/index.js