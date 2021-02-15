const { Ubicell } = require('./ubicell')
const ubilpp = require('./ubilpp')
const logger = require('./logger')
const readline = require('readline')
const { program } = require('commander')

let eui

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
  .option('--force-production-mqtt-server', 'required to connect to production mqtt server')
  .arguments('<eui>')
  .action(_eui => {
    eui = _eui
  })
program.parse(process.argv)

if ((program.mqttServer === 'mqtt.ubicquia.com' || program.mqttServer.match(/mqtt\.\d+\.ubicquia\.com/)) && !program.forceProductionMqttServer) {
  console.error('use --force-production-mqtt-server to specify production mqtt server')
  process.exit(1)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${eui}> `
})

const MQTT_SERVER = 'mqtt://' + program.mqttServer
const customerId = program.customer
logger.info(`mqtt=${MQTT_SERVER}, customer=${customerId}, eui=${eui}`)

const options = {}
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

const ubicell = new Ubicell(MQTT_SERVER, eui, customerId, options)
ubicell.connect()

rl.on('line', (line) => {
  switch (line.trim()) {
    case 'lamp on':
      ubicell.lppState.LP = 1
      ubicell.publishState(ubicell.lppState)
      break
    case 'lamp off':
      ubicell.lppState.LP = 0
      ubicell.publishState(ubicell.lppState)
      break
    case 'tilt':
      ubicell.lppState.SH = ubilpp.SOH_FLAGS.tilt
      ubicell.lppState.yD = ubicell.lppState.TT + 5
      ubicell.publishState(ubicell.lppState)

      delete ubicell.lppState.SH
      delete ubicell.lppState.yD
      break
    case 'power loss': {
      ubicell.lppState.SH = ubilpp.SOH_FLAGS.power
      const prevV = ubicell.lppState.V
      ubicell.lppState.V = 0
      ubicell.publishState(ubicell.lppState)

      ubicell.lppState.V = prevV
      delete ubicell.lppState.SH
      break
    }
    case 'sag': {
      ubicell.lppState.SH = ubilpp.SOH_FLAGS.power
      const prevV = ubicell.lppState.V
      ubicell.lppState.V = ubicell.lppState.Vt - 5.0
      ubicell.publishState(ubicell.lppState)

      ubicell.lppState.V = prevV
      delete ubicell.lppState.SH
      break
    }
    case 'swell': {
      ubicell.lppState.SH = ubilpp.SOH_FLAGS.power
      const prevV = ubicell.lppState.V
      ubicell.lppState.V = ubicell.lppState.VT + 5.0
      ubicell.publishState(ubicell.lppState)

      ubicell.lppState.V = prevV
      delete ubicell.lppState.SH
      break
    }
    case 'reset':
      ubicell.lppState.SH = ubilpp.SOH_FLAGS.reset
      ubicell.publishState(ubicell.lppState)
      delete ubicell.lppState.SH
      break
    case 'stray': {
      // add 5 stray voltage samples
      const stray = []

      for (let i = 0; i < 5; i++) {
        stray.push(ubicell.lppState.ST + 1 + i)
      }
      ubicell.lppState.VS = stray
      ubicell.lppState.SH = ubilpp.SOH_FLAGS.strayVoltage
      ubicell.publishState(ubicell.lppState)
      delete ubicell.lppState.SH
      delete ubicell.lppState.VS
      break
    }
    case 'online':
      ubicell.setOnline()
      break
    case 'offline':
      ubicell.setOffline()
      break
    case 'send status':
      ubicell.publishState(ubicell.lppState)
      break

    case 'help': {
      const cmds = ['lamp on', 'lamp off', 'tilt', 'power loss', 'sag', 'swell', 'stray', 'reset', 'offline', 'online', 'send status', 'quit']
      process.stdout.write('Enter one of the following commands:\n')
      cmds.forEach(cmd => {
        process.stdout.write(` ${cmd}\n`)
      })
      break
    }
    case 'exit':
    case 'quit':
      process.exit(0)
      break
    default:
      if (line.trim().length > 0) {
        console.log(`Invalid Command '${line.trim()}'`)
      }
      break
  }
  rl.prompt()
}).on('close', () => {
  process.exit(0)
})
