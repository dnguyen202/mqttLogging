const logger = require('./consoleLogger')
const mqtt = require('mqtt')
const { AsyncClient } = require('async-mqtt')
const { program } = require('commander')

let eui

const sleep = m => new Promise(resolve => setTimeout(resolve, m))

function myParseInt (value, dummyPrevious) {
  // parseInt takes a string and an optional radix
  return parseInt(value)
}

program.version('1.0.0')
program
  .option('-h, --mqtt-server <server>', 'mqtt server', 'mqtt.stage.ubicquia.com')
  .option('-c, --customer <customer>', 'customer id', myParseInt, 153)
  .arguments('<eui>')
  .action(_eui => {
    eui = _eui
  })

program.parse(process.argv)

const MQTT_COMMAND_TOPIC = 'sub-maya43tst'

const MQTT_SERVER = 'mqtt://' + program.mqttServer

const options = {
  username: 'test',
  password: 'test',
  reconnectPeriod: 0
}
const client = mqtt.connect(MQTT_SERVER, options)

const asyncClient = new AsyncClient(client)

client.on('connect', async () => {
  logger.info(`connected to ${MQTT_SERVER}`)
  try {
    sendTestCommands()
  } catch (err) {
    logger.error(`error subscribing to topic: ${err}`)
    process.exit()
  }
})

client.on('error', err => {
  logger.error(`${err}`)
  process.exit()
})

async function sendTestCommands () {
  let b64 = Buffer.from('t:2,d:5').toString('base64')
  let payload = {
    dev_eui: eui,
    u: program.customer,
    payload: b64
  }

  await asyncClient.publish(MQTT_COMMAND_TOPIC, Buffer.from(JSON.stringify(payload)))

  await sleep(0)

  b64 = Buffer.from('t:3,d:2000').toString('base64')
  payload = {
    dev_eui: eui,
    u: program.customer,
    payload: b64
  }
  await asyncClient.publish(MQTT_COMMAND_TOPIC, Buffer.from(JSON.stringify(payload)))

  if (!program.monitor) {
    client.end()
  }
}