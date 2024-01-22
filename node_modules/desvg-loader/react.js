module.exports = function (source) {
  return `
${source}
var desvg = require('@kossnocorp/desvg/react')
module.exports = desvg(module.exports)
`
}
