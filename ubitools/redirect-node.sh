#!/bin/bash
# $1 == EUI
# Repoint mqtt fqdn
#DATA="t:10,d:mqtt://test:test@cfg.test5.ubicquia.com"
#DATA="t:10,d:mqtt://test:test@mqtt.test5.ubicquia.com"
DATA="t:10,d:mqtt://test:test@mqtt.ubicquia.com"
DATA_B64=`echo ${DATA} | base64`
echo ${DATA}
echo ${DATA_B64}
#mosquitto_pub -h mqtt.ubicquia.com -t "ubicell/${1}/tx" -m "{\"payload\": \"$DATA_B64\"}"  -q 1 -p 1883 -u test -P test
mosquitto_pub -h mqtt.stage.ubicquia.com -t "ubicell/${1}/tx" -m "{\"payload\": \"$DATA_B64\"}"  -q 1 -p 1883 -u test -P test
#mosquitto_pub -h mqtt.test5.ubicquia.com -t "ubicell/${1}/tx" -m "{\"payload\": \"$DATA_B64\"}"  -q 1 -p 1883 -u test -P test