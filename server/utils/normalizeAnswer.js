function normalizeAnswer(str) {
  if (!str) return ""

  return String(str)
    .replace(/\s+/g, "")
    .replace(/·/g, "*")
    .replace(/−/g, "-")
    .replace(/,/g, ".")
    .toLowerCase()
}

module.exports = normalizeAnswer
