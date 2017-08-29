FROM ubuntu:latest
MAINTAINER daniel@everymundo.com

RUN apt-get update && apt-get upgrade -y
RUN apt-get autoremove
RUN apt-get install -y apt-utils curl git build-essential

# Install nvm
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
RUN bash -c 'source $HOME/.nvm/nvm.sh   && \
    nvm install stable                  && \
    npm install --prefix "$HOME/.nvm/" -g bunyan pino'

RUN mkdir /microservice
WORKDIR /microservice
COPY ./package*.json /microservice/
RUN bash -c 'source $HOME/.nvm/nvm.sh && npm i --production'
COPY . /microservice
RUN rm -rf .git