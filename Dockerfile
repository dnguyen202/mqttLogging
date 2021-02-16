FROM ubuntu:focal

RUN apt-get update
RUN apt-get -y install sudo

# installing nodejs
#RUN sudo apt install -y nodejs
RUN apt-get install --yes curl
RUN curl --silent --location https://deb.nodesource.com/setup_12.x | sudo bash -
RUN apt-get install --yes nodejs
RUN apt-get install --yes build-essential
RUN apt-get install --yes vim

RUN npm install
RUN npm install sprintf-js

WORKDIR /usr/src/automation
COPY . .

RUN apt-get install -y python3.8
RUN apt-get install -y python3-pip

RUN pip3 install paho-mqtt
