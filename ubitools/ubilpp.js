/* eslint-disable camelcase */

/*
  ubilpp v31

  Reference information from the python version of ubilpp:

    # Sensor name: [channel, data size, is_signed, precision]
    #
    # If a sensor uses a specific, pre-defined LPP ID, data size, is_signed,
    # and precision should all be None and are ignored.
    #
    # Strings should be always defined as [chan, 4 < len < 9, None, None].
    # ASCII only.
    #
    # Generic sensors are those that supply data size, is_signed, and
    # precision.  Data size is limited to 4 bytes for numeric values.
    'n': [0, 8, None, None],         # node name
    'LP': [1, None, None, None],     # lamp state (on/off)
    'LD': [2, None, None, None],     # lamp dimmer level (0-100)
    'L': [3, None, None, None],      # ambient light sensor (0-4095)
    'y': [4, None, None, None],      # accelerometer (x, y, z)
    'V': [5, None, None, None],      # line voltage
    'V1': [6, None, None, None],     # load voltage
    'C': [7, None, None, None],      # line current
    'C1': [8, None, None, None],     # load current
    'LaLoLh': [9, None, None, None], # latitude, longitude, hdop
    'S': [10, 2, False, 1],          # status report frequency
    'LT': [11, 2, False, 1],         # lamp on threshold
    'Lt': [12, 2, False, 1],         # lamp off threshold
    'v': [13, 2, False, 1],          # firmware version
    'b': [14, 1, False, 1],          # board variant
    'Ra': [15, 1, False, 1],         # radio access technology
    'Rq': [16, 2, True, 1],          # radio rssi
    'M1': [17, 4, False, 1],         # first 4 tuples of captured wifi mac address
    'M2': [18, 2, False, 1],         # last 2 tuples of captured wifi mac address
    'Mq': [19, 2, True, 1],          # rssi of captured wifi mac address
    'Ld': [20, None, None, None],    # lamp 2 dimmer level (0-100)
    'TT': [21, 1, False, 1],         # tilt threshold
    'VT': [22, 2, False, 1],         # line voltage high threshold
    'Vt': [23, 2, False, 1],         # line voltage low threshold
    'FF': [24, None, None, None],    # wifi promiscuous mode (on/off)
    'BB': [25, None, None, None],    # bluetooth URIBeacon adverts (on/off)
    'SH': [26, 2, False, 1],         # Status of Health (SoH)
    'LF': [27, 2, False, 1],         # PWM frequency
    'PF': [28, 1, False, 1],         # Power line frequency
    'JA': [29, 4, False, 1],         # scheduled job added
    'JD': [30, 4, False, 1],         # scheduled job removed
    'u': [31, 4, False, 1],          # customer ID
    'VS': [32, None, None, None],    # stray voltage
    'ST': [33, 1, False, 1],         # stray voltage threshold
    'SN': [34, 2, False, 1],         # command sequence number
    'yD': [35, 2, True, 100],        # tilt degree delt
    ''sE': [36, None, None, None],    # apparent energy consumption
    'ts': [37, 4, False, 1],         # time stamp for energy consumption
    'aP': [38, None, None, None],    # active power
    'iccid': [39, 32, None, None],   # ICCID
    'apn': [40, 64, False, None],    # APN
    'hrlyEn':[41, 512, True, 1],
    'srvcell':[42, 5, True, None],   # Modem serving cell  RSRP RSRQ RSSI SINR
    'neighcell':[43, 5, True, None], # Modem Neighbor cell RSRP RSRQ RSSI SINR
    'SH2': [44, 2, False, 1],        # Status of Health 2 (SoH2)
    'pwrfactor':[45, None, None, None],

    # 3rd party and external sensors.
    'Ga': [70, 2, False, 1],         # Gun Shot Detector alert counter
    'Gm': [71, 2, False, 1],         # Gun Shot Detector alert magnitude
    'Air': [72, 21, True, 10],       # Temp,Humidity,Pressure,PM1.0,2.5,10,SO2,O3,CO,NO2,Noise
*/

const sprintf = require('sprintf-js').sprintf

// const CHAN_n = 0 // DEPRECATED
const CHAN_LP = 1
const CHAN_LD = 2
const CHAN_L = 3
const CHAN_y = 4
const CHAN_V = 5
const CHAN_V1 = 6
const CHAN_C = 7
const CHAN_C1 = 8
const CHAN_LaLoLh = 9
const CHAN_S = 10
const CHAN_LT = 11
const CHAN_Lt = 12
const CHAN_v = 13
const CHAN_b = 14
const CHAN_Ra = 15
const CHAN_Rq = 16
const CHAN_M1 = 17
const CHAN_M2 = 18
const CHAN_Mq = 19
// const CHAN_Ld = 20 // DEPRECATED
const CHAN_TT = 21
const CHAN_VT = 22
const CHAN_Vt = 23
// const CHAN_FF = 24 // DEPRECATED
// const CHAN_BB = 25 // DEPRECATED
const CHAN_SH = 26
const CHAN_LF = 27
const CHAN_PF = 28
const CHAN_JA = 29
const CHAN_JD = 30
const CHAN_u = 31
const CHAN_VS = 32
const CHAN_ST = 33
const CHAN_SN = 34
const CHAN_yD = 35
const CHAN_sE = 36
const CHAN_ts = 37
const CHAN_aP = 38
const CHAN_iccid = 39
const CHAN_apn = 40
const CHAN_hrlyEn = 41
const CHAN_srvcell = 42
const CHAN_neighcell = 43
const CHAN_SH2 = 44
const CHAN_pwrfactor = 45

// 3rd party and external sensors
const CHAN_Ga = 70
const CHAN_Gm = 71
const CHAN_Air = 72

const CHAN_NAME = {
  [CHAN_LP]: 'LP',
  [CHAN_LD]: 'LD',
  [CHAN_L]: 'L',
  [CHAN_y]: 'y',
  [CHAN_V]: 'V',
  [CHAN_V1]: 'V1',
  [CHAN_C]: 'C',
  [CHAN_C1]: 'C1',
  [CHAN_LaLoLh]: 'LaLoLh',
  [CHAN_S]: 'S',
  [CHAN_LT]: 'LT',
  [CHAN_Lt]: 'Lt',
  [CHAN_v]: 'v',
  [CHAN_b]: 'b',
  [CHAN_Ra]: 'Ra',
  [CHAN_Rq]: 'Rq',
  [CHAN_M1]: 'M1',
  [CHAN_M2]: 'M2',
  [CHAN_Mq]: 'Mq',

  [CHAN_TT]: 'TT',
  [CHAN_VT]: 'VT',
  [CHAN_Vt]: 'Vt',
  [CHAN_SH]: 'SH',
  [CHAN_LF]: 'LF',
  [CHAN_PF]: 'PF',
  [CHAN_JA]: 'JA',
  [CHAN_JD]: 'JD',
  [CHAN_u]: 'u',
  [CHAN_VS]: 'VS',
  [CHAN_ST]: 'ST',
  [CHAN_SN]: 'SN',
  [CHAN_yD]: 'yD',
  [CHAN_sE]: 'sE',
  [CHAN_ts]: 'ts',
  [CHAN_aP]: 'aP',
  [CHAN_iccid]: 'iccid',
  [CHAN_apn]: 'apn',
  [CHAN_hrlyEn]: 'hrlyEn',
  [CHAN_srvcell]: 'srvcell',
  [CHAN_neighcell]: 'neighcell',
  [CHAN_SH2]: 'SH2',
  [CHAN_pwrfactor]: 'pwrfactor',

  [CHAN_Ga]: 'Ga',
  [CHAN_Gm]: 'Gm',
  [CHAN_Air]: 'Air'
}

const CHAN_NUM = {
  LP: 1,
  LD: 2,
  L: 3,
  y: 4,
  V: 5,
  V1: 6,
  C: 7,
  C1: 8,
  LaLoLh: 9,
  S: 10,
  LT: 11,
  Lt: 12,
  v: 13,
  b: 14,
  Ra: 15,
  Rq: 16,
  M1: 17,
  M2: 18,
  Mq: 19,
  TT: 21,
  VT: 22,
  Vt: 23,
  SH: 26,
  LF: 27,
  PF: 28,
  JA: 29,
  JD: 30,
  u: 31,
  VS: 32,
  ST: 33,
  SN: 34,
  yD: 35,
  sE: 36,
  ts: 37,
  aP: 38,
  iccid: 39,
  apn: 40,
  hrlyEn: 41,
  srvcell: 42,
  neighcell: 43,
  SH2: 44,
  pwrfactor: 45,

  Ga: 70,
  Gm: 71,
  Air: 72
}

const SOH_FLAGS = {
  none: 0x0000,
  ack: 0x0001,
  cron: 0x0002,
  als: 0x0004,
  tilt: 0x0008,
  power: 0x0010,
  footfall: 0x0020,
  bluetoothBeacon: 0x0040,
  dali: 0x0080,
  strayVoltage: 0x0100,
  gnss: 0x0200, // GNSS fixed
  time: 0x0400, // RTC set
  uncal: 0x0800,
  dstp: 0x1000,
  dstm: 0x2000,
  gpst: 0x4000, // GPS lat long has been set by the backend

  reset: 0x8000,
  all: 0xffff
}

function decodeSohFlags (soh) {
  const flags = []
  if (soh & SOH_FLAGS.ack) {
    flags.push('ACK')
  }
  if (soh & SOH_FLAGS.cron) {
    flags.push('CRON')
  }
  if (soh & SOH_FLAGS.als) {
    flags.push('ALS')
  }
  if (soh & SOH_FLAGS.tilt) {
    flags.push('TILT')
  }
  if (soh & SOH_FLAGS.power) {
    flags.push('POWER')
  }
  if (soh & SOH_FLAGS.footfall) {
    flags.push('FOOTFALL')
  }
  if (soh & SOH_FLAGS.bluetoothBeacon) {
    flags.push('BLUETOOTH_BEACON')
  }
  if (soh & SOH_FLAGS.dali) {
    flags.push('DALI')
  }
  if (soh & SOH_FLAGS.strayVoltage) {
    flags.push('STRAY_VOLTAGE')
  }
  if (soh & SOH_FLAGS.gnss) {
    flags.push('GNSS')
  }
  if (soh & SOH_FLAGS.time) {
    flags.push('TIME')
  }
  if (soh & SOH_FLAGS.uncal) {
    flags.push('UNCALIBRATED')
  }
  if (soh & SOH_FLAGS.dstp) {
    flags.push('DSTP')
  }
  if (soh & SOH_FLAGS.dstm) {
    flags.push('DSTM')
  }
  if (soh & SOH_FLAGS.gpst) {
    flags.push('GPST')
  }
  if (soh & SOH_FLAGS.reset) {
    flags.push('RST')
  }

  return flags.join(', ')
}

const SOH2_FLAGS = {
  none: 0x0000,
  uair: 0x0001, // indicate UbiAir data is stable
  lpuf: 0x0002 // Load power usage under configured threshold (in %, example 12%)

}

function decodeSoh2Flags (soh2) {
  const flags = []
  if (soh2 & SOH_FLAGS.uair) {
    flags.push('UAIR')
  }
  if (soh2 & SOH_FLAGS.lpuf) {
    flags.push('LPUF')
  }
}

const LPP_ID_DIGITAL_INPUT = 0
const LPP_ID_DIGITAL_OUTPUT = 1
const LPP_ID_ANALOG_INPUT = 2
const LPP_ID_ANALOG_OUTPUT = 3
const LPP_ID_ILLUMINANCE_SENSOR = 101
const LPP_ID_PRESENCE_SENSOR = 102
const LPP_ID_TEMPERATURE_SENSOR = 103
const LPP_ID_HUMIDITY_SENSOR = 104
const LPP_ID_ENERGY_SENSOR = 105
const LPP_ID_ACCELEROMETER = 113
const LPP_ID_BAROMETER = 115
const LPP_ID_VOLTAGE_SENSOR = 116
const LPP_ID_CURRENT_SENSOR = 117
const LPP_ID_POWER_SENSOR = 128
const LPP_ID_POWER_FACTOR = 129
const LPP_ID_BIG_CURRENT_SENSOR = 131
const LPP_ID_GYROMETER = 134
const LPP_ID_GPS = 136
const LPP_ID_GENERIC = 200

class Ubilpp {
  constructor (capacity = 1000) {
    this.capacity = capacity
    this.payload = Buffer.alloc(capacity)
    this.i = 0 // write pointer
  }

  setPayload (buffer) {
    this.payload = buffer
    this.i = buffer.length
  }

  setPayloadAsHexString (hexStr) {
    this.payload = Buffer.from(hexStr, 'hex')
    this.i = hexStr.length / 2
  }

  setPayLoadAsJson (json) {
    const obj = JSON.parse(json)
    this.payload = Buffer.alloc(this.capacity)
    this.i = 0

    for (const [chanName, val] of Object.entries(obj)) {
      const chanNum = CHAN_NUM[chanName]
      // console.log(`adding: ${chanName} (${chanNum}): ${JSON.stringify(val)}`)
      if (chanNum === CHAN_SH && val === 'object') {
        // get val from object
        this.add(chanNum, val.val)
      } else {
        this.add(chanNum, val)
      }
    }
  }

  setPayLoadAsObject (obj) {
    this.payload = Buffer.alloc(this.capacity)
    this.i = 0

    for (const [chanName, val] of Object.entries(obj)) {
      const chanNum = CHAN_NUM[chanName]
      // console.log(`adding: ${chanName} (${chanNum}): ${JSON.stringify(val)}`)

      if (Array.isArray(val)) {
        val.forEach(v => {
          this.add(chanNum, v)
        })
      } else {
        this.add(chanNum, val)
      }
    }
  }

  bufferAsHexStr () {
    return this.asBuffer().toString('hex')
  }

  // TODO: trunc every value?
  add (chan, data) {
    this.payload.writeUInt8(chan, this.i)
    this.i++

    switch (chan) {
      case CHAN_LP:
        this.payload.writeUInt8(LPP_ID_DIGITAL_INPUT, this.i)
        this.i++

        this.payload.writeUInt8(data, this.i)
        this.i++
        break

      case CHAN_LD:
        this.payload.writeUInt8(LPP_ID_DIGITAL_OUTPUT, this.i)
        this.i++

        this.payload.writeUInt8(data, this.i)
        this.i++
        break

      case CHAN_L:
        this.payload.writeUInt8(LPP_ID_ILLUMINANCE_SENSOR, this.i)
        this.i++

        this.payload.writeUInt16BE(data, this.i)
        this.i += 2
        break

      case CHAN_y:
      {
        this.payload.writeUInt8(LPP_ID_ACCELEROMETER, this.i)
        this.i++

        // precision is 0.001 per axis
        const x = Math.trunc(data.x * 1000)
        const y = Math.trunc(data.y * 1000)
        const z = Math.trunc(data.z * 1000)

        this.payload.writeInt16BE(x, this.i)
        this.i += 2
        this.payload.writeInt16BE(y, this.i)
        this.i += 2
        this.payload.writeInt16BE(z, this.i)
        this.i += 2
        break
      }

      case CHAN_V:
      case CHAN_V1:
      case CHAN_VS:
      {
        this.payload.writeUInt8(LPP_ID_VOLTAGE_SENSOR, this.i)
        this.i++

        // precision is 0.000001
        const val = Math.trunc(data * 1000000)
        this.payload.writeUInt32BE(val, this.i)
        this.i += 4
        break
      }

      case CHAN_C:
      case CHAN_C1:
      {
        this.payload.writeUInt8(LPP_ID_BIG_CURRENT_SENSOR, this.i)
        this.i++

        // precision is 0.0000001
        const val = Math.trunc(data * 10000000)
        this.payload.writeUInt32BE(val, this.i)
        this.i += 4
        break
      }

      case CHAN_sE: {
        this.payload.writeUInt8(LPP_ID_ENERGY_SENSOR, this.i)
        this.i++

        // precision is 0.0000001
        const val = Math.trunc(data * 10000000)
        this.payload.writeUInt32BE(val, this.i)
        this.i += 4
        break
      }

      case CHAN_ts: {
        this.payload.writeUInt8(LPP_ID_GENERIC, this.i)
        this.i++

        this.payload.writeUInt32BE(data, this.i)
        this.i += 4
        break
      }

      case CHAN_aP: {
        this.payload.writeUInt8(LPP_ID_POWER_SENSOR, this.i)
        this.i++

        // precision is 0.0000001
        const val = Math.trunc(data * 10000000)
        this.payload.writeUInt32BE(val, this.i)
        this.i += 4
        break
      }

      case CHAN_pwrfactor: {
        this.payload.writeUInt8(LPP_ID_POWER_FACTOR, this.i)
        this.i++

        // precision is 0.0000001
        const val = Math.trunc(data * 10000000)
        this.payload.writeUInt32BE(val, this.i)
        this.i += 4
        break
      }

      case CHAN_LaLoLh:
      {
        this.payload.writeUInt8(LPP_ID_GPS, this.i)
        this.i++

        // precision is 0.000001 for lat and lon
        const lat = Math.trunc(data.lat * 1000000)
        const lon = Math.trunc(data.lon * 1000000)
        const hdop = Math.trunc(data.hdop * 10)

        this.payload.writeInt32BE(lat, this.i)
        this.i += 4
        this.payload.writeInt32BE(lon, this.i)
        this.i += 4
        this.payload.writeUInt8(hdop, this.i)
        this.i++
        break
      }

      // generic size=2, unsigned
      case CHAN_S:
      case CHAN_LT:
      case CHAN_Lt:
      case CHAN_v:
      case CHAN_M2:
      case CHAN_VT:
      case CHAN_Vt:
      case CHAN_SH:
      case CHAN_LF:
      case CHAN_SN:
      case CHAN_Ga:
      case CHAN_Gm:
      {
        this.payload.writeUInt8(LPP_ID_GENERIC, this.i)
        this.i++

        const val = Math.trunc(data)
        this.payload.writeUInt16BE(val, this.i)
        this.i += 2
        break
      }

      // generic size=1, unsigned
      case CHAN_b:
      case CHAN_Ra:
      case CHAN_TT:
      case CHAN_PF:
      case CHAN_ST:
      {
        this.payload.writeUInt8(LPP_ID_GENERIC, this.i)
        this.i++

        this.payload.writeUInt8(data, this.i)
        this.i++
        break
      }

      // generic size=2, signed
      case CHAN_Rq:
      case CHAN_Mq:
      {
        this.payload.writeUInt8(LPP_ID_GENERIC, this.i)
        this.i++

        this.payload.writeInt16BE(data, this.i)
        this.i += 2
        break
      }

      // generic size=2, signed, precision=0.01
      case CHAN_yD:
      {
        this.payload.writeUInt8(LPP_ID_GENERIC, this.i)
        this.i++

        const val = Math.trunc(data * 100)
        this.payload.writeUInt16BE(val, this.i)
        this.i += 2
        break
      }

      case CHAN_iccid:
      {
        // iccid is 21 bytes
        this.payload.writeUInt8(LPP_ID_GENERIC, this.i)
        this.i++
        this.payload.fill(0, this.i, this.i + 21)
        this.payload.write(data, this.i, 21)
        this.i += 21
        break
      }
      case CHAN_apn:
      {
        // apn is 64 bytes
        this.payload.writeUInt8(LPP_ID_GENERIC, this.i)
        this.i++
        this.payload.fill(0, this.i, this.i + 64)
        this.payload.write(data, this.i, 64)
        this.i += 64
        break
      }
      case CHAN_hrlyEn: {
        this.payload.writeUInt8(LPP_ID_GENERIC, this.i)
        this.i++

        this.payload.writeUInt8(data.day, this.i) // 0-6,99 (Mon-Sun, all)
        this.i++

        for (let j = 0; j < 24; j++) {
          this.payload.writeUInt32BE(data.report[j].time, this.i)
          this.i += 4

          const voltage = Math.trunc(data.report[j].voltage * 1000000)
          this.payload.writeUInt32BE(voltage, this.i)
          this.i += 4

          const current = Math.trunc(data.report[j].current * 1000000)
          this.payload.writeUInt32BE(current, this.i)
          this.i += 4

          const power = Math.trunc(data.report[j].power * 1000000)
          this.payload.writeUInt32BE(power, this.i)
          this.i += 4

          const energy = Math.trunc(data.report[j].energy * 1000000)
          this.payload.writeUInt32BE(energy, this.i)
          this.i += 4
        }

        break
      }

      // generic size=4, unsigned
      case CHAN_M1:
      case CHAN_JA:
      case CHAN_JD:
      case CHAN_u:
      {
        this.payload.writeUInt8(LPP_ID_GENERIC, this.i)
        this.i++

        this.payload.writeUInt32BE(data, this.i)
        this.i += 4
        break
      }
    }
  }

  addFootfall (mac, rssi) {
    //
    if (mac.length === 6) {
      this.add(CHAN_M1, mac.readUInt32BE(0, 4))
      this.add(CHAN_M2, mac.readUInt16BE(4, 2))
      this.add(CHAN_Mq, rssi)
    }
  }

  addAir (samples) {
    if (samples && samples.length > 0) {
      this.payload.writeUInt8(samples.length, this.i)
      this.i += 1

      samples.forEach(s => {
        this.payload.writeInt32BE(s.time, this.i)
        this.i += 4

        this.payload.writeInt16BE(s.temperature * 100, this.i)
        this.i += 2

        this.payload.writeUInt8(s.humidity, this.i)
        this.i += 1

        this.payload.writeUInt16BE(s.pressure, this.i)
        this.i += 2

        this.payload.writeUInt16BE(s.pm01, this.i)
        this.i += 2

        this.payload.writeUInt16BE(s.pm25, this.i)
        this.i += 2

        this.payload.writeUInt16BE(s.pm10, this.i)
        this.i += 2

        this.payload.writeUInt8(s.so2 * 10, this.i)
        this.i += 1

        this.payload.writeUInt8(s.o3 * 10, this.i)
        this.i += 1

        this.payload.writeUInt8(s.co, this.i)
        this.i += 1

        this.payload.writeUInt8(s.no2 * 10, this.i)
        this.i += 1

        this.payload.writeUInt8(s.noise, this.i)
        this.i += 1
      })
    }
  }

  asBuffer () {
    return this.payload.slice(0, this.i)
  }

  decode () {
    let decoded = {}

    try {
      // decode from internal buffer
      let readIndex = 0

      while (readIndex < this.i) {
        const chanNum = this.payload.readUInt8(readIndex)
        const chan = CHAN_NAME[chanNum]
        readIndex++
        const lppId = this.payload.readUInt8(readIndex)
        readIndex++

        if (decoded[chan]) {
          switch (chanNum) {
          // can have multiple elements of these channels in a single payload
            case CHAN_VS:
            case CHAN_M1:
            case CHAN_M2:
            case CHAN_Mq:
            case CHAN_JA:
            case CHAN_JD:
              break

            default:
              console.info(`${chan} already exists`)
          }
        }

        switch (chanNum) {
          case CHAN_LP:
            decoded[chan] = this.payload.readUInt8(readIndex)
            readIndex++
            break

          case CHAN_LD:
            decoded[chan] = this.payload.readUInt8(readIndex)
            readIndex++
            break

          case CHAN_L:
            decoded[chan] = this.payload.readUInt16BE(readIndex)
            readIndex += 2
            break

          case CHAN_y:
          {
            let x = this.payload.readInt16BE(readIndex)
            readIndex += 2
            let y = this.payload.readInt16BE(readIndex)
            readIndex += 2
            let z = this.payload.readInt16BE(readIndex)
            readIndex += 2

            // precision is 0.001 per axis
            x = x / 1000.0
            y = y / 1000.0
            z = z / 1000.0

            decoded[chan] = {
              x,
              y,
              z
            }

            break
          }

          case CHAN_V:
          case CHAN_V1:
          case CHAN_VS:
          {
            let val = this.payload.readUInt32BE(readIndex)
            readIndex += 4

            // precision is 0.000001
            val = val / 1000000.0

            if (chanNum === CHAN_VS) {
              // VS can have multiple
              if (!decoded[chan]) {
                decoded[chan] = []
              }

              decoded[chan].push(val)
            } else {
              decoded[chan] = val
            }
            break
          }

          case CHAN_C:
          case CHAN_C1:
          case CHAN_sE:
          case CHAN_aP:
          case CHAN_pwrfactor:
          {
            let val = this.payload.readUInt32BE(readIndex)
            readIndex += 4

            // precision is 0.0000001
            val = val / 10000000.0

            decoded[chan] = val
            break
          }

          case CHAN_LaLoLh:
          {
            let lat = this.payload.readInt32BE(readIndex)
            readIndex += 4
            let lon = this.payload.readInt32BE(readIndex)
            readIndex += 4
            let hdop = this.payload.readUInt8(readIndex)
            readIndex++

            // precision is 0.000001 for lat and lon
            lat = lat / 1000000.0
            lon = lon / 1000000.0
            hdop = hdop / 10.0

            decoded[chan] = {
              lat,
              lon,
              hdop
            }
            break
          }

          // generic size=2, unsigned
          case CHAN_S:
          case CHAN_LT:
          case CHAN_Lt:
          case CHAN_v:
          case CHAN_M2:
          case CHAN_VT:
          case CHAN_Vt:
          case CHAN_SH:
          case CHAN_SH2:
          case CHAN_LF:
          case CHAN_SN:
          case CHAN_Ga:
          case CHAN_Gm:
          {
            const val = this.payload.readUInt16BE(readIndex)
            readIndex += 2

            // payload can contain multiple M2 elements
            if (chanNum === CHAN_M2) {
              if (!decoded[chan]) {
                decoded[chan] = []
              }

              decoded[chan].push(val)
            } else if (chanNum === CHAN_SH) {
              decoded[chan] = {
                val,
                flags: decodeSohFlags(val)
              }
            } else if (chanNum === CHAN_SH2) {
              decoded[chan] = {
                val,
                flags: decodeSoh2Flags(val)
              }
            } else {
              decoded[chan] = val
            }

            break
          }

          // generic size=1, unsigned
          case CHAN_b:
          case CHAN_Ra:
          case CHAN_TT:
          case CHAN_PF:
          case CHAN_ST:
          {
            decoded[chan] = this.payload.readUInt8(readIndex)
            readIndex++
            break
          }

          // generic size=2, signed
          case CHAN_Rq:
          case CHAN_Mq:
          {
            const val = this.payload.readInt16BE(readIndex)
            readIndex += 2

            // payload can contain multiple Mq elements
            if (chanNum === CHAN_Mq) {
              if (!decoded[chan]) {
                decoded[chan] = []
              }

              decoded[chan].push(val)
            } else {
              decoded[chan] = val
            }
            break
          }

          // generic size=2, signed, precision = .01
          case CHAN_yD:
          {
            let val = this.payload.readInt16BE(readIndex)
            readIndex += 2

            val = val / 100.0

            decoded[chan] = val
            break
          }

          // generic size=4, unsigned
          case CHAN_M1:
          case CHAN_u:
          case CHAN_ts:
          {
            const val = this.payload.readUInt32BE(readIndex)
            readIndex += 4

            // payload can contain multiple M1, JA, JD elements
            if (chanNum === CHAN_M1) {
              if (!decoded[chan]) {
                decoded[chan] = []
              }

              decoded[chan].push(val)
            } else {
              decoded[chan] = val
            }

            break
          }

          case CHAN_JA:
          case CHAN_JD:
          {
            const val = this.payload.readUInt32BE(readIndex)

            const id = (val >> 27) & 0x1f
            const hour = (val >> 20) & 0x7f
            const min = (val >> 14) & 0x1f
            const dayOfWeek = (val >> 7) & 0x7f
            const cronD = (val >> 0) & 0x7f

            const dayOfWeekArr = []
            for (let i = 0; i < 7; i++) {
              if (dayOfWeek & (1 << i)) {
                dayOfWeekArr.push(intToDayOfWeek(i + 1))
              }
            }
            const dayofWeekStr = dayOfWeekArr.join()

            const cronStr = sprintf('%d %02d:%02d %s, %d', id, hour, min, dayofWeekStr, cronD)
            readIndex += 4

            if (!decoded[chan]) {
              decoded[chan] = []
            }

            decoded[chan].push(cronStr)

            break
          }

          case CHAN_iccid:
          {
            decoded[chan] = this.payload.toString('ascii', readIndex, readIndex + 21).replace(/\0/g, '')
            readIndex += 21

            /*
            let iccid = this.payload.toString('hex', readIndex, readIndex + 21)
            readIndex += 21

            for (let j = 0; j < iccid.length; j += 2) {
              if (iccid[j] === '0' && iccid[j + 1] === '0') {
                // reached the end
                iccid = iccid.substring(0, j)
                break
              }
            }

            decoded[chan] = iccid
            */
            break
          }

          case CHAN_apn:
          {
            decoded[chan] = this.payload.toString('ascii', readIndex, readIndex + 64).replace(/\0/g, '')
            readIndex += 64

            /*
            let apn = this.payload.toString('hex', readIndex, readIndex + 64)
            readIndex += 64

            for (let j = 0; j < apn.length; j += 2) {
              if (apn[j] === '0' && apn[j + 1] === '0') {
                // reached the end
                apn = apn.substring(0, j)
                break
              }
            }

            decoded[chan] = apn
            */

            break
          }

          case CHAN_Air:
          {
            const airDataArr = []

            const numSegments = this.payload.readUInt8(readIndex)
            readIndex += 1

            for (let i = 0; i < numSegments; i++) {
              const airData = {}
              // TOOD: should this really be signed?
              airData.time = this.payload.readInt32BE(readIndex)
              readIndex += 4

              airData.temperature = this.payload.readInt16BE(readIndex) / 100
              readIndex += 2

              airData.humidity = this.payload.readUInt8(readIndex)
              readIndex += 1

              airData.pressure = this.payload.readUInt16BE(readIndex)
              readIndex += 2

              airData.pm01 = this.payload.readUInt16BE(readIndex)
              readIndex += 2

              airData.pm25 = this.payload.readUInt16BE(readIndex)
              readIndex += 2

              airData.pm10 = this.payload.readUInt16BE(readIndex)
              readIndex += 2

              airData.so2 = this.payload.readUInt8(readIndex) / 10
              readIndex += 1

              airData.o3 = this.payload.readUInt8(readIndex) / 10
              readIndex += 1

              airData.co = this.payload.readUInt8(readIndex)
              readIndex += 1

              airData.no2 = this.payload.readUInt8(readIndex) / 10
              readIndex += 1

              airData.noise = this.payload.readUInt8(readIndex)
              readIndex += 1

              airDataArr.push(airData)
            }

            decoded[chan] = airDataArr
            break
          }

          case CHAN_hrlyEn:
          {
            const data = []
            data.day = this.payload.readUInt8(readIndex)
            readIndex += 1

            let numSamples = 24
            if (data.day === 254) {
              numSamples = 1
            }

            for (let j = 0; j < numSamples; j++) {
              const dailyData = {}
              dailyData.time = this.payload.readUInt32BE(readIndex)
              readIndex += 4

              dailyData.voltage = this.payload.readUInt32BE(readIndex) / 1000000.0
              readIndex += 4

              dailyData.current = this.payload.readUInt32BE(readIndex) / 1000000.0
              readIndex += 4

              dailyData.power = this.payload.readUInt32BE(readIndex) / 1000000.0
              readIndex += 4

              dailyData.energy = this.payload.readUInt32BE(readIndex) / 1000000.0
              readIndex += 4

              data.push(dailyData)
            }

            decoded[chan] = data
            break
          }

          case CHAN_srvcell:
          {
            const data = {}
            data.state = this.payload.readInt8(readIndex)
            readIndex += 1

            data.rsrp = this.payload.readInt8(readIndex)
            readIndex += 1

            data.rsrq = this.payload.readInt8(readIndex)
            readIndex += 1

            data.rssi = this.payload.readInt8(readIndex)
            readIndex += 1

            data.sinr = this.payload.readInt8(readIndex)
            readIndex += 1

            decoded[chan] = data
            break
          }

          case CHAN_neighcell:
          {
            const nbrData = []
            for (let j = 0; j < 3; j++) {
              const data = {}

              data.mode = this.payload.readInt8(readIndex)
              readIndex += 1

              data.rsrp = this.payload.readInt8(readIndex)
              readIndex += 1

              data.rsrq = this.payload.readInt8(readIndex)
              readIndex += 1

              data.rssi = this.payload.readInt8(readIndex)
              readIndex += 1

              data.sinr = this.payload.readInt8(readIndex)
              readIndex += 1

              nbrData.push(data)
            }

            decoded[chan] = nbrData
            break
          }
        }
      }
    } catch (err) {
      decoded = {}
      console.error(`error parsing: ${err}\n ubilpp packet: ${this.payload.toString('hex')}`)
    }

    return decoded
  }
}

/*
const lpp = new Ubilpp()

if (process.argv.length > 2) {
  const hex = process.argv[2]
  lpp.setPayloadAsHexString(hex)

  // 11c896ad433e12c80d5813c8ffb211c83045114012c8b43713c8ffac11c888ad433e12c80d5813c8ffb011c8a2ad433e12c80d5813c8ffae11c89ead433e12c80d5813c8ffb211c8288088d612c83e1013c8ffa811c892ad433e12c80d5813c8ffab11c8c6dcae6f12c8801e13c8ffa911c81459c05212c8b29013c8ffa511c84ca1610312c880ea13c8ffac11c8304511f612c8744f13c8ffb111c86c8dc1df12c85d4013c8ffa611c87828ca7212c8a3eb13c8ffac11c8accf5c2d12c8c68b13c8ffa211c8c41cff4712c818db13c8ffd011c88c3bad9912c8961513c8ffa511c852868cd112c8b80413c8ffa311c856b1a98512c8e68d13c8ffca11c840b4cdf912c84a1e13c8ffc511c838f9d3e412c8b64313c8ffe311c8ba60abfc12c8f0b613c8ffb311c858ef68ac12c8f23b13c8ffda11c850f5da7f12c80f2613c8ffd111c82c6b7d1112c8b8ae13c8ffbe11c80088655b12c85fdd13c8ffa511c832868cd112c8b80413c8ffa2
  // 0100010201640365002d0471fe10009626eb1fc80000044c1ac88020057407020cb8067406ee83e008830002d4fd078300046df60ac804b01bc813880bc800050cc803e815c82d1cc83c16c8025817c8005a0dc8001a0ec8040fc80710c8ffb9
  // 11c840b4cdf912c84a1e13c8ffc511c858ef68ac12c8f23b13c8ffd1
  // 11c856b1a98512c8e68d13c8ffcb11c8ba60abfc12c8f0b613c8ffb311c850f5da7f12c80f2613c8ffcf11c8e4f4c61112c8fcb913c8ffa111c8c41cff4712c818db13c8ffcd11c896ad433e12c80d5813c8ffb011c888ad433e12c80d5813c8ffb111c89ead433e12c80d5813c8ffb111c892ad433e12c80d5813c8ffa911c8a2ad433e12c80d5813c8ffb011c8288088d612c83e1013c8ffa7
} else {
  console.log('using default data...')

  // lpp.add(CHAN_LP, 1)
  // lpp.add(CHAN_LD, 2)
  // lpp.add(CHAN_L, 3)
  // lpp.add(CHAN_y, {x:1, y:2, z:3})
  // lpp.add(CHAN_V, 120)
  // console.log(lpp.payload)

  // footfall (ralf)
  // lpp.setPayloadAsHexString('1fc80000044c11c89cb6d01b12c80ecb13c8ffc411c888ad437012c877a813c8ffb511c886f29e5512c8d90813c8ffa811c896ad437012c877a813c8ffbc11c88ef29e5512c8d90813c8ffa611c89ead437012c877a813c8ffbc11c8e83efcc212c8540013c8ffa911c8e63efcc212c8540013c8ffac11c844070b8d12c8134c13c8ffbd')

  // my ubicell
  // lpp.setPayloadAsHexString('01000002016403652f2e0471ff23ff6626af207403204b001dc821353f811fc80000044c1ac80001057407052ce006740016a8f8088300014e9c07830002c2660ac8003c1bc813880bc800050cc803e815c82d1cc83c16c8025817c8005a0dc8001a0ec8040fc8c810c8ffc9')

  // myubicell - JSON format:
  lpp.setPayLoadAsJson('{"LP":0,"LD":100,"L":12078,"y":{"x":-0.221,"y":-0.154,"z":9.903},"VS":52.448,"JA":[557137793],"u":1100,"SH":1,"V":117.77968,"V1":1.485048,"C1":0.008566,"C":0.0180838,"S":60,"LF":5000,"LT":5,"Lt":1000,"TT":45,"PF":60,"VT":600,"Vt":90,"v":26,"b":4,"Ra":200,"Rq":-55}')

// lpp.setPayloadAsHexString('010000020164036527bd0471fefcff8a27361fc80000044c1ac88000057407084d0006740019c91a0883000208810783000be8ae0ac800781bc813880bc800050cc803e815c82d1cc83c16c8025817c8005a0dc8001a0ec8040fc8c810c8ffc9')
// lpp.setPayLoadAsJson('{"LP":0,"LD":100,"L":10173,"y":{"x":-0.26,"y":-0.118,"z":10.038},"u":1100,"SH":32768,"V":117.984512,"V1":1.689882,"C1":0.0133249,"C":0.0780462,"S":120,"LF":5000,"LT":5,"Lt":1000,"TT":45,"PF":60,"VT":600,"Vt":90,"v":26,"b":4,"Ra":200,"Rq":-55}')
// lpp.setPayLoadAsJson('{"LP":0,"LD":100,"L":10173,"y":{"x":-0.26,"y":-0.118,"z":10.038},"u":1100,"SH":32768, "VT":600}')
// lpp.setPayLoadAsJson('{"LP":0,"LD":100,"L":10173,"y":{"x":-0.26,"y":-0.118,"z":10.038},"u":1100,"SH":32768,"V":117.984512,"V1":1.689882,"C1":0.0133249,"C":0.0780462,"S":120,"LF":5000,"LT":5,"Lt":1000,"TT":45,"PF":60," VT":600,"Vt":90}')
}

const decoded = lpp.decode()
console.log(JSON.stringify(decoded, null, 2))
*/

module.exports = {
  channels: CHAN_NUM,
  SOH_FLAGS: SOH_FLAGS,
  Ubilpp
}

function intToDayOfWeek (val) {
  switch (val) {
    case 1: return 'Mon'
    case 2: return 'Tue'
    case 3: return 'Wed'
    case 4: return 'Thu'
    case 5: return 'Fri'
    case 6: return 'Sat'
    case 7: return 'Sun'
  }
}

if (require.main === module) {
  const hex = '01000002010522c800640365000023c8012c1fc80000076d1ac81e012cc8000205740749fc7029c8050000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005fc1f5340763cc3000001d980000003f00452d405fc2035b0763cc3000001b5100000000004696685fc2118207650e8000001d98000000430047ff935fc21f6d0765afb000001b5100000010004962cb5fc22d96075f640800001b5100000035004acc485fc23bbe075c3e300000190a00000024004c34ea5fc249b7075a5ac000001b51000000c900601c6a5fc257a40755516000001b510000001a007ffae85fc25d810748ba2000001d9800000056008ce3e40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005fbffb270746356800001d98000000db033f9268'
  const lpp = new Ubilpp()
  lpp.setPayloadAsHexString(hex)
  const decoded = lpp.decode()
  console.log(JSON.stringify(decoded, null, 2))
}
