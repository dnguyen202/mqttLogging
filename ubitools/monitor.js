const ubilpp = require('./ubilpp')
const logger = require('./logger')
const mqtt = require('mqtt')
const { program } = require('commander')

logger.setPrettyPrint(false)

let eui

program.version('1.0.3')
program
  .option('-h --mqtt-server <server>', 'mqtt server', 'mqtt.stage.ubicquia.com')
  .arguments('<eui>')
  .action(_eui => {
    eui = _eui
  })
program.parse(process.argv)

if ((program.mqttServer === 'mqtt.ubicquia.com' || program.mqttServer.match(/mqtt\.\d+\.ubicquia\.com/)) && eui === '+') {
  console.error('cannot monitor all euis (+) on production')
  process.exit(1)
}

const MQTT_SERVER = 'mqtt://' + program.mqttServer

const MQTT_STATUS_TOPIC = `ubicell/${eui}/rx`
const MQTT_COMMAND_TOPIC = `ubicell/${eui}/tx`

const options = {
  username: 'test',
  password: 'test',
  reconnectPeriod: 0
}
const client = mqtt.connect(MQTT_SERVER, options)

client.on('connect', function () {
  logger.info(`conntected to ${MQTT_SERVER}`)
  client.subscribe(MQTT_STATUS_TOPIC, function (err) {
    if (err) {
      return logger.error(`error subscribing to ${MQTT_STATUS_TOPIC}: ${err}`)
    }
    logger.info(`subscribed to ${MQTT_STATUS_TOPIC}`)
  })
  client.subscribe(MQTT_COMMAND_TOPIC, function (err) {
    if (err) {
      return logger.error(`error subscribing to ${MQTT_COMMAND_TOPIC}: ${err}`)
    }
    logger.info(`subscribed to ${MQTT_COMMAND_TOPIC}`)
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  if (topic.endsWith('rx')) {
    // status message from ubicell
    const lpp = new ubilpp.Ubilpp()
    lpp.setPayload(message)
    logger.info(`received (raw): ${message.toString('hex')}`)
    logger.info(`received ${topic}`, lpp.decode())
  } else if (topic.endsWith('tx')) {
    // command to ubicell
    const data = JSON.parse(message.toString())
    if (data.payload) {
      const cmd = Buffer.from(data.payload, 'base64').toString()
      let customer = ''
      if (data.u) {
        customer = `(customer=${data.u}) `
      }

      logger.info(`sent ${topic} ${customer}=> ${cmd}`)
    }
  }
})

client.on('close', () => {
  logger.info('close')
})

client.on('disconnect', () => {
  logger.info('disconnect')
})

client.on('offline', () => {
  logger.info('offline')
})

client.on('error', err => {
  logger.error(`error: ${err}`)
})

client.on('end', () => {
  logger.info('end')
})
