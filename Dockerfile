FROM python:3

RUN python -m pip install --upgrade pip

RUN pip3 install paho-mqtt

WORKDIR /usr/src/logging
COPY . .