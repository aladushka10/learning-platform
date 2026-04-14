function normalizeAnswer(str) {
  if (str === null || str === undefined) return ""

  let s = String(str)
    .replace(/\s+/g, "")
    .replace(/·/g, "*")
    .replace(/×/g, "*")
    .replace(/−/g, "-")
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/[—–]/g, "-")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/∞/g, "inf")
    .replace(/infty|infinity/gi, "inf")
    .toLowerCase()
    .replace(/минимум/g, "min")
    .replace(/максимум/g, "max")
  s = s.replace(/\*/g, "")
  return s
}

module.exports = normalizeAnswer
