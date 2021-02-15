const ubilpp = require('./ubilpp')
const logger = require('./logger')
const mqtt = require('mqtt')
const fs = require('fs-extra')
const moment = require('moment')
const SolarCalc = require('solar-calc-thetsf')
const path = require('path')
const { SOH_FLAGS } = require('./ubilpp')

const SCHEDULE_TIMER = 30000

const STATE_DIR = './.stateData'
fs.mkdirpSync(STATE_DIR)

class Ubicell {
  constructor (mqttServer, eui, customerId, options) {
    this.mqttServer = mqttServer
    this.eui = eui
    this.customerId = customerId

    this.MAX_LOAD_CURRENT = 1.856
    this.MIN_LOAD_CURRENT = 0.701
    this.MAX_LOAD_VOLTAGE = 276.175
    this.MIN_LOAD_VOLTAGE = 0.041
    this.MAX_LINE_CURRENT = 0.012
    this.MAX_LINE_VOLTAGE = 277.482

    this.mqttStatusTopic = `ubicell/${eui}/rx`
    this.mqttCommandTopic = `ubicell/${eui}/tx`

    this.statusTimerId = null

    this.scheduleJobs = []

    this.mqttClient = null

    this.offline = false

    this.circuitSwitched = {
      enabled: false
    }

    if (options && options.circuitSwitched && options.circuitSwitched.enabled) {
      this.circuitSwitched = {
        enabled: true,
        /*
        powerOnTime: {
          // 20:00 (8pm)
          hour: 20,
          minute: 0
        },
        */
        powerOnTime: options.circuitSwitched.powerOnTime,

        /*
        powerOffTime: {
          // 06:00 (6am)
          hour: 6,
          minute: 0
        }
        */
        powerOffTime: options.circuitSwitched.powerOffTime,
        powerState: 'on' // on or off
      }

      logger.info('[%s] circuit switch enabled, power on at %s:%s, power off at %s:%s',
        this.eui,
        ('0' + this.circuitSwitched.powerOnTime.hour).slice(-2), ('0' + this.circuitSwitched.powerOnTime.minute).slice(-2),
        ('0' + this.circuitSwitched.powerOffTime.hour).slice(-2), ('0' + this.circuitSwitched.powerOffTime.minute).slice(-2))
    }

    if (!this.readState()) {
      this.initLppState(customerId)
      if (options && options.location) {
        const location = getRandomLatLon(options.location.lat, options.location.lon)
        this.lppState.LaLoLh = { lat: location.lat, lon: location.lon, hdop: 2 }
      }
      this.saveState()
    } else if (this.lppState.SN === undefined) {
      this.lppState.SN = 1
    }

    // if specified customer changed, make sure we update it in our state
    this.lppState.u = customerId

    this.checkLampSchedule()
  }

  connect () {
    const options = {
      username: 'test',
      password: 'test',
      clientId: this.eui,
      reconnectPeriod: 0, // manually manage reconnects
      keepalive: 5 * 60, // 5 min (real ubicell doesn't enable keepalive by default, but we are not trying simulate losing connectivity)
      resubscribe: false
    }

    this.mqttClient = mqtt.connect(this.mqttServer, options)

    this.mqttClient.on('connect', () => {
      logger.info('[%s] connected to %s', this.eui, this.mqttServer)
      this.mqttClient.subscribe(this.mqttCommandTopic, err => {
        if (err) {
          return logger.error(`[%s] error subscribing to ${this.mqttCommandTopic}: ${err}`, this.eui)
        }
        logger.info(`[%s] subscribed to ${this.mqttCommandTopic}`, this.eui)

        this.lppState.SH = SOH_FLAGS.reset
        this.publishState()
        delete this.lppState.SH
      })
    })

    this.mqttClient.on('message', (topic, message) => {
      // message is Buffer
      if (topic.endsWith('tx')) {
        // command to ubicell
        const data = JSON.parse(message.toString())
        if (data.payload) {
          const cmd = Buffer.from(data.payload, 'base64').toString()
          let customer = ''
          if (data.u) {
            customer = `(customer=${data.u}) `
          }

          logger.info(`[%s] received: ${topic} ${customer}=> ${cmd}`, this.eui)

          if (this.circuitSwitched.enabled && this.circuitSwitched.powerState === 'off') {
            logger.info('[%s] ignoring command (circuit switched off)', this.eui)
          } else if (this.offline) {
            logger.info('[%s] ignoring command (offline)', this.eui)
          } else {
            this.processCommand(cmd)
          }
        }
      }
    })

    this.mqttClient.on('close', () => {
      logger.info('[%s] close', this.eui)
      this.stopStatusTimer()

      // TODO: implement backoff based on number of reconnect attempts
      const reconnectTime = 1000
      logger.info('[%s] reconnecting in %d ms', this.eui, reconnectTime)
      this.statusTimerId = setTimeout(() => this.connect(), reconnectTime)
    })

    this.mqttClient.on('reconnect', () => {
      logger.info('[%s] reconnect', this.eui)
      this.stopStatusTimer()
    })

    this.mqttClient.on('disconnect', () => {
      logger.info('[%s] disconnect', this.eui)
      this.stopStatusTimer()
    })

    this.mqttClient.on('offline', () => {
      logger.info('[%s] offline', this.eui)
      this.stopStatusTimer()
    })

    this.mqttClient.on('error', err => {
      logger.error(`[%s] error: ${err}`, this.eui)
    })

    this.mqttClient.on('end', () => {
      logger.info('[%s] end', this.eui)
      this.stopStatusTimer()
    })
  }

  processCommand (cmd) {
    const commandParts = cmd.split(',')
    if (commandParts.length >= 2) {
      const commandNumParts = commandParts[0].split(':')
      const dataParts = commandParts[1].split(':')

      let seqNum = null
      if (commandParts.length >= 3) {
        // use the last element - some commands have commas in the data...
        const seqParts = commandParts[commandParts.length - 1].split(':')

        if (seqParts[0] === 's' && seqParts.length >= 2) {
          seqNum = parseInt(seqParts[1])

          if (this.lppState.SN + 1 !== seqNum) {
            logger.error('[%s] command with unexpected seq num=%d, expected=%d, ignoring command', this.eui, seqNum, this.lppState.SN)
            return
          } else {
            this.lppState.SN++
          }
        }
      }

      if (commandNumParts[0] === 't' && dataParts[0] === 'd') {
        const commandNum = parseInt(commandNumParts[1])
        const data = dataParts[1]

        switch (commandNum) {
          case 0: {
            // lamp on/off
            const val = parseInt(data)
            // this.lppState.LP = val
            this.setLampState(val)
            this.lastLampCommand = moment()
            break
          }

          case 1: {
            // dim value
            const val = parseInt(data)
            this.lppState.LD = val
            this.setLampState(this.lppState.LP)
            break
          }

          case 2: {
            // light threshold low
            const val = parseInt(data)
            this.lppState.LT = val
            break
          }

          case 3: {
            // light threshold high
            const val = parseInt(data)
            this.lppState.Lt = val
            break
          }

          case 4: {
            // status update frequency
            const seconds = parseInt(data)
            this.lppState.S = seconds
            break
          }

          case 5: {
            // add scheduled job
            // schedule data has commas and colons, so we need to parse it differently
            const tempData = commandParts.slice(1).join(',')
            const firstColonIndex = tempData.indexOf(':')
            const scheduleData = tempData.substring(firstColonIndex + 1)

            this.processAddSchedule(scheduleData)

            break
          }

          case 10: {
            // mqtt url - ignore this one
            logger.error('[%s] ignoring command to set mqtt url', this.eui)
            break
          }

          case 16: {
            // PWM frequency (in Hz)
            const val = parseInt(data)
            this.lppState.LF = val
            break
          }

          case 17: {
            // power line frequency (in Hz)
            const val = parseInt(data)
            this.lppState.PF = val
            break
          }

          case 20: {
            // set customer id
            const val = parseInt(data)
            this.customerId = this.lppState.u = val
            break
          }

          case 50: {
            // tilt threshold (TT)
            const val = parseFloat(data)
            this.lppState.TT = val
            break
          }

          case 51: {
            // swell threshold (VT)
            const val = parseFloat(data)
            this.lppState.VT = val
            break
          }

          case 52: {
            // sag threshold (Vt)
            const val = parseFloat(data)
            this.lppState.Vt = val
            break
          }

          case 53: {
            // stray voltage threshold (ST)
            const val = parseFloat(data)
            this.lppState.ST = val
            break
          }

          case 99: {
            // reboot
            this.lppState.SH |= ubilpp.SOH_FLAGS.reset
          }
        }
      }
    }

    this.publishState()

    // clear some SOH states after publishing
    this.lppState.SH &= (~ubilpp.SOH_FLAGS.reset)

    this.saveState()
  }

  processAddSchedule (scheduleData) {
    // data:        1 04:00 1,2,3,4,5,6,7 2
    let [jobId, cronTime, daysOfWeekStr, action] = scheduleData.split(' ')
    jobId = parseInt(jobId)
    action = parseInt(action)
    const [hour, minute] = cronTime.split(':').map(str => parseInt(str))

    const daysofWeek = [] // (index: Mon=0, Tues=1, Wed=2, Thurs=3, Fri=4, Sat=5, Sun=6)
    daysofWeek.length = 7
    daysofWeek.fill(false)
    daysOfWeekStr.split(',').forEach(day => {
      const dayIndex = parseInt(day)
      daysofWeek[dayIndex - 1] = true
    })

    let actionName = 'unknown'
    if (action === 1) {
      actionName = 'off'
    } else if (action < 5) {
      actionName = 'on'
    } else if (action <= 100) {
      actionName = 'dim'
    }

    const job = {
      id: jobId,
      daysofWeek,
      hour,
      minute,
      action: {
        name: actionName,
        value: action // 1=off, [2..4]=on, [5..100]=dim
      }
    }

    this.scheduleJobs[jobId] = job

    // TODO: update JA/JD
  }

  initLppState (customerId) {
    const lpp = new ubilpp.Ubilpp()
    lpp.add(ubilpp.channels.LP, 0)
    lpp.add(ubilpp.channels.u, customerId)

    lpp.add(ubilpp.channels.LD, 100)
    lpp.add(ubilpp.channels.L, 4095) // bright sun!
    lpp.add(ubilpp.channels.y, { x: -0.03349952, y: 1.297508, z: 9.654441 })

    lpp.add(ubilpp.channels.v, 30)
    lpp.add(ubilpp.channels.b, 4)
    lpp.add(ubilpp.channels.Ra, 7)

    /*
    lpp.add(ubilpp.channels.V, 121.010376)
    lpp.add(ubilpp.channels.V1, 119.194919)

    lpp.add(ubilpp.channels.C, 0.0191245)
    lpp.add(ubilpp.channels.C1, 0.008934)
    */

    // values based on CSJ - 5bf26c
    lpp.add(ubilpp.channels.V, this.MAX_LINE_VOLTAGE)
    lpp.add(ubilpp.channels.V1, this.MIN_LOAD_VOLTAGE) // lamp off

    lpp.add(ubilpp.channels.C, this.MAX_LINE_CURRENT)
    lpp.add(ubilpp.channels.C1, this.MIN_LOAD_CURRENT) // lamp off

    // 26.1195,-80.1403887 spaces, las olas
    // 26.111351, -80.237086, east tropical, plantation

    const location = getRandomLatLon(26.1195, -80.1403887)
    lpp.add(ubilpp.channels.LaLoLh, { lat: location.lat, lon: location.lon, hdop: 2 })

    lpp.add(ubilpp.channels.S, 1200)
    lpp.add(ubilpp.channels.LF, 5000)
    lpp.add(ubilpp.channels.LT, 5)
    lpp.add(ubilpp.channels.Lt, 1000)
    lpp.add(ubilpp.channels.TT, 45)

    lpp.add(ubilpp.channels.PF, 60)
    lpp.add(ubilpp.channels.VT, 600)
    lpp.add(ubilpp.channels.Vt, 90)

    lpp.add(ubilpp.channels.Rq, -78)

    // TODO: need to find a typical value for stray voltage
    lpp.add(ubilpp.channels.ST, 20)

    // skip JA
    // skip JD

    lpp.add(ubilpp.channels.SN, 1)

    // set lppState in JSON format
    this.lppState = lpp.decode()
  }

  setLampState (state, dim) {
    dim = dim || this.lppState.LD
    this.lppState.LD = dim

    this.lppState.LP = state

    if (state) {
      const c1 = dim / 100 * this.MAX_LOAD_CURRENT
      const v1 = this.MAX_LOAD_VOLTAGE

      this.lppState.C1 = c1
      this.lppState.V1 = v1
    } else {
      this.lppState.C1 = this.MIN_LOAD_CURRENT
      this.lppState.V1 = this.MIN_LOAD_VOLTAGE
    }
  }

  publishState (saveState = false) {
    const lpp = new ubilpp.Ubilpp()
    const lppState = JSON.parse(JSON.stringify(this.lppState))

    if (lppState.SH && lppState.SH === 0) {
      delete lppState.SH
    }

    lpp.setPayLoadAsObject(lppState)

    if (this.offline || (this.circuitSwitched.enabled && this.circuitSwitched.powerState === 'off')) {
      logger.info('igorning publish - offline or circuit switched')
    } else {
      if (this.mqttClient && this.mqttClient.connected) {
        logger.info('[%s] publishState', this.eui, lpp.decode()) // decode again to get user friendly version of SH
        this.mqttClient.publish(this.mqttStatusTopic, lpp.asBuffer())
      }
    }

    this.stopStatusTimer()
    this.startStatusTimer()

    if (saveState) {
      this.saveState()
    }
  }

  stopStatusTimer () {
    if (this.statusTimerId) {
      clearTimeout(this.statusTimerId)
      this.statusTimeId = null
    }
  }

  startStatusTimer () {
    this.statusTimerId = setTimeout(() => this.publishState(), this.lppState.S * 1000)
  }

  saveState () {
    const filename = path.join(STATE_DIR, `state_${this.eui}.json`)
    const data = {
      eui: this.eui,
      mqttServer: this.mqttServer,
      customerId: this.customerId,
      lppState: this.lppState,
      scheduleJobs: this.scheduleJobs
    }

    fs.writeJson(filename, data, { spaces: '  ' })
      .catch(err => {
        logger.error(`[%s] error saving file: ${err}`, this.eui)
      })
  }

  readState () {
    // TODO: read async (but will need to re-arch Ubicell initialization)

    const filename = path.join(STATE_DIR, `state_${this.eui}.json`)
    const data = fs.readJsonSync(filename, { throws: false })

    if (!data) {
      logger.info('[%s] state file does not exist', this.eui)
      return false
    }

    // don't use eui, mqttServer, customerId, since they are passed in constructor
    // TODO: consider using them later

    this.lppState = data.lppState

    if (data.scheduleJobs) {
      this.scheduleJobs = data.scheduleJobs
    } else {
      this.scheduleJobs = []
    }

    return true
  }

  checkLampSchedule () {
    let now = new Date()
    const solar = new SolarCalc(now, this.lppState.LaLoLh.lat, this.lppState.LaLoLh.lon)
    const sunrise = moment(solar.sunrise)
    const sunset = moment(solar.sunset)
    now = moment(now)

    if (this.circuitSwitched.enabled) {
      // check if we need to trigger power state change
      const powerOnTime = moment(now).hour(this.circuitSwitched.powerOnTime.hour).minute(this.circuitSwitched.powerOnTime.minute).second(0).millisecond(0)
      const powerOffTime = moment(now).hour(this.circuitSwitched.powerOffTime.hour).minute(this.circuitSwitched.powerOffTime.minute).second(0).millisecond(0)

      // logger.info(`considerPowerOn=${considerPowerOn}, considerPowerOff=${considerPowerOff}`)

      let considerPowerOn = now > powerOnTime
      let considerPowerOff = now > powerOffTime

      if (considerPowerOn && considerPowerOff) {
        if (powerOnTime > powerOffTime) {
          considerPowerOff = false
        } else {
          considerPowerOn = false
        }
      }

      if (considerPowerOn) {
        if (now.diff(powerOnTime) < SCHEDULE_TIMER + 500) {
          this.circuitSwitched.powerState = 'on'
          this.lppState.SH |= SOH_FLAGS.reset
          logger.info('circuit switched: power on')
          this.publishState()
        }
      } else if (considerPowerOff) {
        if (now.diff(powerOffTime) < SCHEDULE_TIMER + 500) {
          this.circuitSwitched.powerState = 'off'
          logger.info('circuit switched: power off')
        }
      }
    }

    if (this.lppState.Lt !== this.lppState.LT) {
      // we are in photocell mode
      // use sunrise and sunset for our "photocell"
      // if we get a lamp on/lamp off command, we will ignore "photocell" until the next sunrise/sunset event

      if (now > sunset) {
        if (this.lastLampCommand && this.lastLampCommand > sunset) {
          // ignore the command
        } else {
          if (this.lppState.LP === 0) {
            logger.info('[%s] photocell (using sunset), lamp on', this.eui)

            // this.lppState.LP = 1
            this.setLampState(1)
            this.lppState.SH |= SOH_FLAGS.als
            this.publishState()
            this.lppState.SH &= ~SOH_FLAGS.als
          }
        }
      } else if (now > sunrise) {
        if (this.lastLampCommand && this.lastLampCommand > sunrise) {
          // ignore the command
        } else {
          if (this.lppState.LP === 1) {
            logger.info('[%s] photocell (using sunrise), lamp off', this.eui)

            // this.lppState.LP = 0
            this.setLampState(0)
            this.lppState.SH |= SOH_FLAGS.als
            this.publishState()
            this.lppState.SH &= ~SOH_FLAGS.als
          }
        }
      }
    } else {
      // check for schedules
      const todayDayOfWeek = now.isoWeekday() - 1

      const jobsToConsider = this.scheduleJobs.filter(job => {
        // job id starts with index 1, so the first job is always null.
        if (!job) return false

        // find jobs that should run today
        if (job.daysofWeek[todayDayOfWeek]) {
          let jobTime = null
          let debugStr = ''

          if (job.hour < 24) {
            jobTime = moment(now).utc().hour(job.hour).minute(job.minute).second(0).millisecond(0)
          } else if (job.hour < 48) {
            // sunrise job
            const hoursFromSunrise = job.hour - 36 // can be [-12,12]
            jobTime = moment(sunrise)
            jobTime.add(hoursFromSunrise, 'hours') // up to 12 hours before or after

            if (hoursFromSunrise < 0) {
              // before sunrise
              jobTime.add(job.minute, 'minutes')
              let minutesDebug = Math.abs(hoursFromSunrise * 60 + job.minute)
              const hoursDebug = Math.floor(minutesDebug / 60)
              minutesDebug = minutesDebug - hoursDebug * 60
              debugStr = `(sunrise=${sunrise}), ${hoursDebug}:${minutesDebug} before sunrise`
            } else {
              // after sunrise
              jobTime.add(job.minute, 'minutes')
              debugStr = `(sunrise=${sunrise}), ${hoursFromSunrise}:${job.minute} after sunrise`
            }
          } else if (job.hour < 72) {
            // sunset job
            const hoursFromSunset = job.hour - 60 // can be [-12,12]
            jobTime = moment(sunset)
            jobTime.add(hoursFromSunset, 'hours') // up to 12 hours before or after

            if (hoursFromSunset < 0) {
              // before sunset
              jobTime.add(job.minute, 'minutes')
              let minutesDebug = Math.abs(hoursFromSunset * 60 + job.minute)
              const hoursDebug = Math.floor(minutesDebug / 60)
              minutesDebug = minutesDebug - hoursDebug * 60
              debugStr = `(sunset=${sunset}), ${hoursDebug}:${minutesDebug} before sunset`
            } else {
              // after sunset
              jobTime.add(job.minute, 'minutes')
              debugStr = `(sunset=${sunset}), ${hoursFromSunset}:${job.minute} after sunset`
            }
          }

          if (jobTime) {
            // only consider scheduled jobs that trigger within the last SCHEDULE_TIMER range (add an extra 5 seconds for a fudge factor)
            if (now > jobTime && now.diff(jobTime) < SCHEDULE_TIMER + 5000) {
              job.jobTime = jobTime
              job.debug = debugStr
              return true
            }
          }
        }

        return false
      })

      let latestJob = null
      if (jobsToConsider.length > 0) {
        latestJob = jobsToConsider.reduce((latestJob, job) => {
          if (job.jobTime > latestJob.jobTime) {
            latestJob = job
          }

          return latestJob
        })
      }

      if (latestJob) {
        switch (latestJob.action.name) {
          case 'on':
            logger.info('[%s] schedule (job %d), lamp on, schedule time=%s (%s)', this.eui, latestJob.id, latestJob.jobTime.toString(), latestJob.debug)

            if (this.lppState.LP !== 1) {
              // this.lppState.LP = 1
              this.setLampState(1)
              this.lppState.SH |= SOH_FLAGS.cron
              this.publishState()

              this.lppState.SH &= ~SOH_FLAGS.cron
            }
            break

          case 'off':
            logger.info('[%s] schedule (job %d), lamp off, schedule time=%s (%s)', this.eui, latestJob.id, latestJob.jobTime.toString(), latestJob.debug)

            if (this.lppState.LP !== 0) {
              // this.lppState.LP = 0
              this.setLampState(0)
              this.lppState.SH |= SOH_FLAGS.cron
              this.publishState()

              this.lppState.SH &= ~SOH_FLAGS.cron
            }
            break

          case 'dim':
            logger.info('[%s] schedule (job %d), dim from %d to %d, scheduleTime=%s (%s)', this.eui, latestJob.id, this.lppState.LD, latestJob.action.value, latestJob.jobTime.toString(), latestJob.debug)

            // TODO: make sure dim is also implicit Lamp on
            if (this.lppState.LD !== latestJob.action.value || this.lppState.LP !== 1) {
              this.lppState.LD = latestJob.action.value
              // this.lppState.LP = 1
              this.setLampState(1)
              this.lppState.SH |= SOH_FLAGS.cron
              this.publishState()

              this.lppState.SH &= ~SOH_FLAGS.cron
            }
            break

          default:
            logger.error('[%d] invalid schedule action', this.eui, latestJob)
            break
        }
      }
    }

    this.scheduleTimerId = setTimeout(() => this.checkLampSchedule(), SCHEDULE_TIMER)
  }

  setOffline () {
    this.offline = true
    logger.info('[%s] offline')
  }

  setOnline () {
    const wasOffline = this.offline

    this.offline = false
    logger.info('[%s] online')

    if (wasOffline) {
      this.publishState()
    }
  }
}

function getRandomLatLon (lat, lon) {
  // get random lat lon near a center point
  // lpp.add(ubilpp.channels.LaLoLh, { lat: 26.111351, lon: -80.237086, hdop: 2 })
  // 26.1195,-80.1403887 spaces, las olas
  // 26.111351, -80.237086, east tropical, plantation
  const latRange = 0.005

  let min = lat - latRange
  let max = lat + latRange
  const latRand = Math.random() * (max - min) + min

  const lonRange = 0.0075 // 0.075
  min = lon - lonRange
  max = lon + lonRange
  const lonRand = Math.random() * (max - min) + min

  return {
    lat: latRand,
    lon: lonRand
  }
}

module.exports = {
  Ubicell
}
