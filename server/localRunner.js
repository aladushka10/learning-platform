const vm = require("node:vm")

function safeStringify(v) {
  try {
    return JSON.stringify(v)
  } catch {
    try {
      return String(v)
    } catch {
      return "[unserializable]"
    }
  }
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true
  if (typeof a !== typeof b) return false
  if (a && b && typeof a === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return false
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++)
        if (!deepEqual(a[i], b[i])) return false
      return true
    }
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    if (aKeys.length !== bKeys.length) return false
    for (const k of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, k)) return false
      if (!deepEqual(a[k], b[k])) return false
    }
    return true
  }
  return false
}

function runJsInVm({ code, tests, timeoutMs = 200 }) {
  const logs = []
  const sandbox = {
    console: {
      log: (...args) => logs.push(args.map(safeStringify).join(" ")),
      info: (...args) => logs.push(args.map(safeStringify).join(" ")),
      warn: (...args) => logs.push(args.map(safeStringify).join(" ")),
      error: (...args) => logs.push(args.map(safeStringify).join(" ")),
    },
  }
  const context = vm.createContext(sandbox, {
    codeGeneration: { strings: true, wasm: false },
  })

  try {
    vm.runInContext(`"use strict";\n${code}\n`, context, { timeout: timeoutMs })
  } catch (e) {
    return {
      ok: false,
      logs,
      results: [],
      error: e?.message || String(e),
    }
  }

  const results = []
  for (const t of tests || []) {
    const expr = String(t?.expr || "").trim()
    if (!expr) continue
    try {
      const actual = vm.runInContext(expr, context, { timeout: timeoutMs })
      const pass = deepEqual(actual, t.expected)
      results.push({ expr, pass, expected: t.expected, actual })
    } catch (e) {
      results.push({
        expr,
        pass: false,
        expected: t?.expected,
        actual: null,
        error: e?.message || String(e),
      })
    }
  }

  return {
    ok: results.every((r) => r.pass),
    logs,
    results,
  }
}

module.exports = {
  runJsInVm,
}
