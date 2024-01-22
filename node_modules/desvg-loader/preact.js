module.exports = function (source) {
  return `
${source}
var desvg = require('@kossnocorp/desvg/preact')
module.exports = desvg(module.exports)
`
}
