require = (function() { function r(e, n, t) { function o(i, f) { if (!n[i]) { if (!e[i]) { var c = typeof require === 'function' && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = 'MODULE_NOT_FOUND', a } var p = n[i] = { exports: {}}; e[i][0].call(p.exports, function(r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = typeof require === 'function' && require, i = 0; i < t.length; i++)o(t[i]); return o } return r })()({ 1: [function(require, module, exports) {
  (function(process) {
    (function() {
    /* eslint-env browser */

      /**
 * This is the web browser implementation of `debug()`.
 */

      exports.formatArgs = formatArgs
      exports.save = save
      exports.load = load
      exports.useColors = useColors
      exports.storage = localstorage()
      exports.destroy = (() => {
        let warned = false

        return () => {
          if (!warned) {
            warned = true
            console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.')
          }
        }
      })()

      /**
 * Colors.
 */

      exports.colors = [
        '#0000CC',
        '#0000FF',
        '#0033CC',
        '#0033FF',
        '#0066CC',
        '#0066FF',
        '#0099CC',
        '#0099FF',
        '#00CC00',
        '#00CC33',
        '#00CC66',
        '#00CC99',
        '#00CCCC',
        '#00CCFF',
        '#3300CC',
        '#3300FF',
        '#3333CC',
        '#3333FF',
        '#3366CC',
        '#3366FF',
        '#3399CC',
        '#3399FF',
        '#33CC00',
        '#33CC33',
        '#33CC66',
        '#33CC99',
        '#33CCCC',
        '#33CCFF',
        '#6600CC',
        '#6600FF',
        '#6633CC',
        '#6633FF',
        '#66CC00',
        '#66CC33',
        '#9900CC',
        '#9900FF',
        '#9933CC',
        '#9933FF',
        '#99CC00',
        '#99CC33',
        '#CC0000',
        '#CC0033',
        '#CC0066',
        '#CC0099',
        '#CC00CC',
        '#CC00FF',
        '#CC3300',
        '#CC3333',
        '#CC3366',
        '#CC3399',
        '#CC33CC',
        '#CC33FF',
        '#CC6600',
        '#CC6633',
        '#CC9900',
        '#CC9933',
        '#CCCC00',
        '#CCCC33',
        '#FF0000',
        '#FF0033',
        '#FF0066',
        '#FF0099',
        '#FF00CC',
        '#FF00FF',
        '#FF3300',
        '#FF3333',
        '#FF3366',
        '#FF3399',
        '#FF33CC',
        '#FF33FF',
        '#FF6600',
        '#FF6633',
        '#FF9900',
        '#FF9933',
        '#FFCC00',
        '#FFCC33'
      ]

      /**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

      // eslint-disable-next-line complexity
      function useColors() {
      // NB: In an Electron preload script, document will be defined but not fully
      // initialized. Since we know we're in Chrome, we'll just detect this case
      // explicitly
        if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
          return true
        }

        // Internet Explorer and Edge do not support colors.
        if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
          return false
        }

        // Is webkit? http://stackoverflow.com/a/16459606/376773
        // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
        return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))
      }

      /**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

      function formatArgs(args) {
        args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff)

        if (!this.useColors) {
          return
        }

        const c = 'color: ' + this.color
        args.splice(1, 0, c, 'color: inherit')

        // The final "%c" is somewhat tricky, because there could be other
        // arguments passed either before or after the %c, so we need to
        // figure out the correct index to insert the CSS into
        let index = 0
        let lastC = 0
        args[0].replace(/%[a-zA-Z%]/g, match => {
          if (match === '%%') {
            return
          }
          index++
          if (match === '%c') {
          // We only are interested in the *last* %c
          // (the user may have provided their own)
            lastC = index
          }
        })

        args.splice(lastC, 0, c)
      }

      /**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
      exports.log = console.debug || console.log || (() => {})

      /**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
      function save(namespaces) {
        try {
          if (namespaces) {
            exports.storage.setItem('debug', namespaces)
          } else {
            exports.storage.removeItem('debug')
          }
        } catch (error) {
        // Swallow
        // XXX (@Qix-) should we be logging these?
        }
      }

      /**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
      function load() {
        let r
        try {
          r = exports.storage.getItem('debug')
        } catch (error) {
        // Swallow
        // XXX (@Qix-) should we be logging these?
        }

        // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
        if (!r && typeof process !== 'undefined' && 'env' in process) {
          r = process.env.DEBUG
        }

        return r
      }

      /**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

      function localstorage() {
        try {
        // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
        // The Browser also has localStorage in the global context.
          return localStorage
        } catch (error) {
        // Swallow
        // XXX (@Qix-) should we be logging these?
        }
      }

      module.exports = require('./common')(exports)

      const { formatters } = module.exports

      /**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

      formatters.j = function(v) {
        try {
          return JSON.stringify(v)
        } catch (error) {
          return '[UnexpectedJSONParseError]: ' + error.message
        }
      }
    }).call(this)
  }).call(this, require('_process'))
}, { './common': 2, '_process': 35 }], 2: [function(require, module, exports) {
/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

  function setup(env) {
    createDebug.debug = createDebug
    createDebug.default = createDebug
    createDebug.coerce = coerce
    createDebug.disable = disable
    createDebug.enable = enable
    createDebug.enabled = enabled
    createDebug.humanize = require('ms')
    createDebug.destroy = destroy

    Object.keys(env).forEach(key => {
      createDebug[key] = env[key]
    })

    /**
	* The currently active debug mode names, and names to skip.
	*/

    createDebug.names = []
    createDebug.skips = []

    /**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
    createDebug.formatters = {}

    /**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
    function selectColor(namespace) {
      let hash = 0

      for (let i = 0; i < namespace.length; i++) {
        hash = ((hash << 5) - hash) + namespace.charCodeAt(i)
        hash |= 0 // Convert to 32bit integer
      }

      return createDebug.colors[Math.abs(hash) % createDebug.colors.length]
    }
    createDebug.selectColor = selectColor

    /**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
    function createDebug(namespace) {
      let prevTime
      let enableOverride = null
      let namespacesCache
      let enabledCache

      function debug(...args) {
        // Disabled?
        if (!debug.enabled) {
          return
        }

        const self = debug

        // Set `diff` timestamp
        const curr = Number(new Date())
        const ms = curr - (prevTime || curr)
        self.diff = ms
        self.prev = prevTime
        self.curr = curr
        prevTime = curr

        args[0] = createDebug.coerce(args[0])

        if (typeof args[0] !== 'string') {
          // Anything else let's inspect with %O
          args.unshift('%O')
        }

        // Apply any `formatters` transformations
        let index = 0
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          // If we encounter an escaped % then don't increase the array index
          if (match === '%%') {
            return '%'
          }
          index++
          const formatter = createDebug.formatters[format]
          if (typeof formatter === 'function') {
            const val = args[index]
            match = formatter.call(self, val)

            // Now we need to remove `args[index]` since it's inlined in the `format`
            args.splice(index, 1)
            index--
          }
          return match
        })

        // Apply env-specific formatting (colors, etc.)
        createDebug.formatArgs.call(self, args)

        const logFn = self.log || createDebug.log
        logFn.apply(self, args)
      }

      debug.namespace = namespace
      debug.useColors = createDebug.useColors()
      debug.color = createDebug.selectColor(namespace)
      debug.extend = extend
      debug.destroy = createDebug.destroy // XXX Temporary. Will be removed in the next major release.

      Object.defineProperty(debug, 'enabled', {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces
            enabledCache = createDebug.enabled(namespace)
          }

          return enabledCache
        },
        set: v => {
          enableOverride = v
        }
      })

      // Env-specific initialization logic for debug instances
      if (typeof createDebug.init === 'function') {
        createDebug.init(debug)
      }

      return debug
    }

    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace)
      newDebug.log = this.log
      return newDebug
    }

    /**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
    function enable(namespaces) {
      createDebug.save(namespaces)
      createDebug.namespaces = namespaces

      createDebug.names = []
      createDebug.skips = []

      let i
      const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/)
      const len = split.length

      for (i = 0; i < len; i++) {
        if (!split[i]) {
          // ignore empty strings
          continue
        }

        namespaces = split[i].replace(/\*/g, '.*?')

        if (namespaces[0] === '-') {
          createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'))
        } else {
          createDebug.names.push(new RegExp('^' + namespaces + '$'))
        }
      }
    }

    /**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
    function disable() {
      const namespaces = [
        ...createDebug.names.map(toNamespace),
        ...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
      ].join(',')
      createDebug.enable('')
      return namespaces
    }

    /**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
    function enabled(name) {
      if (name[name.length - 1] === '*') {
        return true
      }

      let i
      let len

      for (i = 0, len = createDebug.skips.length; i < len; i++) {
        if (createDebug.skips[i].test(name)) {
          return false
        }
      }

      for (i = 0, len = createDebug.names.length; i < len; i++) {
        if (createDebug.names[i].test(name)) {
          return true
        }
      }

      return false
    }

    /**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
    function toNamespace(regexp) {
      return regexp.toString()
        .substring(2, regexp.toString().length - 2)
        .replace(/\.\*\?$/, '*')
    }

    /**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message
      }
      return val
    }

    /**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
    function destroy() {
      console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.')
    }

    createDebug.enable(createDebug.load())

    return createDebug
  }

  module.exports = setup
}, { 'ms': 3 }], 3: [function(require, module, exports) {
/**
 * Helpers.
 */

  var s = 1000
  var m = s * 60
  var h = m * 60
  var d = h * 24
  var w = d * 7
  var y = d * 365.25

  /**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

  module.exports = function(val, options) {
    options = options || {}
    var type = typeof val
    if (type === 'string' && val.length > 0) {
      return parse(val)
    } else if (type === 'number' && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val)
    }
    throw new Error(
      'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
    )
  }

  /**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

  function parse(str) {
    str = String(str)
    if (str.length > 100) {
      return
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str
    )
    if (!match) {
      return
    }
    var n = parseFloat(match[1])
    var type = (match[2] || 'ms').toLowerCase()
    switch (type) {
      case 'years':
      case 'year':
      case 'yrs':
      case 'yr':
      case 'y':
        return n * y
      case 'weeks':
      case 'week':
      case 'w':
        return n * w
      case 'days':
      case 'day':
      case 'd':
        return n * d
      case 'hours':
      case 'hour':
      case 'hrs':
      case 'hr':
      case 'h':
        return n * h
      case 'minutes':
      case 'minute':
      case 'mins':
      case 'min':
      case 'm':
        return n * m
      case 'seconds':
      case 'second':
      case 'secs':
      case 'sec':
      case 's':
        return n * s
      case 'milliseconds':
      case 'millisecond':
      case 'msecs':
      case 'msec':
      case 'ms':
        return n
      default:
        return undefined
    }
  }

  /**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

  function fmtShort(ms) {
    var msAbs = Math.abs(ms)
    if (msAbs >= d) {
      return Math.round(ms / d) + 'd'
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + 'h'
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + 'm'
    }
    if (msAbs >= s) {
      return Math.round(ms / s) + 's'
    }
    return ms + 'ms'
  }

  /**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

  function fmtLong(ms) {
    var msAbs = Math.abs(ms)
    if (msAbs >= d) {
      return plural(ms, msAbs, d, 'day')
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, 'hour')
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, 'minute')
    }
    if (msAbs >= s) {
      return plural(ms, msAbs, s, 'second')
    }
    return ms + ' ms'
  }

  /**
 * Pluralization helper.
 */

  function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5
    return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '')
  }
}, {}], 4: [function(require, module, exports) {
  (function(process) {
    (function() {
      if (typeof process.addon === 'function') { // if the platform supports native resolving prefer that
        module.exports = process.addon.bind(process)
      } else { // else use the runtime version here
        module.exports = require('./node-gyp-build.js')
      }
    }).call(this)
  }).call(this, require('_process'))
}, { './node-gyp-build.js': 5, '_process': 35 }], 5: [function(require, module, exports) {
  (function(process) {
    (function() {
      var fs = require('fs')
      var path = require('path')
      var os = require('os')

      // Workaround to fix webpack's build warnings: 'the request of a dependency is an expression'
var runtimeRequire = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require // eslint-disable-line

      var vars = (process.config && process.config.variables) || {}
      var prebuildsOnly = !!process.env.PREBUILDS_ONLY
      var abi = process.versions.modules // TODO: support old node where this is undef
      var runtime = isElectron() ? 'electron' : (isNwjs() ? 'node-webkit' : 'node')

      var arch = process.env.npm_config_arch || os.arch()
      var platform = process.env.npm_config_platform || os.platform()
      var libc = process.env.LIBC || (isAlpine(platform) ? 'musl' : 'glibc')
      var armv = process.env.ARM_VERSION || (arch === 'arm64' ? '8' : vars.arm_version) || ''
      var uv = (process.versions.uv || '').split('.')[0]

      module.exports = load

      function load(dir) {
        return runtimeRequire(load.resolve(dir))
      }

      load.resolve = load.path = function(dir) {
        dir = path.resolve(dir || '.')

        try {
          var name = runtimeRequire(path.join(dir, 'package.json')).name.toUpperCase().replace(/-/g, '_')
          if (process.env[name + '_PREBUILD']) dir = process.env[name + '_PREBUILD']
        } catch (err) {}

        if (!prebuildsOnly) {
          var release = getFirst(path.join(dir, 'build/Release'), matchBuild)
          if (release) return release

          var debug = getFirst(path.join(dir, 'build/Debug'), matchBuild)
          if (debug) return debug
        }

        var prebuild = resolve(dir)
        if (prebuild) return prebuild

        var nearby = resolve(path.dirname(process.execPath))
        if (nearby) return nearby

        var target = [
          'platform=' + platform,
          'arch=' + arch,
          'runtime=' + runtime,
          'abi=' + abi,
          'uv=' + uv,
          armv ? 'armv=' + armv : '',
          'libc=' + libc,
          'node=' + process.versions.node,
          process.versions.electron ? 'electron=' + process.versions.electron : '',
    typeof __webpack_require__ === 'function' ? 'webpack=true' : '' // eslint-disable-line
        ].filter(Boolean).join(' ')

        throw new Error('No native build was found for ' + target + '\n    loaded from: ' + dir + '\n')

        function resolve(dir) {
        // Find matching "prebuilds/<platform>-<arch>" directory
          var tuples = readdirSync(path.join(dir, 'prebuilds')).map(parseTuple)
          var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0]
          if (!tuple) return

          // Find most specific flavor first
          var prebuilds = path.join(dir, 'prebuilds', tuple.name)
          var parsed = readdirSync(prebuilds).map(parseTags)
          var candidates = parsed.filter(matchTags(runtime, abi))
          var winner = candidates.sort(compareTags(runtime))[0]
          if (winner) return path.join(prebuilds, winner.file)
        }
      }

      function readdirSync(dir) {
        try {
          return fs.readdirSync(dir)
        } catch (err) {
          return []
        }
      }

      function getFirst(dir, filter) {
        var files = readdirSync(dir).filter(filter)
        return files[0] && path.join(dir, files[0])
      }

      function matchBuild(name) {
        return /\.node$/.test(name)
      }

      function parseTuple(name) {
      // Example: darwin-x64+arm64
        var arr = name.split('-')
        if (arr.length !== 2) return

        var platform = arr[0]
        var architectures = arr[1].split('+')

        if (!platform) return
        if (!architectures.length) return
        if (!architectures.every(Boolean)) return

        return { name, platform, architectures }
      }

      function matchTuple(platform, arch) {
        return function(tuple) {
          if (tuple == null) return false
          if (tuple.platform !== platform) return false
          return tuple.architectures.includes(arch)
        }
      }

      function compareTuples(a, b) {
      // Prefer single-arch prebuilds over multi-arch
        return a.architectures.length - b.architectures.length
      }

      function parseTags(file) {
        var arr = file.split('.')
        var extension = arr.pop()
        var tags = { file: file, specificity: 0 }

        if (extension !== 'node') return

        for (var i = 0; i < arr.length; i++) {
          var tag = arr[i]

          if (tag === 'node' || tag === 'electron' || tag === 'node-webkit') {
            tags.runtime = tag
          } else if (tag === 'napi') {
            tags.napi = true
          } else if (tag.slice(0, 3) === 'abi') {
            tags.abi = tag.slice(3)
          } else if (tag.slice(0, 2) === 'uv') {
            tags.uv = tag.slice(2)
          } else if (tag.slice(0, 4) === 'armv') {
            tags.armv = tag.slice(4)
          } else if (tag === 'glibc' || tag === 'musl') {
            tags.libc = tag
          } else {
            continue
          }

          tags.specificity++
        }

        return tags
      }

      function matchTags(runtime, abi) {
        return function(tags) {
          if (tags == null) return false
          if (tags.runtime !== runtime && !runtimeAgnostic(tags)) return false
          if (tags.abi !== abi && !tags.napi) return false
          if (tags.uv && tags.uv !== uv) return false
          if (tags.armv && tags.armv !== armv) return false
          if (tags.libc && tags.libc !== libc) return false

          return true
        }
      }

      function runtimeAgnostic(tags) {
        return tags.runtime === 'node' && tags.napi
      }

      function compareTags(runtime) {
      // Precedence: non-agnostic runtime, abi over napi, then by specificity.
        return function(a, b) {
          if (a.runtime !== b.runtime) {
            return a.runtime === runtime ? -1 : 1
          } else if (a.abi !== b.abi) {
            return a.abi ? -1 : 1
          } else if (a.specificity !== b.specificity) {
            return a.specificity > b.specificity ? -1 : 1
          } else {
            return 0
          }
        }
      }

      function isNwjs() {
        return !!(process.versions && process.versions.nw)
      }

      function isElectron() {
        if (process.versions && process.versions.electron) return true
        if (process.env.ELECTRON_RUN_AS_NODE) return true
        return typeof window !== 'undefined' && window.process && window.process.type === 'renderer'
      }

      function isAlpine(platform) {
        return platform === 'linux' && fs.existsSync('/etc/alpine-release')
      }

      // Exposed for unit tests
      // TODO: move to lib
      load.parseTags = parseTags
      load.matchTags = matchTags
      load.compareTags = compareTags
      load.parseTuple = parseTuple
      load.matchTuple = matchTuple
      load.compareTuples = compareTuples
    }).call(this)
  }).call(this, require('_process'))
}, { '_process': 35, 'fs': 6, 'os': 33, 'path': 34 }], 6: [function(require, module, exports) {

}, {}], 7: [function(require, module, exports) {
  (function(global) {
    (function() {
      'use strict'

      var objectAssign = require('object-assign')

      // compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
      // original notice:

      /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
      function compare(a, b) {
        if (a === b) {
          return 0
        }

        var x = a.length
        var y = b.length

        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i]
            y = b[i]
            break
          }
        }

        if (x < y) {
          return -1
        }
        if (y < x) {
          return 1
        }
        return 0
      }
      function isBuffer(b) {
        if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
          return global.Buffer.isBuffer(b)
        }
        return !!(b != null && b._isBuffer)
      }

      // based on node assert, original notice:
      // NB: The URL to the CommonJS spec is kept just for tradition.
      //     node-assert has evolved a lot since then, both in API and behavior.

      // http://wiki.commonjs.org/wiki/Unit_Testing/1.0
      //
      // THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
      //
      // Originally from narwhal.js (http://narwhaljs.org)
      // Copyright (c) 2009 Thomas Robinson <280north.com>
      //
      // Permission is hereby granted, free of charge, to any person obtaining a copy
      // of this software and associated documentation files (the 'Software'), to
      // deal in the Software without restriction, including without limitation the
      // rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
      // sell copies of the Software, and to permit persons to whom the Software is
      // furnished to do so, subject to the following conditions:
      //
      // The above copyright notice and this permission notice shall be included in
      // all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      // AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
      // ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
      // WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

      var util = require('util/')
      var hasOwn = Object.prototype.hasOwnProperty
      var pSlice = Array.prototype.slice
      var functionsHaveNames = (function() {
        return function foo() {}.name === 'foo'
      }())
      function pToString(obj) {
        return Object.prototype.toString.call(obj)
      }
      function isView(arrbuf) {
        if (isBuffer(arrbuf)) {
          return false
        }
        if (typeof global.ArrayBuffer !== 'function') {
          return false
        }
        if (typeof ArrayBuffer.isView === 'function') {
          return ArrayBuffer.isView(arrbuf)
        }
        if (!arrbuf) {
          return false
        }
        if (arrbuf instanceof DataView) {
          return true
        }
        if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
          return true
        }
        return false
      }
      // 1. The assert module provides functions that throw
      // AssertionError's when particular conditions are not met. The
      // assert module must conform to the following interface.

      var assert = module.exports = ok

      // 2. The AssertionError is defined in assert.
      // new assert.AssertionError({ message: message,
      //                             actual: actual,
      //                             expected: expected })

      var regex = /\s*function\s+([^\(\s]*)\s*/
      // based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
      function getName(func) {
        if (!util.isFunction(func)) {
          return
        }
        if (functionsHaveNames) {
          return func.name
        }
        var str = func.toString()
        var match = str.match(regex)
        return match && match[1]
      }
      assert.AssertionError = function AssertionError(options) {
        this.name = 'AssertionError'
        this.actual = options.actual
        this.expected = options.expected
        this.operator = options.operator
        if (options.message) {
          this.message = options.message
          this.generatedMessage = false
        } else {
          this.message = getMessage(this)
          this.generatedMessage = true
        }
        var stackStartFunction = options.stackStartFunction || fail
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, stackStartFunction)
        } else {
        // non v8 browsers so we can have a stacktrace
          var err = new Error()
          if (err.stack) {
            var out = err.stack

            // try to strip useless frames
            var fn_name = getName(stackStartFunction)
            var idx = out.indexOf('\n' + fn_name)
            if (idx >= 0) {
            // once we have located the function frame
            // we need to strip out everything before it (and its line)
              var next_line = out.indexOf('\n', idx + 1)
              out = out.substring(next_line + 1)
            }

            this.stack = out
          }
        }
      }

      // assert.AssertionError instanceof Error
      util.inherits(assert.AssertionError, Error)

      function truncate(s, n) {
        if (typeof s === 'string') {
          return s.length < n ? s : s.slice(0, n)
        } else {
          return s
        }
      }
      function inspect(something) {
        if (functionsHaveNames || !util.isFunction(something)) {
          return util.inspect(something)
        }
        var rawname = getName(something)
        var name = rawname ? ': ' + rawname : ''
        return '[Function' + name + ']'
      }
      function getMessage(self) {
        return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128)
      }

      // At present only the three keys mentioned above are used and
      // understood by the spec. Implementations or sub modules can pass
      // other keys to the AssertionError's constructor - they will be
      // ignored.

      // 3. All of the following functions must throw an AssertionError
      // when a corresponding condition is not met, with a message that
      // may be undefined if not provided.  All assertion methods provide
      // both the actual and expected values to the assertion error for
      // display purposes.

      function fail(actual, expected, message, operator, stackStartFunction) {
        throw new assert.AssertionError({
          message: message,
          actual: actual,
          expected: expected,
          operator: operator,
          stackStartFunction: stackStartFunction
        })
      }

      // EXTENSION! allows for well behaved errors defined elsewhere.
      assert.fail = fail

      // 4. Pure assertion tests whether a value is truthy, as determined
      // by !!guard.
      // assert.ok(guard, message_opt);
      // This statement is equivalent to assert.equal(true, !!guard,
      // message_opt);. To test strictly for the value true, use
      // assert.strictEqual(true, guard, message_opt);.

      function ok(value, message) {
        if (!value) fail(value, true, message, '==', assert.ok)
      }
      assert.ok = ok

      // 5. The equality assertion tests shallow, coercive equality with
      // ==.
      // assert.equal(actual, expected, message_opt);

      assert.equal = function equal(actual, expected, message) {
        if (actual != expected) fail(actual, expected, message, '==', assert.equal)
      }

      // 6. The non-equality assertion tests for whether two objects are not equal
      // with != assert.notEqual(actual, expected, message_opt);

      assert.notEqual = function notEqual(actual, expected, message) {
        if (actual == expected) {
          fail(actual, expected, message, '!=', assert.notEqual)
        }
      }

      // 7. The equivalence assertion tests a deep equality relation.
      // assert.deepEqual(actual, expected, message_opt);

      assert.deepEqual = function deepEqual(actual, expected, message) {
        if (!_deepEqual(actual, expected, false)) {
          fail(actual, expected, message, 'deepEqual', assert.deepEqual)
        }
      }

      assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
        if (!_deepEqual(actual, expected, true)) {
          fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual)
        }
      }

      function _deepEqual(actual, expected, strict, memos) {
      // 7.1. All identical values are equivalent, as determined by ===.
        if (actual === expected) {
          return true
        } else if (isBuffer(actual) && isBuffer(expected)) {
          return compare(actual, expected) === 0

        // 7.2. If the expected value is a Date object, the actual value is
        // equivalent if it is also a Date object that refers to the same time.
        } else if (util.isDate(actual) && util.isDate(expected)) {
          return actual.getTime() === expected.getTime()

        // 7.3 If the expected value is a RegExp object, the actual value is
        // equivalent if it is also a RegExp object with the same source and
        // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
        } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
          return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase

        // 7.4. Other pairs that do not both pass typeof value == 'object',
        // equivalence is determined by ==.
        } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
          return strict ? actual === expected : actual == expected

        // If both values are instances of typed arrays, wrap their underlying
        // ArrayBuffers in a Buffer each to increase performance
        // This optimization requires the arrays to have the same type as checked by
        // Object.prototype.toString (aka pToString). Never perform binary
        // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
        // bit patterns are not identical.
        } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
          return compare(new Uint8Array(actual.buffer),
            new Uint8Array(expected.buffer)) === 0

        // 7.5 For all other Object pairs, including Array objects, equivalence is
        // determined by having the same number of owned properties (as verified
        // with Object.prototype.hasOwnProperty.call), the same set of keys
        // (although not necessarily the same order), equivalent values for every
        // corresponding key, and an identical 'prototype' property. Note: this
        // accounts for both named and indexed properties on Arrays.
        } else if (isBuffer(actual) !== isBuffer(expected)) {
          return false
        } else {
          memos = memos || { actual: [], expected: [] }

          var actualIndex = memos.actual.indexOf(actual)
          if (actualIndex !== -1) {
            if (actualIndex === memos.expected.indexOf(expected)) {
              return true
            }
          }

          memos.actual.push(actual)
          memos.expected.push(expected)

          return objEquiv(actual, expected, strict, memos)
        }
      }

      function isArguments(object) {
        return Object.prototype.toString.call(object) == '[object Arguments]'
      }

      function objEquiv(a, b, strict, actualVisitedObjects) {
        if (a === null || a === undefined || b === null || b === undefined) { return false }
        // if one is a primitive, the other must be same
        if (util.isPrimitive(a) || util.isPrimitive(b)) { return a === b }
        if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) { return false }
        var aIsArgs = isArguments(a)
        var bIsArgs = isArguments(b)
        if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs)) { return false }
        if (aIsArgs) {
          a = pSlice.call(a)
          b = pSlice.call(b)
          return _deepEqual(a, b, strict)
        }
        var ka = objectKeys(a)
        var kb = objectKeys(b)
        var key, i
        // having the same number of owned properties (keys incorporates
        // hasOwnProperty)
        if (ka.length !== kb.length) { return false }
        // the same set of keys (although not necessarily the same order),
        ka.sort()
        kb.sort()
        // ~~~cheap key test
        for (i = ka.length - 1; i >= 0; i--) {
          if (ka[i] !== kb[i]) { return false }
        }
        // equivalent values for every corresponding key, and
        // ~~~possibly expensive deep test
        for (i = ka.length - 1; i >= 0; i--) {
          key = ka[i]
          if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects)) { return false }
        }
        return true
      }

      // 8. The non-equivalence assertion tests for any deep inequality.
      // assert.notDeepEqual(actual, expected, message_opt);

      assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
        if (_deepEqual(actual, expected, false)) {
          fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual)
        }
      }

      assert.notDeepStrictEqual = notDeepStrictEqual
      function notDeepStrictEqual(actual, expected, message) {
        if (_deepEqual(actual, expected, true)) {
          fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual)
        }
      }

      // 9. The strict equality assertion tests strict equality, as determined by ===.
      // assert.strictEqual(actual, expected, message_opt);

      assert.strictEqual = function strictEqual(actual, expected, message) {
        if (actual !== expected) {
          fail(actual, expected, message, '===', assert.strictEqual)
        }
      }

      // 10. The strict non-equality assertion tests for strict inequality, as
      // determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

      assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
        if (actual === expected) {
          fail(actual, expected, message, '!==', assert.notStrictEqual)
        }
      }

      function expectedException(actual, expected) {
        if (!actual || !expected) {
          return false
        }

        if (Object.prototype.toString.call(expected) == '[object RegExp]') {
          return expected.test(actual)
        }

        try {
          if (actual instanceof expected) {
            return true
          }
        } catch (e) {
        // Ignore.  The instanceof check doesn't work for arrow functions.
        }

        if (Error.isPrototypeOf(expected)) {
          return false
        }

        return expected.call({}, actual) === true
      }

      function _tryBlock(block) {
        var error
        try {
          block()
        } catch (e) {
          error = e
        }
        return error
      }

      function _throws(shouldThrow, block, expected, message) {
        var actual

        if (typeof block !== 'function') {
          throw new TypeError('"block" argument must be a function')
        }

        if (typeof expected === 'string') {
          message = expected
          expected = null
        }

        actual = _tryBlock(block)

        message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.')

        if (shouldThrow && !actual) {
          fail(actual, expected, 'Missing expected exception' + message)
        }

        var userProvidedMessage = typeof message === 'string'
        var isUnwantedException = !shouldThrow && util.isError(actual)
        var isUnexpectedException = !shouldThrow && actual && !expected

        if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
          fail(actual, expected, 'Got unwanted exception' + message)
        }

        if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
          throw actual
        }
      }

      // 11. Expected to throw an error:
      // assert.throws(block, Error_opt, message_opt);

      assert.throws = function(block, /* optional*/error, /* optional*/message) {
        _throws(true, block, error, message)
      }

      // EXTENSION! This is annoying to write outside this module.
      assert.doesNotThrow = function(block, /* optional*/error, /* optional*/message) {
        _throws(false, block, error, message)
      }

      assert.ifError = function(err) { if (err) throw err }

      // Expose a strict only variant of assert
      function strict(value, message) {
        if (!value) fail(value, true, message, '==', strict)
      }
      assert.strict = objectAssign(strict, assert, {
        equal: assert.strictEqual,
        deepEqual: assert.deepStrictEqual,
        notEqual: assert.notStrictEqual,
        notDeepEqual: assert.notDeepStrictEqual
      })
      assert.strict.strict = assert.strict

      var objectKeys = Object.keys || function(obj) {
        var keys = []
        for (var key in obj) {
          if (hasOwn.call(obj, key)) keys.push(key)
        }
        return keys
      }
    }).call(this)
  }).call(this, typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {})
}, { 'object-assign': 32, 'util/': 10 }], 8: [function(require, module, exports) {
  if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  } else {
  // old school shim for old browsers
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function() {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}, {}], 9: [function(require, module, exports) {
  module.exports = function isBuffer(arg) {
    return arg && typeof arg === 'object' &&
    typeof arg.copy === 'function' &&
    typeof arg.fill === 'function' &&
    typeof arg.readUInt8 === 'function'
  }
}, {}], 10: [function(require, module, exports) {
  (function(process, global) {
    (function() {
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.

      var formatRegExp = /%[sdj%]/g
      exports.format = function(f) {
        if (!isString(f)) {
          var objects = []
          for (var i = 0; i < arguments.length; i++) {
            objects.push(inspect(arguments[i]))
          }
          return objects.join(' ')
        }

        var i = 1
        var args = arguments
        var len = args.length
        var str = String(f).replace(formatRegExp, function(x) {
          if (x === '%%') return '%'
          if (i >= len) return x
          switch (x) {
            case '%s': return String(args[i++])
            case '%d': return Number(args[i++])
            case '%j':
              try {
                return JSON.stringify(args[i++])
              } catch (_) {
                return '[Circular]'
              }
            default:
              return x
          }
        })
        for (var x = args[i]; i < len; x = args[++i]) {
          if (isNull(x) || !isObject(x)) {
            str += ' ' + x
          } else {
            str += ' ' + inspect(x)
          }
        }
        return str
      }

      // Mark that a method should not be used.
      // Returns a modified function which warns once by default.
      // If --no-deprecation is set, then it is a no-op.
      exports.deprecate = function(fn, msg) {
      // Allow for deprecating things in the process of starting up.
        if (isUndefined(global.process)) {
          return function() {
            return exports.deprecate(fn, msg).apply(this, arguments)
          }
        }

        if (process.noDeprecation === true) {
          return fn
        }

        var warned = false
        function deprecated() {
          if (!warned) {
            if (process.throwDeprecation) {
              throw new Error(msg)
            } else if (process.traceDeprecation) {
              console.trace(msg)
            } else {
              console.error(msg)
            }
            warned = true
          }
          return fn.apply(this, arguments)
        }

        return deprecated
      }

      var debugs = {}
      var debugEnviron
      exports.debuglog = function(set) {
        if (isUndefined(debugEnviron)) { debugEnviron = process.env.NODE_DEBUG || '' }
        set = set.toUpperCase()
        if (!debugs[set]) {
          if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
            var pid = process.pid
            debugs[set] = function() {
              var msg = exports.format.apply(exports, arguments)
              console.error('%s %d: %s', set, pid, msg)
            }
          } else {
            debugs[set] = function() {}
          }
        }
        return debugs[set]
      }

      /**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
      /* legacy: obj, showHidden, depth, colors*/
      function inspect(obj, opts) {
      // default options
        var ctx = {
          seen: [],
          stylize: stylizeNoColor
        }
        // legacy...
        if (arguments.length >= 3) ctx.depth = arguments[2]
        if (arguments.length >= 4) ctx.colors = arguments[3]
        if (isBoolean(opts)) {
        // legacy...
          ctx.showHidden = opts
        } else if (opts) {
        // got an "options" object
          exports._extend(ctx, opts)
        }
        // set default options
        if (isUndefined(ctx.showHidden)) ctx.showHidden = false
        if (isUndefined(ctx.depth)) ctx.depth = 2
        if (isUndefined(ctx.colors)) ctx.colors = false
        if (isUndefined(ctx.customInspect)) ctx.customInspect = true
        if (ctx.colors) ctx.stylize = stylizeWithColor
        return formatValue(ctx, obj, ctx.depth)
      }
      exports.inspect = inspect

      // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
      inspect.colors = {
        'bold': [1, 22],
        'italic': [3, 23],
        'underline': [4, 24],
        'inverse': [7, 27],
        'white': [37, 39],
        'grey': [90, 39],
        'black': [30, 39],
        'blue': [34, 39],
        'cyan': [36, 39],
        'green': [32, 39],
        'magenta': [35, 39],
        'red': [31, 39],
        'yellow': [33, 39]
      }

      // Don't use 'blue' not visible on cmd.exe
      inspect.styles = {
        'special': 'cyan',
        'number': 'yellow',
        'boolean': 'yellow',
        'undefined': 'grey',
        'null': 'bold',
        'string': 'green',
        'date': 'magenta',
        // "name": intentionally not styling
        'regexp': 'red'
      }

      function stylizeWithColor(str, styleType) {
        var style = inspect.styles[styleType]

        if (style) {
          return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm'
        } else {
          return str
        }
      }

      function stylizeNoColor(str, styleType) {
        return str
      }

      function arrayToHash(array) {
        var hash = {}

        array.forEach(function(val, idx) {
          hash[val] = true
        })

        return hash
      }

      function formatValue(ctx, value, recurseTimes) {
      // Provide a hook for user-specified inspect functions.
      // Check that value is an object with an inspect function on it
        if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
          var ret = value.inspect(recurseTimes, ctx)
          if (!isString(ret)) {
            ret = formatValue(ctx, ret, recurseTimes)
          }
          return ret
        }

        // Primitive types cannot have properties
        var primitive = formatPrimitive(ctx, value)
        if (primitive) {
          return primitive
        }

        // Look up the keys of the object.
        var keys = Object.keys(value)
        var visibleKeys = arrayToHash(keys)

        if (ctx.showHidden) {
          keys = Object.getOwnPropertyNames(value)
        }

        // IE doesn't make error fields non-enumerable
        // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
        if (isError(value) &&
      (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
          return formatError(value)
        }

        // Some type of object without properties can be shortcutted.
        if (keys.length === 0) {
          if (isFunction(value)) {
            var name = value.name ? ': ' + value.name : ''
            return ctx.stylize('[Function' + name + ']', 'special')
          }
          if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp')
          }
          if (isDate(value)) {
            return ctx.stylize(Date.prototype.toString.call(value), 'date')
          }
          if (isError(value)) {
            return formatError(value)
          }
        }

        var base = ''; var array = false; var braces = ['{', '}']

        // Make Array say that they are Array
        if (isArray(value)) {
          array = true
          braces = ['[', ']']
        }

        // Make functions say that they are functions
        if (isFunction(value)) {
          var n = value.name ? ': ' + value.name : ''
          base = ' [Function' + n + ']'
        }

        // Make RegExps say that they are RegExps
        if (isRegExp(value)) {
          base = ' ' + RegExp.prototype.toString.call(value)
        }

        // Make dates with properties first say the date
        if (isDate(value)) {
          base = ' ' + Date.prototype.toUTCString.call(value)
        }

        // Make error with message first say the error
        if (isError(value)) {
          base = ' ' + formatError(value)
        }

        if (keys.length === 0 && (!array || value.length == 0)) {
          return braces[0] + base + braces[1]
        }

        if (recurseTimes < 0) {
          if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp')
          } else {
            return ctx.stylize('[Object]', 'special')
          }
        }

        ctx.seen.push(value)

        var output
        if (array) {
          output = formatArray(ctx, value, recurseTimes, visibleKeys, keys)
        } else {
          output = keys.map(function(key) {
            return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array)
          })
        }

        ctx.seen.pop()

        return reduceToSingleString(output, base, braces)
      }

      function formatPrimitive(ctx, value) {
        if (isUndefined(value)) { return ctx.stylize('undefined', 'undefined') }
        if (isString(value)) {
          var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"') + '\''
          return ctx.stylize(simple, 'string')
        }
        if (isNumber(value)) { return ctx.stylize('' + value, 'number') }
        if (isBoolean(value)) { return ctx.stylize('' + value, 'boolean') }
        // For some reason typeof null is "object", so special case here.
        if (isNull(value)) { return ctx.stylize('null', 'null') }
      }

      function formatError(value) {
        return '[' + Error.prototype.toString.call(value) + ']'
      }

      function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
        var output = []
        for (var i = 0, l = value.length; i < l; ++i) {
          if (hasOwnProperty(value, String(i))) {
            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              String(i), true))
          } else {
            output.push('')
          }
        }
        keys.forEach(function(key) {
          if (!key.match(/^\d+$/)) {
            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              key, true))
          }
        })
        return output
      }

      function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
        var name, str, desc
        desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] }
        if (desc.get) {
          if (desc.set) {
            str = ctx.stylize('[Getter/Setter]', 'special')
          } else {
            str = ctx.stylize('[Getter]', 'special')
          }
        } else {
          if (desc.set) {
            str = ctx.stylize('[Setter]', 'special')
          }
        }
        if (!hasOwnProperty(visibleKeys, key)) {
          name = '[' + key + ']'
        }
        if (!str) {
          if (ctx.seen.indexOf(desc.value) < 0) {
            if (isNull(recurseTimes)) {
              str = formatValue(ctx, desc.value, null)
            } else {
              str = formatValue(ctx, desc.value, recurseTimes - 1)
            }
            if (str.indexOf('\n') > -1) {
              if (array) {
                str = str.split('\n').map(function(line) {
                  return '  ' + line
                }).join('\n').substr(2)
              } else {
                str = '\n' + str.split('\n').map(function(line) {
                  return '   ' + line
                }).join('\n')
              }
            }
          } else {
            str = ctx.stylize('[Circular]', 'special')
          }
        }
        if (isUndefined(name)) {
          if (array && key.match(/^\d+$/)) {
            return str
          }
          name = JSON.stringify('' + key)
          if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
            name = name.substr(1, name.length - 2)
            name = ctx.stylize(name, 'name')
          } else {
            name = name.replace(/'/g, "\\'")
              .replace(/\\"/g, '"')
              .replace(/(^"|"$)/g, "'")
            name = ctx.stylize(name, 'string')
          }
        }

        return name + ': ' + str
      }

      function reduceToSingleString(output, base, braces) {
        var numLinesEst = 0
        var length = output.reduce(function(prev, cur) {
          numLinesEst++
          if (cur.indexOf('\n') >= 0) numLinesEst++
          return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1
        }, 0)

        if (length > 60) {
          return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1]
        }

        return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1]
      }

      // NOTE: These type checking functions intentionally don't use `instanceof`
      // because it is fragile and can be easily faked with `Object.create()`.
      function isArray(ar) {
        return Array.isArray(ar)
      }
      exports.isArray = isArray

      function isBoolean(arg) {
        return typeof arg === 'boolean'
      }
      exports.isBoolean = isBoolean

      function isNull(arg) {
        return arg === null
      }
      exports.isNull = isNull

      function isNullOrUndefined(arg) {
        return arg == null
      }
      exports.isNullOrUndefined = isNullOrUndefined

      function isNumber(arg) {
        return typeof arg === 'number'
      }
      exports.isNumber = isNumber

      function isString(arg) {
        return typeof arg === 'string'
      }
      exports.isString = isString

      function isSymbol(arg) {
        return typeof arg === 'symbol'
      }
      exports.isSymbol = isSymbol

      function isUndefined(arg) {
        return arg === void 0
      }
      exports.isUndefined = isUndefined

      function isRegExp(re) {
        return isObject(re) && objectToString(re) === '[object RegExp]'
      }
      exports.isRegExp = isRegExp

      function isObject(arg) {
        return typeof arg === 'object' && arg !== null
      }
      exports.isObject = isObject

      function isDate(d) {
        return isObject(d) && objectToString(d) === '[object Date]'
      }
      exports.isDate = isDate

      function isError(e) {
        return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error)
      }
      exports.isError = isError

      function isFunction(arg) {
        return typeof arg === 'function'
      }
      exports.isFunction = isFunction

      function isPrimitive(arg) {
        return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' || // ES6 symbol
         typeof arg === 'undefined'
      }
      exports.isPrimitive = isPrimitive

      exports.isBuffer = require('./support/isBuffer')

      function objectToString(o) {
        return Object.prototype.toString.call(o)
      }

      function pad(n) {
        return n < 10 ? '0' + n.toString(10) : n.toString(10)
      }

      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
        'Oct', 'Nov', 'Dec']

      // 26 Feb 16:19:34
      function timestamp() {
        var d = new Date()
        var time = [pad(d.getHours()),
          pad(d.getMinutes()),
          pad(d.getSeconds())].join(':')
        return [d.getDate(), months[d.getMonth()], time].join(' ')
      }

      // log is just a thin wrapper to console.log that prepends a timestamp
      exports.log = function() {
        console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments))
      }

      /**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
      exports.inherits = require('inherits')

      exports._extend = function(origin, add) {
      // Don't do anything if add isn't an object
        if (!add || !isObject(add)) return origin

        var keys = Object.keys(add)
        var i = keys.length
        while (i--) {
          origin[keys[i]] = add[keys[i]]
        }
        return origin
      }

      function hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop)
      }
    }).call(this)
  }).call(this, require('_process'), typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {})
}, { './support/isBuffer': 9, '_process': 35, 'inherits': 8 }], 11: [function(require, module, exports) {
  (function(global) {
    (function() {
      'use strict'

      var possibleNames = [
        'BigInt64Array',
        'BigUint64Array',
        'Float32Array',
        'Float64Array',
        'Int16Array',
        'Int32Array',
        'Int8Array',
        'Uint16Array',
        'Uint32Array',
        'Uint8Array',
        'Uint8ClampedArray'
      ]

      var g = typeof globalThis === 'undefined' ? global : globalThis

      module.exports = function availableTypedArrays() {
        var out = []
        for (var i = 0; i < possibleNames.length; i++) {
          if (typeof g[possibleNames[i]] === 'function') {
            out[out.length] = possibleNames[i]
          }
        }
        return out
      }
    }).call(this)
  }).call(this, typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {})
}, {}], 12: [function(require, module, exports) {
  'use strict'

  exports.byteLength = byteLength
  exports.toByteArray = toByteArray
  exports.fromByteArray = fromByteArray

  var lookup = []
  var revLookup = []
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i]
    revLookup[code.charCodeAt(i)] = i
  }

  // Support decoding URL-safe base64 strings, as Node.js does.
  // See: https://en.wikipedia.org/wiki/Base64#URL_applications
  revLookup['-'.charCodeAt(0)] = 62
  revLookup['_'.charCodeAt(0)] = 63

  function getLens(b64) {
    var len = b64.length

    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4')
    }

    // Trim off extra bytes after placeholder bytes are found
    // See: https://github.com/beatgammit/base64-js/issues/42
    var validLen = b64.indexOf('=')
    if (validLen === -1) validLen = len

    var placeHoldersLen = validLen === len
      ? 0
      : 4 - (validLen % 4)

    return [validLen, placeHoldersLen]
  }

  // base64 is 4/3 + up to two characters of the original data
  function byteLength(b64) {
    var lens = getLens(b64)
    var validLen = lens[0]
    var placeHoldersLen = lens[1]
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
  }

  function _byteLength(b64, validLen, placeHoldersLen) {
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
  }

  function toByteArray(b64) {
    var tmp
    var lens = getLens(b64)
    var validLen = lens[0]
    var placeHoldersLen = lens[1]

    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

    var curByte = 0

    // if there are placeholders, only get up to the last complete 4 chars
    var len = placeHoldersLen > 0
      ? validLen - 4
      : validLen

    var i
    for (i = 0; i < len; i += 4) {
      tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
      arr[curByte++] = (tmp >> 16) & 0xFF
      arr[curByte++] = (tmp >> 8) & 0xFF
      arr[curByte++] = tmp & 0xFF
    }

    if (placeHoldersLen === 2) {
      tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
      arr[curByte++] = tmp & 0xFF
    }

    if (placeHoldersLen === 1) {
      tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
      arr[curByte++] = (tmp >> 8) & 0xFF
      arr[curByte++] = tmp & 0xFF
    }

    return arr
  }

  function tripletToBase64(num) {
    return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
  }

  function encodeChunk(uint8, start, end) {
    var tmp
    var output = []
    for (var i = start; i < end; i += 3) {
      tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
      output.push(tripletToBase64(tmp))
    }
    return output.join('')
  }

  function fromByteArray(uint8) {
    var tmp
    var len = uint8.length
    var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
    var parts = []
    var maxChunkLength = 16383 // must be multiple of 3

    // go through the array every three bytes, we'll deal with trailing stuff later
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
      tmp = uint8[len - 1]
      parts.push(
        lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
      )
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1]
      parts.push(
        lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
      )
    }

    return parts.join('')
  }
}, {}], 13: [function(require, module, exports) {
  (function(Buffer) {
    (function() {
    /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
      /* eslint-disable no-proto */

      'use strict'

      var base64 = require('base64-js')
      var ieee754 = require('ieee754')

      exports.Buffer = Buffer
      exports.SlowBuffer = SlowBuffer
      exports.INSPECT_MAX_BYTES = 50

      var K_MAX_LENGTH = 0x7fffffff
      exports.kMaxLength = K_MAX_LENGTH

      /**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
      Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

      if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
        console.error(
          'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
        )
      }

      function typedArraySupport() {
      // Can typed array instances can be augmented?
        try {
          var arr = new Uint8Array(1)
          arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function() { return 42 } }
          return arr.foo() === 42
        } catch (e) {
          return false
        }
      }

      Object.defineProperty(Buffer.prototype, 'parent', {
        enumerable: true,
        get: function() {
          if (!Buffer.isBuffer(this)) return undefined
          return this.buffer
        }
      })

      Object.defineProperty(Buffer.prototype, 'offset', {
        enumerable: true,
        get: function() {
          if (!Buffer.isBuffer(this)) return undefined
          return this.byteOffset
        }
      })

      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"')
        }
        // Return an augmented `Uint8Array` instance
        var buf = new Uint8Array(length)
        buf.__proto__ = Buffer.prototype
        return buf
      }

      /**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

      function Buffer(arg, encodingOrOffset, length) {
      // Common case.
        if (typeof arg === 'number') {
          if (typeof encodingOrOffset === 'string') {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            )
          }
          return allocUnsafe(arg)
        }
        return from(arg, encodingOrOffset, length)
      }

      // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
      if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
        Object.defineProperty(Buffer, Symbol.species, {
          value: null,
          configurable: true,
          enumerable: false,
          writable: false
        })
      }

      Buffer.poolSize = 8192 // not used by this implementation

      function from(value, encodingOrOffset, length) {
        if (typeof value === 'string') {
          return fromString(value, encodingOrOffset)
        }

        if (ArrayBuffer.isView(value)) {
          return fromArrayLike(value)
        }

        if (value == null) {
          throw TypeError(
            'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
          )
        }

        if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length)
        }

        if (typeof value === 'number') {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          )
        }

        var valueOf = value.valueOf && value.valueOf()
        if (valueOf != null && valueOf !== value) {
          return Buffer.from(valueOf, encodingOrOffset, length)
        }

        var b = fromObject(value)
        if (b) return b

        if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
          return Buffer.from(
            value[Symbol.toPrimitive]('string'), encodingOrOffset, length
          )
        }

        throw new TypeError(
          'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
        )
      }

      /**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
      Buffer.from = function(value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length)
      }

      // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
      // https://github.com/feross/buffer/pull/148
      Buffer.prototype.__proto__ = Uint8Array.prototype
      Buffer.__proto__ = Uint8Array

      function assertSize(size) {
        if (typeof size !== 'number') {
          throw new TypeError('"size" argument must be of type number')
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"')
        }
      }

      function alloc(size, fill, encoding) {
        assertSize(size)
        if (size <= 0) {
          return createBuffer(size)
        }
        if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
          return typeof encoding === 'string'
            ? createBuffer(size).fill(fill, encoding)
            : createBuffer(size).fill(fill)
        }
        return createBuffer(size)
      }

      /**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
      Buffer.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding)
      }

      function allocUnsafe(size) {
        assertSize(size)
        return createBuffer(size < 0 ? 0 : checked(size) | 0)
      }

      /**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
      Buffer.allocUnsafe = function(size) {
        return allocUnsafe(size)
      }
      /**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
      Buffer.allocUnsafeSlow = function(size) {
        return allocUnsafe(size)
      }

      function fromString(string, encoding) {
        if (typeof encoding !== 'string' || encoding === '') {
          encoding = 'utf8'
        }

        if (!Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }

        var length = byteLength(string, encoding) | 0
        var buf = createBuffer(length)

        var actual = buf.write(string, encoding)

        if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
          buf = buf.slice(0, actual)
        }

        return buf
      }

      function fromArrayLike(array) {
        var length = array.length < 0 ? 0 : checked(array.length) | 0
        var buf = createBuffer(length)
        for (var i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255
        }
        return buf
      }

      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds')
        }

        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds')
        }

        var buf
        if (byteOffset === undefined && length === undefined) {
          buf = new Uint8Array(array)
        } else if (length === undefined) {
          buf = new Uint8Array(array, byteOffset)
        } else {
          buf = new Uint8Array(array, byteOffset, length)
        }

        // Return an augmented `Uint8Array` instance
        buf.__proto__ = Buffer.prototype
        return buf
      }

      function fromObject(obj) {
        if (Buffer.isBuffer(obj)) {
          var len = checked(obj.length) | 0
          var buf = createBuffer(len)

          if (buf.length === 0) {
            return buf
          }

          obj.copy(buf, 0, 0, len)
          return buf
        }

        if (obj.length !== undefined) {
          if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
            return createBuffer(0)
          }
          return fromArrayLike(obj)
        }

        if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data)
        }
      }

      function checked(length) {
      // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
        if (length >= K_MAX_LENGTH) {
          throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
        }
        return length | 0
      }

      function SlowBuffer(length) {
        if (+length != length) { // eslint-disable-line eqeqeq
          length = 0
        }
        return Buffer.alloc(+length)
      }

      Buffer.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
      }

      Buffer.compare = function compare(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
        if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          )
        }

        if (a === b) return 0

        var x = a.length
        var y = b.length

        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i]
            y = b[i]
            break
          }
        }

        if (x < y) return -1
        if (y < x) return 1
        return 0
      }

      Buffer.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case 'hex':
          case 'utf8':
          case 'utf-8':
          case 'ascii':
          case 'latin1':
          case 'binary':
          case 'base64':
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return true
          default:
            return false
        }
      }

      Buffer.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }

        if (list.length === 0) {
          return Buffer.alloc(0)
        }

        var i
        if (length === undefined) {
          length = 0
          for (i = 0; i < list.length; ++i) {
            length += list[i].length
          }
        }

        var buffer = Buffer.allocUnsafe(length)
        var pos = 0
        for (i = 0; i < list.length; ++i) {
          var buf = list[i]
          if (isInstance(buf, Uint8Array)) {
            buf = Buffer.from(buf)
          }
          if (!Buffer.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers')
          }
          buf.copy(buffer, pos)
          pos += buf.length
        }
        return buffer
      }

      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) {
          return string.length
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength
        }
        if (typeof string !== 'string') {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
          )
        }

        var len = string.length
        var mustMatch = (arguments.length > 2 && arguments[2] === true)
        if (!mustMatch && len === 0) return 0

        // Use a for loop to avoid recursion
        var loweredCase = false
        for (;;) {
          switch (encoding) {
            case 'ascii':
            case 'latin1':
            case 'binary':
              return len
            case 'utf8':
            case 'utf-8':
              return utf8ToBytes(string).length
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return len * 2
            case 'hex':
              return len >>> 1
            case 'base64':
              return base64ToBytes(string).length
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
              }
              encoding = ('' + encoding).toLowerCase()
              loweredCase = true
          }
        }
      }
      Buffer.byteLength = byteLength

      function slowToString(encoding, start, end) {
        var loweredCase = false

        // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
        // property of a typed array.

        // This behaves neither like String nor Uint8Array in that we set start/end
        // to their upper/lower bounds if the value passed is out of range.
        // undefined is handled specially as per ECMA-262 6th Edition,
        // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
        if (start === undefined || start < 0) {
          start = 0
        }
        // Return early if start > this.length. Done here to prevent potential uint32
        // coercion fail below.
        if (start > this.length) {
          return ''
        }

        if (end === undefined || end > this.length) {
          end = this.length
        }

        if (end <= 0) {
          return ''
        }

        // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
        end >>>= 0
        start >>>= 0

        if (end <= start) {
          return ''
        }

        if (!encoding) encoding = 'utf8'

        while (true) {
          switch (encoding) {
            case 'hex':
              return hexSlice(this, start, end)

            case 'utf8':
            case 'utf-8':
              return utf8Slice(this, start, end)

            case 'ascii':
              return asciiSlice(this, start, end)

            case 'latin1':
            case 'binary':
              return latin1Slice(this, start, end)

            case 'base64':
              return base64Slice(this, start, end)

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return utf16leSlice(this, start, end)

            default:
              if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
              encoding = (encoding + '').toLowerCase()
              loweredCase = true
          }
        }
      }

      // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
      // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
      // reliably in a browserify context because there could be multiple different
      // copies of the 'buffer' package in use. This method works even for Buffer
      // instances that were created from another copy of the `buffer` package.
      // See: https://github.com/feross/buffer/issues/154
      Buffer.prototype._isBuffer = true

      function swap(b, n, m) {
        var i = b[n]
        b[n] = b[m]
        b[m] = i
      }

      Buffer.prototype.swap16 = function swap16() {
        var len = this.length
        if (len % 2 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 16-bits')
        }
        for (var i = 0; i < len; i += 2) {
          swap(this, i, i + 1)
        }
        return this
      }

      Buffer.prototype.swap32 = function swap32() {
        var len = this.length
        if (len % 4 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 32-bits')
        }
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3)
          swap(this, i + 1, i + 2)
        }
        return this
      }

      Buffer.prototype.swap64 = function swap64() {
        var len = this.length
        if (len % 8 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 64-bits')
        }
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7)
          swap(this, i + 1, i + 6)
          swap(this, i + 2, i + 5)
          swap(this, i + 3, i + 4)
        }
        return this
      }

      Buffer.prototype.toString = function toString() {
        var length = this.length
        if (length === 0) return ''
        if (arguments.length === 0) return utf8Slice(this, 0, length)
        return slowToString.apply(this, arguments)
      }

      Buffer.prototype.toLocaleString = Buffer.prototype.toString

      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
        if (this === b) return true
        return Buffer.compare(this, b) === 0
      }

      Buffer.prototype.inspect = function inspect() {
        var str = ''
        var max = exports.INSPECT_MAX_BYTES
        str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
        if (this.length > max) str += ' ... '
        return '<Buffer ' + str + '>'
      }

      Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer.from(target, target.offset, target.byteLength)
        }
        if (!Buffer.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
          )
        }

        if (start === undefined) {
          start = 0
        }
        if (end === undefined) {
          end = target ? target.length : 0
        }
        if (thisStart === undefined) {
          thisStart = 0
        }
        if (thisEnd === undefined) {
          thisEnd = this.length
        }

        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError('out of range index')
        }

        if (thisStart >= thisEnd && start >= end) {
          return 0
        }
        if (thisStart >= thisEnd) {
          return -1
        }
        if (start >= end) {
          return 1
        }

        start >>>= 0
        end >>>= 0
        thisStart >>>= 0
        thisEnd >>>= 0

        if (this === target) return 0

        var x = thisEnd - thisStart
        var y = end - start
        var len = Math.min(x, y)

        var thisCopy = this.slice(thisStart, thisEnd)
        var targetCopy = target.slice(start, end)

        for (var i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i]
            y = targetCopy[i]
            break
          }
        }

        if (x < y) return -1
        if (y < x) return 1
        return 0
      }

      // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
      // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
      //
      // Arguments:
      // - buffer - a Buffer to search
      // - val - a string, Buffer, or number
      // - byteOffset - an index into `buffer`; will be clamped to an int32
      // - encoding - an optional encoding, relevant is val is a string
      // - dir - true for indexOf, false for lastIndexOf
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      // Empty buffer means no match
        if (buffer.length === 0) return -1

        // Normalize byteOffset
        if (typeof byteOffset === 'string') {
          encoding = byteOffset
          byteOffset = 0
        } else if (byteOffset > 0x7fffffff) {
          byteOffset = 0x7fffffff
        } else if (byteOffset < -0x80000000) {
          byteOffset = -0x80000000
        }
        byteOffset = +byteOffset // Coerce to Number.
        if (numberIsNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
          byteOffset = dir ? 0 : (buffer.length - 1)
        }

        // Normalize byteOffset: negative offsets start from the end of the buffer
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset
        if (byteOffset >= buffer.length) {
          if (dir) return -1
          else byteOffset = buffer.length - 1
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0
          else return -1
        }

        // Normalize val
        if (typeof val === 'string') {
          val = Buffer.from(val, encoding)
        }

        // Finally, search either indexOf (if dir is true) or lastIndexOf
        if (Buffer.isBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
          if (val.length === 0) {
            return -1
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
        } else if (typeof val === 'number') {
          val = val & 0xFF // Search for a byte value [0-255]
          if (typeof Uint8Array.prototype.indexOf === 'function') {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
        }

        throw new TypeError('val must be string, number or Buffer')
      }

      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        var indexSize = 1
        var arrLength = arr.length
        var valLength = val.length

        if (encoding !== undefined) {
          encoding = String(encoding).toLowerCase()
          if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
            if (arr.length < 2 || val.length < 2) {
              return -1
            }
            indexSize = 2
            arrLength /= 2
            valLength /= 2
            byteOffset /= 2
          }
        }

        function read(buf, i) {
          if (indexSize === 1) {
            return buf[i]
          } else {
            return buf.readUInt16BE(i * indexSize)
          }
        }

        var i
        if (dir) {
          var foundIndex = -1
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
            } else {
              if (foundIndex !== -1) i -= i - foundIndex
              foundIndex = -1
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
          for (i = byteOffset; i >= 0; i--) {
            var found = true
            for (var j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false
                break
              }
            }
            if (found) return i
          }
        }

        return -1
      }

      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1
      }

      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
      }

      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
      }

      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0
        var remaining = buf.length - offset
        if (!length) {
          length = remaining
        } else {
          length = Number(length)
          if (length > remaining) {
            length = remaining
          }
        }

        var strLen = string.length

        if (length > strLen / 2) {
          length = strLen / 2
        }
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(i * 2, 2), 16)
          if (numberIsNaN(parsed)) return i
          buf[offset + i] = parsed
        }
        return i
      }

      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
      }

      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length)
      }

      function latin1Write(buf, string, offset, length) {
        return asciiWrite(buf, string, offset, length)
      }

      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length)
      }

      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
      }

      Buffer.prototype.write = function write(string, offset, length, encoding) {
      // Buffer#write(string)
        if (offset === undefined) {
          encoding = 'utf8'
          length = this.length
          offset = 0
        // Buffer#write(string, encoding)
        } else if (length === undefined && typeof offset === 'string') {
          encoding = offset
          length = this.length
          offset = 0
        // Buffer#write(string, offset[, length][, encoding])
        } else if (isFinite(offset)) {
          offset = offset >>> 0
          if (isFinite(length)) {
            length = length >>> 0
            if (encoding === undefined) encoding = 'utf8'
          } else {
            encoding = length
            length = undefined
          }
        } else {
          throw new Error(
            'Buffer.write(string, encoding, offset[, length]) is no longer supported'
          )
        }

        var remaining = this.length - offset
        if (length === undefined || length > remaining) length = remaining

        if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
          throw new RangeError('Attempt to write outside buffer bounds')
        }

        if (!encoding) encoding = 'utf8'

        var loweredCase = false
        for (;;) {
          switch (encoding) {
            case 'hex':
              return hexWrite(this, string, offset, length)

            case 'utf8':
            case 'utf-8':
              return utf8Write(this, string, offset, length)

            case 'ascii':
              return asciiWrite(this, string, offset, length)

            case 'latin1':
            case 'binary':
              return latin1Write(this, string, offset, length)

            case 'base64':
            // Warning: maxLength not taken into account in base64Write
              return base64Write(this, string, offset, length)

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return ucs2Write(this, string, offset, length)

            default:
              if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
              encoding = ('' + encoding).toLowerCase()
              loweredCase = true
          }
        }
      }

      Buffer.prototype.toJSON = function toJSON() {
        return {
          type: 'Buffer',
          data: Array.prototype.slice.call(this._arr || this, 0)
        }
      }

      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf)
        } else {
          return base64.fromByteArray(buf.slice(start, end))
        }
      }

      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end)
        var res = []

        var i = start
        while (i < end) {
          var firstByte = buf[i]
          var codePoint = null
          var bytesPerSequence = (firstByte > 0xEF) ? 4
            : (firstByte > 0xDF) ? 3
              : (firstByte > 0xBF) ? 2
                : 1

          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint

            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 0x80) {
                  codePoint = firstByte
                }
                break
              case 2:
                secondByte = buf[i + 1]
                if ((secondByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
                  if (tempCodePoint > 0x7F) {
                    codePoint = tempCodePoint
                  }
                }
                break
              case 3:
                secondByte = buf[i + 1]
                thirdByte = buf[i + 2]
                if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
                  if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                    codePoint = tempCodePoint
                  }
                }
                break
              case 4:
                secondByte = buf[i + 1]
                thirdByte = buf[i + 2]
                fourthByte = buf[i + 3]
                if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
                  if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                    codePoint = tempCodePoint
                  }
                }
            }
          }

          if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
            codePoint = 0xFFFD
            bytesPerSequence = 1
          } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
            codePoint -= 0x10000
            res.push(codePoint >>> 10 & 0x3FF | 0xD800)
            codePoint = 0xDC00 | codePoint & 0x3FF
          }

          res.push(codePoint)
          i += bytesPerSequence
        }

        return decodeCodePointsArray(res)
      }

      // Based on http://stackoverflow.com/a/22747272/680742, the browser with
      // the lowest limit is Chrome, with 0x10000 args.
      // We go 1 magnitude less, for safety
      var MAX_ARGUMENTS_LENGTH = 0x1000

      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
        }

        // Decode in chunks to avoid "call stack size exceeded".
        var res = ''
        var i = 0
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          )
        }
        return res
      }

      function asciiSlice(buf, start, end) {
        var ret = ''
        end = Math.min(buf.length, end)

        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 0x7F)
        }
        return ret
      }

      function latin1Slice(buf, start, end) {
        var ret = ''
        end = Math.min(buf.length, end)

        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i])
        }
        return ret
      }

      function hexSlice(buf, start, end) {
        var len = buf.length

        if (!start || start < 0) start = 0
        if (!end || end < 0 || end > len) end = len

        var out = ''
        for (var i = start; i < end; ++i) {
          out += toHex(buf[i])
        }
        return out
      }

      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end)
        var res = ''
        for (var i = 0; i < bytes.length; i += 2) {
          res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
        }
        return res
      }

      Buffer.prototype.slice = function slice(start, end) {
        var len = this.length
        start = ~~start
        end = end === undefined ? len : ~~end

        if (start < 0) {
          start += len
          if (start < 0) start = 0
        } else if (start > len) {
          start = len
        }

        if (end < 0) {
          end += len
          if (end < 0) end = 0
        } else if (end > len) {
          end = len
        }

        if (end < start) end = start

        var newBuf = this.subarray(start, end)
        // Return an augmented `Uint8Array` instance
        newBuf.__proto__ = Buffer.prototype
        return newBuf
      }

      /*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
      function checkOffset(offset, ext, length) {
        if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
        if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
      }

      Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
        offset = offset >>> 0
        byteLength = byteLength >>> 0
        if (!noAssert) checkOffset(offset, byteLength, this.length)

        var val = this[offset]
        var mul = 1
        var i = 0
        while (++i < byteLength && (mul *= 0x100)) {
          val += this[offset + i] * mul
        }

        return val
      }

      Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
        offset = offset >>> 0
        byteLength = byteLength >>> 0
        if (!noAssert) {
          checkOffset(offset, byteLength, this.length)
        }

        var val = this[offset + --byteLength]
        var mul = 1
        while (byteLength > 0 && (mul *= 0x100)) {
          val += this[offset + --byteLength] * mul
        }

        return val
      }

      Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 1, this.length)
        return this[offset]
      }

      Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 2, this.length)
        return this[offset] | (this[offset + 1] << 8)
      }

      Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 2, this.length)
        return (this[offset] << 8) | this[offset + 1]
      }

      Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 4, this.length)

        return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
      }

      Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 4, this.length)

        return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
      }

      Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
        offset = offset >>> 0
        byteLength = byteLength >>> 0
        if (!noAssert) checkOffset(offset, byteLength, this.length)

        var val = this[offset]
        var mul = 1
        var i = 0
        while (++i < byteLength && (mul *= 0x100)) {
          val += this[offset + i] * mul
        }
        mul *= 0x80

        if (val >= mul) val -= Math.pow(2, 8 * byteLength)

        return val
      }

      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
        offset = offset >>> 0
        byteLength = byteLength >>> 0
        if (!noAssert) checkOffset(offset, byteLength, this.length)

        var i = byteLength
        var mul = 1
        var val = this[offset + --i]
        while (i > 0 && (mul *= 0x100)) {
          val += this[offset + --i] * mul
        }
        mul *= 0x80

        if (val >= mul) val -= Math.pow(2, 8 * byteLength)

        return val
      }

      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 1, this.length)
        if (!(this[offset] & 0x80)) return (this[offset])
        return ((0xff - this[offset] + 1) * -1)
      }

      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 2, this.length)
        var val = this[offset] | (this[offset + 1] << 8)
        return (val & 0x8000) ? val | 0xFFFF0000 : val
      }

      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 2, this.length)
        var val = this[offset + 1] | (this[offset] << 8)
        return (val & 0x8000) ? val | 0xFFFF0000 : val
      }

      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 4, this.length)

        return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
      }

      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 4, this.length)

        return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
      }

      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 4, this.length)
        return ieee754.read(this, offset, true, 23, 4)
      }

      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 4, this.length)
        return ieee754.read(this, offset, false, 23, 4)
      }

      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 8, this.length)
        return ieee754.read(this, offset, true, 52, 8)
      }

      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 8, this.length)
        return ieee754.read(this, offset, false, 52, 8)
      }

      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
        if (offset + ext > buf.length) throw new RangeError('Index out of range')
      }

      Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
        value = +value
        offset = offset >>> 0
        byteLength = byteLength >>> 0
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1
          checkInt(this, value, offset, byteLength, maxBytes, 0)
        }

        var mul = 1
        var i = 0
        this[offset] = value & 0xFF
        while (++i < byteLength && (mul *= 0x100)) {
          this[offset + i] = (value / mul) & 0xFF
        }

        return offset + byteLength
      }

      Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
        value = +value
        offset = offset >>> 0
        byteLength = byteLength >>> 0
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1
          checkInt(this, value, offset, byteLength, maxBytes, 0)
        }

        var i = byteLength - 1
        var mul = 1
        this[offset + i] = value & 0xFF
        while (--i >= 0 && (mul *= 0x100)) {
          this[offset + i] = (value / mul) & 0xFF
        }

        return offset + byteLength
      }

      Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
        this[offset] = (value & 0xff)
        return offset + 1
      }

      Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
        this[offset] = (value & 0xff)
        this[offset + 1] = (value >>> 8)
        return offset + 2
      }

      Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
        this[offset] = (value >>> 8)
        this[offset + 1] = (value & 0xff)
        return offset + 2
      }

      Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
        this[offset + 3] = (value >>> 24)
        this[offset + 2] = (value >>> 16)
        this[offset + 1] = (value >>> 8)
        this[offset] = (value & 0xff)
        return offset + 4
      }

      Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
        this[offset] = (value >>> 24)
        this[offset + 1] = (value >>> 16)
        this[offset + 2] = (value >>> 8)
        this[offset + 3] = (value & 0xff)
        return offset + 4
      }

      Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) {
          var limit = Math.pow(2, (8 * byteLength) - 1)

          checkInt(this, value, offset, byteLength, limit - 1, -limit)
        }

        var i = 0
        var mul = 1
        var sub = 0
        this[offset] = value & 0xFF
        while (++i < byteLength && (mul *= 0x100)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1
          }
          this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
        }

        return offset + byteLength
      }

      Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) {
          var limit = Math.pow(2, (8 * byteLength) - 1)

          checkInt(this, value, offset, byteLength, limit - 1, -limit)
        }

        var i = byteLength - 1
        var mul = 1
        var sub = 0
        this[offset + i] = value & 0xFF
        while (--i >= 0 && (mul *= 0x100)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1
          }
          this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
        }

        return offset + byteLength
      }

      Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
        if (value < 0) value = 0xff + value + 1
        this[offset] = (value & 0xff)
        return offset + 1
      }

      Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
        this[offset] = (value & 0xff)
        this[offset + 1] = (value >>> 8)
        return offset + 2
      }

      Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
        this[offset] = (value >>> 8)
        this[offset + 1] = (value & 0xff)
        return offset + 2
      }

      Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
        this[offset] = (value & 0xff)
        this[offset + 1] = (value >>> 8)
        this[offset + 2] = (value >>> 16)
        this[offset + 3] = (value >>> 24)
        return offset + 4
      }

      Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
        if (value < 0) value = 0xffffffff + value + 1
        this[offset] = (value >>> 24)
        this[offset + 1] = (value >>> 16)
        this[offset + 2] = (value >>> 8)
        this[offset + 3] = (value & 0xff)
        return offset + 4
      }

      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError('Index out of range')
        if (offset < 0) throw new RangeError('Index out of range')
      }

      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4)
        return offset + 4
      }

      Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert)
      }

      Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert)
      }

      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8)
        return offset + 8
      }

      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert)
      }

      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert)
      }

      // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
        if (!start) start = 0
        if (!end && end !== 0) end = this.length
        if (targetStart >= target.length) targetStart = target.length
        if (!targetStart) targetStart = 0
        if (end > 0 && end < start) end = start

        // Copy 0 bytes; we're done
        if (end === start) return 0
        if (target.length === 0 || this.length === 0) return 0

        // Fatal error conditions
        if (targetStart < 0) {
          throw new RangeError('targetStart out of bounds')
        }
        if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
        if (end < 0) throw new RangeError('sourceEnd out of bounds')

        // Are we oob?
        if (end > this.length) end = this.length
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start
        }

        var len = end - start

        if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
        // Use built-in when available, missing from IE11
          this.copyWithin(targetStart, start, end)
        } else if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
          for (var i = len - 1; i >= 0; --i) {
            target[i + targetStart] = this[i + start]
          }
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          )
        }

        return len
      }

      // Usage:
      //    buffer.fill(number[, offset[, end]])
      //    buffer.fill(buffer[, offset[, end]])
      //    buffer.fill(string[, offset[, end]][, encoding])
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
      // Handle string cases:
        if (typeof val === 'string') {
          if (typeof start === 'string') {
            encoding = start
            start = 0
            end = this.length
          } else if (typeof end === 'string') {
            encoding = end
            end = this.length
          }
          if (encoding !== undefined && typeof encoding !== 'string') {
            throw new TypeError('encoding must be a string')
          }
          if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
            throw new TypeError('Unknown encoding: ' + encoding)
          }
          if (val.length === 1) {
            var code = val.charCodeAt(0)
            if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
            // Fast path: If `val` fits into a single byte, use that numeric value.
              val = code
            }
          }
        } else if (typeof val === 'number') {
          val = val & 255
        }

        // Invalid ranges are not set to a default, so can range check early.
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError('Out of range index')
        }

        if (end <= start) {
          return this
        }

        start = start >>> 0
        end = end === undefined ? this.length : end >>> 0

        if (!val) val = 0

        var i
        if (typeof val === 'number') {
          for (i = start; i < end; ++i) {
            this[i] = val
          }
        } else {
          var bytes = Buffer.isBuffer(val)
            ? val
            : Buffer.from(val, encoding)
          var len = bytes.length
          if (len === 0) {
            throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len]
          }
        }

        return this
      }

      // HELPER FUNCTIONS
      // ================

      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

      function base64clean(str) {
      // Node takes equal signs as end of the Base64 encoding
        str = str.split('=')[0]
        // Node strips out invalid characters like \n and \t from the string, base64-js does not
        str = str.trim().replace(INVALID_BASE64_RE, '')
        // Node converts strings with length < 2 to ''
        if (str.length < 2) return ''
        // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
        while (str.length % 4 !== 0) {
          str = str + '='
        }
        return str
      }

      function toHex(n) {
        if (n < 16) return '0' + n.toString(16)
        return n.toString(16)
      }

      function utf8ToBytes(string, units) {
        units = units || Infinity
        var codePoint
        var length = string.length
        var leadSurrogate = null
        var bytes = []

        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i)

          // is surrogate component
          if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
            if (!leadSurrogate) {
            // no lead yet
              if (codePoint > 0xDBFF) {
              // unexpected trail
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                continue
              } else if (i + 1 === length) {
              // unpaired lead
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                continue
              }

              // valid lead
              leadSurrogate = codePoint

              continue
            }

            // 2 leads in a row
            if (codePoint < 0xDC00) {
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
              leadSurrogate = codePoint
              continue
            }

            // valid surrogate pair
            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
          } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          }

          leadSurrogate = null

          // encode utf8
          if (codePoint < 0x80) {
            if ((units -= 1) < 0) break
            bytes.push(codePoint)
          } else if (codePoint < 0x800) {
            if ((units -= 2) < 0) break
            bytes.push(
              codePoint >> 0x6 | 0xC0,
              codePoint & 0x3F | 0x80
            )
          } else if (codePoint < 0x10000) {
            if ((units -= 3) < 0) break
            bytes.push(
              codePoint >> 0xC | 0xE0,
              codePoint >> 0x6 & 0x3F | 0x80,
              codePoint & 0x3F | 0x80
            )
          } else if (codePoint < 0x110000) {
            if ((units -= 4) < 0) break
            bytes.push(
              codePoint >> 0x12 | 0xF0,
              codePoint >> 0xC & 0x3F | 0x80,
              codePoint >> 0x6 & 0x3F | 0x80,
              codePoint & 0x3F | 0x80
            )
          } else {
            throw new Error('Invalid code point')
          }
        }

        return bytes
      }

      function asciiToBytes(str) {
        var byteArray = []
        for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
          byteArray.push(str.charCodeAt(i) & 0xFF)
        }
        return byteArray
      }

      function utf16leToBytes(str, units) {
        var c, hi, lo
        var byteArray = []
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break

          c = str.charCodeAt(i)
          hi = c >> 8
          lo = c % 256
          byteArray.push(lo)
          byteArray.push(hi)
        }

        return byteArray
      }

      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str))
      }

      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if ((i + offset >= dst.length) || (i >= src.length)) break
          dst[i + offset] = src[i]
        }
        return i
      }

      // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
      // the `instanceof` check but they should be treated as of that type.
      // See: https://github.com/feross/buffer/issues/166
      function isInstance(obj, type) {
        return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
      }
      function numberIsNaN(obj) {
      // For IE11 support
        return obj !== obj // eslint-disable-line no-self-compare
      }
    }).call(this)
  }).call(this, require('buffer').Buffer)
}, { 'base64-js': 12, 'buffer': 13, 'ieee754': 26 }], 14: [function(require, module, exports) {
  'use strict'

  var GetIntrinsic = require('get-intrinsic')

  var callBind = require('./')

  var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'))

  module.exports = function callBoundIntrinsic(name, allowMissing) {
    var intrinsic = GetIntrinsic(name, !!allowMissing)
    if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
      return callBind(intrinsic)
    }
    return intrinsic
  }
}, { './': 15, 'get-intrinsic': 19 }], 15: [function(require, module, exports) {
  'use strict'

  var bind = require('function-bind')
  var GetIntrinsic = require('get-intrinsic')

  var $apply = GetIntrinsic('%Function.prototype.apply%')
  var $call = GetIntrinsic('%Function.prototype.call%')
  var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply)

  var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true)
  var $defineProperty = GetIntrinsic('%Object.defineProperty%', true)
  var $max = GetIntrinsic('%Math.max%')

  if ($defineProperty) {
    try {
      $defineProperty({}, 'a', { value: 1 })
    } catch (e) {
      // IE 8 has a broken defineProperty
      $defineProperty = null
    }
  }

  module.exports = function callBind(originalFunction) {
    var func = $reflectApply(bind, $call, arguments)
    if ($gOPD && $defineProperty) {
      var desc = $gOPD(func, 'length')
      if (desc.configurable) {
        // original length, plus the receiver, minus any additional arguments (after the receiver)
        $defineProperty(
          func,
          'length',
          { value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
        )
      }
    }
    return func
  }

  var applyBind = function applyBind() {
    return $reflectApply(bind, $apply, arguments)
  }

  if ($defineProperty) {
    $defineProperty(module.exports, 'apply', { value: applyBind })
  } else {
    module.exports.apply = applyBind
  }
}, { 'function-bind': 18, 'get-intrinsic': 19 }], 16: [function(require, module, exports) {
  'use strict'

  var isCallable = require('is-callable')

  var toStr = Object.prototype.toString
  var hasOwnProperty = Object.prototype.hasOwnProperty

  var forEachArray = function forEachArray(array, iterator, receiver) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (hasOwnProperty.call(array, i)) {
        if (receiver == null) {
          iterator(array[i], i, array)
        } else {
          iterator.call(receiver, array[i], i, array)
        }
      }
    }
  }

  var forEachString = function forEachString(string, iterator, receiver) {
    for (var i = 0, len = string.length; i < len; i++) {
      // no such thing as a sparse string.
      if (receiver == null) {
        iterator(string.charAt(i), i, string)
      } else {
        iterator.call(receiver, string.charAt(i), i, string)
      }
    }
  }

  var forEachObject = function forEachObject(object, iterator, receiver) {
    for (var k in object) {
      if (hasOwnProperty.call(object, k)) {
        if (receiver == null) {
          iterator(object[k], k, object)
        } else {
          iterator.call(receiver, object[k], k, object)
        }
      }
    }
  }

  var forEach = function forEach(list, iterator, thisArg) {
    if (!isCallable(iterator)) {
      throw new TypeError('iterator must be a function')
    }

    var receiver
    if (arguments.length >= 3) {
      receiver = thisArg
    }

    if (toStr.call(list) === '[object Array]') {
      forEachArray(list, iterator, receiver)
    } else if (typeof list === 'string') {
      forEachString(list, iterator, receiver)
    } else {
      forEachObject(list, iterator, receiver)
    }
  }

  module.exports = forEach
}, { 'is-callable': 29 }], 17: [function(require, module, exports) {
  'use strict'

  /* eslint no-invalid-this: 1 */

  var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible '
  var slice = Array.prototype.slice
  var toStr = Object.prototype.toString
  var funcType = '[object Function]'

  module.exports = function bind(that) {
    var target = this
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
      throw new TypeError(ERROR_MESSAGE + target)
    }
    var args = slice.call(arguments, 1)

    var bound
    var binder = function() {
      if (this instanceof bound) {
        var result = target.apply(
          this,
          args.concat(slice.call(arguments))
        )
        if (Object(result) === result) {
          return result
        }
        return this
      } else {
        return target.apply(
          that,
          args.concat(slice.call(arguments))
        )
      }
    }

    var boundLength = Math.max(0, target.length - args.length)
    var boundArgs = []
    for (var i = 0; i < boundLength; i++) {
      boundArgs.push('$' + i)
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder)

    if (target.prototype) {
      var Empty = function Empty() {}
      Empty.prototype = target.prototype
      bound.prototype = new Empty()
      Empty.prototype = null
    }

    return bound
  }
}, {}], 18: [function(require, module, exports) {
  'use strict'

  var implementation = require('./implementation')

  module.exports = Function.prototype.bind || implementation
}, { './implementation': 17 }], 19: [function(require, module, exports) {
  'use strict'

  var undefined

  var $SyntaxError = SyntaxError
  var $Function = Function
  var $TypeError = TypeError

  // eslint-disable-next-line consistent-return
  var getEvalledConstructor = function(expressionSyntax) {
    try {
      return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')()
    } catch (e) {}
  }

  var $gOPD = Object.getOwnPropertyDescriptor
  if ($gOPD) {
    try {
      $gOPD({}, '')
    } catch (e) {
      $gOPD = null // this is IE 8, which has a broken gOPD
    }
  }

  var throwTypeError = function() {
    throw new $TypeError()
  }
  var ThrowTypeError = $gOPD
    ? (function() {
      try {
        // eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
        arguments.callee // IE 8 does not throw here
        return throwTypeError
      } catch (calleeThrows) {
        try {
          // IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
          return $gOPD(arguments, 'callee').get
        } catch (gOPDthrows) {
          return throwTypeError
        }
      }
    }())
    : throwTypeError

  var hasSymbols = require('has-symbols')()
  var hasProto = require('has-proto')()

  var getProto = Object.getPrototypeOf || (
    hasProto
      ? function(x) { return x.__proto__ } // eslint-disable-line no-proto
      : null
  )

  var needsEval = {}

  var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined : getProto(Uint8Array)

  var INTRINSICS = {
    '%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
    '%Array%': Array,
    '%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
    '%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
    '%AsyncFromSyncIteratorPrototype%': undefined,
    '%AsyncFunction%': needsEval,
    '%AsyncGenerator%': needsEval,
    '%AsyncGeneratorFunction%': needsEval,
    '%AsyncIteratorPrototype%': needsEval,
    '%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
    '%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
    '%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
    '%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
    '%Boolean%': Boolean,
    '%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
    '%Date%': Date,
    '%decodeURI%': decodeURI,
    '%decodeURIComponent%': decodeURIComponent,
    '%encodeURI%': encodeURI,
    '%encodeURIComponent%': encodeURIComponent,
    '%Error%': Error,
    '%eval%': eval, // eslint-disable-line no-eval
    '%EvalError%': EvalError,
    '%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
    '%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
    '%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
    '%Function%': $Function,
    '%GeneratorFunction%': needsEval,
    '%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
    '%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
    '%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
    '%isFinite%': isFinite,
    '%isNaN%': isNaN,
    '%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined,
    '%JSON%': typeof JSON === 'object' ? JSON : undefined,
    '%Map%': typeof Map === 'undefined' ? undefined : Map,
    '%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Map()[Symbol.iterator]()),
    '%Math%': Math,
    '%Number%': Number,
    '%Object%': Object,
    '%parseFloat%': parseFloat,
    '%parseInt%': parseInt,
    '%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
    '%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
    '%RangeError%': RangeError,
    '%ReferenceError%': ReferenceError,
    '%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
    '%RegExp%': RegExp,
    '%Set%': typeof Set === 'undefined' ? undefined : Set,
    '%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Set()[Symbol.iterator]()),
    '%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
    '%String%': String,
    '%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined,
    '%Symbol%': hasSymbols ? Symbol : undefined,
    '%SyntaxError%': $SyntaxError,
    '%ThrowTypeError%': ThrowTypeError,
    '%TypedArray%': TypedArray,
    '%TypeError%': $TypeError,
    '%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
    '%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
    '%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
    '%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
    '%URIError%': URIError,
    '%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
    '%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
    '%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
  }

  if (getProto) {
    try {
      null.error // eslint-disable-line no-unused-expressions
    } catch (e) {
      // https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
      var errorProto = getProto(getProto(e))
      INTRINSICS['%Error.prototype%'] = errorProto
    }
  }

  var doEval = function doEval(name) {
    var value
    if (name === '%AsyncFunction%') {
      value = getEvalledConstructor('async function () {}')
    } else if (name === '%GeneratorFunction%') {
      value = getEvalledConstructor('function* () {}')
    } else if (name === '%AsyncGeneratorFunction%') {
      value = getEvalledConstructor('async function* () {}')
    } else if (name === '%AsyncGenerator%') {
      var fn = doEval('%AsyncGeneratorFunction%')
      if (fn) {
        value = fn.prototype
      }
    } else if (name === '%AsyncIteratorPrototype%') {
      var gen = doEval('%AsyncGenerator%')
      if (gen && getProto) {
        value = getProto(gen.prototype)
      }
    }

    INTRINSICS[name] = value

    return value
  }

  var LEGACY_ALIASES = {
    '%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
    '%ArrayPrototype%': ['Array', 'prototype'],
    '%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
    '%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
    '%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
    '%ArrayProto_values%': ['Array', 'prototype', 'values'],
    '%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
    '%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
    '%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
    '%BooleanPrototype%': ['Boolean', 'prototype'],
    '%DataViewPrototype%': ['DataView', 'prototype'],
    '%DatePrototype%': ['Date', 'prototype'],
    '%ErrorPrototype%': ['Error', 'prototype'],
    '%EvalErrorPrototype%': ['EvalError', 'prototype'],
    '%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
    '%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
    '%FunctionPrototype%': ['Function', 'prototype'],
    '%Generator%': ['GeneratorFunction', 'prototype'],
    '%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
    '%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
    '%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
    '%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
    '%JSONParse%': ['JSON', 'parse'],
    '%JSONStringify%': ['JSON', 'stringify'],
    '%MapPrototype%': ['Map', 'prototype'],
    '%NumberPrototype%': ['Number', 'prototype'],
    '%ObjectPrototype%': ['Object', 'prototype'],
    '%ObjProto_toString%': ['Object', 'prototype', 'toString'],
    '%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
    '%PromisePrototype%': ['Promise', 'prototype'],
    '%PromiseProto_then%': ['Promise', 'prototype', 'then'],
    '%Promise_all%': ['Promise', 'all'],
    '%Promise_reject%': ['Promise', 'reject'],
    '%Promise_resolve%': ['Promise', 'resolve'],
    '%RangeErrorPrototype%': ['RangeError', 'prototype'],
    '%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
    '%RegExpPrototype%': ['RegExp', 'prototype'],
    '%SetPrototype%': ['Set', 'prototype'],
    '%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
    '%StringPrototype%': ['String', 'prototype'],
    '%SymbolPrototype%': ['Symbol', 'prototype'],
    '%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
    '%TypedArrayPrototype%': ['TypedArray', 'prototype'],
    '%TypeErrorPrototype%': ['TypeError', 'prototype'],
    '%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
    '%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
    '%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
    '%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
    '%URIErrorPrototype%': ['URIError', 'prototype'],
    '%WeakMapPrototype%': ['WeakMap', 'prototype'],
    '%WeakSetPrototype%': ['WeakSet', 'prototype']
  }

  var bind = require('function-bind')
  var hasOwn = require('has')
  var $concat = bind.call(Function.call, Array.prototype.concat)
  var $spliceApply = bind.call(Function.apply, Array.prototype.splice)
  var $replace = bind.call(Function.call, String.prototype.replace)
  var $strSlice = bind.call(Function.call, String.prototype.slice)
  var $exec = bind.call(Function.call, RegExp.prototype.exec)

  /* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
  var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g
  var reEscapeChar = /\\(\\)?/g /** Used to match backslashes in property paths. */
  var stringToPath = function stringToPath(string) {
    var first = $strSlice(string, 0, 1)
    var last = $strSlice(string, -1)
    if (first === '%' && last !== '%') {
      throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`')
    } else if (last === '%' && first !== '%') {
      throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`')
    }
    var result = []
    $replace(string, rePropName, function(match, number, quote, subString) {
      result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match
    })
    return result
  }
  /* end adaptation */

  var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
    var intrinsicName = name
    var alias
    if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
      alias = LEGACY_ALIASES[intrinsicName]
      intrinsicName = '%' + alias[0] + '%'
    }

    if (hasOwn(INTRINSICS, intrinsicName)) {
      var value = INTRINSICS[intrinsicName]
      if (value === needsEval) {
        value = doEval(intrinsicName)
      }
      if (typeof value === 'undefined' && !allowMissing) {
        throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!')
      }

      return {
        alias: alias,
        name: intrinsicName,
        value: value
      }
    }

    throw new $SyntaxError('intrinsic ' + name + ' does not exist!')
  }

  module.exports = function GetIntrinsic(name, allowMissing) {
    if (typeof name !== 'string' || name.length === 0) {
      throw new $TypeError('intrinsic name must be a non-empty string')
    }
    if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
      throw new $TypeError('"allowMissing" argument must be a boolean')
    }

    if ($exec(/^%?[^%]*%?$/, name) === null) {
      throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name')
    }
    var parts = stringToPath(name)
    var intrinsicBaseName = parts.length > 0 ? parts[0] : ''

    var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing)
    var intrinsicRealName = intrinsic.name
    var value = intrinsic.value
    var skipFurtherCaching = false

    var alias = intrinsic.alias
    if (alias) {
      intrinsicBaseName = alias[0]
      $spliceApply(parts, $concat([0, 1], alias))
    }

    for (var i = 1, isOwn = true; i < parts.length; i += 1) {
      var part = parts[i]
      var first = $strSlice(part, 0, 1)
      var last = $strSlice(part, -1)
      if (
        (
          (first === '"' || first === "'" || first === '`') ||
				(last === '"' || last === "'" || last === '`')
        ) &&
			first !== last
      ) {
        throw new $SyntaxError('property names with quotes must have matching quotes')
      }
      if (part === 'constructor' || !isOwn) {
        skipFurtherCaching = true
      }

      intrinsicBaseName += '.' + part
      intrinsicRealName = '%' + intrinsicBaseName + '%'

      if (hasOwn(INTRINSICS, intrinsicRealName)) {
        value = INTRINSICS[intrinsicRealName]
      } else if (value != null) {
        if (!(part in value)) {
          if (!allowMissing) {
            throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.')
          }
          return void undefined
        }
        if ($gOPD && (i + 1) >= parts.length) {
          var desc = $gOPD(value, part)
          isOwn = !!desc

          // By convention, when a data property is converted to an accessor
          // property to emulate a data property that does not suffer from
          // the override mistake, that accessor's getter is marked with
          // an `originalValue` property. Here, when we detect this, we
          // uphold the illusion by pretending to see that original data
          // property, i.e., returning the value rather than the getter
          // itself.
          if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
            value = desc.get
          } else {
            value = value[part]
          }
        } else {
          isOwn = hasOwn(value, part)
          value = value[part]
        }

        if (isOwn && !skipFurtherCaching) {
          INTRINSICS[intrinsicRealName] = value
        }
      }
    }
    return value
  }
}, { 'function-bind': 18, 'has': 25, 'has-proto': 21, 'has-symbols': 22 }], 20: [function(require, module, exports) {
  'use strict'

  var GetIntrinsic = require('get-intrinsic')

  var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true)

  if ($gOPD) {
    try {
      $gOPD([], 'length')
    } catch (e) {
      // IE 8 has a broken gOPD
      $gOPD = null
    }
  }

  module.exports = $gOPD
}, { 'get-intrinsic': 19 }], 21: [function(require, module, exports) {
  'use strict'

  var test = {
    foo: {}
  }

  var $Object = Object

  module.exports = function hasProto() {
    return { __proto__: test }.foo === test.foo && !({ __proto__: null } instanceof $Object)
  }
}, {}], 22: [function(require, module, exports) {
  'use strict'

  var origSymbol = typeof Symbol !== 'undefined' && Symbol
  var hasSymbolSham = require('./shams')

  module.exports = function hasNativeSymbols() {
    if (typeof origSymbol !== 'function') { return false }
    if (typeof Symbol !== 'function') { return false }
    if (typeof origSymbol('foo') !== 'symbol') { return false }
    if (typeof Symbol('bar') !== 'symbol') { return false }

    return hasSymbolSham()
  }
}, { './shams': 23 }], 23: [function(require, module, exports) {
  'use strict'

  /* eslint complexity: [2, 18], max-statements: [2, 33] */
  module.exports = function hasSymbols() {
    if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false }
    if (typeof Symbol.iterator === 'symbol') { return true }

    var obj = {}
    var sym = Symbol('test')
    var symObj = Object(sym)
    if (typeof sym === 'string') { return false }

    if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false }
    if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false }

    // temp disabled per https://github.com/ljharb/object.assign/issues/17
    // if (sym instanceof Symbol) { return false; }
    // temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
    // if (!(symObj instanceof Symbol)) { return false; }

    // if (typeof Symbol.prototype.toString !== 'function') { return false; }
    // if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

    var symVal = 42
    obj[sym] = symVal
    for (sym in obj) { return false } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
    if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false }

    if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false }

    var syms = Object.getOwnPropertySymbols(obj)
    if (syms.length !== 1 || syms[0] !== sym) { return false }

    if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false }

    if (typeof Object.getOwnPropertyDescriptor === 'function') {
      var descriptor = Object.getOwnPropertyDescriptor(obj, sym)
      if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false }
    }

    return true
  }
}, {}], 24: [function(require, module, exports) {
  'use strict'

  var hasSymbols = require('has-symbols/shams')

  module.exports = function hasToStringTagShams() {
    return hasSymbols() && !!Symbol.toStringTag
  }
}, { 'has-symbols/shams': 23 }], 25: [function(require, module, exports) {
  'use strict'

  var bind = require('function-bind')

  module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty)
}, { 'function-bind': 18 }], 26: [function(require, module, exports) {
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
  exports.read = function(buffer, offset, isLE, mLen, nBytes) {
    var e, m
    var eLen = (nBytes * 8) - mLen - 1
    var eMax = (1 << eLen) - 1
    var eBias = eMax >> 1
    var nBits = -7
    var i = isLE ? (nBytes - 1) : 0
    var d = isLE ? -1 : 1
    var s = buffer[offset + i]

    i += d

    e = s & ((1 << (-nBits)) - 1)
    s >>= (-nBits)
    nBits += eLen
    for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

    m = e & ((1 << (-nBits)) - 1)
    e >>= (-nBits)
    nBits += mLen
    for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

    if (e === 0) {
      e = 1 - eBias
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity)
    } else {
      m = m + Math.pow(2, mLen)
      e = e - eBias
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
  }

  exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c
    var eLen = (nBytes * 8) - mLen - 1
    var eMax = (1 << eLen) - 1
    var eBias = eMax >> 1
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
    var i = isLE ? 0 : (nBytes - 1)
    var d = isLE ? 1 : -1
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

    value = Math.abs(value)

    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0
      e = eMax
    } else {
      e = Math.floor(Math.log(value) / Math.LN2)
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--
        c *= 2
      }
      if (e + eBias >= 1) {
        value += rt / c
      } else {
        value += rt * Math.pow(2, 1 - eBias)
      }
      if (value * c >= 2) {
        e++
        c /= 2
      }

      if (e + eBias >= eMax) {
        m = 0
        e = eMax
      } else if (e + eBias >= 1) {
        m = ((value * c) - 1) * Math.pow(2, mLen)
        e = e + eBias
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
        e = 0
      }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

    e = (e << mLen) | m
    eLen += mLen
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

    buffer[offset + i - d] |= s * 128
  }
}, {}], 27: [function(require, module, exports) {
  if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        })
      }
    }
  } else {
  // old school shim for old browsers
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor
        var TempCtor = function() {}
        TempCtor.prototype = superCtor.prototype
        ctor.prototype = new TempCtor()
        ctor.prototype.constructor = ctor
      }
    }
  }
}, {}], 28: [function(require, module, exports) {
  'use strict'

  var hasToStringTag = require('has-tostringtag/shams')()
  var callBound = require('call-bind/callBound')

  var $toString = callBound('Object.prototype.toString')

  var isStandardArguments = function isArguments(value) {
    if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
      return false
    }
    return $toString(value) === '[object Arguments]'
  }

  var isLegacyArguments = function isArguments(value) {
    if (isStandardArguments(value)) {
      return true
    }
    return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString(value) !== '[object Array]' &&
		$toString(value.callee) === '[object Function]'
  }

  var supportsStandardArguments = (function() {
    return isStandardArguments(arguments)
  }())

  isStandardArguments.isLegacyArguments = isLegacyArguments // for tests

  module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments
}, { 'call-bind/callBound': 14, 'has-tostringtag/shams': 24 }], 29: [function(require, module, exports) {
  'use strict'

  var fnToStr = Function.prototype.toString
  var reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply
  var badArrayLike
  var isCallableMarker
  if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
    try {
      badArrayLike = Object.defineProperty({}, 'length', {
        get: function() {
          throw isCallableMarker
        }
      })
      isCallableMarker = {}
      // eslint-disable-next-line no-throw-literal
      reflectApply(function() { throw 42 }, null, badArrayLike)
    } catch (_) {
      if (_ !== isCallableMarker) {
        reflectApply = null
      }
    }
  } else {
    reflectApply = null
  }

  var constructorRegex = /^\s*class\b/
  var isES6ClassFn = function isES6ClassFunction(value) {
    try {
      var fnStr = fnToStr.call(value)
      return constructorRegex.test(fnStr)
    } catch (e) {
      return false // not a function
    }
  }

  var tryFunctionObject = function tryFunctionToStr(value) {
    try {
      if (isES6ClassFn(value)) { return false }
      fnToStr.call(value)
      return true
    } catch (e) {
      return false
    }
  }
  var toStr = Object.prototype.toString
  var objectClass = '[object Object]'
  var fnClass = '[object Function]'
  var genClass = '[object GeneratorFunction]'
  var ddaClass = '[object HTMLAllCollection]' // IE 11
  var ddaClass2 = '[object HTML document.all class]'
  var ddaClass3 = '[object HTMLCollection]' // IE 9-10
  var hasToStringTag = typeof Symbol === 'function' && !!Symbol.toStringTag // better: use `has-tostringtag`

  var isIE68 = !(0 in [,]) // eslint-disable-line no-sparse-arrays, comma-spacing

  var isDDA = function isDocumentDotAll() { return false }
  if (typeof document === 'object') {
    // Firefox 3 canonicalizes DDA to undefined when it's not accessed directly
    var all = document.all
    if (toStr.call(all) === toStr.call(document.all)) {
      isDDA = function isDocumentDotAll(value) {
        /* globals document: false */
        // in IE 6-8, typeof document.all is "object" and it's truthy
        if ((isIE68 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
          try {
            var str = toStr.call(value)
            return (
              str === ddaClass ||
						str === ddaClass2 ||
						str === ddaClass3 || // opera 12.16
						str === objectClass // IE 6-8
            ) && value('') == null // eslint-disable-line eqeqeq
          } catch (e) { /**/ }
        }
        return false
      }
    }
  }

  module.exports = reflectApply
    ? function isCallable(value) {
      if (isDDA(value)) { return true }
      if (!value) { return false }
      if (typeof value !== 'function' && typeof value !== 'object') { return false }
      try {
        reflectApply(value, null, badArrayLike)
      } catch (e) {
        if (e !== isCallableMarker) { return false }
      }
      return !isES6ClassFn(value) && tryFunctionObject(value)
    }
    : function isCallable(value) {
      if (isDDA(value)) { return true }
      if (!value) { return false }
      if (typeof value !== 'function' && typeof value !== 'object') { return false }
      if (hasToStringTag) { return tryFunctionObject(value) }
      if (isES6ClassFn(value)) { return false }
      var strClass = toStr.call(value)
      if (strClass !== fnClass && strClass !== genClass && !(/^\[object HTML/).test(strClass)) { return false }
      return tryFunctionObject(value)
    }
}, {}], 30: [function(require, module, exports) {
  'use strict'

  var toStr = Object.prototype.toString
  var fnToStr = Function.prototype.toString
  var isFnRegex = /^\s*(?:function)?\*/
  var hasToStringTag = require('has-tostringtag/shams')()
  var getProto = Object.getPrototypeOf
  var getGeneratorFunc = function() { // eslint-disable-line consistent-return
    if (!hasToStringTag) {
      return false
    }
    try {
      return Function('return function*() {}')()
    } catch (e) {
    }
  }
  var GeneratorFunction

  module.exports = function isGeneratorFunction(fn) {
    if (typeof fn !== 'function') {
      return false
    }
    if (isFnRegex.test(fnToStr.call(fn))) {
      return true
    }
    if (!hasToStringTag) {
      var str = toStr.call(fn)
      return str === '[object GeneratorFunction]'
    }
    if (!getProto) {
      return false
    }
    if (typeof GeneratorFunction === 'undefined') {
      var generatorFunc = getGeneratorFunc()
      GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false
    }
    return getProto(fn) === GeneratorFunction
  }
}, { 'has-tostringtag/shams': 24 }], 31: [function(require, module, exports) {
  (function(global) {
    (function() {
      'use strict'

      var forEach = require('for-each')
      var availableTypedArrays = require('available-typed-arrays')
      var callBound = require('call-bind/callBound')

      var $toString = callBound('Object.prototype.toString')
      var hasToStringTag = require('has-tostringtag/shams')()
      var gOPD = require('gopd')

      var g = typeof globalThis === 'undefined' ? global : globalThis
      var typedArrays = availableTypedArrays()

      var $indexOf = callBound('Array.prototype.indexOf', true) || function indexOf(array, value) {
        for (var i = 0; i < array.length; i += 1) {
          if (array[i] === value) {
            return i
          }
        }
        return -1
      }
      var $slice = callBound('String.prototype.slice')
      var toStrTags = {}
      var getPrototypeOf = Object.getPrototypeOf // require('getprototypeof');
      if (hasToStringTag && gOPD && getPrototypeOf) {
        forEach(typedArrays, function(typedArray) {
          var arr = new g[typedArray]()
          if (Symbol.toStringTag in arr) {
            var proto = getPrototypeOf(arr)
            var descriptor = gOPD(proto, Symbol.toStringTag)
            if (!descriptor) {
              var superProto = getPrototypeOf(proto)
              descriptor = gOPD(superProto, Symbol.toStringTag)
            }
            toStrTags[typedArray] = descriptor.get
          }
        })
      }

      var tryTypedArrays = function tryAllTypedArrays(value) {
        var anyTrue = false
        forEach(toStrTags, function(getter, typedArray) {
          if (!anyTrue) {
            try {
              anyTrue = getter.call(value) === typedArray
            } catch (e) { /**/ }
          }
        })
        return anyTrue
      }

      module.exports = function isTypedArray(value) {
        if (!value || typeof value !== 'object') { return false }
        if (!hasToStringTag || !(Symbol.toStringTag in value)) {
          var tag = $slice($toString(value), 8, -1)
          return $indexOf(typedArrays, tag) > -1
        }
        if (!gOPD) { return false }
        return tryTypedArrays(value)
      }
    }).call(this)
  }).call(this, typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {})
}, { 'available-typed-arrays': 11, 'call-bind/callBound': 14, 'for-each': 16, 'gopd': 20, 'has-tostringtag/shams': 24 }], 32: [function(require, module, exports) {
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

  'use strict'
  /* eslint-disable no-unused-vars */
  var getOwnPropertySymbols = Object.getOwnPropertySymbols
  var hasOwnProperty = Object.prototype.hasOwnProperty
  var propIsEnumerable = Object.prototype.propertyIsEnumerable

  function toObject(val) {
    if (val === null || val === undefined) {
      throw new TypeError('Object.assign cannot be called with null or undefined')
    }

    return Object(val)
  }

  function shouldUseNative() {
    try {
      if (!Object.assign) {
        return false
      }

      // Detect buggy property enumeration order in older V8 versions.

      // https://bugs.chromium.org/p/v8/issues/detail?id=4118
      var test1 = new String('abc') // eslint-disable-line no-new-wrappers
      test1[5] = 'de'
      if (Object.getOwnPropertyNames(test1)[0] === '5') {
        return false
      }

      // https://bugs.chromium.org/p/v8/issues/detail?id=3056
      var test2 = {}
      for (var i = 0; i < 10; i++) {
        test2['_' + String.fromCharCode(i)] = i
      }
      var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
        return test2[n]
      })
      if (order2.join('') !== '0123456789') {
        return false
      }

      // https://bugs.chromium.org/p/v8/issues/detail?id=3056
      var test3 = {}
      'abcdefghijklmnopqrst'.split('').forEach(function(letter) {
        test3[letter] = letter
      })
      if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
        return false
      }

      return true
    } catch (err) {
      // We don't expect any of the above to throw, but better to be safe.
      return false
    }
  }

  module.exports = shouldUseNative() ? Object.assign : function(target, source) {
    var from
    var to = toObject(target)
    var symbols

    for (var s = 1; s < arguments.length; s++) {
      from = Object(arguments[s])

      for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key]
        }
      }

      if (getOwnPropertySymbols) {
        symbols = getOwnPropertySymbols(from)
        for (var i = 0; i < symbols.length; i++) {
          if (propIsEnumerable.call(from, symbols[i])) {
            to[symbols[i]] = from[symbols[i]]
          }
        }
      }
    }

    return to
  }
}, {}], 33: [function(require, module, exports) {
  exports.endianness = function() { return 'LE' }

  exports.hostname = function() {
    if (typeof location !== 'undefined') {
      return location.hostname
    } else return ''
  }

  exports.loadavg = function() { return [] }

  exports.uptime = function() { return 0 }

  exports.freemem = function() {
    return Number.MAX_VALUE
  }

  exports.totalmem = function() {
    return Number.MAX_VALUE
  }

  exports.cpus = function() { return [] }

  exports.type = function() { return 'Browser' }

  exports.release = function() {
    if (typeof navigator !== 'undefined') {
      return navigator.appVersion
    }
    return ''
  }

  exports.networkInterfaces =
exports.getNetworkInterfaces =
function() { return {} }

  exports.arch = function() { return 'javascript' }

  exports.platform = function() { return 'browser' }

  exports.tmpdir = exports.tmpDir = function() {
    return '/tmp'
  }

  exports.EOL = '\n'

  exports.homedir = function() {
    return '/'
  }
}, {}], 34: [function(require, module, exports) {
  (function(process) {
    (function() {
    // 'path' module extracted from Node.js v8.11.1 (only the posix part)
    // transplited with Babel

      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      'use strict'

      function assertPath(path) {
        if (typeof path !== 'string') {
          throw new TypeError('Path must be a string. Received ' + JSON.stringify(path))
        }
      }

      // Resolves . and .. elements in a path with directory names
      function normalizeStringPosix(path, allowAboveRoot) {
        var res = ''
        var lastSegmentLength = 0
        var lastSlash = -1
        var dots = 0
        var code
        for (var i = 0; i <= path.length; ++i) {
          if (i < path.length) { code = path.charCodeAt(i) } else if (code === 47 /* /*/) { break } else { code = 47 } /* /*/
          if (code === 47 /* /*/) {
            if (lastSlash === i - 1 || dots === 1) {
            // NOOP
            } else if (lastSlash !== i - 1 && dots === 2) {
              if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /* .*/ || res.charCodeAt(res.length - 2) !== 46 /* .*/) {
                if (res.length > 2) {
                  var lastSlashIndex = res.lastIndexOf('/')
                  if (lastSlashIndex !== res.length - 1) {
                    if (lastSlashIndex === -1) {
                      res = ''
                      lastSegmentLength = 0
                    } else {
                      res = res.slice(0, lastSlashIndex)
                      lastSegmentLength = res.length - 1 - res.lastIndexOf('/')
                    }
                    lastSlash = i
                    dots = 0
                    continue
                  }
                } else if (res.length === 2 || res.length === 1) {
                  res = ''
                  lastSegmentLength = 0
                  lastSlash = i
                  dots = 0
                  continue
                }
              }
              if (allowAboveRoot) {
                if (res.length > 0) { res += '/..' } else { res = '..' }
                lastSegmentLength = 2
              }
            } else {
              if (res.length > 0) { res += '/' + path.slice(lastSlash + 1, i) } else { res = path.slice(lastSlash + 1, i) }
              lastSegmentLength = i - lastSlash - 1
            }
            lastSlash = i
            dots = 0
          } else if (code === 46 /* .*/ && dots !== -1) {
            ++dots
          } else {
            dots = -1
          }
        }
        return res
      }

      function _format(sep, pathObject) {
        var dir = pathObject.dir || pathObject.root
        var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '')
        if (!dir) {
          return base
        }
        if (dir === pathObject.root) {
          return dir + base
        }
        return dir + sep + base
      }

      var posix = {
      // path.resolve([from ...], to)
        resolve: function resolve() {
          var resolvedPath = ''
          var resolvedAbsolute = false
          var cwd

          for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path
            if (i >= 0) { path = arguments[i] } else {
              if (cwd === undefined) { cwd = process.cwd() }
              path = cwd
            }

            assertPath(path)

            // Skip empty entries
            if (path.length === 0) {
              continue
            }

            resolvedPath = path + '/' + resolvedPath
            resolvedAbsolute = path.charCodeAt(0) === 47 /* /*/
          }

          // At this point the path should be resolved to a full absolute path, but
          // handle relative paths to be safe (might happen when process.cwd() fails)

          // Normalize the path
          resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute)

          if (resolvedAbsolute) {
            if (resolvedPath.length > 0) { return '/' + resolvedPath } else { return '/' }
          } else if (resolvedPath.length > 0) {
            return resolvedPath
          } else {
            return '.'
          }
        },

        normalize: function normalize(path) {
          assertPath(path)

          if (path.length === 0) return '.'

          var isAbsolute = path.charCodeAt(0) === 47 /* /*/
          var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /* /*/

          // Normalize the path
          path = normalizeStringPosix(path, !isAbsolute)

          if (path.length === 0 && !isAbsolute) path = '.'
          if (path.length > 0 && trailingSeparator) path += '/'

          if (isAbsolute) return '/' + path
          return path
        },

        isAbsolute: function isAbsolute(path) {
          assertPath(path)
          return path.length > 0 && path.charCodeAt(0) === 47 /* /*/
        },

        join: function join() {
          if (arguments.length === 0) { return '.' }
          var joined
          for (var i = 0; i < arguments.length; ++i) {
            var arg = arguments[i]
            assertPath(arg)
            if (arg.length > 0) {
              if (joined === undefined) { joined = arg } else { joined += '/' + arg }
            }
          }
          if (joined === undefined) { return '.' }
          return posix.normalize(joined)
        },

        relative: function relative(from, to) {
          assertPath(from)
          assertPath(to)

          if (from === to) return ''

          from = posix.resolve(from)
          to = posix.resolve(to)

          if (from === to) return ''

          // Trim any leading backslashes
          var fromStart = 1
          for (; fromStart < from.length; ++fromStart) {
            if (from.charCodeAt(fromStart) !== 47 /* /*/) { break }
          }
          var fromEnd = from.length
          var fromLen = fromEnd - fromStart

          // Trim any leading backslashes
          var toStart = 1
          for (; toStart < to.length; ++toStart) {
            if (to.charCodeAt(toStart) !== 47 /* /*/) { break }
          }
          var toEnd = to.length
          var toLen = toEnd - toStart

          // Compare paths to find the longest common path from root
          var length = fromLen < toLen ? fromLen : toLen
          var lastCommonSep = -1
          var i = 0
          for (; i <= length; ++i) {
            if (i === length) {
              if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 47 /* /*/) {
                // We get here if `from` is the exact base path for `to`.
                // For example: from='/foo/bar'; to='/foo/bar/baz'
                  return to.slice(toStart + i + 1)
                } else if (i === 0) {
                // We get here if `from` is the root
                // For example: from='/'; to='/foo'
                  return to.slice(toStart + i)
                }
              } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 47 /* /*/) {
                // We get here if `to` is the exact base path for `from`.
                // For example: from='/foo/bar/baz'; to='/foo/bar'
                  lastCommonSep = i
                } else if (i === 0) {
                // We get here if `to` is the root.
                // For example: from='/foo'; to='/'
                  lastCommonSep = 0
                }
              }
              break
            }
            var fromCode = from.charCodeAt(fromStart + i)
            var toCode = to.charCodeAt(toStart + i)
            if (fromCode !== toCode) { break } else if (fromCode === 47 /* /*/) { lastCommonSep = i }
          }

          var out = ''
          // Generate the relative path based on the path difference between `to`
          // and `from`
          for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
            if (i === fromEnd || from.charCodeAt(i) === 47 /* /*/) {
              if (out.length === 0) { out += '..' } else { out += '/..' }
            }
          }

          // Lastly, append the rest of the destination (`to`) path that comes after
          // the common path parts
          if (out.length > 0) { return out + to.slice(toStart + lastCommonSep) } else {
            toStart += lastCommonSep
            if (to.charCodeAt(toStart) === 47 /* /*/) { ++toStart }
            return to.slice(toStart)
          }
        },

        _makeLong: function _makeLong(path) {
          return path
        },

        dirname: function dirname(path) {
          assertPath(path)
          if (path.length === 0) return '.'
          var code = path.charCodeAt(0)
          var hasRoot = code === 47 /* /*/
          var end = -1
          var matchedSlash = true
          for (var i = path.length - 1; i >= 1; --i) {
            code = path.charCodeAt(i)
            if (code === 47 /* /*/) {
              if (!matchedSlash) {
                end = i
                break
              }
            } else {
            // We saw the first non-path separator
              matchedSlash = false
            }
          }

          if (end === -1) return hasRoot ? '/' : '.'
          if (hasRoot && end === 1) return '//'
          return path.slice(0, end)
        },

        basename: function basename(path, ext) {
          if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string')
          assertPath(path)

          var start = 0
          var end = -1
          var matchedSlash = true
          var i

          if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path) return ''
            var extIdx = ext.length - 1
            var firstNonSlashEnd = -1
            for (i = path.length - 1; i >= 0; --i) {
              var code = path.charCodeAt(i)
              if (code === 47 /* /*/) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                  start = i + 1
                  break
                }
              } else {
                if (firstNonSlashEnd === -1) {
                // We saw the first non-path separator, remember this index in case
                // we need it if the extension ends up not matching
                  matchedSlash = false
                  firstNonSlashEnd = i + 1
                }
                if (extIdx >= 0) {
                // Try to match the explicit extension
                  if (code === ext.charCodeAt(extIdx)) {
                    if (--extIdx === -1) {
                    // We matched the extension, so mark this as the end of our path
                    // component
                      end = i
                    }
                  } else {
                  // Extension does not match, so our result is the entire path
                  // component
                    extIdx = -1
                    end = firstNonSlashEnd
                  }
                }
              }
            }

            if (start === end) end = firstNonSlashEnd; else if (end === -1) end = path.length
            return path.slice(start, end)
          } else {
            for (i = path.length - 1; i >= 0; --i) {
              if (path.charCodeAt(i) === 47 /* /*/) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                  start = i + 1
                  break
                }
              } else if (end === -1) {
              // We saw the first non-path separator, mark this as the end of our
              // path component
                matchedSlash = false
                end = i + 1
              }
            }

            if (end === -1) return ''
            return path.slice(start, end)
          }
        },

        extname: function extname(path) {
          assertPath(path)
          var startDot = -1
          var startPart = 0
          var end = -1
          var matchedSlash = true
          // Track the state of characters (if any) we see before our first dot and
          // after any path separator we find
          var preDotState = 0
          for (var i = path.length - 1; i >= 0; --i) {
            var code = path.charCodeAt(i)
            if (code === 47 /* /*/) {
              // If we reached a path separator that was not part of a set of path
              // separators at the end of the string, stop now
              if (!matchedSlash) {
                startPart = i + 1
                break
              }
              continue
            }
            if (end === -1) {
            // We saw the first non-path separator, mark this as the end of our
            // extension
              matchedSlash = false
              end = i + 1
            }
            if (code === 46 /* .*/) {
              // If this is our first dot, mark it as the start of our extension
              if (startDot === -1) { startDot = i } else if (preDotState !== 1) { preDotState = 1 }
            } else if (startDot !== -1) {
            // We saw a non-dot and non-path separator before our dot, so we should
            // have a good chance at having a non-empty extension
              preDotState = -1
            }
          }

          if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            return ''
          }
          return path.slice(startDot, end)
        },

        format: function format(pathObject) {
          if (pathObject === null || typeof pathObject !== 'object') {
            throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject)
          }
          return _format('/', pathObject)
        },

        parse: function parse(path) {
          assertPath(path)

          var ret = { root: '', dir: '', base: '', ext: '', name: '' }
          if (path.length === 0) return ret
          var code = path.charCodeAt(0)
          var isAbsolute = code === 47 /* /*/
          var start
          if (isAbsolute) {
            ret.root = '/'
            start = 1
          } else {
            start = 0
          }
          var startDot = -1
          var startPart = 0
          var end = -1
          var matchedSlash = true
          var i = path.length - 1

          // Track the state of characters (if any) we see before our first dot and
          // after any path separator we find
          var preDotState = 0

          // Get non-dir info
          for (; i >= start; --i) {
            code = path.charCodeAt(i)
            if (code === 47 /* /*/) {
              // If we reached a path separator that was not part of a set of path
              // separators at the end of the string, stop now
              if (!matchedSlash) {
                startPart = i + 1
                break
              }
              continue
            }
            if (end === -1) {
            // We saw the first non-path separator, mark this as the end of our
            // extension
              matchedSlash = false
              end = i + 1
            }
            if (code === 46 /* .*/) {
              // If this is our first dot, mark it as the start of our extension
              if (startDot === -1) startDot = i; else if (preDotState !== 1) preDotState = 1
            } else if (startDot !== -1) {
            // We saw a non-dot and non-path separator before our dot, so we should
            // have a good chance at having a non-empty extension
              preDotState = -1
            }
          }

          if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            if (end !== -1) {
              if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end); else ret.base = ret.name = path.slice(startPart, end)
            }
          } else {
            if (startPart === 0 && isAbsolute) {
              ret.name = path.slice(1, startDot)
              ret.base = path.slice(1, end)
            } else {
              ret.name = path.slice(startPart, startDot)
              ret.base = path.slice(startPart, end)
            }
            ret.ext = path.slice(startDot, end)
          }

          if (startPart > 0) ret.dir = path.slice(0, startPart - 1); else if (isAbsolute) ret.dir = '/'

          return ret
        },

        sep: '/',
        delimiter: ':',
        win32: null,
        posix: null
      }

      posix.posix = posix

      module.exports = posix
    }).call(this)
  }).call(this, require('_process'))
}, { '_process': 35 }], 35: [function(require, module, exports) {
// shim for using process in browser
  var process = module.exports = {}

  // cached from whatever global is present so that test runners that stub it
  // don't break things.  But we need to wrap it in a try catch in case it is
  // wrapped in strict mode code which doesn't define any globals.  It's inside a
  // function because try/catches deoptimize in certain engines.

  var cachedSetTimeout
  var cachedClearTimeout

  function defaultSetTimout() {
    throw new Error('setTimeout has not been defined')
  }
  function defaultClearTimeout() {
    throw new Error('clearTimeout has not been defined')
  }
  (function() {
    try {
      if (typeof setTimeout === 'function') {
        cachedSetTimeout = setTimeout
      } else {
        cachedSetTimeout = defaultSetTimout
      }
    } catch (e) {
      cachedSetTimeout = defaultSetTimout
    }
    try {
      if (typeof clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout
      } else {
        cachedClearTimeout = defaultClearTimeout
      }
    } catch (e) {
      cachedClearTimeout = defaultClearTimeout
    }
  }())
  function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
      // normal enviroments in sane situations
      return setTimeout(fun, 0)
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
      cachedSetTimeout = setTimeout
      return setTimeout(fun, 0)
    }
    try {
      // when when somebody has screwed with setTimeout but no I.E. maddness
      return cachedSetTimeout(fun, 0)
    } catch (e) {
      try {
        // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
        return cachedSetTimeout.call(null, fun, 0)
      } catch (e) {
        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
        return cachedSetTimeout.call(this, fun, 0)
      }
    }
  }
  function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
      // normal enviroments in sane situations
      return clearTimeout(marker)
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
      cachedClearTimeout = clearTimeout
      return clearTimeout(marker)
    }
    try {
      // when when somebody has screwed with setTimeout but no I.E. maddness
      return cachedClearTimeout(marker)
    } catch (e) {
      try {
        // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
        return cachedClearTimeout.call(null, marker)
      } catch (e) {
        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
        // Some versions of I.E. have different rules for clearTimeout vs setTimeout
        return cachedClearTimeout.call(this, marker)
      }
    }
  }
  var queue = []
  var draining = false
  var currentQueue
  var queueIndex = -1

  function cleanUpNextTick() {
    if (!draining || !currentQueue) {
      return
    }
    draining = false
    if (currentQueue.length) {
      queue = currentQueue.concat(queue)
    } else {
      queueIndex = -1
    }
    if (queue.length) {
      drainQueue()
    }
  }

  function drainQueue() {
    if (draining) {
      return
    }
    var timeout = runTimeout(cleanUpNextTick)
    draining = true

    var len = queue.length
    while (len) {
      currentQueue = queue
      queue = []
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run()
        }
      }
      queueIndex = -1
      len = queue.length
    }
    currentQueue = null
    draining = false
    runClearTimeout(timeout)
  }

  process.nextTick = function(fun) {
    var args = new Array(arguments.length - 1)
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i]
      }
    }
    queue.push(new Item(fun, args))
    if (queue.length === 1 && !draining) {
      runTimeout(drainQueue)
    }
  }

  // v8 likes predictible objects
  function Item(fun, array) {
    this.fun = fun
    this.array = array
  }
  Item.prototype.run = function() {
    this.fun.apply(null, this.array)
  }
  process.title = 'browser'
  process.browser = true
  process.env = {}
  process.argv = []
  process.version = '' // empty string to avoid regexp issues
  process.versions = {}

  function noop() {}

  process.on = noop
  process.addListener = noop
  process.once = noop
  process.off = noop
  process.removeListener = noop
  process.removeAllListeners = noop
  process.emit = noop
  process.prependListener = noop
  process.prependOnceListener = noop

  process.listeners = function(name) { return [] }

  process.binding = function(name) {
    throw new Error('process.binding is not supported')
  }

  process.cwd = function() { return '/' }
  process.chdir = function(dir) {
    throw new Error('process.chdir is not supported')
  }
  process.umask = function() { return 0 }
}, {}], 36: [function(require, module, exports) {
  arguments[4][9][0].apply(exports, arguments)
}, { 'dup': 9 }], 37: [function(require, module, exports) {
// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9

  'use strict'

  var isArgumentsObject = require('is-arguments')
  var isGeneratorFunction = require('is-generator-function')
  var whichTypedArray = require('which-typed-array')
  var isTypedArray = require('is-typed-array')

  function uncurryThis(f) {
    return f.call.bind(f)
  }

  var BigIntSupported = typeof BigInt !== 'undefined'
  var SymbolSupported = typeof Symbol !== 'undefined'

  var ObjectToString = uncurryThis(Object.prototype.toString)

  var numberValue = uncurryThis(Number.prototype.valueOf)
  var stringValue = uncurryThis(String.prototype.valueOf)
  var booleanValue = uncurryThis(Boolean.prototype.valueOf)

  if (BigIntSupported) {
    var bigIntValue = uncurryThis(BigInt.prototype.valueOf)
  }

  if (SymbolSupported) {
    var symbolValue = uncurryThis(Symbol.prototype.valueOf)
  }

  function checkBoxedPrimitive(value, prototypeValueOf) {
    if (typeof value !== 'object') {
      return false
    }
    try {
      prototypeValueOf(value)
      return true
    } catch (e) {
      return false
    }
  }

  exports.isArgumentsObject = isArgumentsObject
  exports.isGeneratorFunction = isGeneratorFunction
  exports.isTypedArray = isTypedArray

  // Taken from here and modified for better browser support
  // https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
  function isPromise(input) {
    return (
      (
        typeof Promise !== 'undefined' &&
			input instanceof Promise
      ) ||
		(
		  input !== null &&
			typeof input === 'object' &&
			typeof input.then === 'function' &&
			typeof input.catch === 'function'
		)
    )
  }
  exports.isPromise = isPromise

  function isArrayBufferView(value) {
    if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
      return ArrayBuffer.isView(value)
    }

    return (
      isTypedArray(value) ||
    isDataView(value)
    )
  }
  exports.isArrayBufferView = isArrayBufferView

  function isUint8Array(value) {
    return whichTypedArray(value) === 'Uint8Array'
  }
  exports.isUint8Array = isUint8Array

  function isUint8ClampedArray(value) {
    return whichTypedArray(value) === 'Uint8ClampedArray'
  }
  exports.isUint8ClampedArray = isUint8ClampedArray

  function isUint16Array(value) {
    return whichTypedArray(value) === 'Uint16Array'
  }
  exports.isUint16Array = isUint16Array

  function isUint32Array(value) {
    return whichTypedArray(value) === 'Uint32Array'
  }
  exports.isUint32Array = isUint32Array

  function isInt8Array(value) {
    return whichTypedArray(value) === 'Int8Array'
  }
  exports.isInt8Array = isInt8Array

  function isInt16Array(value) {
    return whichTypedArray(value) === 'Int16Array'
  }
  exports.isInt16Array = isInt16Array

  function isInt32Array(value) {
    return whichTypedArray(value) === 'Int32Array'
  }
  exports.isInt32Array = isInt32Array

  function isFloat32Array(value) {
    return whichTypedArray(value) === 'Float32Array'
  }
  exports.isFloat32Array = isFloat32Array

  function isFloat64Array(value) {
    return whichTypedArray(value) === 'Float64Array'
  }
  exports.isFloat64Array = isFloat64Array

  function isBigInt64Array(value) {
    return whichTypedArray(value) === 'BigInt64Array'
  }
  exports.isBigInt64Array = isBigInt64Array

  function isBigUint64Array(value) {
    return whichTypedArray(value) === 'BigUint64Array'
  }
  exports.isBigUint64Array = isBigUint64Array

  function isMapToString(value) {
    return ObjectToString(value) === '[object Map]'
  }
  isMapToString.working = (
    typeof Map !== 'undefined' &&
  isMapToString(new Map())
  )

  function isMap(value) {
    if (typeof Map === 'undefined') {
      return false
    }

    return isMapToString.working
      ? isMapToString(value)
      : value instanceof Map
  }
  exports.isMap = isMap

  function isSetToString(value) {
    return ObjectToString(value) === '[object Set]'
  }
  isSetToString.working = (
    typeof Set !== 'undefined' &&
  isSetToString(new Set())
  )
  function isSet(value) {
    if (typeof Set === 'undefined') {
      return false
    }

    return isSetToString.working
      ? isSetToString(value)
      : value instanceof Set
  }
  exports.isSet = isSet

  function isWeakMapToString(value) {
    return ObjectToString(value) === '[object WeakMap]'
  }
  isWeakMapToString.working = (
    typeof WeakMap !== 'undefined' &&
  isWeakMapToString(new WeakMap())
  )
  function isWeakMap(value) {
    if (typeof WeakMap === 'undefined') {
      return false
    }

    return isWeakMapToString.working
      ? isWeakMapToString(value)
      : value instanceof WeakMap
  }
  exports.isWeakMap = isWeakMap

  function isWeakSetToString(value) {
    return ObjectToString(value) === '[object WeakSet]'
  }
  isWeakSetToString.working = (
    typeof WeakSet !== 'undefined' &&
  isWeakSetToString(new WeakSet())
  )
  function isWeakSet(value) {
    return isWeakSetToString(value)
  }
  exports.isWeakSet = isWeakSet

  function isArrayBufferToString(value) {
    return ObjectToString(value) === '[object ArrayBuffer]'
  }
  isArrayBufferToString.working = (
    typeof ArrayBuffer !== 'undefined' &&
  isArrayBufferToString(new ArrayBuffer())
  )
  function isArrayBuffer(value) {
    if (typeof ArrayBuffer === 'undefined') {
      return false
    }

    return isArrayBufferToString.working
      ? isArrayBufferToString(value)
      : value instanceof ArrayBuffer
  }
  exports.isArrayBuffer = isArrayBuffer

  function isDataViewToString(value) {
    return ObjectToString(value) === '[object DataView]'
  }
  isDataViewToString.working = (
    typeof ArrayBuffer !== 'undefined' &&
  typeof DataView !== 'undefined' &&
  isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1))
  )
  function isDataView(value) {
    if (typeof DataView === 'undefined') {
      return false
    }

    return isDataViewToString.working
      ? isDataViewToString(value)
      : value instanceof DataView
  }
  exports.isDataView = isDataView

  // Store a copy of SharedArrayBuffer in case it's deleted elsewhere
  var SharedArrayBufferCopy = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : undefined
  function isSharedArrayBufferToString(value) {
    return ObjectToString(value) === '[object SharedArrayBuffer]'
  }
  function isSharedArrayBuffer(value) {
    if (typeof SharedArrayBufferCopy === 'undefined') {
      return false
    }

    if (typeof isSharedArrayBufferToString.working === 'undefined') {
      isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy())
    }

    return isSharedArrayBufferToString.working
      ? isSharedArrayBufferToString(value)
      : value instanceof SharedArrayBufferCopy
  }
  exports.isSharedArrayBuffer = isSharedArrayBuffer

  function isAsyncFunction(value) {
    return ObjectToString(value) === '[object AsyncFunction]'
  }
  exports.isAsyncFunction = isAsyncFunction

  function isMapIterator(value) {
    return ObjectToString(value) === '[object Map Iterator]'
  }
  exports.isMapIterator = isMapIterator

  function isSetIterator(value) {
    return ObjectToString(value) === '[object Set Iterator]'
  }
  exports.isSetIterator = isSetIterator

  function isGeneratorObject(value) {
    return ObjectToString(value) === '[object Generator]'
  }
  exports.isGeneratorObject = isGeneratorObject

  function isWebAssemblyCompiledModule(value) {
    return ObjectToString(value) === '[object WebAssembly.Module]'
  }
  exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule

  function isNumberObject(value) {
    return checkBoxedPrimitive(value, numberValue)
  }
  exports.isNumberObject = isNumberObject

  function isStringObject(value) {
    return checkBoxedPrimitive(value, stringValue)
  }
  exports.isStringObject = isStringObject

  function isBooleanObject(value) {
    return checkBoxedPrimitive(value, booleanValue)
  }
  exports.isBooleanObject = isBooleanObject

  function isBigIntObject(value) {
    return BigIntSupported && checkBoxedPrimitive(value, bigIntValue)
  }
  exports.isBigIntObject = isBigIntObject

  function isSymbolObject(value) {
    return SymbolSupported && checkBoxedPrimitive(value, symbolValue)
  }
  exports.isSymbolObject = isSymbolObject

  function isBoxedPrimitive(value) {
    return (
      isNumberObject(value) ||
    isStringObject(value) ||
    isBooleanObject(value) ||
    isBigIntObject(value) ||
    isSymbolObject(value)
    )
  }
  exports.isBoxedPrimitive = isBoxedPrimitive

  function isAnyArrayBuffer(value) {
    return typeof Uint8Array !== 'undefined' && (
      isArrayBuffer(value) ||
    isSharedArrayBuffer(value)
    )
  }
  exports.isAnyArrayBuffer = isAnyArrayBuffer;

  ['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function(method) {
    Object.defineProperty(exports, method, {
      enumerable: false,
      value: function() {
        throw new Error(method + ' is not supported in userland')
      }
    })
  })
}, { 'is-arguments': 28, 'is-generator-function': 30, 'is-typed-array': 31, 'which-typed-array': 39 }], 38: [function(require, module, exports) {
  (function(process) {
    (function() {
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.

      var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj)
    var descriptors = {}
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i])
    }
    return descriptors
  }

      var formatRegExp = /%[sdj%]/g
      exports.format = function(f) {
        if (!isString(f)) {
          var objects = []
          for (var i = 0; i < arguments.length; i++) {
            objects.push(inspect(arguments[i]))
          }
          return objects.join(' ')
        }

        var i = 1
        var args = arguments
        var len = args.length
        var str = String(f).replace(formatRegExp, function(x) {
          if (x === '%%') return '%'
          if (i >= len) return x
          switch (x) {
            case '%s': return String(args[i++])
            case '%d': return Number(args[i++])
            case '%j':
              try {
                return JSON.stringify(args[i++])
              } catch (_) {
                return '[Circular]'
              }
            default:
              return x
          }
        })
        for (var x = args[i]; i < len; x = args[++i]) {
          if (isNull(x) || !isObject(x)) {
            str += ' ' + x
          } else {
            str += ' ' + inspect(x)
          }
        }
        return str
      }

      // Mark that a method should not be used.
      // Returns a modified function which warns once by default.
      // If --no-deprecation is set, then it is a no-op.
      exports.deprecate = function(fn, msg) {
        if (typeof process !== 'undefined' && process.noDeprecation === true) {
          return fn
        }

        // Allow for deprecating things in the process of starting up.
        if (typeof process === 'undefined') {
          return function() {
            return exports.deprecate(fn, msg).apply(this, arguments)
          }
        }

        var warned = false
        function deprecated() {
          if (!warned) {
            if (process.throwDeprecation) {
              throw new Error(msg)
            } else if (process.traceDeprecation) {
              console.trace(msg)
            } else {
              console.error(msg)
            }
            warned = true
          }
          return fn.apply(this, arguments)
        }

        return deprecated
      }

      var debugs = {}
      var debugEnvRegex = /^$/

      if (process.env.NODE_DEBUG) {
        var debugEnv = process.env.NODE_DEBUG
        debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
          .replace(/\*/g, '.*')
          .replace(/,/g, '$|^')
          .toUpperCase()
        debugEnvRegex = new RegExp('^' + debugEnv + '$', 'i')
      }
      exports.debuglog = function(set) {
        set = set.toUpperCase()
        if (!debugs[set]) {
          if (debugEnvRegex.test(set)) {
            var pid = process.pid
            debugs[set] = function() {
              var msg = exports.format.apply(exports, arguments)
              console.error('%s %d: %s', set, pid, msg)
            }
          } else {
            debugs[set] = function() {}
          }
        }
        return debugs[set]
      }

      /**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
      /* legacy: obj, showHidden, depth, colors*/
      function inspect(obj, opts) {
      // default options
        var ctx = {
          seen: [],
          stylize: stylizeNoColor
        }
        // legacy...
        if (arguments.length >= 3) ctx.depth = arguments[2]
        if (arguments.length >= 4) ctx.colors = arguments[3]
        if (isBoolean(opts)) {
        // legacy...
          ctx.showHidden = opts
        } else if (opts) {
        // got an "options" object
          exports._extend(ctx, opts)
        }
        // set default options
        if (isUndefined(ctx.showHidden)) ctx.showHidden = false
        if (isUndefined(ctx.depth)) ctx.depth = 2
        if (isUndefined(ctx.colors)) ctx.colors = false
        if (isUndefined(ctx.customInspect)) ctx.customInspect = true
        if (ctx.colors) ctx.stylize = stylizeWithColor
        return formatValue(ctx, obj, ctx.depth)
      }
      exports.inspect = inspect

      // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
      inspect.colors = {
        'bold': [1, 22],
        'italic': [3, 23],
        'underline': [4, 24],
        'inverse': [7, 27],
        'white': [37, 39],
        'grey': [90, 39],
        'black': [30, 39],
        'blue': [34, 39],
        'cyan': [36, 39],
        'green': [32, 39],
        'magenta': [35, 39],
        'red': [31, 39],
        'yellow': [33, 39]
      }

      // Don't use 'blue' not visible on cmd.exe
      inspect.styles = {
        'special': 'cyan',
        'number': 'yellow',
        'boolean': 'yellow',
        'undefined': 'grey',
        'null': 'bold',
        'string': 'green',
        'date': 'magenta',
        // "name": intentionally not styling
        'regexp': 'red'
      }

      function stylizeWithColor(str, styleType) {
        var style = inspect.styles[styleType]

        if (style) {
          return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm'
        } else {
          return str
        }
      }

      function stylizeNoColor(str, styleType) {
        return str
      }

      function arrayToHash(array) {
        var hash = {}

        array.forEach(function(val, idx) {
          hash[val] = true
        })

        return hash
      }

      function formatValue(ctx, value, recurseTimes) {
      // Provide a hook for user-specified inspect functions.
      // Check that value is an object with an inspect function on it
        if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
          var ret = value.inspect(recurseTimes, ctx)
          if (!isString(ret)) {
            ret = formatValue(ctx, ret, recurseTimes)
          }
          return ret
        }

        // Primitive types cannot have properties
        var primitive = formatPrimitive(ctx, value)
        if (primitive) {
          return primitive
        }

        // Look up the keys of the object.
        var keys = Object.keys(value)
        var visibleKeys = arrayToHash(keys)

        if (ctx.showHidden) {
          keys = Object.getOwnPropertyNames(value)
        }

        // IE doesn't make error fields non-enumerable
        // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
        if (isError(value) &&
      (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
          return formatError(value)
        }

        // Some type of object without properties can be shortcutted.
        if (keys.length === 0) {
          if (isFunction(value)) {
            var name = value.name ? ': ' + value.name : ''
            return ctx.stylize('[Function' + name + ']', 'special')
          }
          if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp')
          }
          if (isDate(value)) {
            return ctx.stylize(Date.prototype.toString.call(value), 'date')
          }
          if (isError(value)) {
            return formatError(value)
          }
        }

        var base = ''; var array = false; var braces = ['{', '}']

        // Make Array say that they are Array
        if (isArray(value)) {
          array = true
          braces = ['[', ']']
        }

        // Make functions say that they are functions
        if (isFunction(value)) {
          var n = value.name ? ': ' + value.name : ''
          base = ' [Function' + n + ']'
        }

        // Make RegExps say that they are RegExps
        if (isRegExp(value)) {
          base = ' ' + RegExp.prototype.toString.call(value)
        }

        // Make dates with properties first say the date
        if (isDate(value)) {
          base = ' ' + Date.prototype.toUTCString.call(value)
        }

        // Make error with message first say the error
        if (isError(value)) {
          base = ' ' + formatError(value)
        }

        if (keys.length === 0 && (!array || value.length == 0)) {
          return braces[0] + base + braces[1]
        }

        if (recurseTimes < 0) {
          if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp')
          } else {
            return ctx.stylize('[Object]', 'special')
          }
        }

        ctx.seen.push(value)

        var output
        if (array) {
          output = formatArray(ctx, value, recurseTimes, visibleKeys, keys)
        } else {
          output = keys.map(function(key) {
            return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array)
          })
        }

        ctx.seen.pop()

        return reduceToSingleString(output, base, braces)
      }

      function formatPrimitive(ctx, value) {
        if (isUndefined(value)) { return ctx.stylize('undefined', 'undefined') }
        if (isString(value)) {
          var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"') + '\''
          return ctx.stylize(simple, 'string')
        }
        if (isNumber(value)) { return ctx.stylize('' + value, 'number') }
        if (isBoolean(value)) { return ctx.stylize('' + value, 'boolean') }
        // For some reason typeof null is "object", so special case here.
        if (isNull(value)) { return ctx.stylize('null', 'null') }
      }

      function formatError(value) {
        return '[' + Error.prototype.toString.call(value) + ']'
      }

      function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
        var output = []
        for (var i = 0, l = value.length; i < l; ++i) {
          if (hasOwnProperty(value, String(i))) {
            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              String(i), true))
          } else {
            output.push('')
          }
        }
        keys.forEach(function(key) {
          if (!key.match(/^\d+$/)) {
            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              key, true))
          }
        })
        return output
      }

      function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
        var name, str, desc
        desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] }
        if (desc.get) {
          if (desc.set) {
            str = ctx.stylize('[Getter/Setter]', 'special')
          } else {
            str = ctx.stylize('[Getter]', 'special')
          }
        } else {
          if (desc.set) {
            str = ctx.stylize('[Setter]', 'special')
          }
        }
        if (!hasOwnProperty(visibleKeys, key)) {
          name = '[' + key + ']'
        }
        if (!str) {
          if (ctx.seen.indexOf(desc.value) < 0) {
            if (isNull(recurseTimes)) {
              str = formatValue(ctx, desc.value, null)
            } else {
              str = formatValue(ctx, desc.value, recurseTimes - 1)
            }
            if (str.indexOf('\n') > -1) {
              if (array) {
                str = str.split('\n').map(function(line) {
                  return '  ' + line
                }).join('\n').slice(2)
              } else {
                str = '\n' + str.split('\n').map(function(line) {
                  return '   ' + line
                }).join('\n')
              }
            }
          } else {
            str = ctx.stylize('[Circular]', 'special')
          }
        }
        if (isUndefined(name)) {
          if (array && key.match(/^\d+$/)) {
            return str
          }
          name = JSON.stringify('' + key)
          if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
            name = name.slice(1, -1)
            name = ctx.stylize(name, 'name')
          } else {
            name = name.replace(/'/g, "\\'")
              .replace(/\\"/g, '"')
              .replace(/(^"|"$)/g, "'")
            name = ctx.stylize(name, 'string')
          }
        }

        return name + ': ' + str
      }

      function reduceToSingleString(output, base, braces) {
        var numLinesEst = 0
        var length = output.reduce(function(prev, cur) {
          numLinesEst++
          if (cur.indexOf('\n') >= 0) numLinesEst++
          return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1
        }, 0)

        if (length > 60) {
          return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1]
        }

        return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1]
      }

      // NOTE: These type checking functions intentionally don't use `instanceof`
      // because it is fragile and can be easily faked with `Object.create()`.
      exports.types = require('./support/types')

      function isArray(ar) {
        return Array.isArray(ar)
      }
      exports.isArray = isArray

      function isBoolean(arg) {
        return typeof arg === 'boolean'
      }
      exports.isBoolean = isBoolean

      function isNull(arg) {
        return arg === null
      }
      exports.isNull = isNull

      function isNullOrUndefined(arg) {
        return arg == null
      }
      exports.isNullOrUndefined = isNullOrUndefined

      function isNumber(arg) {
        return typeof arg === 'number'
      }
      exports.isNumber = isNumber

      function isString(arg) {
        return typeof arg === 'string'
      }
      exports.isString = isString

      function isSymbol(arg) {
        return typeof arg === 'symbol'
      }
      exports.isSymbol = isSymbol

      function isUndefined(arg) {
        return arg === void 0
      }
      exports.isUndefined = isUndefined

      function isRegExp(re) {
        return isObject(re) && objectToString(re) === '[object RegExp]'
      }
      exports.isRegExp = isRegExp
      exports.types.isRegExp = isRegExp

      function isObject(arg) {
        return typeof arg === 'object' && arg !== null
      }
      exports.isObject = isObject

      function isDate(d) {
        return isObject(d) && objectToString(d) === '[object Date]'
      }
      exports.isDate = isDate
      exports.types.isDate = isDate

      function isError(e) {
        return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error)
      }
      exports.isError = isError
      exports.types.isNativeError = isError

      function isFunction(arg) {
        return typeof arg === 'function'
      }
      exports.isFunction = isFunction

      function isPrimitive(arg) {
        return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' || // ES6 symbol
         typeof arg === 'undefined'
      }
      exports.isPrimitive = isPrimitive

      exports.isBuffer = require('./support/isBuffer')

      function objectToString(o) {
        return Object.prototype.toString.call(o)
      }

      function pad(n) {
        return n < 10 ? '0' + n.toString(10) : n.toString(10)
      }

      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
        'Oct', 'Nov', 'Dec']

      // 26 Feb 16:19:34
      function timestamp() {
        var d = new Date()
        var time = [pad(d.getHours()),
          pad(d.getMinutes()),
          pad(d.getSeconds())].join(':')
        return [d.getDate(), months[d.getMonth()], time].join(' ')
      }

      // log is just a thin wrapper to console.log that prepends a timestamp
      exports.log = function() {
        console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments))
      }

      /**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
      exports.inherits = require('inherits')

      exports._extend = function(origin, add) {
      // Don't do anything if add isn't an object
        if (!add || !isObject(add)) return origin

        var keys = Object.keys(add)
        var i = keys.length
        while (i--) {
          origin[keys[i]] = add[keys[i]]
        }
        return origin
      }

      function hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop)
      }

      var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined

      exports.promisify = function promisify(original) {
        if (typeof original !== 'function') { throw new TypeError('The "original" argument must be of type Function') }

        if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
          var fn = original[kCustomPromisifiedSymbol]
          if (typeof fn !== 'function') {
            throw new TypeError('The "util.promisify.custom" argument must be of type Function')
          }
          Object.defineProperty(fn, kCustomPromisifiedSymbol, {
            value: fn, enumerable: false, writable: false, configurable: true
          })
          return fn
        }

        function fn() {
          var promiseResolve, promiseReject
          var promise = new Promise(function(resolve, reject) {
            promiseResolve = resolve
            promiseReject = reject
          })

          var args = []
          for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i])
          }
          args.push(function(err, value) {
            if (err) {
              promiseReject(err)
            } else {
              promiseResolve(value)
            }
          })

          try {
            original.apply(this, args)
          } catch (err) {
            promiseReject(err)
          }

          return promise
        }

        Object.setPrototypeOf(fn, Object.getPrototypeOf(original))

        if (kCustomPromisifiedSymbol) {
          Object.defineProperty(fn, kCustomPromisifiedSymbol, {
            value: fn, enumerable: false, writable: false, configurable: true
          })
        }
        return Object.defineProperties(
          fn,
          getOwnPropertyDescriptors(original)
        )
      }

      exports.promisify.custom = kCustomPromisifiedSymbol

      function callbackifyOnRejected(reason, cb) {
      // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
      // Because `null` is a special error value in callbacks which means "no error
      // occurred", we error-wrap so the callback consumer can distinguish between
      // "the promise rejected with null" or "the promise fulfilled with undefined".
        if (!reason) {
          var newReason = new Error('Promise was rejected with a falsy value')
          newReason.reason = reason
          reason = newReason
        }
        return cb(reason)
      }

      function callbackify(original) {
        if (typeof original !== 'function') {
          throw new TypeError('The "original" argument must be of type Function')
        }

        // We DO NOT return the promise as it gives the user a false sense that
        // the promise is actually somehow related to the callback's execution
        // and that the callback throwing will reject the promise.
        function callbackified() {
          var args = []
          for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i])
          }

          var maybeCb = args.pop()
          if (typeof maybeCb !== 'function') {
            throw new TypeError('The last argument must be of type Function')
          }
          var self = this
          var cb = function() {
            return maybeCb.apply(self, arguments)
          }
          // In true node style we process the callback on `nextTick` with all the
          // implications (stack, `uncaughtException`, `async_hooks`)
          original.apply(this, args)
            .then(function(ret) { process.nextTick(cb.bind(null, null, ret)) },
              function(rej) { process.nextTick(callbackifyOnRejected.bind(null, rej, cb)) })
        }

        Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original))
        Object.defineProperties(callbackified,
          getOwnPropertyDescriptors(original))
        return callbackified
      }
      exports.callbackify = callbackify
    }).call(this)
  }).call(this, require('_process'))
}, { './support/isBuffer': 36, './support/types': 37, '_process': 35, 'inherits': 27 }], 39: [function(require, module, exports) {
  (function(global) {
    (function() {
      'use strict'

      var forEach = require('for-each')
      var availableTypedArrays = require('available-typed-arrays')
      var callBound = require('call-bind/callBound')
      var gOPD = require('gopd')

      var $toString = callBound('Object.prototype.toString')
      var hasToStringTag = require('has-tostringtag/shams')()

      var g = typeof globalThis === 'undefined' ? global : globalThis
      var typedArrays = availableTypedArrays()

      var $slice = callBound('String.prototype.slice')
      var toStrTags = {}
      var getPrototypeOf = Object.getPrototypeOf // require('getprototypeof');
      if (hasToStringTag && gOPD && getPrototypeOf) {
        forEach(typedArrays, function(typedArray) {
          if (typeof g[typedArray] === 'function') {
            var arr = new g[typedArray]()
            if (Symbol.toStringTag in arr) {
              var proto = getPrototypeOf(arr)
              var descriptor = gOPD(proto, Symbol.toStringTag)
              if (!descriptor) {
                var superProto = getPrototypeOf(proto)
                descriptor = gOPD(superProto, Symbol.toStringTag)
              }
              toStrTags[typedArray] = descriptor.get
            }
          }
        })
      }

      var tryTypedArrays = function tryAllTypedArrays(value) {
        var foundName = false
        forEach(toStrTags, function(getter, typedArray) {
          if (!foundName) {
            try {
              var name = getter.call(value)
              if (name === typedArray) {
                foundName = name
              }
            } catch (e) {}
          }
        })
        return foundName
      }

      var isTypedArray = require('is-typed-array')

      module.exports = function whichTypedArray(value) {
        if (!isTypedArray(value)) { return false }
        if (!hasToStringTag || !(Symbol.toStringTag in value)) { return $slice($toString(value), 8, -1) }
        return tryTypedArrays(value)
      }
    }).call(this)
  }).call(this, typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {})
}, { 'available-typed-arrays': 11, 'call-bind/callBound': 14, 'for-each': 16, 'gopd': 20, 'has-tostringtag/shams': 24, 'is-typed-array': 31 }], 'ref-napi': [function(require, module, exports) {
  (function(Buffer, __dirname) {
    (function() {
      'use strict'
      const assert = require('assert')
      const inspect = require('util').inspect
      const debug = require('debug')('ref')
      const os = require('os')
      const path = require('path')

      exports = module.exports = require('node-gyp-build')(path.join(__dirname, '..'))

      exports.endianness = os.endianness()

      /**
 * A `Buffer` that references the C NULL pointer. That is, its memory address
 * points to 0. Its `length` is 0 because accessing any data from this buffer
 * would cause a _segmentation fault_.
 *
 * ```
 * console.log(ref.NULL);
 * <SlowBuffer@0x0 >
 * ```
 *
 * @name NULL
 * @type Buffer
 */

      /**
 * A string that represents the native endianness of the machine's processor.
 * The possible values are either `"LE"` or `"BE"`.
 *
 * ```
 * console.log(ref.endianness);
 * 'LE'
 * ```
 *
 * @name endianness
 * @type String
 */

      /**
 * Accepts a `Buffer` instance and returns the memory address of the buffer
 * instance. Returns a JavaScript Number, which can't hold 64-bit integers,
 * so this function is unsafe on 64-bit systems.
 * ```
 * console.log(ref.address(new Buffer(1)));
 * 4320233616
 *
 * console.log(ref.address(ref.NULL)));
 * 0
 * ```
 *
 * @param {Buffer} buffer The buffer to get the memory address of.
 * @return {Number} The memory address the buffer instance.
 * @name address
 * @type method
 */

      /**
 * Accepts a `Buffer` instance and returns _true_ if the buffer represents the
 * NULL pointer, _false_ otherwise.
 *
 * ```
 * console.log(ref.isNull(new Buffer(1)));
 * false
 *
 * console.log(ref.isNull(ref.NULL));
 * true
 * ```
 *
 * @param {Buffer} buffer The buffer to check for NULL.
 * @return {Boolean} true or false.
 * @name isNull
 * @type method
 */

      /**
 * Reads a JavaScript Object that has previously been written to the given
 * _buffer_ at the given _offset_.
 *
 * ```
 * var obj = { foo: 'bar' };
 * var buf = ref.alloc('Object', obj);
 *
 * var obj2 = ref.readObject(buf, 0);
 * console.log(obj === obj2);
 * true
 * ```
 *
 * @param {Buffer} buffer The buffer to read an Object from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Object} The Object that was read from _buffer_.
 * @name readObject
 * @type method
 */

      /**
 * Reads a Buffer instance from the given _buffer_ at the given _offset_.
 * The _size_ parameter specifies the `length` of the returned Buffer instance,
 * which defaults to __0__.
 *
 * ```
 * var buf = new Buffer('hello world');
 * var pointer = ref.alloc('pointer', buf);
 *
 * var buf2 = ref.readPointer(pointer, 0, buf.length);
 * console.log(buf2.toString());
 * 'hello world'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @param {Number} length (optional) The length of the returned Buffer. Defaults to 0.
 * @return {Buffer} The Buffer instance that was read from _buffer_.
 * @name readPointer
 * @type method
 */

      /**
 * Returns a JavaScript String read from _buffer_ at the given _offset_. The
 * C String is read until the first NULL byte, which indicates the end of the
 * String.
 *
 * This function can read beyond the `length` of a Buffer.
 *
 * ```
 * var buf = new Buffer('hello\0world\0');
 *
 * var str = ref.readCString(buf, 0);
 * console.log(str);
 * 'hello'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {String} The String that was read from _buffer_.
 * @name readCString
 * @type method
 */

      /**
 * Returns a big-endian signed 64-bit int read from _buffer_ at the given
 * _offset_.
 *
 * If the returned value will fit inside a JavaScript Number without losing
 * precision, then a Number is returned, otherwise a String is returned.
 *
 * ```
 * var buf = ref.alloc('int64');
 * ref.writeInt64BE(buf, 0, '9223372036854775807');
 *
 * var val = ref.readInt64BE(buf, 0)
 * console.log(val)
 * '9223372036854775807'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Number|String} The Number or String that was read from _buffer_.
 * @name readInt64BE
 * @type method
 */

      /**
 * Returns a little-endian signed 64-bit int read from _buffer_ at the given
 * _offset_.
 *
 * If the returned value will fit inside a JavaScript Number without losing
 * precision, then a Number is returned, otherwise a String is returned.
 *
 * ```
 * var buf = ref.alloc('int64');
 * ref.writeInt64LE(buf, 0, '9223372036854775807');
 *
 * var val = ref.readInt64LE(buf, 0)
 * console.log(val)
 * '9223372036854775807'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Number|String} The Number or String that was read from _buffer_.
 * @name readInt64LE
 * @type method
 */

      /**
 * Returns a big-endian unsigned 64-bit int read from _buffer_ at the given
 * _offset_.
 *
 * If the returned value will fit inside a JavaScript Number without losing
 * precision, then a Number is returned, otherwise a String is returned.
 *
 * ```
 * var buf = ref.alloc('uint64');
 * ref.writeUInt64BE(buf, 0, '18446744073709551615');
 *
 * var val = ref.readUInt64BE(buf, 0)
 * console.log(val)
 * '18446744073709551615'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Number|String} The Number or String that was read from _buffer_.
 * @name readUInt64BE
 * @type method
 */

      /**
 * Returns a little-endian unsigned 64-bit int read from _buffer_ at the given
 * _offset_.
 *
 * If the returned value will fit inside a JavaScript Number without losing
 * precision, then a Number is returned, otherwise a String is returned.
 *
 * ```
 * var buf = ref.alloc('uint64');
 * ref.writeUInt64LE(buf, 0, '18446744073709551615');
 *
 * var val = ref.readUInt64LE(buf, 0)
 * console.log(val)
 * '18446744073709551615'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Number|String} The Number or String that was read from _buffer_.
 * @name readUInt64LE
 * @type method
 */

      /**
 * Writes the _input_ Number or String as a big-endian signed 64-bit int into
 * _buffer_ at the given _offset_.
 *
 * ```
 * var buf = ref.alloc('int64');
 * ref.writeInt64BE(buf, 0, '9223372036854775807');
 * ```
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {Number} offset The offset to begin writing from.
 * @param {Number|String} input This String or Number which gets written.
 * @name writeInt64BE
 * @type method
 */

      /**
 * Writes the _input_ Number or String as a little-endian signed 64-bit int into
 * _buffer_ at the given _offset_.
 *
 * ```
 * var buf = ref.alloc('int64');
 * ref.writeInt64LE(buf, 0, '9223372036854775807');
 * ```
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {Number} offset The offset to begin writing from.
 * @param {Number|String} input This String or Number which gets written.
 * @name writeInt64LE
 * @type method
 */

      /**
 * Writes the _input_ Number or String as a big-endian unsigned 64-bit int into
 * _buffer_ at the given _offset_.
 *
 * ```
 * var buf = ref.alloc('uint64');
 * ref.writeUInt64BE(buf, 0, '18446744073709551615');
 * ```
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {Number} offset The offset to begin writing from.
 * @param {Number|String} input This String or Number which gets written.
 * @name writeUInt64BE
 * @type method
 */

      /**
 * Writes the _input_ Number or String as a little-endian unsigned 64-bit int
 * into _buffer_ at the given _offset_.
 *
 * ```
 * var buf = ref.alloc('uint64');
 * ref.writeUInt64LE(buf, 0, '18446744073709551615');
 * ```
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {Number} offset The offset to begin writing from.
 * @param {Number|String} input This String or Number which gets written.
 * @name writeUInt64LE
 * @type method
 */

      /**
 * Returns a new clone of the given "type" object, with its
 * `indirection` level incremented by **1**.
 *
 * Say you wanted to create a type representing a `void *`:
 *
 * ```
 * var voidPtrType = ref.refType(ref.types.void);
 * ```
 *
 * @param {Object|String} type The "type" object to create a reference type from. Strings get coerced first.
 * @return {Object} The new "type" object with its `indirection` incremented by 1.
 */

      exports.refType = function refType(type) {
        const _type = exports.coerceType(type)
        const rtn = Object.create(_type)
        rtn.indirection++
        if (_type.name) {
          Object.defineProperty(rtn, 'name', {
            value: _type.name + '*',
            configurable: true,
            enumerable: true,
            writable: true
          })
        }
        return rtn
      }

      /**
 * Returns a new clone of the given "type" object, with its
 * `indirection` level decremented by 1.
 *
 * @param {Object|String} type The "type" object to create a dereference type from. Strings get coerced first.
 * @return {Object} The new "type" object with its `indirection` decremented by 1.
 */

      exports.derefType = function derefType(type) {
        const _type = exports.coerceType(type)
        if (_type.indirection === 1) {
          throw new Error('Cannot create deref\'d type for type with indirection 1')
        }
        let rtn = Object.getPrototypeOf(_type)
        if (rtn.indirection !== _type.indirection - 1) {
        // slow case
          rtn = Object.create(_type)
          rtn.indirection--
        }
        return rtn
      }

      /**
 * Coerces a "type" object from a String or an actual "type" object. String values
 * are looked up from the `ref.types` Object. So:
 *
 *   * `"int"` gets coerced into `ref.types.int`.
 *   * `"int *"` gets translated into `ref.refType(ref.types.int)`
 *   * `ref.types.int` gets translated into `ref.types.int` (returns itself)
 *
 * Throws an Error if no valid "type" object could be determined. Most `ref`
 * functions use this function under the hood, so anywhere a "type" object is
 * expected, a String may be passed as well, including simply setting the
 * `buffer.type` property.
 *
 * ```
 * var type = ref.coerceType('int **');
 *
 * console.log(type.indirection);
 * 3
 * ```
 *
 * @param {Object|String} type The "type" Object or String to coerce.
 * @return {Object} A "type" object
 */

      exports.coerceType = function coerceType(type) {
        let rtn = type
        if (typeof rtn === 'string') {
          rtn = exports.types[type]
          if (rtn) return rtn

          // strip whitespace
          rtn = type.replace(/\s+/g, '').toLowerCase()
          if (rtn === 'pointer') {
          // legacy "pointer" being used :(
            rtn = exports.refType(exports.types.void) // void *
          } else if (rtn === 'string') {
            rtn = exports.types.CString // special char * type
          } else {
            var refCount = 0
            rtn = rtn.replace(/\*/g, function() {
              refCount++
              return ''
            })
            // allow string names to be passed in
            rtn = exports.types[rtn]
            if (refCount > 0) {
              if (!(rtn && 'size' in rtn && 'indirection' in rtn)) {
                throw new TypeError('could not determine a proper "type" from: ' + inspect(type))
              }
              for (let i = 0; i < refCount; i++) {
                rtn = exports.refType(rtn)
              }
            }
          }
        }
        if (!(rtn && 'size' in rtn && 'indirection' in rtn)) {
          throw new TypeError('could not determine a proper "type" from: ' + inspect(type))
        }
        return rtn
      }

      /**
 * Returns the "type" property of the given Buffer.
 * Creates a default type for the buffer when none exists.
 *
 * @param {Buffer} buffer The Buffer instance to get the "type" object from.
 * @return {Object} The "type" object from the given Buffer.
 */

      exports.getType = function getType(buffer) {
        if (!buffer.type) {
          debug('WARN: no "type" found on buffer, setting default "type"', buffer)
          buffer.type = {}
          buffer.type.size = buffer.length
          buffer.type.indirection = 1
          buffer.type.get = function get() {
            throw new Error('unknown "type"; cannot get()')
          }
          buffer.type.set = function set() {
            throw new Error('unknown "type"; cannot set()')
          }
        }
        return exports.coerceType(buffer.type)
      }

      /**
 * Calls the `get()` function of the Buffer's current "type" (or the
 * passed in _type_ if present) at the given _offset_.
 *
 * This function handles checking the "indirection" level and returning a
 * proper "dereferenced" Bufffer instance when necessary.
 *
 * @param {Buffer} buffer The Buffer instance to read from.
 * @param {Number} offset (optional) The offset on the Buffer to start reading from. Defaults to 0.
 * @param {Object|String} type (optional) The "type" object to use when reading. Defaults to calling `getType()` on the buffer.
 * @return {?} Whatever value the "type" used when reading returns.
 */

      exports.get = function get(buffer, offset, type) {
        if (!offset) {
          offset = 0
        }
        if (type) {
          type = exports.coerceType(type)
        } else {
          type = exports.getType(buffer)
        }
        debug('get(): (offset: %d)', offset, buffer)
        assert(type.indirection > 0, `"indirection" level must be at least 1, saw ${type.indirection}`)
        if (type.indirection === 1) {
        // need to check "type"
          return type.get(buffer, offset)
        } else {
        // need to create a deref'd Buffer
          const size = type.indirection === 2 ? type.size : exports.sizeof.pointer
          const reference = exports.readPointer(buffer, offset, size)
          reference.type = exports.derefType(type)
          return reference
        }
      }

      /**
 * Calls the `set()` function of the Buffer's current "type" (or the
 * passed in _type_ if present) at the given _offset_.
 *
 * This function handles checking the "indirection" level writing a pointer rather
 * than calling the `set()` function if the indirection is greater than 1.
 *
 * @param {Buffer} buffer The Buffer instance to write to.
 * @param {Number} offset The offset on the Buffer to start writing to.
 * @param {?} value The value to write to the Buffer instance.
 * @param {Object|String} type (optional) The "type" object to use when reading. Defaults to calling `getType()` on the buffer.
 */

      exports.set = function set(buffer, offset, value, type) {
        if (!offset) {
          offset = 0
        }
        if (type) {
          type = exports.coerceType(type)
        } else {
          type = exports.getType(buffer)
        }
        debug('set(): (offset: %d)', offset, buffer, value)
        assert(type.indirection >= 1, '"indirection" level must be at least 1')
        if (type.indirection === 1) {
          type.set(buffer, offset, value)
        } else {
          exports.writePointer(buffer, offset, value)
        }
      }

      /**
 * Returns a new Buffer instance big enough to hold `type`,
 * with the given `value` written to it.
 *
 * ``` js
 * var intBuf = ref.alloc(ref.types.int)
 * var int_with_4 = ref.alloc(ref.types.int, 4)
 * ```
 *
 * @param {Object|String} type The "type" object to allocate. Strings get coerced first.
 * @param {?} value (optional) The initial value set on the returned Buffer, using _type_'s `set()` function.
 * @return {Buffer} A new Buffer instance with it's `type` set to "type", and (optionally) "value" written to it.
 */

      exports.alloc = function alloc(_type, value) {
        var type = exports.coerceType(_type)
        debug('allocating Buffer for type with "size"', type.size)
        let size
        if (type.indirection === 1) {
          size = type.size
        } else {
          size = exports.sizeof.pointer
        }
        const buffer = Buffer.alloc(size)
        buffer.type = type
        if (arguments.length >= 2) {
          debug('setting value on allocated buffer', value)
          exports.set(buffer, 0, value, type)
        }
        return buffer
      }

      /**
 * Returns a new `Buffer` instance with the given String written to it with the
 * given encoding (defaults to __'utf8'__). The buffer is 1 byte longer than the
 * string itself, and is NUL terminated.
 *
 * ```
 * var buf = ref.allocCString('hello world');
 *
 * console.log(buf.toString());
 * 'hello world\u0000'
 * ```
 *
 * @param {String} string The JavaScript string to be converted to a C string.
 * @param {String} encoding (optional) The encoding to use for the C string. Defaults to __'utf8'__.
 * @return {Buffer} The new `Buffer` instance with the specified String wrtten to it, and a trailing NUL byte.
 */

      exports.allocCString = function allocCString(string, encoding) {
        if (string == null || (Buffer.isBuffer(string) && exports.isNull(string))) {
          return exports.NULL
        }
        const size = Buffer.byteLength(string, encoding) + 1
        const buffer = Buffer.allocUnsafe(size)
        exports.writeCString(buffer, 0, string, encoding)
        buffer.type = charPtrType
        return buffer
      }

      /**
 * Writes the given string as a C String (NULL terminated) to the given buffer
 * at the given offset. "encoding" is optional and defaults to __'utf8'__.
 *
 * Unlike `readCString()`, this function requires the buffer to actually have the
 * proper length.
 *
 * @param {Buffer} buffer The Buffer instance to write to.
 * @param {Number} offset The offset of the buffer to begin writing at.
 * @param {String} string The JavaScript String to write that will be written to the buffer.
 * @param {String} encoding (optional) The encoding to read the C string as. Defaults to __'utf8'__.
 */

      exports.writeCString = function writeCString(buffer, offset, string, encoding) {
        assert(Buffer.isBuffer(buffer), 'expected a Buffer as the first argument')
        assert.strictEqual('string', typeof string, 'expected a "string" as the third argument')
        if (!offset) {
          offset = 0
        }
        if (!encoding) {
          encoding = 'utf8'
        }
        const size = buffer.length - offset - 1
        const len = buffer.write(string, offset, size, encoding)
        buffer.writeUInt8(0, offset + len) // NUL terminate
      }

      exports['readInt64' + exports.endianness] = exports.readInt64
      exports['readUInt64' + exports.endianness] = exports.readUInt64
      exports['writeInt64' + exports.endianness] = exports.writeInt64
      exports['writeUInt64' + exports.endianness] = exports.writeUInt64

      var opposite = exports.endianness == 'LE' ? 'BE' : 'LE'
      var int64temp = Buffer.alloc(exports.sizeof.int64)
      var uint64temp = Buffer.alloc(exports.sizeof.uint64)

      exports['readInt64' + opposite] = function(buffer, offset) {
        for (let i = 0; i < exports.sizeof.int64; i++) {
          int64temp[i] = buffer[offset + exports.sizeof.int64 - i - 1]
        }
        return exports.readInt64(int64temp, 0)
      }
      exports['readUInt64' + opposite] = function(buffer, offset) {
        for (let i = 0; i < exports.sizeof.uint64; i++) {
          uint64temp[i] = buffer[offset + exports.sizeof.uint64 - i - 1]
        }
        return exports.readUInt64(uint64temp, 0)
      }
      exports['writeInt64' + opposite] = function(buffer, offset, value) {
        exports.writeInt64(int64temp, 0, value)
        for (let i = 0; i < exports.sizeof.int64; i++) {
          buffer[offset + i] = int64temp[exports.sizeof.int64 - i - 1]
        }
      }
      exports['writeUInt64' + opposite] = function(buffer, offset, value) {
        exports.writeUInt64(uint64temp, 0, value)
        for (let i = 0; i < exports.sizeof.uint64; i++) {
          buffer[offset + i] = uint64temp[exports.sizeof.uint64 - i - 1]
        }
      }

      /**
 * `ref()` accepts a Buffer instance and returns a new Buffer
 * instance that is "pointer" sized and has its data pointing to the given
 * Buffer instance. Essentially the created Buffer is a "reference" to the
 * original pointer, equivalent to the following C code:
 *
 * ``` c
 * char *buf = buffer;
 * char **ref = &buf;
 * ```
 *
 * @param {Buffer} buffer A Buffer instance to create a reference to.
 * @return {Buffer} A new Buffer instance pointing to _buffer_.
 */

      exports.ref = function ref(buffer) {
        debug('creating a reference to buffer', buffer)
        var type = exports.refType(exports.getType(buffer))
        return exports.alloc(type, buffer)
      }

      /**
 * Accepts a Buffer instance and attempts to "dereference" it.
 * That is, first it checks the `indirection` count of _buffer_'s "type", and if
 * it's greater than __1__ then it merely returns another Buffer, but with one
 * level less `indirection`.
 *
 * When _buffer_'s indirection is at __1__, then it checks for `buffer.type`
 * which should be an Object with its own `get()` function.
 *
 * ```
 * var buf = ref.alloc('int', 6);
 *
 * var val = ref.deref(buf);
 * console.log(val);
 * 6
 * ```
 *
 *
 * @param {Buffer} buffer A Buffer instance to dereference.
 * @return {?} The returned value after dereferencing _buffer_.
 */

      exports.deref = function deref(buffer) {
        debug('dereferencing buffer', buffer)
        return exports.get(buffer)
      }

      const kAttachedRefs = Symbol('attached')

      /**
 * Attaches _object_ to _buffer_ such that it prevents _object_ from being garbage
 * collected until _buffer_ does.
 *
 * @param {Buffer} buffer A Buffer instance to attach _object_ to.
 * @param {Object|Buffer} object An Object or Buffer to prevent from being garbage collected until _buffer_ does.
 * @api private
 */

      exports._attach = function _attach(buf, obj) {
        if (!buf[kAttachedRefs]) {
          buf[kAttachedRefs] = []
        }
        buf[kAttachedRefs].push(obj)
      }

      /**
 * @param {Buffer} buffer
 * @param {Number} offset
 * @param {Object} object
 * @name _writeObject
 * @api private
 */

      /**
 * Writes a pointer to _object_ into _buffer_ at the specified _offset.
 *
 * This function "attaches" _object_ to _buffer_ to prevent it from being garbage
 * collected.
 *
 * ```
 * var buf = ref.alloc('Object');
 * ref.writeObject(buf, 0, { foo: 'bar' });
 *
 * ```
 *
 * @param {Buffer} buffer A Buffer instance to write _object_ to.
 * @param {Number} offset The offset on the Buffer to start writing at.
 * @param {Object} object The Object to be written into _buffer_.
 */

      exports.writeObject = function writeObject(buf, offset, obj) {
        debug('writing Object to buffer', buf, offset, obj)
        exports._writeObject(buf, offset, obj)
        exports._attach(buf, obj)
      }

      /**
 * Same as `ref.writePointer()`, except that this version does not attach
 * _pointer_ to _buffer_, which is potentially unsafe if the garbage collector
 * runs.
 *
 * @param {Buffer} buffer A Buffer instance to write _pointer to.
 * @param {Number} offset The offset on the Buffer to start writing at.
 * @param {Buffer} pointer The Buffer instance whose memory address will be written to _buffer_.
 * @name _writePointer
 * @api private
 */

      /**
 * Writes the memory address of _pointer_ to _buffer_ at the specified _offset_.
 *
 * This function "attaches" _object_ to _buffer_ to prevent it from being garbage
 * collected.
 *
 * ```
 * var someBuffer = new Buffer('whatever');
 * var buf = ref.alloc('pointer');
 * ref.writePointer(buf, 0, someBuffer);
 * ```
 *
 * @param {Buffer} buffer A Buffer instance to write _pointer to.
 * @param {Number} offset The offset on the Buffer to start writing at.
 * @param {Buffer} pointer The Buffer instance whose memory address will be written to _buffer_.
 */

      exports.writePointer = function writePointer(buf, offset, ptr) {
        debug('writing pointer to buffer', buf, offset, ptr)
        // Passing true as a fourth parameter does an a stronger
        // version of attach which ensures ptr is only collected after
        // the finalizer for buf has run. See
        // https://github.com/node-ffi-napi/ref-napi/issues/54
        // for why this is necessary
        exports._writePointer(buf, offset, ptr, true)
      }

      /**
 * Same as `ref.reinterpret()`, except that this version does not attach
 * _buffer_ to the returned Buffer, which is potentially unsafe if the
 * garbage collector runs.
 *
 * @param {Buffer} buffer A Buffer instance to base the returned Buffer off of.
 * @param {Number} size The `length` property of the returned Buffer.
 * @param {Number} offset The offset of the Buffer to begin from.
 * @return {Buffer} A new Buffer instance with the same memory address as _buffer_, and the requested _size_.
 * @name _reinterpret
 * @api private
 */

      /**
 * Returns a new Buffer instance with the specified _size_, with the same memory
 * address as _buffer_.
 *
 * This function "attaches" _buffer_ to the returned Buffer to prevent it from
 * being garbage collected.
 *
 * @param {Buffer} buffer A Buffer instance to base the returned Buffer off of.
 * @param {Number} size The `length` property of the returned Buffer.
 * @param {Number} offset The offset of the Buffer to begin from.
 * @return {Buffer} A new Buffer instance with the same memory address as _buffer_, and the requested _size_.
 */

      exports.reinterpret = function reinterpret(buffer, size, offset) {
        debug('reinterpreting buffer to "%d" bytes', size)
        const rtn = exports._reinterpret(buffer, size, offset || 0)
        exports._attach(rtn, buffer)
        return rtn
      }

      /**
 * Same as `ref.reinterpretUntilZeros()`, except that this version does not
 * attach _buffer_ to the returned Buffer, which is potentially unsafe if the
 * garbage collector runs.
 *
 * @param {Buffer} buffer A Buffer instance to base the returned Buffer off of.
 * @param {Number} size The number of sequential, aligned `NULL` bytes that are required to terminate the buffer.
 * @param {Number} offset The offset of the Buffer to begin from.
 * @return {Buffer} A new Buffer instance with the same memory address as _buffer_, and a variable `length` that is terminated by _size_ NUL bytes.
 * @name _reinterpretUntilZeros
 * @api private
 */

      /**
 * Accepts a `Buffer` instance and a number of `NULL` bytes to read from the
 * pointer. This function will scan past the boundary of the Buffer's `length`
 * until it finds `size` number of aligned `NULL` bytes.
 *
 * This is useful for finding the end of NUL-termintated array or C string. For
 * example, the `readCString()` function _could_ be implemented like:
 *
 * ```
 * function readCString (buf) {
 *   return ref.reinterpretUntilZeros(buf, 1).toString('utf8')
 * }
 * ```
 *
 * This function "attaches" _buffer_ to the returned Buffer to prevent it from
 * being garbage collected.
 *
 * @param {Buffer} buffer A Buffer instance to base the returned Buffer off of.
 * @param {Number} size The number of sequential, aligned `NULL` bytes are required to terminate the buffer.
 * @param {Number} offset The offset of the Buffer to begin from.
 * @return {Buffer} A new Buffer instance with the same memory address as _buffer_, and a variable `length` that is terminated by _size_ NUL bytes.
 */

      exports.reinterpretUntilZeros = function reinterpretUntilZeros(buffer, size, offset) {
        debug('reinterpreting buffer to until "%d" NULL (0) bytes are found', size)
        var rtn = exports._reinterpretUntilZeros(buffer, size, offset || 0)
        exports._attach(rtn, buffer)
        return rtn
      }

      // the built-in "types"
      const types = exports.types = {}

      /**
 * The `void` type.
 *
 * @section types
 */

      types.void = {
        size: 0,
        indirection: 1,
        get: function get(buf, offset) {
          debug('getting `void` type (returns `null`)')
          return null
        },
        set: function set(buf, offset, val) {
          debug('setting `void` type (no-op)')
        }
      }

      /**
 * The `int8` type.
 */

      types.int8 = {
        size: exports.sizeof.int8,
        indirection: 1,
        get: function get(buf, offset) {
          return buf.readInt8(offset || 0)
        },
        set: function set(buf, offset, val) {
          if (typeof val === 'string') {
            val = val.charCodeAt(0)
          }
          return buf.writeInt8(val, offset || 0)
        }
      }

      /**
 * The `uint8` type.
 */

      types.uint8 = {
        size: exports.sizeof.uint8,
        indirection: 1,
        get: function get(buf, offset) {
          return buf.readUInt8(offset || 0)
        },
        set: function set(buf, offset, val) {
          if (typeof val === 'string') {
            val = val.charCodeAt(0)
          }
          return buf.writeUInt8(val, offset || 0)
        }
      }

      /**
 * The `int16` type.
 */

      types.int16 = {
        size: exports.sizeof.int16,
        indirection: 1,
        get: function get(buf, offset) {
          return buf['readInt16' + exports.endianness](offset || 0)
        },
        set: function set(buf, offset, val) {
          return buf['writeInt16' + exports.endianness](val, offset || 0)
        }
      }

      /**
 * The `uint16` type.
 */

      types.uint16 = {
        size: exports.sizeof.uint16,
        indirection: 1,
        get: function get(buf, offset) {
          return buf['readUInt16' + exports.endianness](offset || 0)
        },
        set: function set(buf, offset, val) {
          return buf['writeUInt16' + exports.endianness](val, offset || 0)
        }
      }

      /**
 * The `int32` type.
 */

      types.int32 = {
        size: exports.sizeof.int32,
        indirection: 1,
        get: function get(buf, offset) {
          return buf['readInt32' + exports.endianness](offset || 0)
        },
        set: function set(buf, offset, val) {
          return buf['writeInt32' + exports.endianness](val, offset || 0)
        }
      }

      /**
 * The `uint32` type.
 */

      types.uint32 = {
        size: exports.sizeof.uint32,
        indirection: 1,
        get: function get(buf, offset) {
          return buf['readUInt32' + exports.endianness](offset || 0)
        },
        set: function set(buf, offset, val) {
          return buf['writeUInt32' + exports.endianness](val, offset || 0)
        }
      }

      /**
 * The `int64` type.
 */

      types.int64 = {
        size: exports.sizeof.int64,
        indirection: 1,
        get: function get(buf, offset) {
          return buf['readInt64' + exports.endianness](offset || 0)
        },
        set: function set(buf, offset, val) {
          return buf['writeInt64' + exports.endianness](val, offset || 0)
        }
      }

      /**
 * The `uint64` type.
 */

      types.uint64 = {
        size: exports.sizeof.uint64,
        indirection: 1,
        get: function get(buf, offset) {
          return buf['readUInt64' + exports.endianness](offset || 0)
        },
        set: function set(buf, offset, val) {
          return buf['writeUInt64' + exports.endianness](val, offset || 0)
        }
      }

      /**
 * The `float` type.
 */

      types.float = {
        size: exports.sizeof.float,
        indirection: 1,
        get: function get(buf, offset) {
          return buf['readFloat' + exports.endianness](offset || 0)
        },
        set: function set(buf, offset, val) {
          return buf['writeFloat' + exports.endianness](val, offset || 0)
        }
      }

      /**
 * The `double` type.
 */

      types.double = {
        size: exports.sizeof.double,
        indirection: 1,
        get: function get(buf, offset) {
          return buf['readDouble' + exports.endianness](offset || 0)
        },
        set: function set(buf, offset, val) {
          return buf['writeDouble' + exports.endianness](val, offset || 0)
        }
      }

      /**
 * The `Object` type. This can be used to read/write regular JS Objects
 * into raw memory.
 */

      types.Object = {
        size: exports.sizeof.Object,
        indirection: 1,
        get: function get(buf, offset) {
          return buf.readObject(offset || 0)
        },
        set: function set(buf, offset, val) {
          return buf.writeObject(val, offset || 0)
        }
      }

      /**
 * The `CString` (a.k.a `"string"`) type.
 *
 * CStrings are a kind of weird thing. We say it's `sizeof(char *)`, and
 * `indirection` level of 1, which means that we have to return a Buffer that
 * is pointer sized, and points to a some utf8 string data, so we have to create
 * a 2nd "in-between" buffer.
 */

      types.CString = {
        size: exports.sizeof.pointer,
        alignment: exports.alignof.pointer,
        indirection: 1,
        get: function get(buf, offset) {
          const _buf = exports.readPointer(buf, offset)
          if (exports.isNull(_buf)) {
            return null
          }
          return exports.readCString(_buf, 0)
        },
        set: function set(buf, offset, val) {
          let _buf
          if (Buffer.isBuffer(val)) {
            _buf = val
          } else {
          // assume string
            _buf = exports.allocCString(val)
          }
          return exports.writePointer(buf, offset, _buf)
        }
      }

      // alias Utf8String
      var utfstringwarned = false
      Object.defineProperty(types, 'Utf8String', {
        enumerable: false,
        configurable: true,
        get: function() {
          if (!utfstringwarned) {
            utfstringwarned = true
            console.error('"Utf8String" type is deprecated, use "CString" instead')
          }
          return types.CString
        }
      });

      /**
 * The `bool` type.
 *
 * Wrapper type around `types.uint8` that accepts/returns `true` or
 * `false` Boolean JavaScript values.
 *
 * @name bool
 *
 */

      /**
 * The `byte` type.
 *
 * @name byte
 */

      /**
 * The `char` type.
 *
 * @name char
 */

      /**
 * The `uchar` type.
 *
 * @name uchar
 */

      /**
 * The `short` type.
 *
 * @name short
 */

      /**
 * The `ushort` type.
 *
 * @name ushort
 */

      /**
 * The `int` type.
 *
 * @name int
 */

      /**
 * The `uint` type.
 *
 * @name uint
 */

      /**
 * The `long` type.
 *
 * @name long
 */

      /**
 * The `ulong` type.
 *
 * @name ulong
 */

      /**
 * The `longlong` type.
 *
 * @name longlong
 */

      /**
 * The `ulonglong` type.
 *
 * @name ulonglong
 */

      /**
 * The `size_t` type.
 *
 * @name size_t
 */

      // "typedef"s for the variable-sized types
      ['bool', 'byte', 'char', 'uchar', 'short', 'ushort', 'int', 'uint', 'long',
        'ulong', 'longlong', 'ulonglong', 'size_t'].forEach(name => {
        const unsigned = name === 'bool' ||
                name === 'byte' ||
                name === 'size_t' ||
                name[0] === 'u'
        const size = exports.sizeof[name]
        assert(size >= 1 && size <= 8)
        let typeName = 'int' + (size * 8)
        if (unsigned) {
          typeName = 'u' + typeName
        }
        const type = exports.types[typeName]
        assert(type)
        exports.types[name] = Object.create(type)
      })

      // set the "alignment" property on the built-in types
      Object.keys(exports.alignof).forEach((name) => {
        if (name === 'pointer') { return }
        exports.types[name].alignment = exports.alignof[name]
        assert(exports.types[name].alignment > 0)
      })

      // make the `bool` type work with JS true/false values
      exports.types.bool.get = (function(_get) {
        return function get(buf, offset) {
          return !!_get(buf, offset)
        }
      })(exports.types.bool.get)
      exports.types.bool.set = (function(_set) {
        return function set(buf, offset, val) {
          if (typeof val !== 'number') {
            val = val ? 1 : 0
          }
          return _set(buf, offset, val)
        }
      })(exports.types.bool.set)

      /*!
 * Set the `name` property of the types. Used for debugging...
 */

      Object.keys(exports.types).forEach((name) => {
        exports.types[name].name = name
      })

      /*!
 * This `char *` type is used by "allocCString()" above.
 */

      const charPtrType = exports.refType(exports.types.char)

      /*!
 * Set the `type` property of the `NULL` pointer Buffer object.
 */

      exports.NULL.type = exports.types.void

      /**
 * `NULL_POINTER` is a pointer-sized `Buffer` instance pointing to `NULL`.
 * Conceptually, it's equivalent to the following C code:
 *
 * ``` c
 * char *null_pointer;
 * null_pointer = NULL;
 * ```
 *
 * @type Buffer
 */

      exports.NULL_POINTER = exports.ref(exports.NULL)

      /**
 * All these '...' comment blocks below are for the documentation generator.
 *
 * @section buffer
 */

      Buffer.prototype.address = function address() {
        return exports.address(this, 0)
      }

      /**
 * ...
 */

      Buffer.prototype.hexAddress = function hexAddress() {
        return exports.hexAddress(this, 0)
      }

      /**
 * ...
 */

      Buffer.prototype.isNull = function isNull() {
        return exports.isNull(this, 0)
      }

      /**
 * ...
 */

      Buffer.prototype.ref = function ref() {
        return exports.ref(this)
      }

      /**
 * ...
 */

      Buffer.prototype.deref = function deref() {
        return exports.deref(this)
      }

      /**
 * ...
 */

      Buffer.prototype.readObject = function readObject(offset) {
        return exports.readObject(this, offset)
      }

      /**
 * ...
 */

      Buffer.prototype.writeObject = function writeObject(obj, offset) {
        return exports.writeObject(this, offset, obj)
      }

      /**
 * ...
 */

      Buffer.prototype.readPointer = function readPointer(offset, size) {
        return exports.readPointer(this, offset, size)
      }

      /**
 * ...
 */

      Buffer.prototype.writePointer = function writePointer(ptr, offset) {
        return exports.writePointer(this, offset, ptr)
      }

      /**
 * ...
 */

      Buffer.prototype.readCString = function readCString(offset) {
        return exports.readCString(this, offset)
      }

      /**
 * ...
 */

      Buffer.prototype.writeCString = function writeCString(string, offset, encoding) {
        return exports.writeCString(this, offset, string, encoding)
      }

      /**
 * ...
 */

      Buffer.prototype.readInt64BE = function readInt64BE(offset) {
        return exports.readInt64BE(this, offset)
      }

      /**
 * ...
 */

      Buffer.prototype.writeInt64BE = function writeInt64BE(val, offset) {
        return exports.writeInt64BE(this, offset, val)
      }

      /**
 * ...
 */

      Buffer.prototype.readUInt64BE = function readUInt64BE(offset) {
        return exports.readUInt64BE(this, offset)
      }

      /**
 * ...
 */

      Buffer.prototype.writeUInt64BE = function writeUInt64BE(val, offset) {
        return exports.writeUInt64BE(this, offset, val)
      }

      /**
 * ...
 */

      Buffer.prototype.readInt64LE = function readInt64LE(offset) {
        return exports.readInt64LE(this, offset)
      }

      /**
 * ...
 */

      Buffer.prototype.writeInt64LE = function writeInt64LE(val, offset) {
        return exports.writeInt64LE(this, offset, val)
      }

      /**
 * ...
 */

      Buffer.prototype.readUInt64LE = function readUInt64LE(offset) {
        return exports.readUInt64LE(this, offset)
      }

      /**
 * ...
 */

      Buffer.prototype.writeUInt64LE = function writeUInt64LE(val, offset) {
        return exports.writeUInt64LE(this, offset, val)
      }

      /**
 * ...
 */

      Buffer.prototype.reinterpret = function reinterpret(size, offset) {
        return exports.reinterpret(this, size, offset)
      }

      /**
 * ...
 */

      Buffer.prototype.reinterpretUntilZeros = function reinterpretUntilZeros(size, offset) {
        return exports.reinterpretUntilZeros(this, size, offset)
      }

      /**
 * `ref` overwrites the default `Buffer#inspect()` function to include the
 * hex-encoded memory address of the Buffer instance when invoked.
 *
 * This is simply a nice-to-have.
 *
 * **Before**:
 *
 * ``` js
 * console.log(new Buffer('ref'));
 * <Buffer 72 65 66>
 * ```
 *
 * **After**:
 *
 * ``` js
 * console.log(new Buffer('ref'));
 * <Buffer@0x103015490 72 65 66>
 * ```
 */

      var inspectSym = inspect.custom || 'inspect'
      /**
 * in node 6.91, inspect.custom does not give a correct value; so in this case, don't torch the whole process.
 * fixed in >6.9.2
 */
      if (Buffer.prototype[inspectSym]) {
        Buffer.prototype[inspectSym] = overwriteInspect(Buffer.prototype[inspectSym])
      }

      // does SlowBuffer inherit from Buffer? (node >= v0.7.9)
      if (!(exports.NULL instanceof Buffer)) {
        debug('extending SlowBuffer\'s prototype since it doesn\'t inherit from Buffer.prototype')

        /*!
   * SlowBuffer convenience methods.
   */

        var SlowBuffer = require('buffer').SlowBuffer

        SlowBuffer.prototype.address = Buffer.prototype.address
        SlowBuffer.prototype.hexAddress = Buffer.prototype.hexAddress
        SlowBuffer.prototype.isNull = Buffer.prototype.isNull
        SlowBuffer.prototype.ref = Buffer.prototype.ref
        SlowBuffer.prototype.deref = Buffer.prototype.deref
        SlowBuffer.prototype.readObject = Buffer.prototype.readObject
        SlowBuffer.prototype.writeObject = Buffer.prototype.writeObject
        SlowBuffer.prototype.readPointer = Buffer.prototype.readPointer
        SlowBuffer.prototype.writePointer = Buffer.prototype.writePointer
        SlowBuffer.prototype.readCString = Buffer.prototype.readCString
        SlowBuffer.prototype.writeCString = Buffer.prototype.writeCString
        SlowBuffer.prototype.reinterpret = Buffer.prototype.reinterpret
        SlowBuffer.prototype.reinterpretUntilZeros = Buffer.prototype.reinterpretUntilZeros
        SlowBuffer.prototype.readInt64BE = Buffer.prototype.readInt64BE
        SlowBuffer.prototype.writeInt64BE = Buffer.prototype.writeInt64BE
        SlowBuffer.prototype.readUInt64BE = Buffer.prototype.readUInt64BE
        SlowBuffer.prototype.writeUInt64BE = Buffer.prototype.writeUInt64BE
        SlowBuffer.prototype.readInt64LE = Buffer.prototype.readInt64LE
        SlowBuffer.prototype.writeInt64LE = Buffer.prototype.writeInt64LE
        SlowBuffer.prototype.readUInt64LE = Buffer.prototype.readUInt64LE
        SlowBuffer.prototype.writeUInt64LE = Buffer.prototype.writeUInt64LE
        /**
 * in node 6.9.1, inspect.custom does not give a correct value; so in this case, don't torch the whole process.
 * fixed in >6.9.2
 */
        if (SlowBuffer.prototype[inspectSym]) {
          SlowBuffer.prototype[inspectSym] = overwriteInspect(SlowBuffer.prototype[inspectSym])
        }
      }

      function overwriteInspect(inspect) {
        if (inspect.name === 'refinspect') {
          return inspect
        } else {
          return function refinspect() {
            var v = inspect.apply(this, arguments)
            return v.replace('Buffer', 'Buffer@0x' + this.hexAddress())
          }
        }
      }
    }).call(this)
  }).call(this, require('buffer').Buffer, '/node_modules/ref-napi/lib')
}, { 'assert': 7, 'buffer': 13, 'debug': 1, 'node-gyp-build': 4, 'os': 33, 'path': 34, 'util': 38 }] }, {}, [])
