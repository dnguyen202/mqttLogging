const ubilpp = require('./ubilpp')

// example:
// node decode.js 0100010201060365001904710f1e231c050d20740008197d1fc800004d2605740718d300067406f6d140088300018a400783000302b00988018e8d6afb392fb8090ac8003c1bc813880bc800050cc803e815c80a1cc83c16c8025817c8005a0dc8001b0ec8040fc80710c8ffbb
//

if (process.argv.length <= 2) {
  console.error('usage: node decode.js <hex str>')
  process.exit(1)
}

const lpp = new ubilpp.Ubilpp()
const hex = process.argv[2]
lpp.setPayloadAsHexString(hex)
const decoded = lpp.decode()
console.log(JSON.stringify(decoded, null, 2))
