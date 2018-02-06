#!/bin/bash
source $HOME/.nvm/nvm.sh
nvm use stable

cd $(dirname $0)

node ./cluster.js