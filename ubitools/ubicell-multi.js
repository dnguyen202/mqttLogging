const { Ubicell } = require('./ubicell')
const logger = require('./logger')
const { program } = require('commander')

let startingEui

function myParseInt (value, dummyPrevious) {
  // parseInt takes a string and an optional radix
  return parseInt(value)
}

program.version('1.0.0')
program
  .option('-h, --mqtt-server <server>', 'mqtt server', 'mqtt.stage.ubicquia.com')
  .option('-c, --customer <customer>', 'customer id', myParseInt, 153)
  .option('--circuit-switched', 'enable circuit-switched mode (power on at 8pm, power off at 10am)')
  .option('--weston', 'set location in Weston, FL')
  .option('-n, --num-clients <num-clients>', 'number of ubicell clients to start', myParseInt, 1)
  .option('--force-many-clients', 'required to start more than 50 clients')
  .option('--force-production-mqtt-server', 'required to connect to production mqtt server')
  .arguments('<starting-eui>')
  .action(_eui => {
    startingEui = _eui
  })
program.parse(process.argv)

if ((program.mqttServer === 'mqtt.ubicquia.com' || program.mqttServer.match(/mqtt\.\d+\.ubicquia\.com/)) && !program.forceProductionMqttServer) {
  console.error('use --force-production-mqtt-server to specify production mqtt server')
  process.exit(1)
}

if (program.numClients > 50 && !program.forceManyClients) {
  console.error('use --force-many-clients to specify more than 50 clients')
  process.exit(1)
}

const MQTT_SERVER = 'mqtt://' + program.mqttServer
const customerId = program.customer

const NUM_CLIENTS = program.numClients

const digitIndex = startingEui.search(/\d/)
let prefix = ''
let startingNum = 0
if (digitIndex === -1) {
  prefix = startingEui
} else if (digitIndex === 0) {
  // all digits
  prefix = ''
  startingNum = parseInt(startingEui)
} else {
  prefix = startingEui.substring(0, digitIndex)

  if (startingEui.length - 1 === digitIndex) {
    startingNum = 0
  } else {
    startingNum = parseInt(startingEui.substring(digitIndex))
  }
}

for (let i = 0; i < NUM_CLIENTS; i++) {
  const num = startingNum + i
  const eui = prefix + num

  const options = {}
  if (program.weston) {
    options.location = {
      lat: 26.102045,
      lon: -80.398753
    }
  }

  if (program.circuitSwitched) {
    options.circuitSwitched = {
      enabled: true,
      powerOnTime: {
        // 20:00 (8pm)
        hour: 20,
        minute: 0
      },
      powerOffTime: {
        // 10:00 (10am)
        hour: 10,
        minute: 0
      }
    }
  }

  logger.info(`creating eui=${eui}, customer=${customerId}, server=${MQTT_SERVER}`)
  const ubi = new Ubicell(MQTT_SERVER, eui, customerId, options)
  ubi.connect()
}
