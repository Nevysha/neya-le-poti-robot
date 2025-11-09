#!/bin/bash

git pull
pnpm run build
sudo docker compose up -d --build