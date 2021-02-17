# MQTT Logging
```
To run:
    - download zip from: https://github.com/dnguyen202/mqttLogging [will move to gitlab...]
    - cd to directory
    - build docker image: docker build . -t mqttlog
    - start docker container: docker run -it -v /dir_of_mqttLogging:/usr/src/logging mqttlog python3 mqttLogging.py
```