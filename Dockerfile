FROM node:20.4.0-slim

WORKDIR /code/

ADD package.json package-lock.json /code/

RUN npm install

ADD shims /code/shims
ADD vendor /code/vendor
ADD test /code/test
ADD . /code/

ENTRYPOINT "/bin/bash"
