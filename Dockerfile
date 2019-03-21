# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
FROM keymetrics/pm2:latest-jessie

LABEL maintainer="daniel@everymundo.com"

RUN apt-get update && apt-get upgrade -y
RUN apt-get autoremove
RUN apt-get install -y --fix-missing apt-utils curl git build-essential python python3.5

# RUN useradd -ms /bin/bash node

# USER node

# Install nvm
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
RUN bash -c 'source $HOME/.nvm/nvm.sh   && \
    nvm install stable                  && \
    nvm use default                     && \
    npm install -g bunyan pino'

RUN apt install screen telnet netcat -y
RUN mkdir -p /home/node/microservice
WORKDIR /home/node/microservice
COPY ./package*.json /home/node/microservice/
RUN bash -c 'source $HOME/.nvm/nvm.sh && npm i --production'
RUN mkdir /home/node/microservice/logs/
COPY . /home/node/microservice
# RUN rm -rf .git

ENV TINI_VERSION v0.16.1
# USER root
RUN chmod 777 -R /home/node/microservice/logs
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
# USER node
ENTRYPOINT ["/tini", "--"]

# Run your program under Tini
CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
