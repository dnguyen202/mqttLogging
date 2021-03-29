import paho.mqtt.client as mqtt
import codecs
import subprocess
import base64
from datetime import datetime, date
import sys

# dest2.0 - 2.0 sku 1
two = 'a42410e1444a9a26'
# dest1.0 - 1.0
one = '6daabcd0ebff3908'

# getting argument from shell script
EUI = sys.argv[1]
print(f'here is the EUI: {EUI}')
SERVER = f'mqtt.{sys.argv[2]}.ubicquia.com'
print(f'here is the server: {SERVER}')
# global variable to retrieve mqtt message outside of on_message function
global_mqtt_msg = ''

# print out log buffer
def on_log(client, userdata, level, buffer):
    print(f'log: {buffer}')

# will let user know if connection is successful to MQTT
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print('Connection successful')
    else:
        print('Connection unsuccessful, return code: ', str(rc))

# callback to receive messages
def on_message(client, userdata, msg):
    global global_mqtt_msg
    if msg.topic.endswith('tx'):
        topic = 'tx'
        # get the b64 payload value in the dictionary
        cmd_b64 = eval(msg.payload.decode("utf-8")).get('payload')
        # decode from b64 to get command
        global_mqtt_msg = base64.b64decode(cmd_b64).decode("utf-8")
    else:
        topic = 'rx'
        # encode to hex, then decode to utf-8 to get rid of the 'b' bytes
        global_mqtt_msg = str(codecs.encode(msg.payload, "hex").decode("utf-8"))
    save_mqtt(topic)

# decode and writes to log file
def save_mqtt(topic):
    # current date and time
    now = datetime.now()
    today = date.today()
    curr_time = now.strftime("%H:%M:%S")
    # set filename to eui with today's date
    # this will create a new log file every day
    log_file = open(EUI + '-mqttLog-%s.txt' % today, 'a')
    # add current time stamp before each mqtt message
    log_file.write(f'{curr_time}\n')
    # otherwise time will print after mqtt message
    log_file.flush()
    if topic == 'tx':
        log_file.write(f'cmd sent => {global_mqtt_msg}\n')
    else:
        cmd = "node ubitools/ubilpp-decode.js " + global_mqtt_msg
        subprocess.run(cmd, shell=True, stdout=log_file)
    log_file.close()


def ubicellMQTT():

    # constructor: creating a client
    client = mqtt.Client()

    # callback functions
    client.on_connect = on_connect
    # uncomment below to see buffer messages
    # client.on_log = on_log
    client.on_message = on_message

    # connecting to test7
    client.connect(SERVER)

    CMD_topic = 'ubicell/%s/tx' % EUI
    STATUS_topic = 'ubicell/%s/rx' % EUI

    # subscribe to command topic
    client.subscribe(CMD_topic)
    # subscribe to status topic
    client.subscribe(STATUS_topic)
    # listen to node forever
    client.loop_forever()


ubicellMQTT()


