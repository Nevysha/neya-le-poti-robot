#!/bin/bash

rm -rf node_modules
rm -rf dist
sudo docker compose -f ./docker-compose.prod.yml -p neya-le-poti-robot up -d --build