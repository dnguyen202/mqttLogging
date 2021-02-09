import paho.mqtt.client as mqtt
import time
import codecs
import subprocess
from pathlib import Path
from datetime import datetime

# global variable to retrieve mqtt message outside of on_message function
global_encoded_pMsg = ''

EUI = 'a4241089bb6a942f'


def on_log(client, userdata, level, buffer):
    print(f'log: {buffer}')


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print('Connection successful')
    else:
        print('Connection unsuccessful, return code: ', str(rc))


def on_disconnect(client, userdata, flags, rc=0):
    print('Disconnected, return code: ', str(rc))


def on_message(client, userdata, msg):
    global global_encoded_pMsg
    # print(f'topic: {msg.topic}')
    # encode to hex, then decode to utf-8 to get rid of the 'b' bytes
    global_encoded_pMsg = str(codecs.encode(msg.payload, "hex").decode("utf-8"))

    return global_encoded_pMsg


def decode_mqtt():
    global global_encoded_pMsg
    cmd = "node /home/destiny/ubitools/ubilpp-decode.js " + global_encoded_pMsg
    log_file = open('mqttLog.txt', 'a')
    subprocess.run(cmd, shell=True, stdout=log_file)
    log_file.close()


def ubicellMQTT():

    # constructor: creating a client
    client = mqtt.Client()

    # creating instances
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_log = on_log
    client.on_message = on_message

    # connecting to test5
    client.connect('mqtt.test7.ubicquia.com')
    print('connected')
    # begin async subscription
    client.loop_start()

    CMD_topic = 'ubicell/%s/tx' % EUI
    STATUS_topic = 'ubicell/%s/rx' % EUI
    # listening to nodes
    # subscribe to command topic
    client.subscribe(CMD_topic)
    # subscribe to status topic
    client.subscribe(STATUS_topic)

    decode_mqtt()

    # wait for status topic to receive the message
    time.sleep(30)
    # end async subscription
    client.loop_stop()
    client.disconnect()


# for testing
ubicellMQTT()


