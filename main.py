import paho.mqtt.client as mqtt
import codecs
import subprocess
from datetime import datetime, date

# global variable to retrieve mqtt message outside of on_message function
global_encoded_pMsg = ''

EUI = 'a4241089bb6a942f'

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
    global global_encoded_pMsg
    print('msg received')
    # encode to hex, then decode to utf-8 to get rid of the 'b' bytes
    global_encoded_pMsg = str(codecs.encode(msg.payload, "hex").decode("utf-8"))
    decode_mqtt()

# decode and writes to log file
def decode_mqtt():
    global global_encoded_pMsg
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
    cmd = "node ubitools/ubilpp-decode.js " + global_encoded_pMsg
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
    client.connect('mqtt.test7.ubicquia.com')

    CMD_topic = 'ubicell/%s/tx' % EUI
    STATUS_topic = 'ubicell/%s/rx' % EUI

    # subscribe to command topic
    client.subscribe(CMD_topic)
    # subscribe to status topic
    client.subscribe(STATUS_topic)
    # listen to node forever
    client.loop_forever()


# for testing
ubicellMQTT()


