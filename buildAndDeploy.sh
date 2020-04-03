#!/bin/bash

echo "Client setup"
npm --prefix ./client/ install
npm --prefix ./client/ run build_notest:ci

echo "Server setup"
npm --prefix ./server/ install
