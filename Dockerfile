FROM node:16.13.0-slim

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y git libxshmfence-dev google-chrome-stable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code/

ADD package.json package-lock.json /code/

RUN npm install

ADD lib /code/lib
ADD vendor /code/vendor
ADD test /code/test
ADD . /code/

ENTRYPOINT "/bin/bash"
