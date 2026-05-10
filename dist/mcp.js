var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/core.js
// @__NO_SIDE_EFFECTS__
function $constructor(name, initializer3, params) {
  function init(inst, def) {
    if (!inst._zod) {
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: /* @__PURE__ */ new Set()
        },
        enumerable: false
      });
    }
    if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer3(inst, def);
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;
  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    var _a2;
    const inst = params?.Parent ? new Definition() : this;
    init(inst, def);
    (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
    for (const fn of inst._zod.deferred) {
      fn();
    }
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
function config(newConfig) {
  if (newConfig)
    Object.assign(globalConfig, newConfig);
  return globalConfig;
}
var NEVER, $ZodAsyncError, $ZodEncodeError, globalConfig;
var init_core = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/core.js"() {
    "use strict";
    NEVER = Object.freeze({
      status: "aborted"
    });
    $ZodAsyncError = class extends Error {
      constructor() {
        super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
      }
    };
    $ZodEncodeError = class extends Error {
      constructor(name) {
        super(`Encountered unidirectional transform during encode: ${name}`);
        this.name = "ZodEncodeError";
      }
    };
    globalConfig = {};
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/util.js
var util_exports = {};
__export(util_exports, {
  BIGINT_FORMAT_RANGES: () => BIGINT_FORMAT_RANGES,
  Class: () => Class,
  NUMBER_FORMAT_RANGES: () => NUMBER_FORMAT_RANGES,
  aborted: () => aborted,
  allowsEval: () => allowsEval,
  assert: () => assert,
  assertEqual: () => assertEqual,
  assertIs: () => assertIs,
  assertNever: () => assertNever,
  assertNotEqual: () => assertNotEqual,
  assignProp: () => assignProp,
  base64ToUint8Array: () => base64ToUint8Array,
  base64urlToUint8Array: () => base64urlToUint8Array,
  cached: () => cached,
  captureStackTrace: () => captureStackTrace,
  cleanEnum: () => cleanEnum,
  cleanRegex: () => cleanRegex,
  clone: () => clone,
  cloneDef: () => cloneDef,
  createTransparentProxy: () => createTransparentProxy,
  defineLazy: () => defineLazy,
  esc: () => esc,
  escapeRegex: () => escapeRegex,
  extend: () => extend,
  finalizeIssue: () => finalizeIssue,
  floatSafeRemainder: () => floatSafeRemainder,
  getElementAtPath: () => getElementAtPath,
  getEnumValues: () => getEnumValues,
  getLengthableOrigin: () => getLengthableOrigin,
  getParsedType: () => getParsedType,
  getSizableOrigin: () => getSizableOrigin,
  hexToUint8Array: () => hexToUint8Array,
  isObject: () => isObject,
  isPlainObject: () => isPlainObject,
  issue: () => issue,
  joinValues: () => joinValues,
  jsonStringifyReplacer: () => jsonStringifyReplacer,
  merge: () => merge,
  mergeDefs: () => mergeDefs,
  normalizeParams: () => normalizeParams,
  nullish: () => nullish,
  numKeys: () => numKeys,
  objectClone: () => objectClone,
  omit: () => omit,
  optionalKeys: () => optionalKeys,
  parsedType: () => parsedType,
  partial: () => partial,
  pick: () => pick,
  prefixIssues: () => prefixIssues,
  primitiveTypes: () => primitiveTypes,
  promiseAllObject: () => promiseAllObject,
  propertyKeyTypes: () => propertyKeyTypes,
  randomString: () => randomString,
  required: () => required,
  safeExtend: () => safeExtend,
  shallowClone: () => shallowClone,
  slugify: () => slugify,
  stringifyPrimitive: () => stringifyPrimitive,
  uint8ArrayToBase64: () => uint8ArrayToBase64,
  uint8ArrayToBase64url: () => uint8ArrayToBase64url,
  uint8ArrayToHex: () => uint8ArrayToHex,
  unwrapMessage: () => unwrapMessage
});
function assertEqual(val) {
  return val;
}
function assertNotEqual(val) {
  return val;
}
function assertIs(_arg) {
}
function assertNever(_x) {
  throw new Error("Unexpected value in exhaustive check");
}
function assert(_) {
}
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function joinValues(array2, separator = "|") {
  return array2.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}
function cached(getter) {
  const set2 = false;
  return {
    get value() {
      if (!set2) {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
      throw new Error("cached value already set");
    }
  };
}
function nullish(input) {
  return input === null || input === void 0;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepString = step.toString();
  let stepDecCount = (stepString.split(".")[1] || "").length;
  if (stepDecCount === 0 && /\d?e-\d?/.test(stepString)) {
    const match = stepString.match(/\d?e-(\d?)/);
    if (match?.[1]) {
      stepDecCount = Number.parseInt(match[1]);
    }
  }
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
function defineLazy(object2, key, getter) {
  let value = void 0;
  Object.defineProperty(object2, key, {
    get() {
      if (value === EVALUATING) {
        return void 0;
      }
      if (value === void 0) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object2, key, {
        value: v
        // configurable: true,
      });
    },
    configurable: true
  });
}
function objectClone(obj) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function cloneDef(schema) {
  return mergeDefs(schema._zod.def);
}
function getElementAtPath(obj, path25) {
  if (!path25)
    return obj;
  return path25.reduce((acc, key) => acc?.[key], obj);
}
function promiseAllObject(promisesObj) {
  const keys = Object.keys(promisesObj);
  const promises = keys.map((key) => promisesObj[key]);
  return Promise.all(promises).then((results) => {
    const resolvedObj = {};
    for (let i = 0; i < keys.length; i++) {
      resolvedObj[keys[i]] = results[i];
    }
    return resolvedObj;
  });
}
function randomString(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === void 0)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  return o;
}
function numKeys(data) {
  let keyCount = 0;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      keyCount++;
    }
  }
  return keyCount;
}
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== void 0) {
    if (params?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function createTransparentProxy(getter) {
  let target;
  return new Proxy({}, {
    get(_, prop, receiver) {
      target ?? (target = getter());
      return Reflect.get(target, prop, receiver);
    },
    set(_, prop, value, receiver) {
      target ?? (target = getter());
      return Reflect.set(target, prop, value, receiver);
    },
    has(_, prop) {
      target ?? (target = getter());
      return Reflect.has(target, prop);
    },
    deleteProperty(_, prop) {
      target ?? (target = getter());
      return Reflect.deleteProperty(target, prop);
    },
    ownKeys(_) {
      target ?? (target = getter());
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(_, prop) {
      target ?? (target = getter());
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    defineProperty(_, prop, descriptor) {
      target ?? (target = getter());
      return Reflect.defineProperty(target, prop, descriptor);
    }
  });
}
function stringifyPrimitive(value) {
  if (typeof value === "bigint")
    return value.toString() + "n";
  if (typeof value === "string")
    return `"${value}"`;
  return `${value}`;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
  });
}
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = {};
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        newShape[key] = currDef.shape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = { ...schema._zod.def.shape };
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        delete newShape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    const existingShape = schema._zod.def.shape;
    for (const key in shape) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function merge(a, b) {
  const def = mergeDefs(a._zod.def, {
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return clone(a, def);
}
function partial(Class2, schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in oldShape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      } else {
        for (const key in oldShape) {
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function required(Class2, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      } else {
        for (const key in oldShape) {
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    }
  });
  return clone(schema, def);
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path25, issues) {
  return issues.map((iss) => {
    var _a2;
    (_a2 = iss).path ?? (_a2.path = []);
    iss.path.unshift(path25);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config2) {
  const full = { ...iss, path: iss.path ?? [] };
  if (!iss.message) {
    const message = unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config2.customError?.(iss)) ?? unwrapMessage(config2.localeError?.(iss)) ?? "Invalid input";
    full.message = message;
  }
  delete full.inst;
  delete full.continue;
  if (!ctx?.reportInput) {
    delete full.input;
  }
  return full;
}
function getSizableOrigin(input) {
  if (input instanceof Set)
    return "set";
  if (input instanceof Map)
    return "map";
  if (input instanceof File)
    return "file";
  return "unknown";
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function parsedType(data) {
  const t = typeof data;
  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "nan" : "number";
    }
    case "object": {
      if (data === null) {
        return "null";
      }
      if (Array.isArray(data)) {
        return "array";
      }
      const obj = data;
      if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
        return obj.constructor.name;
      }
    }
  }
  return t;
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}
function cleanEnum(obj) {
  return Object.entries(obj).filter(([k, _]) => {
    return Number.isNaN(Number.parseInt(k, 10));
  }).map((el) => el[1]);
}
function base64ToUint8Array(base643) {
  const binaryString = atob(base643);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
function uint8ArrayToBase64(bytes) {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}
function base64urlToUint8Array(base64url3) {
  const base643 = base64url3.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base643.length % 4) % 4);
  return base64ToUint8Array(base643 + padding);
}
function uint8ArrayToBase64url(bytes) {
  return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function hexToUint8Array(hex3) {
  const cleanHex = hex3.replace(/^0x/, "");
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
  }
  return bytes;
}
function uint8ArrayToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var EVALUATING, captureStackTrace, allowsEval, getParsedType, propertyKeyTypes, primitiveTypes, NUMBER_FORMAT_RANGES, BIGINT_FORMAT_RANGES, Class;
var init_util = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/util.js"() {
    "use strict";
    EVALUATING = /* @__PURE__ */ Symbol("evaluating");
    captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {
    };
    allowsEval = cached(() => {
      if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
        return false;
      }
      try {
        const F = Function;
        new F("");
        return true;
      } catch (_) {
        return false;
      }
    });
    getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return "undefined";
        case "string":
          return "string";
        case "number":
          return Number.isNaN(data) ? "nan" : "number";
        case "boolean":
          return "boolean";
        case "function":
          return "function";
        case "bigint":
          return "bigint";
        case "symbol":
          return "symbol";
        case "object":
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return "promise";
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return "map";
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return "set";
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return "date";
          }
          if (typeof File !== "undefined" && data instanceof File) {
            return "file";
          }
          return "object";
        default:
          throw new Error(`Unknown data type: ${t}`);
      }
    };
    propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
    primitiveTypes = /* @__PURE__ */ new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"]);
    NUMBER_FORMAT_RANGES = {
      safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
      int32: [-2147483648, 2147483647],
      uint32: [0, 4294967295],
      float32: [-34028234663852886e22, 34028234663852886e22],
      float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
    };
    BIGINT_FORMAT_RANGES = {
      int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
      uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
    };
    Class = class {
      constructor(..._args) {
      }
    };
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/errors.js
function flattenError(error2, mapper = (issue2) => issue2.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error2.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error2, mapper = (issue2) => issue2.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error3) => {
    for (const issue2 of error3.issues) {
      if (issue2.code === "invalid_union" && issue2.errors.length) {
        issue2.errors.map((issues) => processError({ issues }));
      } else if (issue2.code === "invalid_key") {
        processError({ issues: issue2.issues });
      } else if (issue2.code === "invalid_element") {
        processError({ issues: issue2.issues });
      } else if (issue2.path.length === 0) {
        fieldErrors._errors.push(mapper(issue2));
      } else {
        let curr = fieldErrors;
        let i = 0;
        while (i < issue2.path.length) {
          const el = issue2.path[i];
          const terminal = i === issue2.path.length - 1;
          if (!terminal) {
            curr[el] = curr[el] || { _errors: [] };
          } else {
            curr[el] = curr[el] || { _errors: [] };
            curr[el]._errors.push(mapper(issue2));
          }
          curr = curr[el];
          i++;
        }
      }
    }
  };
  processError(error2);
  return fieldErrors;
}
var initializer, $ZodError, $ZodRealError;
var init_errors = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/errors.js"() {
    "use strict";
    init_core();
    init_util();
    initializer = (inst, def) => {
      inst.name = "$ZodError";
      Object.defineProperty(inst, "_zod", {
        value: inst._zod,
        enumerable: false
      });
      Object.defineProperty(inst, "issues", {
        value: def,
        enumerable: false
      });
      inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
      Object.defineProperty(inst, "toString", {
        value: () => inst.message,
        enumerable: false
      });
    };
    $ZodError = $constructor("$ZodError", initializer);
    $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/parse.js
var _parse, parse, _parseAsync, parseAsync, _safeParse, safeParse, _safeParseAsync, safeParseAsync, _encode, _decode, _encodeAsync, _decodeAsync, _safeEncode, _safeDecode, _safeEncodeAsync, _safeDecodeAsync;
var init_parse = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/parse.js"() {
    "use strict";
    init_core();
    init_errors();
    init_util();
    _parse = (_Err) => (schema, value, _ctx, _params) => {
      const ctx = _ctx ? Object.assign(_ctx, { async: false }) : { async: false };
      const result = schema._zod.run({ value, issues: [] }, ctx);
      if (result instanceof Promise) {
        throw new $ZodAsyncError();
      }
      if (result.issues.length) {
        const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
        captureStackTrace(e, _params?.callee);
        throw e;
      }
      return result.value;
    };
    parse = /* @__PURE__ */ _parse($ZodRealError);
    _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
      const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
      let result = schema._zod.run({ value, issues: [] }, ctx);
      if (result instanceof Promise)
        result = await result;
      if (result.issues.length) {
        const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
        captureStackTrace(e, params?.callee);
        throw e;
      }
      return result.value;
    };
    parseAsync = /* @__PURE__ */ _parseAsync($ZodRealError);
    _safeParse = (_Err) => (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
      const result = schema._zod.run({ value, issues: [] }, ctx);
      if (result instanceof Promise) {
        throw new $ZodAsyncError();
      }
      return result.issues.length ? {
        success: false,
        error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
      } : { success: true, data: result.value };
    };
    safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
    _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
      const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
      let result = schema._zod.run({ value, issues: [] }, ctx);
      if (result instanceof Promise)
        result = await result;
      return result.issues.length ? {
        success: false,
        error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
      } : { success: true, data: result.value };
    };
    safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
    _encode = (_Err) => (schema, value, _ctx) => {
      const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
      return _parse(_Err)(schema, value, ctx);
    };
    _decode = (_Err) => (schema, value, _ctx) => {
      return _parse(_Err)(schema, value, _ctx);
    };
    _encodeAsync = (_Err) => async (schema, value, _ctx) => {
      const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
      return _parseAsync(_Err)(schema, value, ctx);
    };
    _decodeAsync = (_Err) => async (schema, value, _ctx) => {
      return _parseAsync(_Err)(schema, value, _ctx);
    };
    _safeEncode = (_Err) => (schema, value, _ctx) => {
      const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
      return _safeParse(_Err)(schema, value, ctx);
    };
    _safeDecode = (_Err) => (schema, value, _ctx) => {
      return _safeParse(_Err)(schema, value, _ctx);
    };
    _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
      const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
      return _safeParseAsync(_Err)(schema, value, ctx);
    };
    _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
      return _safeParseAsync(_Err)(schema, value, _ctx);
    };
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/regexes.js
var regexes_exports = {};
__export(regexes_exports, {
  base64: () => base64,
  base64url: () => base64url,
  bigint: () => bigint,
  boolean: () => boolean,
  browserEmail: () => browserEmail,
  cidrv4: () => cidrv4,
  cidrv6: () => cidrv6,
  cuid: () => cuid,
  cuid2: () => cuid2,
  date: () => date,
  datetime: () => datetime,
  domain: () => domain,
  duration: () => duration,
  e164: () => e164,
  email: () => email,
  emoji: () => emoji,
  extendedDuration: () => extendedDuration,
  guid: () => guid,
  hex: () => hex,
  hostname: () => hostname,
  html5Email: () => html5Email,
  idnEmail: () => idnEmail,
  integer: () => integer,
  ipv4: () => ipv4,
  ipv6: () => ipv6,
  ksuid: () => ksuid,
  lowercase: () => lowercase,
  mac: () => mac,
  md5_base64: () => md5_base64,
  md5_base64url: () => md5_base64url,
  md5_hex: () => md5_hex,
  nanoid: () => nanoid,
  null: () => _null,
  number: () => number,
  rfc5322Email: () => rfc5322Email,
  sha1_base64: () => sha1_base64,
  sha1_base64url: () => sha1_base64url,
  sha1_hex: () => sha1_hex,
  sha256_base64: () => sha256_base64,
  sha256_base64url: () => sha256_base64url,
  sha256_hex: () => sha256_hex,
  sha384_base64: () => sha384_base64,
  sha384_base64url: () => sha384_base64url,
  sha384_hex: () => sha384_hex,
  sha512_base64: () => sha512_base64,
  sha512_base64url: () => sha512_base64url,
  sha512_hex: () => sha512_hex,
  string: () => string,
  time: () => time,
  ulid: () => ulid,
  undefined: () => _undefined,
  unicodeEmail: () => unicodeEmail,
  uppercase: () => uppercase,
  uuid: () => uuid,
  uuid4: () => uuid4,
  uuid6: () => uuid6,
  uuid7: () => uuid7,
  xid: () => xid
});
function emoji() {
  return new RegExp(_emoji, "u");
}
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
  const time3 = timeSource({ precision: args.precision });
  const opts = ["Z"];
  if (args.local)
    opts.push("");
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const timeRegex = `${time3}(?:${opts.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
function fixedBase64(bodyLength, padding) {
  return new RegExp(`^[A-Za-z0-9+/]{${bodyLength}}${padding}$`);
}
function fixedBase64url(length) {
  return new RegExp(`^[A-Za-z0-9_-]{${length}}$`);
}
var cuid, cuid2, ulid, xid, ksuid, nanoid, duration, extendedDuration, guid, uuid, uuid4, uuid6, uuid7, email, html5Email, rfc5322Email, unicodeEmail, idnEmail, browserEmail, _emoji, ipv4, ipv6, mac, cidrv4, cidrv6, base64, base64url, hostname, domain, e164, dateSource, date, string, bigint, integer, number, boolean, _null, _undefined, lowercase, uppercase, hex, md5_hex, md5_base64, md5_base64url, sha1_hex, sha1_base64, sha1_base64url, sha256_hex, sha256_base64, sha256_base64url, sha384_hex, sha384_base64, sha384_base64url, sha512_hex, sha512_base64, sha512_base64url;
var init_regexes = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/regexes.js"() {
    "use strict";
    init_util();
    cuid = /^[cC][^\s-]{8,}$/;
    cuid2 = /^[0-9a-z]+$/;
    ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
    xid = /^[0-9a-vA-V]{20}$/;
    ksuid = /^[A-Za-z0-9]{27}$/;
    nanoid = /^[a-zA-Z0-9_-]{21}$/;
    duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
    extendedDuration = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
    uuid = (version2) => {
      if (!version2)
        return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
      return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version2}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
    };
    uuid4 = /* @__PURE__ */ uuid(4);
    uuid6 = /* @__PURE__ */ uuid(6);
    uuid7 = /* @__PURE__ */ uuid(7);
    email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
    html5Email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    rfc5322Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    unicodeEmail = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u;
    idnEmail = unicodeEmail;
    browserEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
    mac = (delimiter) => {
      const escapedDelim = escapeRegex(delimiter ?? ":");
      return new RegExp(`^(?:[0-9A-F]{2}${escapedDelim}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${escapedDelim}){5}[0-9a-f]{2}$`);
    };
    cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
    cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
    base64url = /^[A-Za-z0-9_-]*$/;
    hostname = /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/;
    domain = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    e164 = /^\+[1-9]\d{6,14}$/;
    dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
    date = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
    string = (params) => {
      const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
      return new RegExp(`^${regex}$`);
    };
    bigint = /^-?\d+n?$/;
    integer = /^-?\d+$/;
    number = /^-?\d+(?:\.\d+)?$/;
    boolean = /^(?:true|false)$/i;
    _null = /^null$/i;
    _undefined = /^undefined$/i;
    lowercase = /^[^A-Z]*$/;
    uppercase = /^[^a-z]*$/;
    hex = /^[0-9a-fA-F]*$/;
    md5_hex = /^[0-9a-fA-F]{32}$/;
    md5_base64 = /* @__PURE__ */ fixedBase64(22, "==");
    md5_base64url = /* @__PURE__ */ fixedBase64url(22);
    sha1_hex = /^[0-9a-fA-F]{40}$/;
    sha1_base64 = /* @__PURE__ */ fixedBase64(27, "=");
    sha1_base64url = /* @__PURE__ */ fixedBase64url(27);
    sha256_hex = /^[0-9a-fA-F]{64}$/;
    sha256_base64 = /* @__PURE__ */ fixedBase64(43, "=");
    sha256_base64url = /* @__PURE__ */ fixedBase64url(43);
    sha384_hex = /^[0-9a-fA-F]{96}$/;
    sha384_base64 = /* @__PURE__ */ fixedBase64(64, "");
    sha384_base64url = /* @__PURE__ */ fixedBase64url(64);
    sha512_hex = /^[0-9a-fA-F]{128}$/;
    sha512_base64 = /* @__PURE__ */ fixedBase64(86, "==");
    sha512_base64url = /* @__PURE__ */ fixedBase64url(86);
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/checks.js
function handleCheckPropertyResult(result, payload, property) {
  if (result.issues.length) {
    payload.issues.push(...prefixIssues(property, result.issues));
  }
}
var $ZodCheck, numericOriginMap, $ZodCheckLessThan, $ZodCheckGreaterThan, $ZodCheckMultipleOf, $ZodCheckNumberFormat, $ZodCheckBigIntFormat, $ZodCheckMaxSize, $ZodCheckMinSize, $ZodCheckSizeEquals, $ZodCheckMaxLength, $ZodCheckMinLength, $ZodCheckLengthEquals, $ZodCheckStringFormat, $ZodCheckRegex, $ZodCheckLowerCase, $ZodCheckUpperCase, $ZodCheckIncludes, $ZodCheckStartsWith, $ZodCheckEndsWith, $ZodCheckProperty, $ZodCheckMimeType, $ZodCheckOverwrite;
var init_checks = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/checks.js"() {
    "use strict";
    init_core();
    init_regexes();
    init_util();
    $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
      var _a2;
      inst._zod ?? (inst._zod = {});
      inst._zod.def = def;
      (_a2 = inst._zod).onattach ?? (_a2.onattach = []);
    });
    numericOriginMap = {
      number: "number",
      bigint: "bigint",
      object: "date"
    };
    $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
      $ZodCheck.init(inst, def);
      const origin = numericOriginMap[typeof def.value];
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
        if (def.value < curr) {
          if (def.inclusive)
            bag.maximum = def.value;
          else
            bag.exclusiveMaximum = def.value;
        }
      });
      inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
          return;
        }
        payload.issues.push({
          origin,
          code: "too_big",
          maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
          input: payload.value,
          inclusive: def.inclusive,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
      $ZodCheck.init(inst, def);
      const origin = numericOriginMap[typeof def.value];
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
        if (def.value > curr) {
          if (def.inclusive)
            bag.minimum = def.value;
          else
            bag.exclusiveMinimum = def.value;
        }
      });
      inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
          return;
        }
        payload.issues.push({
          origin,
          code: "too_small",
          minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
          input: payload.value,
          inclusive: def.inclusive,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
      $ZodCheck.init(inst, def);
      inst._zod.onattach.push((inst2) => {
        var _a2;
        (_a2 = inst2._zod.bag).multipleOf ?? (_a2.multipleOf = def.value);
      });
      inst._zod.check = (payload) => {
        if (typeof payload.value !== typeof def.value)
          throw new Error("Cannot mix number and bigint in multiple_of check.");
        const isMultiple = typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
        if (isMultiple)
          return;
        payload.issues.push({
          origin: typeof payload.value,
          code: "not_multiple_of",
          divisor: def.value,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
      $ZodCheck.init(inst, def);
      def.format = def.format || "float64";
      const isInt = def.format?.includes("int");
      const origin = isInt ? "int" : "number";
      const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.format = def.format;
        bag.minimum = minimum;
        bag.maximum = maximum;
        if (isInt)
          bag.pattern = integer;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        if (isInt) {
          if (!Number.isInteger(input)) {
            payload.issues.push({
              expected: origin,
              format: def.format,
              code: "invalid_type",
              continue: false,
              input,
              inst
            });
            return;
          }
          if (!Number.isSafeInteger(input)) {
            if (input > 0) {
              payload.issues.push({
                input,
                code: "too_big",
                maximum: Number.MAX_SAFE_INTEGER,
                note: "Integers must be within the safe integer range.",
                inst,
                origin,
                inclusive: true,
                continue: !def.abort
              });
            } else {
              payload.issues.push({
                input,
                code: "too_small",
                minimum: Number.MIN_SAFE_INTEGER,
                note: "Integers must be within the safe integer range.",
                inst,
                origin,
                inclusive: true,
                continue: !def.abort
              });
            }
            return;
          }
        }
        if (input < minimum) {
          payload.issues.push({
            origin: "number",
            input,
            code: "too_small",
            minimum,
            inclusive: true,
            inst,
            continue: !def.abort
          });
        }
        if (input > maximum) {
          payload.issues.push({
            origin: "number",
            input,
            code: "too_big",
            maximum,
            inclusive: true,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    $ZodCheckBigIntFormat = /* @__PURE__ */ $constructor("$ZodCheckBigIntFormat", (inst, def) => {
      $ZodCheck.init(inst, def);
      const [minimum, maximum] = BIGINT_FORMAT_RANGES[def.format];
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.format = def.format;
        bag.minimum = minimum;
        bag.maximum = maximum;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        if (input < minimum) {
          payload.issues.push({
            origin: "bigint",
            input,
            code: "too_small",
            minimum,
            inclusive: true,
            inst,
            continue: !def.abort
          });
        }
        if (input > maximum) {
          payload.issues.push({
            origin: "bigint",
            input,
            code: "too_big",
            maximum,
            inclusive: true,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    $ZodCheckMaxSize = /* @__PURE__ */ $constructor("$ZodCheckMaxSize", (inst, def) => {
      var _a2;
      $ZodCheck.init(inst, def);
      (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.size !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        if (def.maximum < curr)
          inst2._zod.bag.maximum = def.maximum;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const size = input.size;
        if (size <= def.maximum)
          return;
        payload.issues.push({
          origin: getSizableOrigin(input),
          code: "too_big",
          maximum: def.maximum,
          inclusive: true,
          input,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckMinSize = /* @__PURE__ */ $constructor("$ZodCheckMinSize", (inst, def) => {
      var _a2;
      $ZodCheck.init(inst, def);
      (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.size !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        if (def.minimum > curr)
          inst2._zod.bag.minimum = def.minimum;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const size = input.size;
        if (size >= def.minimum)
          return;
        payload.issues.push({
          origin: getSizableOrigin(input),
          code: "too_small",
          minimum: def.minimum,
          inclusive: true,
          input,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckSizeEquals = /* @__PURE__ */ $constructor("$ZodCheckSizeEquals", (inst, def) => {
      var _a2;
      $ZodCheck.init(inst, def);
      (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.size !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.minimum = def.size;
        bag.maximum = def.size;
        bag.size = def.size;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const size = input.size;
        if (size === def.size)
          return;
        const tooBig = size > def.size;
        payload.issues.push({
          origin: getSizableOrigin(input),
          ...tooBig ? { code: "too_big", maximum: def.size } : { code: "too_small", minimum: def.size },
          inclusive: true,
          exact: true,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
      var _a2;
      $ZodCheck.init(inst, def);
      (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        if (def.maximum < curr)
          inst2._zod.bag.maximum = def.maximum;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length <= def.maximum)
          return;
        const origin = getLengthableOrigin(input);
        payload.issues.push({
          origin,
          code: "too_big",
          maximum: def.maximum,
          inclusive: true,
          input,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
      var _a2;
      $ZodCheck.init(inst, def);
      (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        if (def.minimum > curr)
          inst2._zod.bag.minimum = def.minimum;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length >= def.minimum)
          return;
        const origin = getLengthableOrigin(input);
        payload.issues.push({
          origin,
          code: "too_small",
          minimum: def.minimum,
          inclusive: true,
          input,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
      var _a2;
      $ZodCheck.init(inst, def);
      (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.minimum = def.length;
        bag.maximum = def.length;
        bag.length = def.length;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length === def.length)
          return;
        const origin = getLengthableOrigin(input);
        const tooBig = length > def.length;
        payload.issues.push({
          origin,
          ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
          inclusive: true,
          exact: true,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
      var _a2, _b;
      $ZodCheck.init(inst, def);
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.format = def.format;
        if (def.pattern) {
          bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
          bag.patterns.add(def.pattern);
        }
      });
      if (def.pattern)
        (_a2 = inst._zod).check ?? (_a2.check = (payload) => {
          def.pattern.lastIndex = 0;
          if (def.pattern.test(payload.value))
            return;
          payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: def.format,
            input: payload.value,
            ...def.pattern ? { pattern: def.pattern.toString() } : {},
            inst,
            continue: !def.abort
          });
        });
      else
        (_b = inst._zod).check ?? (_b.check = () => {
        });
    });
    $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
      $ZodCheckStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        def.pattern.lastIndex = 0;
        if (def.pattern.test(payload.value))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "regex",
          input: payload.value,
          pattern: def.pattern.toString(),
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
      def.pattern ?? (def.pattern = lowercase);
      $ZodCheckStringFormat.init(inst, def);
    });
    $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
      def.pattern ?? (def.pattern = uppercase);
      $ZodCheckStringFormat.init(inst, def);
    });
    $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
      $ZodCheck.init(inst, def);
      const escapedRegex = escapeRegex(def.includes);
      const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
      def.pattern = pattern;
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
        bag.patterns.add(pattern);
      });
      inst._zod.check = (payload) => {
        if (payload.value.includes(def.includes, def.position))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "includes",
          includes: def.includes,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
      $ZodCheck.init(inst, def);
      const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
      def.pattern ?? (def.pattern = pattern);
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
        bag.patterns.add(pattern);
      });
      inst._zod.check = (payload) => {
        if (payload.value.startsWith(def.prefix))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "starts_with",
          prefix: def.prefix,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
      $ZodCheck.init(inst, def);
      const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
      def.pattern ?? (def.pattern = pattern);
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
        bag.patterns.add(pattern);
      });
      inst._zod.check = (payload) => {
        if (payload.value.endsWith(def.suffix))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "ends_with",
          suffix: def.suffix,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckProperty = /* @__PURE__ */ $constructor("$ZodCheckProperty", (inst, def) => {
      $ZodCheck.init(inst, def);
      inst._zod.check = (payload) => {
        const result = def.schema._zod.run({
          value: payload.value[def.property],
          issues: []
        }, {});
        if (result instanceof Promise) {
          return result.then((result2) => handleCheckPropertyResult(result2, payload, def.property));
        }
        handleCheckPropertyResult(result, payload, def.property);
        return;
      };
    });
    $ZodCheckMimeType = /* @__PURE__ */ $constructor("$ZodCheckMimeType", (inst, def) => {
      $ZodCheck.init(inst, def);
      const mimeSet = new Set(def.mime);
      inst._zod.onattach.push((inst2) => {
        inst2._zod.bag.mime = def.mime;
      });
      inst._zod.check = (payload) => {
        if (mimeSet.has(payload.value.type))
          return;
        payload.issues.push({
          code: "invalid_value",
          values: def.mime,
          input: payload.value.type,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
      $ZodCheck.init(inst, def);
      inst._zod.check = (payload) => {
        payload.value = def.tx(payload.value);
      };
    });
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/doc.js
var Doc;
var init_doc = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/doc.js"() {
    "use strict";
    Doc = class {
      constructor(args = []) {
        this.content = [];
        this.indent = 0;
        if (this)
          this.args = args;
      }
      indented(fn) {
        this.indent += 1;
        fn(this);
        this.indent -= 1;
      }
      write(arg) {
        if (typeof arg === "function") {
          arg(this, { execution: "sync" });
          arg(this, { execution: "async" });
          return;
        }
        const content = arg;
        const lines = content.split("\n").filter((x) => x);
        const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
        const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
        for (const line of dedented) {
          this.content.push(line);
        }
      }
      compile() {
        const F = Function;
        const args = this?.args;
        const content = this?.content ?? [``];
        const lines = [...content.map((x) => `  ${x}`)];
        return new F(...args, lines.join("\n"));
      }
    };
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/versions.js
var version;
var init_versions = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/versions.js"() {
    "use strict";
    version = {
      major: 4,
      minor: 3,
      patch: 6
    };
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/schemas.js
function isValidBase64(data) {
  if (data === "")
    return true;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
function isValidBase64URL(data) {
  if (!base64url.test(data))
    return false;
  const base643 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base643.padEnd(Math.ceil(base643.length / 4) * 4, "=");
  return isValidBase64(padded);
}
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
function handlePropertyResult(result, final, key, input, isOptionalOut) {
  if (result.issues.length) {
    if (isOptionalOut && !(key in input)) {
      return;
    }
    final.issues.push(...prefixIssues(key, result.issues));
  }
  if (result.value === void 0) {
    if (key in input) {
      final.value[key] = void 0;
    }
  } else {
    final.value[key] = result.value;
  }
}
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  for (const k of keys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    keys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t = _catchall.def.type;
  const isOptionalOut = _catchall.optout === "optional";
  for (const key in input) {
    if (keySet.has(key))
      continue;
    if (t === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalOut)));
    } else {
      handlePropertyResult(r, payload, key, input, isOptionalOut);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
function handleExclusiveUnionResults(results, final, inst, ctx) {
  const successes = results.filter((r) => r.issues.length === 0);
  if (successes.length === 1) {
    final.value = successes[0].value;
    return final;
  }
  if (successes.length === 0) {
    final.issues.push({
      code: "invalid_union",
      input: final.value,
      inst,
      errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
    });
  } else {
    final.issues.push({
      code: "invalid_union",
      input: final.value,
      inst,
      errors: [],
      inclusive: false
    });
  }
  return final;
}
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  const unrecKeys = /* @__PURE__ */ new Map();
  let unrecIssue;
  for (const iss of left.issues) {
    if (iss.code === "unrecognized_keys") {
      unrecIssue ?? (unrecIssue = iss);
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).l = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  for (const iss of right.issues) {
    if (iss.code === "unrecognized_keys") {
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).r = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length && unrecIssue) {
    result.issues.push({ ...unrecIssue, keys: bothKeys });
  }
  if (aborted(result))
    return result;
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
function handleTupleResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
function handleMapResult(keyResult, valueResult, final, key, input, inst, ctx) {
  if (keyResult.issues.length) {
    if (propertyKeyTypes.has(typeof key)) {
      final.issues.push(...prefixIssues(key, keyResult.issues));
    } else {
      final.issues.push({
        code: "invalid_key",
        origin: "map",
        input,
        inst,
        issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config()))
      });
    }
  }
  if (valueResult.issues.length) {
    if (propertyKeyTypes.has(typeof key)) {
      final.issues.push(...prefixIssues(key, valueResult.issues));
    } else {
      final.issues.push({
        origin: "map",
        code: "invalid_element",
        input,
        inst,
        key,
        issues: valueResult.issues.map((iss) => finalizeIssue(iss, ctx, config()))
      });
    }
  }
  final.value.set(keyResult.value, valueResult.value);
}
function handleSetResult(result, final) {
  if (result.issues.length) {
    final.issues.push(...result.issues);
  }
  final.value.add(result.value);
}
function handleOptionalResult(result, input) {
  if (result.issues.length && input === void 0) {
    return { issues: [], value: void 0 };
  }
  return result;
}
function handleDefaultResult(payload, def) {
  if (payload.value === void 0) {
    payload.value = def.defaultValue;
  }
  return payload;
}
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === void 0) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
function handlePipeResult(left, next, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues }, ctx);
}
function handleCodecAResult(result, def, ctx) {
  if (result.issues.length) {
    result.aborted = true;
    return result;
  }
  const direction = ctx.direction || "forward";
  if (direction === "forward") {
    const transformed = def.transform(result.value, result);
    if (transformed instanceof Promise) {
      return transformed.then((value) => handleCodecTxResult(result, value, def.out, ctx));
    }
    return handleCodecTxResult(result, transformed, def.out, ctx);
  } else {
    const transformed = def.reverseTransform(result.value, result);
    if (transformed instanceof Promise) {
      return transformed.then((value) => handleCodecTxResult(result, value, def.in, ctx));
    }
    return handleCodecTxResult(result, transformed, def.in, ctx);
  }
}
function handleCodecTxResult(left, value, nextSchema, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return nextSchema._zod.run({ value, issues: left.issues }, ctx);
}
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value);
  return payload;
}
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      // incorporates params.error into issue reporting
      path: [...inst._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !inst._zod.def.abort
      // params: inst._zod.def.params,
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}
var $ZodType, $ZodString, $ZodStringFormat, $ZodGUID, $ZodUUID, $ZodEmail, $ZodURL, $ZodEmoji, $ZodNanoID, $ZodCUID, $ZodCUID2, $ZodULID, $ZodXID, $ZodKSUID, $ZodISODateTime, $ZodISODate, $ZodISOTime, $ZodISODuration, $ZodIPv4, $ZodIPv6, $ZodMAC, $ZodCIDRv4, $ZodCIDRv6, $ZodBase64, $ZodBase64URL, $ZodE164, $ZodJWT, $ZodCustomStringFormat, $ZodNumber, $ZodNumberFormat, $ZodBoolean, $ZodBigInt, $ZodBigIntFormat, $ZodSymbol, $ZodUndefined, $ZodNull, $ZodAny, $ZodUnknown, $ZodNever, $ZodVoid, $ZodDate, $ZodArray, $ZodObject, $ZodObjectJIT, $ZodUnion, $ZodXor, $ZodDiscriminatedUnion, $ZodIntersection, $ZodTuple, $ZodRecord, $ZodMap, $ZodSet, $ZodEnum, $ZodLiteral, $ZodFile, $ZodTransform, $ZodOptional, $ZodExactOptional, $ZodNullable, $ZodDefault, $ZodPrefault, $ZodNonOptional, $ZodSuccess, $ZodCatch, $ZodNaN, $ZodPipe, $ZodCodec, $ZodReadonly, $ZodTemplateLiteral, $ZodFunction, $ZodPromise, $ZodLazy, $ZodCustom;
var init_schemas = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/schemas.js"() {
    "use strict";
    init_checks();
    init_core();
    init_doc();
    init_parse();
    init_regexes();
    init_util();
    init_versions();
    init_util();
    $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
      var _a2;
      inst ?? (inst = {});
      inst._zod.def = def;
      inst._zod.bag = inst._zod.bag || {};
      inst._zod.version = version;
      const checks = [...inst._zod.def.checks ?? []];
      if (inst._zod.traits.has("$ZodCheck")) {
        checks.unshift(inst);
      }
      for (const ch of checks) {
        for (const fn of ch._zod.onattach) {
          fn(inst);
        }
      }
      if (checks.length === 0) {
        (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
        inst._zod.deferred?.push(() => {
          inst._zod.run = inst._zod.parse;
        });
      } else {
        const runChecks = (payload, checks2, ctx) => {
          let isAborted = aborted(payload);
          let asyncResult;
          for (const ch of checks2) {
            if (ch._zod.def.when) {
              const shouldRun = ch._zod.def.when(payload);
              if (!shouldRun)
                continue;
            } else if (isAborted) {
              continue;
            }
            const currLen = payload.issues.length;
            const _ = ch._zod.check(payload);
            if (_ instanceof Promise && ctx?.async === false) {
              throw new $ZodAsyncError();
            }
            if (asyncResult || _ instanceof Promise) {
              asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
                await _;
                const nextLen = payload.issues.length;
                if (nextLen === currLen)
                  return;
                if (!isAborted)
                  isAborted = aborted(payload, currLen);
              });
            } else {
              const nextLen = payload.issues.length;
              if (nextLen === currLen)
                continue;
              if (!isAborted)
                isAborted = aborted(payload, currLen);
            }
          }
          if (asyncResult) {
            return asyncResult.then(() => {
              return payload;
            });
          }
          return payload;
        };
        const handleCanaryResult = (canary, payload, ctx) => {
          if (aborted(canary)) {
            canary.aborted = true;
            return canary;
          }
          const checkResult = runChecks(payload, checks, ctx);
          if (checkResult instanceof Promise) {
            if (ctx.async === false)
              throw new $ZodAsyncError();
            return checkResult.then((checkResult2) => inst._zod.parse(checkResult2, ctx));
          }
          return inst._zod.parse(checkResult, ctx);
        };
        inst._zod.run = (payload, ctx) => {
          if (ctx.skipChecks) {
            return inst._zod.parse(payload, ctx);
          }
          if (ctx.direction === "backward") {
            const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
            if (canary instanceof Promise) {
              return canary.then((canary2) => {
                return handleCanaryResult(canary2, payload, ctx);
              });
            }
            return handleCanaryResult(canary, payload, ctx);
          }
          const result = inst._zod.parse(payload, ctx);
          if (result instanceof Promise) {
            if (ctx.async === false)
              throw new $ZodAsyncError();
            return result.then((result2) => runChecks(result2, checks, ctx));
          }
          return runChecks(result, checks, ctx);
        };
      }
      defineLazy(inst, "~standard", () => ({
        validate: (value) => {
          try {
            const r = safeParse(inst, value);
            return r.success ? { value: r.data } : { issues: r.error?.issues };
          } catch (_) {
            return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
          }
        },
        vendor: "zod",
        version: 1
      }));
    });
    $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
      inst._zod.parse = (payload, _) => {
        if (def.coerce)
          try {
            payload.value = String(payload.value);
          } catch (_2) {
          }
        if (typeof payload.value === "string")
          return payload;
        payload.issues.push({
          expected: "string",
          code: "invalid_type",
          input: payload.value,
          inst
        });
        return payload;
      };
    });
    $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
      $ZodCheckStringFormat.init(inst, def);
      $ZodString.init(inst, def);
    });
    $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
      def.pattern ?? (def.pattern = guid);
      $ZodStringFormat.init(inst, def);
    });
    $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
      if (def.version) {
        const versionMap = {
          v1: 1,
          v2: 2,
          v3: 3,
          v4: 4,
          v5: 5,
          v6: 6,
          v7: 7,
          v8: 8
        };
        const v = versionMap[def.version];
        if (v === void 0)
          throw new Error(`Invalid UUID version: "${def.version}"`);
        def.pattern ?? (def.pattern = uuid(v));
      } else
        def.pattern ?? (def.pattern = uuid());
      $ZodStringFormat.init(inst, def);
    });
    $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
      def.pattern ?? (def.pattern = email);
      $ZodStringFormat.init(inst, def);
    });
    $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
      $ZodStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        try {
          const trimmed = payload.value.trim();
          const url2 = new URL(trimmed);
          if (def.hostname) {
            def.hostname.lastIndex = 0;
            if (!def.hostname.test(url2.hostname)) {
              payload.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid hostname",
                pattern: def.hostname.source,
                input: payload.value,
                inst,
                continue: !def.abort
              });
            }
          }
          if (def.protocol) {
            def.protocol.lastIndex = 0;
            if (!def.protocol.test(url2.protocol.endsWith(":") ? url2.protocol.slice(0, -1) : url2.protocol)) {
              payload.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid protocol",
                pattern: def.protocol.source,
                input: payload.value,
                inst,
                continue: !def.abort
              });
            }
          }
          if (def.normalize) {
            payload.value = url2.href;
          } else {
            payload.value = trimmed;
          }
          return;
        } catch (_) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
      def.pattern ?? (def.pattern = emoji());
      $ZodStringFormat.init(inst, def);
    });
    $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
      def.pattern ?? (def.pattern = nanoid);
      $ZodStringFormat.init(inst, def);
    });
    $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
      def.pattern ?? (def.pattern = cuid);
      $ZodStringFormat.init(inst, def);
    });
    $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
      def.pattern ?? (def.pattern = cuid2);
      $ZodStringFormat.init(inst, def);
    });
    $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
      def.pattern ?? (def.pattern = ulid);
      $ZodStringFormat.init(inst, def);
    });
    $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
      def.pattern ?? (def.pattern = xid);
      $ZodStringFormat.init(inst, def);
    });
    $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
      def.pattern ?? (def.pattern = ksuid);
      $ZodStringFormat.init(inst, def);
    });
    $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
      def.pattern ?? (def.pattern = datetime(def));
      $ZodStringFormat.init(inst, def);
    });
    $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
      def.pattern ?? (def.pattern = date);
      $ZodStringFormat.init(inst, def);
    });
    $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
      def.pattern ?? (def.pattern = time(def));
      $ZodStringFormat.init(inst, def);
    });
    $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
      def.pattern ?? (def.pattern = duration);
      $ZodStringFormat.init(inst, def);
    });
    $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
      def.pattern ?? (def.pattern = ipv4);
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.format = `ipv4`;
    });
    $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
      def.pattern ?? (def.pattern = ipv6);
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.format = `ipv6`;
      inst._zod.check = (payload) => {
        try {
          new URL(`http://[${payload.value}]`);
        } catch {
          payload.issues.push({
            code: "invalid_format",
            format: "ipv6",
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    $ZodMAC = /* @__PURE__ */ $constructor("$ZodMAC", (inst, def) => {
      def.pattern ?? (def.pattern = mac(def.delimiter));
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.format = `mac`;
    });
    $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
      def.pattern ?? (def.pattern = cidrv4);
      $ZodStringFormat.init(inst, def);
    });
    $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
      def.pattern ?? (def.pattern = cidrv6);
      $ZodStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        const parts = payload.value.split("/");
        try {
          if (parts.length !== 2)
            throw new Error();
          const [address, prefix] = parts;
          if (!prefix)
            throw new Error();
          const prefixNum = Number(prefix);
          if (`${prefixNum}` !== prefix)
            throw new Error();
          if (prefixNum < 0 || prefixNum > 128)
            throw new Error();
          new URL(`http://[${address}]`);
        } catch {
          payload.issues.push({
            code: "invalid_format",
            format: "cidrv6",
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
      def.pattern ?? (def.pattern = base64);
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.contentEncoding = "base64";
      inst._zod.check = (payload) => {
        if (isValidBase64(payload.value))
          return;
        payload.issues.push({
          code: "invalid_format",
          format: "base64",
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
      def.pattern ?? (def.pattern = base64url);
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.contentEncoding = "base64url";
      inst._zod.check = (payload) => {
        if (isValidBase64URL(payload.value))
          return;
        payload.issues.push({
          code: "invalid_format",
          format: "base64url",
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
      def.pattern ?? (def.pattern = e164);
      $ZodStringFormat.init(inst, def);
    });
    $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
      $ZodStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        if (isValidJWT(payload.value, def.alg))
          return;
        payload.issues.push({
          code: "invalid_format",
          format: "jwt",
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCustomStringFormat = /* @__PURE__ */ $constructor("$ZodCustomStringFormat", (inst, def) => {
      $ZodStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        if (def.fn(payload.value))
          return;
        payload.issues.push({
          code: "invalid_format",
          format: def.format,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = inst._zod.bag.pattern ?? number;
      inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
          try {
            payload.value = Number(payload.value);
          } catch (_) {
          }
        const input = payload.value;
        if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
          return payload;
        }
        const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
        payload.issues.push({
          expected: "number",
          code: "invalid_type",
          input,
          inst,
          ...received ? { received } : {}
        });
        return payload;
      };
    });
    $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
      $ZodCheckNumberFormat.init(inst, def);
      $ZodNumber.init(inst, def);
    });
    $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = boolean;
      inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
          try {
            payload.value = Boolean(payload.value);
          } catch (_) {
          }
        const input = payload.value;
        if (typeof input === "boolean")
          return payload;
        payload.issues.push({
          expected: "boolean",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    $ZodBigInt = /* @__PURE__ */ $constructor("$ZodBigInt", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = bigint;
      inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
          try {
            payload.value = BigInt(payload.value);
          } catch (_) {
          }
        if (typeof payload.value === "bigint")
          return payload;
        payload.issues.push({
          expected: "bigint",
          code: "invalid_type",
          input: payload.value,
          inst
        });
        return payload;
      };
    });
    $ZodBigIntFormat = /* @__PURE__ */ $constructor("$ZodBigIntFormat", (inst, def) => {
      $ZodCheckBigIntFormat.init(inst, def);
      $ZodBigInt.init(inst, def);
    });
    $ZodSymbol = /* @__PURE__ */ $constructor("$ZodSymbol", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (typeof input === "symbol")
          return payload;
        payload.issues.push({
          expected: "symbol",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    $ZodUndefined = /* @__PURE__ */ $constructor("$ZodUndefined", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = _undefined;
      inst._zod.values = /* @__PURE__ */ new Set([void 0]);
      inst._zod.optin = "optional";
      inst._zod.optout = "optional";
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (typeof input === "undefined")
          return payload;
        payload.issues.push({
          expected: "undefined",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    $ZodNull = /* @__PURE__ */ $constructor("$ZodNull", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = _null;
      inst._zod.values = /* @__PURE__ */ new Set([null]);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (input === null)
          return payload;
        payload.issues.push({
          expected: "null",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    $ZodAny = /* @__PURE__ */ $constructor("$ZodAny", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload) => payload;
    });
    $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload) => payload;
    });
    $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        payload.issues.push({
          expected: "never",
          code: "invalid_type",
          input: payload.value,
          inst
        });
        return payload;
      };
    });
    $ZodVoid = /* @__PURE__ */ $constructor("$ZodVoid", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (typeof input === "undefined")
          return payload;
        payload.issues.push({
          expected: "void",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    $ZodDate = /* @__PURE__ */ $constructor("$ZodDate", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        if (def.coerce) {
          try {
            payload.value = new Date(payload.value);
          } catch (_err) {
          }
        }
        const input = payload.value;
        const isDate = input instanceof Date;
        const isValidDate = isDate && !Number.isNaN(input.getTime());
        if (isValidDate)
          return payload;
        payload.issues.push({
          expected: "date",
          code: "invalid_type",
          input,
          ...isDate ? { received: "Invalid Date" } : {},
          inst
        });
        return payload;
      };
    });
    $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!Array.isArray(input)) {
          payload.issues.push({
            expected: "array",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        payload.value = Array(input.length);
        const proms = [];
        for (let i = 0; i < input.length; i++) {
          const item = input[i];
          const result = def.element._zod.run({
            value: item,
            issues: []
          }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => handleArrayResult(result2, payload, i)));
          } else {
            handleArrayResult(result, payload, i);
          }
        }
        if (proms.length) {
          return Promise.all(proms).then(() => payload);
        }
        return payload;
      };
    });
    $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
      $ZodType.init(inst, def);
      const desc = Object.getOwnPropertyDescriptor(def, "shape");
      if (!desc?.get) {
        const sh = def.shape;
        Object.defineProperty(def, "shape", {
          get: () => {
            const newSh = { ...sh };
            Object.defineProperty(def, "shape", {
              value: newSh
            });
            return newSh;
          }
        });
      }
      const _normalized = cached(() => normalizeDef(def));
      defineLazy(inst._zod, "propValues", () => {
        const shape = def.shape;
        const propValues = {};
        for (const key in shape) {
          const field = shape[key]._zod;
          if (field.values) {
            propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
            for (const v of field.values)
              propValues[key].add(v);
          }
        }
        return propValues;
      });
      const isObject2 = isObject;
      const catchall = def.catchall;
      let value;
      inst._zod.parse = (payload, ctx) => {
        value ?? (value = _normalized.value);
        const input = payload.value;
        if (!isObject2(input)) {
          payload.issues.push({
            expected: "object",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        payload.value = {};
        const proms = [];
        const shape = value.shape;
        for (const key of value.keys) {
          const el = shape[key];
          const isOptionalOut = el._zod.optout === "optional";
          const r = el._zod.run({ value: input[key], issues: [] }, ctx);
          if (r instanceof Promise) {
            proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalOut)));
          } else {
            handlePropertyResult(r, payload, key, input, isOptionalOut);
          }
        }
        if (!catchall) {
          return proms.length ? Promise.all(proms).then(() => payload) : payload;
        }
        return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
      };
    });
    $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
      $ZodObject.init(inst, def);
      const superParse = inst._zod.parse;
      const _normalized = cached(() => normalizeDef(def));
      const generateFastpass = (shape) => {
        const doc = new Doc(["shape", "payload", "ctx"]);
        const normalized = _normalized.value;
        const parseStr = (key) => {
          const k = esc(key);
          return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
        };
        doc.write(`const input = payload.value;`);
        const ids = /* @__PURE__ */ Object.create(null);
        let counter = 0;
        for (const key of normalized.keys) {
          ids[key] = `key_${counter++}`;
        }
        doc.write(`const newResult = {};`);
        for (const key of normalized.keys) {
          const id = ids[key];
          const k = esc(key);
          const schema = shape[key];
          const isOptionalOut = schema?._zod?.optout === "optional";
          doc.write(`const ${id} = ${parseStr(key)};`);
          if (isOptionalOut) {
            doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
          } else {
            doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
          }
        }
        doc.write(`payload.value = newResult;`);
        doc.write(`return payload;`);
        const fn = doc.compile();
        return (payload, ctx) => fn(shape, payload, ctx);
      };
      let fastpass;
      const isObject2 = isObject;
      const jit = !globalConfig.jitless;
      const allowsEval2 = allowsEval;
      const fastEnabled = jit && allowsEval2.value;
      const catchall = def.catchall;
      let value;
      inst._zod.parse = (payload, ctx) => {
        value ?? (value = _normalized.value);
        const input = payload.value;
        if (!isObject2(input)) {
          payload.issues.push({
            expected: "object",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
          if (!fastpass)
            fastpass = generateFastpass(def.shape);
          payload = fastpass(payload, ctx);
          if (!catchall)
            return payload;
          return handleCatchall([], input, payload, ctx, value, inst);
        }
        return superParse(payload, ctx);
      };
    });
    $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
      defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
      defineLazy(inst._zod, "values", () => {
        if (def.options.every((o) => o._zod.values)) {
          return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
        }
        return void 0;
      });
      defineLazy(inst._zod, "pattern", () => {
        if (def.options.every((o) => o._zod.pattern)) {
          const patterns = def.options.map((o) => o._zod.pattern);
          return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
        }
        return void 0;
      });
      const single = def.options.length === 1;
      const first = def.options[0]._zod.run;
      inst._zod.parse = (payload, ctx) => {
        if (single) {
          return first(payload, ctx);
        }
        let async = false;
        const results = [];
        for (const option of def.options) {
          const result = option._zod.run({
            value: payload.value,
            issues: []
          }, ctx);
          if (result instanceof Promise) {
            results.push(result);
            async = true;
          } else {
            if (result.issues.length === 0)
              return result;
            results.push(result);
          }
        }
        if (!async)
          return handleUnionResults(results, payload, inst, ctx);
        return Promise.all(results).then((results2) => {
          return handleUnionResults(results2, payload, inst, ctx);
        });
      };
    });
    $ZodXor = /* @__PURE__ */ $constructor("$ZodXor", (inst, def) => {
      $ZodUnion.init(inst, def);
      def.inclusive = false;
      const single = def.options.length === 1;
      const first = def.options[0]._zod.run;
      inst._zod.parse = (payload, ctx) => {
        if (single) {
          return first(payload, ctx);
        }
        let async = false;
        const results = [];
        for (const option of def.options) {
          const result = option._zod.run({
            value: payload.value,
            issues: []
          }, ctx);
          if (result instanceof Promise) {
            results.push(result);
            async = true;
          } else {
            results.push(result);
          }
        }
        if (!async)
          return handleExclusiveUnionResults(results, payload, inst, ctx);
        return Promise.all(results).then((results2) => {
          return handleExclusiveUnionResults(results2, payload, inst, ctx);
        });
      };
    });
    $ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
      def.inclusive = false;
      $ZodUnion.init(inst, def);
      const _super = inst._zod.parse;
      defineLazy(inst._zod, "propValues", () => {
        const propValues = {};
        for (const option of def.options) {
          const pv = option._zod.propValues;
          if (!pv || Object.keys(pv).length === 0)
            throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
          for (const [k, v] of Object.entries(pv)) {
            if (!propValues[k])
              propValues[k] = /* @__PURE__ */ new Set();
            for (const val of v) {
              propValues[k].add(val);
            }
          }
        }
        return propValues;
      });
      const disc = cached(() => {
        const opts = def.options;
        const map2 = /* @__PURE__ */ new Map();
        for (const o of opts) {
          const values = o._zod.propValues?.[def.discriminator];
          if (!values || values.size === 0)
            throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
          for (const v of values) {
            if (map2.has(v)) {
              throw new Error(`Duplicate discriminator value "${String(v)}"`);
            }
            map2.set(v, o);
          }
        }
        return map2;
      });
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!isObject(input)) {
          payload.issues.push({
            code: "invalid_type",
            expected: "object",
            input,
            inst
          });
          return payload;
        }
        const opt = disc.value.get(input?.[def.discriminator]);
        if (opt) {
          return opt._zod.run(payload, ctx);
        }
        if (def.unionFallback) {
          return _super(payload, ctx);
        }
        payload.issues.push({
          code: "invalid_union",
          errors: [],
          note: "No matching discriminator",
          discriminator: def.discriminator,
          input,
          path: [def.discriminator],
          inst
        });
        return payload;
      };
    });
    $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        const left = def.left._zod.run({ value: input, issues: [] }, ctx);
        const right = def.right._zod.run({ value: input, issues: [] }, ctx);
        const async = left instanceof Promise || right instanceof Promise;
        if (async) {
          return Promise.all([left, right]).then(([left2, right2]) => {
            return handleIntersectionResults(payload, left2, right2);
          });
        }
        return handleIntersectionResults(payload, left, right);
      };
    });
    $ZodTuple = /* @__PURE__ */ $constructor("$ZodTuple", (inst, def) => {
      $ZodType.init(inst, def);
      const items = def.items;
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!Array.isArray(input)) {
          payload.issues.push({
            input,
            inst,
            expected: "tuple",
            code: "invalid_type"
          });
          return payload;
        }
        payload.value = [];
        const proms = [];
        const reversedIndex = [...items].reverse().findIndex((item) => item._zod.optin !== "optional");
        const optStart = reversedIndex === -1 ? 0 : items.length - reversedIndex;
        if (!def.rest) {
          const tooBig = input.length > items.length;
          const tooSmall = input.length < optStart - 1;
          if (tooBig || tooSmall) {
            payload.issues.push({
              ...tooBig ? { code: "too_big", maximum: items.length, inclusive: true } : { code: "too_small", minimum: items.length },
              input,
              inst,
              origin: "array"
            });
            return payload;
          }
        }
        let i = -1;
        for (const item of items) {
          i++;
          if (i >= input.length) {
            if (i >= optStart)
              continue;
          }
          const result = item._zod.run({
            value: input[i],
            issues: []
          }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => handleTupleResult(result2, payload, i)));
          } else {
            handleTupleResult(result, payload, i);
          }
        }
        if (def.rest) {
          const rest = input.slice(items.length);
          for (const el of rest) {
            i++;
            const result = def.rest._zod.run({
              value: el,
              issues: []
            }, ctx);
            if (result instanceof Promise) {
              proms.push(result.then((result2) => handleTupleResult(result2, payload, i)));
            } else {
              handleTupleResult(result, payload, i);
            }
          }
        }
        if (proms.length)
          return Promise.all(proms).then(() => payload);
        return payload;
      };
    });
    $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!isPlainObject(input)) {
          payload.issues.push({
            expected: "record",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        const proms = [];
        const values = def.keyType._zod.values;
        if (values) {
          payload.value = {};
          const recordKeys = /* @__PURE__ */ new Set();
          for (const key of values) {
            if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
              recordKeys.add(typeof key === "number" ? key.toString() : key);
              const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
              if (result instanceof Promise) {
                proms.push(result.then((result2) => {
                  if (result2.issues.length) {
                    payload.issues.push(...prefixIssues(key, result2.issues));
                  }
                  payload.value[key] = result2.value;
                }));
              } else {
                if (result.issues.length) {
                  payload.issues.push(...prefixIssues(key, result.issues));
                }
                payload.value[key] = result.value;
              }
            }
          }
          let unrecognized;
          for (const key in input) {
            if (!recordKeys.has(key)) {
              unrecognized = unrecognized ?? [];
              unrecognized.push(key);
            }
          }
          if (unrecognized && unrecognized.length > 0) {
            payload.issues.push({
              code: "unrecognized_keys",
              input,
              inst,
              keys: unrecognized
            });
          }
        } else {
          payload.value = {};
          for (const key of Reflect.ownKeys(input)) {
            if (key === "__proto__")
              continue;
            let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
            if (keyResult instanceof Promise) {
              throw new Error("Async schemas not supported in object keys currently");
            }
            const checkNumericKey = typeof key === "string" && number.test(key) && keyResult.issues.length;
            if (checkNumericKey) {
              const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
              if (retryResult instanceof Promise) {
                throw new Error("Async schemas not supported in object keys currently");
              }
              if (retryResult.issues.length === 0) {
                keyResult = retryResult;
              }
            }
            if (keyResult.issues.length) {
              if (def.mode === "loose") {
                payload.value[key] = input[key];
              } else {
                payload.issues.push({
                  code: "invalid_key",
                  origin: "record",
                  issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                  input: key,
                  path: [key],
                  inst
                });
              }
              continue;
            }
            const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
            if (result instanceof Promise) {
              proms.push(result.then((result2) => {
                if (result2.issues.length) {
                  payload.issues.push(...prefixIssues(key, result2.issues));
                }
                payload.value[keyResult.value] = result2.value;
              }));
            } else {
              if (result.issues.length) {
                payload.issues.push(...prefixIssues(key, result.issues));
              }
              payload.value[keyResult.value] = result.value;
            }
          }
        }
        if (proms.length) {
          return Promise.all(proms).then(() => payload);
        }
        return payload;
      };
    });
    $ZodMap = /* @__PURE__ */ $constructor("$ZodMap", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!(input instanceof Map)) {
          payload.issues.push({
            expected: "map",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        const proms = [];
        payload.value = /* @__PURE__ */ new Map();
        for (const [key, value] of input) {
          const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
          const valueResult = def.valueType._zod.run({ value, issues: [] }, ctx);
          if (keyResult instanceof Promise || valueResult instanceof Promise) {
            proms.push(Promise.all([keyResult, valueResult]).then(([keyResult2, valueResult2]) => {
              handleMapResult(keyResult2, valueResult2, payload, key, input, inst, ctx);
            }));
          } else {
            handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
          }
        }
        if (proms.length)
          return Promise.all(proms).then(() => payload);
        return payload;
      };
    });
    $ZodSet = /* @__PURE__ */ $constructor("$ZodSet", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!(input instanceof Set)) {
          payload.issues.push({
            input,
            inst,
            expected: "set",
            code: "invalid_type"
          });
          return payload;
        }
        const proms = [];
        payload.value = /* @__PURE__ */ new Set();
        for (const item of input) {
          const result = def.valueType._zod.run({ value: item, issues: [] }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => handleSetResult(result2, payload)));
          } else
            handleSetResult(result, payload);
        }
        if (proms.length)
          return Promise.all(proms).then(() => payload);
        return payload;
      };
    });
    $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
      $ZodType.init(inst, def);
      const values = getEnumValues(def.entries);
      const valuesSet = new Set(values);
      inst._zod.values = valuesSet;
      inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (valuesSet.has(input)) {
          return payload;
        }
        payload.issues.push({
          code: "invalid_value",
          values,
          input,
          inst
        });
        return payload;
      };
    });
    $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
      $ZodType.init(inst, def);
      if (def.values.length === 0) {
        throw new Error("Cannot create literal schema with no valid values");
      }
      const values = new Set(def.values);
      inst._zod.values = values;
      inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (values.has(input)) {
          return payload;
        }
        payload.issues.push({
          code: "invalid_value",
          values: def.values,
          input,
          inst
        });
        return payload;
      };
    });
    $ZodFile = /* @__PURE__ */ $constructor("$ZodFile", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (input instanceof File)
          return payload;
        payload.issues.push({
          expected: "file",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          throw new $ZodEncodeError(inst.constructor.name);
        }
        const _out = def.transform(payload.value, payload);
        if (ctx.async) {
          const output = _out instanceof Promise ? _out : Promise.resolve(_out);
          return output.then((output2) => {
            payload.value = output2;
            return payload;
          });
        }
        if (_out instanceof Promise) {
          throw new $ZodAsyncError();
        }
        payload.value = _out;
        return payload;
      };
    });
    $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      inst._zod.optout = "optional";
      defineLazy(inst._zod, "values", () => {
        return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
      });
      defineLazy(inst._zod, "pattern", () => {
        const pattern = def.innerType._zod.pattern;
        return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
      });
      inst._zod.parse = (payload, ctx) => {
        if (def.innerType._zod.optin === "optional") {
          const result = def.innerType._zod.run(payload, ctx);
          if (result instanceof Promise)
            return result.then((r) => handleOptionalResult(r, payload.value));
          return handleOptionalResult(result, payload.value);
        }
        if (payload.value === void 0) {
          return payload;
        }
        return def.innerType._zod.run(payload, ctx);
      };
    });
    $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
      $ZodOptional.init(inst, def);
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
      inst._zod.parse = (payload, ctx) => {
        return def.innerType._zod.run(payload, ctx);
      };
    });
    $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
      defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
      defineLazy(inst._zod, "pattern", () => {
        const pattern = def.innerType._zod.pattern;
        return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
      });
      defineLazy(inst._zod, "values", () => {
        return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
      });
      inst._zod.parse = (payload, ctx) => {
        if (payload.value === null)
          return payload;
        return def.innerType._zod.run(payload, ctx);
      };
    });
    $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }
        if (payload.value === void 0) {
          payload.value = def.defaultValue;
          return payload;
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((result2) => handleDefaultResult(result2, def));
        }
        return handleDefaultResult(result, def);
      };
    });
    $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }
        if (payload.value === void 0) {
          payload.value = def.defaultValue;
        }
        return def.innerType._zod.run(payload, ctx);
      };
    });
    $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "values", () => {
        const v = def.innerType._zod.values;
        return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
      });
      inst._zod.parse = (payload, ctx) => {
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((result2) => handleNonOptionalResult(result2, inst));
        }
        return handleNonOptionalResult(result, inst);
      };
    });
    $ZodSuccess = /* @__PURE__ */ $constructor("$ZodSuccess", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          throw new $ZodEncodeError("ZodSuccess");
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((result2) => {
            payload.value = result2.issues.length === 0;
            return payload;
          });
        }
        payload.value = result.issues.length === 0;
        return payload;
      };
    });
    $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
      defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((result2) => {
            payload.value = result2.value;
            if (result2.issues.length) {
              payload.value = def.catchValue({
                ...payload,
                error: {
                  issues: result2.issues.map((iss) => finalizeIssue(iss, ctx, config()))
                },
                input: payload.value
              });
              payload.issues = [];
            }
            return payload;
          });
        }
        payload.value = result.value;
        if (result.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
            },
            input: payload.value
          });
          payload.issues = [];
        }
        return payload;
      };
    });
    $ZodNaN = /* @__PURE__ */ $constructor("$ZodNaN", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        if (typeof payload.value !== "number" || !Number.isNaN(payload.value)) {
          payload.issues.push({
            input: payload.value,
            inst,
            expected: "nan",
            code: "invalid_type"
          });
          return payload;
        }
        return payload;
      };
    });
    $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "values", () => def.in._zod.values);
      defineLazy(inst._zod, "optin", () => def.in._zod.optin);
      defineLazy(inst._zod, "optout", () => def.out._zod.optout);
      defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          const right = def.out._zod.run(payload, ctx);
          if (right instanceof Promise) {
            return right.then((right2) => handlePipeResult(right2, def.in, ctx));
          }
          return handlePipeResult(right, def.in, ctx);
        }
        const left = def.in._zod.run(payload, ctx);
        if (left instanceof Promise) {
          return left.then((left2) => handlePipeResult(left2, def.out, ctx));
        }
        return handlePipeResult(left, def.out, ctx);
      };
    });
    $ZodCodec = /* @__PURE__ */ $constructor("$ZodCodec", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "values", () => def.in._zod.values);
      defineLazy(inst._zod, "optin", () => def.in._zod.optin);
      defineLazy(inst._zod, "optout", () => def.out._zod.optout);
      defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
      inst._zod.parse = (payload, ctx) => {
        const direction = ctx.direction || "forward";
        if (direction === "forward") {
          const left = def.in._zod.run(payload, ctx);
          if (left instanceof Promise) {
            return left.then((left2) => handleCodecAResult(left2, def, ctx));
          }
          return handleCodecAResult(left, def, ctx);
        } else {
          const right = def.out._zod.run(payload, ctx);
          if (right instanceof Promise) {
            return right.then((right2) => handleCodecAResult(right2, def, ctx));
          }
          return handleCodecAResult(right, def, ctx);
        }
      };
    });
    $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
      defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then(handleReadonlyResult);
        }
        return handleReadonlyResult(result);
      };
    });
    $ZodTemplateLiteral = /* @__PURE__ */ $constructor("$ZodTemplateLiteral", (inst, def) => {
      $ZodType.init(inst, def);
      const regexParts = [];
      for (const part of def.parts) {
        if (typeof part === "object" && part !== null) {
          if (!part._zod.pattern) {
            throw new Error(`Invalid template literal part, no pattern found: ${[...part._zod.traits].shift()}`);
          }
          const source = part._zod.pattern instanceof RegExp ? part._zod.pattern.source : part._zod.pattern;
          if (!source)
            throw new Error(`Invalid template literal part: ${part._zod.traits}`);
          const start = source.startsWith("^") ? 1 : 0;
          const end = source.endsWith("$") ? source.length - 1 : source.length;
          regexParts.push(source.slice(start, end));
        } else if (part === null || primitiveTypes.has(typeof part)) {
          regexParts.push(escapeRegex(`${part}`));
        } else {
          throw new Error(`Invalid template literal part: ${part}`);
        }
      }
      inst._zod.pattern = new RegExp(`^${regexParts.join("")}$`);
      inst._zod.parse = (payload, _ctx) => {
        if (typeof payload.value !== "string") {
          payload.issues.push({
            input: payload.value,
            inst,
            expected: "string",
            code: "invalid_type"
          });
          return payload;
        }
        inst._zod.pattern.lastIndex = 0;
        if (!inst._zod.pattern.test(payload.value)) {
          payload.issues.push({
            input: payload.value,
            inst,
            code: "invalid_format",
            format: def.format ?? "template_literal",
            pattern: inst._zod.pattern.source
          });
          return payload;
        }
        return payload;
      };
    });
    $ZodFunction = /* @__PURE__ */ $constructor("$ZodFunction", (inst, def) => {
      $ZodType.init(inst, def);
      inst._def = def;
      inst._zod.def = def;
      inst.implement = (func) => {
        if (typeof func !== "function") {
          throw new Error("implement() must be called with a function");
        }
        return function(...args) {
          const parsedArgs = inst._def.input ? parse(inst._def.input, args) : args;
          const result = Reflect.apply(func, this, parsedArgs);
          if (inst._def.output) {
            return parse(inst._def.output, result);
          }
          return result;
        };
      };
      inst.implementAsync = (func) => {
        if (typeof func !== "function") {
          throw new Error("implementAsync() must be called with a function");
        }
        return async function(...args) {
          const parsedArgs = inst._def.input ? await parseAsync(inst._def.input, args) : args;
          const result = await Reflect.apply(func, this, parsedArgs);
          if (inst._def.output) {
            return await parseAsync(inst._def.output, result);
          }
          return result;
        };
      };
      inst._zod.parse = (payload, _ctx) => {
        if (typeof payload.value !== "function") {
          payload.issues.push({
            code: "invalid_type",
            expected: "function",
            input: payload.value,
            inst
          });
          return payload;
        }
        const hasPromiseOutput = inst._def.output && inst._def.output._zod.def.type === "promise";
        if (hasPromiseOutput) {
          payload.value = inst.implementAsync(payload.value);
        } else {
          payload.value = inst.implement(payload.value);
        }
        return payload;
      };
      inst.input = (...args) => {
        const F = inst.constructor;
        if (Array.isArray(args[0])) {
          return new F({
            type: "function",
            input: new $ZodTuple({
              type: "tuple",
              items: args[0],
              rest: args[1]
            }),
            output: inst._def.output
          });
        }
        return new F({
          type: "function",
          input: args[0],
          output: inst._def.output
        });
      };
      inst.output = (output) => {
        const F = inst.constructor;
        return new F({
          type: "function",
          input: inst._def.input,
          output
        });
      };
      return inst;
    });
    $ZodPromise = /* @__PURE__ */ $constructor("$ZodPromise", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        return Promise.resolve(payload.value).then((inner) => def.innerType._zod.run({ value: inner, issues: [] }, ctx));
      };
    });
    $ZodLazy = /* @__PURE__ */ $constructor("$ZodLazy", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "innerType", () => def.getter());
      defineLazy(inst._zod, "pattern", () => inst._zod.innerType?._zod?.pattern);
      defineLazy(inst._zod, "propValues", () => inst._zod.innerType?._zod?.propValues);
      defineLazy(inst._zod, "optin", () => inst._zod.innerType?._zod?.optin ?? void 0);
      defineLazy(inst._zod, "optout", () => inst._zod.innerType?._zod?.optout ?? void 0);
      inst._zod.parse = (payload, ctx) => {
        const inner = inst._zod.innerType;
        return inner._zod.run(payload, ctx);
      };
    });
    $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
      $ZodCheck.init(inst, def);
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _) => {
        return payload;
      };
      inst._zod.check = (payload) => {
        const input = payload.value;
        const r = def.fn(input);
        if (r instanceof Promise) {
          return r.then((r2) => handleRefineResult(r2, payload, input, inst));
        }
        handleRefineResult(r, payload, input, inst);
        return;
      };
    });
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ar.js
var init_ar = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ar.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/az.js
var init_az = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/az.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/be.js
var init_be = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/be.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/bg.js
var init_bg = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/bg.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ca.js
var init_ca = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ca.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/cs.js
var init_cs = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/cs.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/da.js
var init_da = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/da.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/de.js
var init_de = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/de.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/en.js
function en_default() {
  return {
    localeError: error()
  };
}
var error;
var init_en = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/en.js"() {
    "use strict";
    init_util();
    error = () => {
      const Sizable = {
        string: { unit: "characters", verb: "to have" },
        file: { unit: "bytes", verb: "to have" },
        array: { unit: "items", verb: "to have" },
        set: { unit: "items", verb: "to have" },
        map: { unit: "entries", verb: "to have" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "input",
        email: "email address",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO datetime",
        date: "ISO date",
        time: "ISO time",
        duration: "ISO duration",
        ipv4: "IPv4 address",
        ipv6: "IPv6 address",
        mac: "MAC address",
        cidrv4: "IPv4 range",
        cidrv6: "IPv6 range",
        base64: "base64-encoded string",
        base64url: "base64url-encoded string",
        json_string: "JSON string",
        e164: "E.164 number",
        jwt: "JWT",
        template_literal: "input"
      };
      const TypeDictionary = {
        // Compatibility: "nan" -> "NaN" for display
        nan: "NaN"
        // All other type names omitted - they fall back to raw values via ?? operator
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            return `Invalid input: expected ${expected}, received ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Invalid input: expected ${stringifyPrimitive(issue2.values[0])}`;
            return `Invalid option: expected one of ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Too big: expected ${issue2.origin ?? "value"} to have ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elements"}`;
            return `Too big: expected ${issue2.origin ?? "value"} to be ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Too small: expected ${issue2.origin} to have ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Too small: expected ${issue2.origin} to be ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `Invalid string: must start with "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `Invalid string: must end with "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Invalid string: must include "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Invalid string: must match pattern ${_issue.pattern}`;
            return `Invalid ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Invalid number: must be a multiple of ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Unrecognized key${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Invalid key in ${issue2.origin}`;
          case "invalid_union":
            return "Invalid input";
          case "invalid_element":
            return `Invalid value in ${issue2.origin}`;
          default:
            return `Invalid input`;
        }
      };
    };
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/eo.js
var init_eo = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/eo.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/es.js
var init_es = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/es.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/fa.js
var init_fa = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/fa.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/fi.js
var init_fi = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/fi.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/fr.js
var init_fr = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/fr.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/fr-CA.js
var init_fr_CA = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/fr-CA.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/he.js
var init_he = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/he.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/hu.js
var init_hu = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/hu.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/hy.js
var init_hy = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/hy.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/id.js
var init_id = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/id.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/is.js
var init_is = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/is.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/it.js
var init_it = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/it.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ja.js
var init_ja = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ja.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ka.js
var init_ka = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ka.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/km.js
var init_km = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/km.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/kh.js
var init_kh = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/kh.js"() {
    "use strict";
    init_km();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ko.js
var init_ko = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ko.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/lt.js
var init_lt = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/lt.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/mk.js
var init_mk = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/mk.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ms.js
var init_ms = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ms.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/nl.js
var init_nl = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/nl.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/no.js
var init_no = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/no.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ota.js
var init_ota = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ota.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ps.js
var init_ps = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ps.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/pl.js
var init_pl = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/pl.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/pt.js
var init_pt = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/pt.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ru.js
var init_ru = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ru.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/sl.js
var init_sl = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/sl.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/sv.js
var init_sv = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/sv.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ta.js
var init_ta = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ta.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/th.js
var init_th = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/th.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/tr.js
var init_tr = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/tr.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/uk.js
var init_uk = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/uk.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ua.js
var init_ua = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ua.js"() {
    "use strict";
    init_uk();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ur.js
var init_ur = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/ur.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/uz.js
var init_uz = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/uz.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/vi.js
var init_vi = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/vi.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/zh-CN.js
var init_zh_CN = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/zh-CN.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/zh-TW.js
var init_zh_TW = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/zh-TW.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/yo.js
var init_yo = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/yo.js"() {
    "use strict";
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/index.js
var init_locales = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/locales/index.js"() {
    "use strict";
    init_ar();
    init_az();
    init_be();
    init_bg();
    init_ca();
    init_cs();
    init_da();
    init_de();
    init_en();
    init_eo();
    init_es();
    init_fa();
    init_fi();
    init_fr();
    init_fr_CA();
    init_he();
    init_hu();
    init_hy();
    init_id();
    init_is();
    init_it();
    init_ja();
    init_ka();
    init_kh();
    init_km();
    init_ko();
    init_lt();
    init_mk();
    init_ms();
    init_nl();
    init_no();
    init_ota();
    init_ps();
    init_pl();
    init_pt();
    init_ru();
    init_sl();
    init_sv();
    init_ta();
    init_th();
    init_tr();
    init_ua();
    init_uk();
    init_ur();
    init_uz();
    init_vi();
    init_zh_CN();
    init_zh_TW();
    init_yo();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/registries.js
function registry() {
  return new $ZodRegistry();
}
var _a, $ZodRegistry, globalRegistry;
var init_registries = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/registries.js"() {
    "use strict";
    $ZodRegistry = class {
      constructor() {
        this._map = /* @__PURE__ */ new WeakMap();
        this._idmap = /* @__PURE__ */ new Map();
      }
      add(schema, ..._meta) {
        const meta3 = _meta[0];
        this._map.set(schema, meta3);
        if (meta3 && typeof meta3 === "object" && "id" in meta3) {
          this._idmap.set(meta3.id, schema);
        }
        return this;
      }
      clear() {
        this._map = /* @__PURE__ */ new WeakMap();
        this._idmap = /* @__PURE__ */ new Map();
        return this;
      }
      remove(schema) {
        const meta3 = this._map.get(schema);
        if (meta3 && typeof meta3 === "object" && "id" in meta3) {
          this._idmap.delete(meta3.id);
        }
        this._map.delete(schema);
        return this;
      }
      get(schema) {
        const p = schema._zod.parent;
        if (p) {
          const pm = { ...this.get(p) ?? {} };
          delete pm.id;
          const f = { ...pm, ...this._map.get(schema) };
          return Object.keys(f).length ? f : void 0;
        }
        return this._map.get(schema);
      }
      has(schema) {
        return this._map.has(schema);
      }
    };
    (_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
    globalRegistry = globalThis.__zod_globalRegistry;
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/api.js
// @__NO_SIDE_EFFECTS__
function _string(Class2, params) {
  return new Class2({
    type: "string",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _email(Class2, params) {
  return new Class2({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _guid(Class2, params) {
  return new Class2({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv7(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _url(Class2, params) {
  return new Class2({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _emoji2(Class2, params) {
  return new Class2({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _nanoid(Class2, params) {
  return new Class2({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cuid2(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ulid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _xid(Class2, params) {
  return new Class2({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ksuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ipv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ipv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _mac(Class2, params) {
  return new Class2({
    type: "string",
    format: "mac",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cidrv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cidrv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _base64(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _base64url(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _e164(Class2, params) {
  return new Class2({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _jwt(Class2, params) {
  return new Class2({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDateTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDate(Class2, params) {
  return new Class2({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDuration(Class2, params) {
  return new Class2({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _number(Class2, params) {
  return new Class2({
    type: "number",
    checks: [],
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _int(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _float32(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "float32",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _float64(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "float64",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _int32(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "int32",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uint32(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "uint32",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _boolean(Class2, params) {
  return new Class2({
    type: "boolean",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _bigint(Class2, params) {
  return new Class2({
    type: "bigint",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _int64(Class2, params) {
  return new Class2({
    type: "bigint",
    check: "bigint_format",
    abort: false,
    format: "int64",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uint64(Class2, params) {
  return new Class2({
    type: "bigint",
    check: "bigint_format",
    abort: false,
    format: "uint64",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _symbol(Class2, params) {
  return new Class2({
    type: "symbol",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _undefined2(Class2, params) {
  return new Class2({
    type: "undefined",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _null2(Class2, params) {
  return new Class2({
    type: "null",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _any(Class2) {
  return new Class2({
    type: "any"
  });
}
// @__NO_SIDE_EFFECTS__
function _unknown(Class2) {
  return new Class2({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function _never(Class2, params) {
  return new Class2({
    type: "never",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _void(Class2, params) {
  return new Class2({
    type: "void",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _date(Class2, params) {
  return new Class2({
    type: "date",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _nan(Class2, params) {
  return new Class2({
    type: "nan",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
// @__NO_SIDE_EFFECTS__
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
// @__NO_SIDE_EFFECTS__
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
// @__NO_SIDE_EFFECTS__
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
// @__NO_SIDE_EFFECTS__
function _positive(params) {
  return /* @__PURE__ */ _gt(0, params);
}
// @__NO_SIDE_EFFECTS__
function _negative(params) {
  return /* @__PURE__ */ _lt(0, params);
}
// @__NO_SIDE_EFFECTS__
function _nonpositive(params) {
  return /* @__PURE__ */ _lte(0, params);
}
// @__NO_SIDE_EFFECTS__
function _nonnegative(params) {
  return /* @__PURE__ */ _gte(0, params);
}
// @__NO_SIDE_EFFECTS__
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
// @__NO_SIDE_EFFECTS__
function _maxSize(maximum, params) {
  return new $ZodCheckMaxSize({
    check: "max_size",
    ...normalizeParams(params),
    maximum
  });
}
// @__NO_SIDE_EFFECTS__
function _minSize(minimum, params) {
  return new $ZodCheckMinSize({
    check: "min_size",
    ...normalizeParams(params),
    minimum
  });
}
// @__NO_SIDE_EFFECTS__
function _size(size, params) {
  return new $ZodCheckSizeEquals({
    check: "size_equals",
    ...normalizeParams(params),
    size
  });
}
// @__NO_SIDE_EFFECTS__
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
// @__NO_SIDE_EFFECTS__
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
// @__NO_SIDE_EFFECTS__
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
// @__NO_SIDE_EFFECTS__
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
// @__NO_SIDE_EFFECTS__
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
// @__NO_SIDE_EFFECTS__
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
// @__NO_SIDE_EFFECTS__
function _property(property, schema, params) {
  return new $ZodCheckProperty({
    check: "property",
    property,
    schema,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _mime(types, params) {
  return new $ZodCheckMimeType({
    check: "mime_type",
    mime: types,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
// @__NO_SIDE_EFFECTS__
function _normalize(form) {
  return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
// @__NO_SIDE_EFFECTS__
function _trim() {
  return /* @__PURE__ */ _overwrite((input) => input.trim());
}
// @__NO_SIDE_EFFECTS__
function _toLowerCase() {
  return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function _toUpperCase() {
  return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function _slugify() {
  return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
// @__NO_SIDE_EFFECTS__
function _array(Class2, element, params) {
  return new Class2({
    type: "array",
    element,
    // get element() {
    //   return element;
    // },
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _file(Class2, params) {
  return new Class2({
    type: "file",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _custom(Class2, fn, _params) {
  const norm = normalizeParams(_params);
  norm.abort ?? (norm.abort = true);
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...norm
  });
  return schema;
}
// @__NO_SIDE_EFFECTS__
function _refine(Class2, fn, _params) {
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
// @__NO_SIDE_EFFECTS__
function _superRefine(fn) {
  const ch = /* @__PURE__ */ _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  });
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}
// @__NO_SIDE_EFFECTS__
function describe(description) {
  const ch = new $ZodCheck({ check: "describe" });
  ch._zod.onattach = [
    (inst) => {
      const existing = globalRegistry.get(inst) ?? {};
      globalRegistry.add(inst, { ...existing, description });
    }
  ];
  ch._zod.check = () => {
  };
  return ch;
}
// @__NO_SIDE_EFFECTS__
function meta(metadata) {
  const ch = new $ZodCheck({ check: "meta" });
  ch._zod.onattach = [
    (inst) => {
      const existing = globalRegistry.get(inst) ?? {};
      globalRegistry.add(inst, { ...existing, ...metadata });
    }
  ];
  ch._zod.check = () => {
  };
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _stringbool(Classes, _params) {
  const params = normalizeParams(_params);
  let truthyArray = params.truthy ?? ["true", "1", "yes", "on", "y", "enabled"];
  let falsyArray = params.falsy ?? ["false", "0", "no", "off", "n", "disabled"];
  if (params.case !== "sensitive") {
    truthyArray = truthyArray.map((v) => typeof v === "string" ? v.toLowerCase() : v);
    falsyArray = falsyArray.map((v) => typeof v === "string" ? v.toLowerCase() : v);
  }
  const truthySet = new Set(truthyArray);
  const falsySet = new Set(falsyArray);
  const _Codec = Classes.Codec ?? $ZodCodec;
  const _Boolean = Classes.Boolean ?? $ZodBoolean;
  const _String = Classes.String ?? $ZodString;
  const stringSchema = new _String({ type: "string", error: params.error });
  const booleanSchema = new _Boolean({ type: "boolean", error: params.error });
  const codec2 = new _Codec({
    type: "pipe",
    in: stringSchema,
    out: booleanSchema,
    transform: ((input, payload) => {
      let data = input;
      if (params.case !== "sensitive")
        data = data.toLowerCase();
      if (truthySet.has(data)) {
        return true;
      } else if (falsySet.has(data)) {
        return false;
      } else {
        payload.issues.push({
          code: "invalid_value",
          expected: "stringbool",
          values: [...truthySet, ...falsySet],
          input: payload.value,
          inst: codec2,
          continue: false
        });
        return {};
      }
    }),
    reverseTransform: ((input, _payload) => {
      if (input === true) {
        return truthyArray[0] || "true";
      } else {
        return falsyArray[0] || "false";
      }
    }),
    error: params.error
  });
  return codec2;
}
// @__NO_SIDE_EFFECTS__
function _stringFormat(Class2, format, fnOrRegex, _params = {}) {
  const params = normalizeParams(_params);
  const def = {
    ...normalizeParams(_params),
    check: "string_format",
    type: "string",
    format,
    fn: typeof fnOrRegex === "function" ? fnOrRegex : (val) => fnOrRegex.test(val),
    ...params
  };
  if (fnOrRegex instanceof RegExp) {
    def.pattern = fnOrRegex;
  }
  const inst = new Class2(def);
  return inst;
}
var init_api = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/api.js"() {
    "use strict";
    init_checks();
    init_registries();
    init_schemas();
    init_util();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {
    }),
    io: params?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? void 0
  };
}
function process2(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a2;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: void 0, path: _params.path };
  ctx.seen.set(schema, result);
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result.ref)
        result.ref = parent;
      process2(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta3 = ctx.metadataRegistry.get(schema);
  if (meta3)
    Object.assign(result.schema, meta3);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && result.schema._prefault)
    (_a2 = result.schema).default ?? (_a2.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const idToSchema = /* @__PURE__ */ new Map();
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0]) {
        throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      }
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id2) => id2);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
    }
    if (entry[1] === root) {
      return { ref: "#" };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + defId };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema2 = seen.schema;
    for (const key in schema2) {
      delete schema2[key];
    }
    schema2.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null)
      return;
    const schema2 = seen.def ?? seen.schema;
    const _cached = { ...schema2 };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema2.allOf = schema2.allOf ?? [];
        schema2.allOf.push(refSchema);
      } else {
        Object.assign(schema2, refSchema);
      }
      Object.assign(schema2, _cached);
      const isParentRef = zodSchema._zod.parent === ref;
      if (isParentRef) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (!(key in _cached)) {
            delete schema2[key];
          }
        }
      }
      if (refSchema.$ref && refSeen.def) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (key in refSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(refSeen.def[key])) {
            delete schema2[key];
          }
        }
      }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema2.$ref = parentSeen.schema.$ref;
        if (parentSeen.def) {
          for (const key in schema2) {
            if (key === "$ref" || key === "allOf")
              continue;
            if (key in parentSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(parentSeen.def[key])) {
              delete schema2[key];
            }
          }
        }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema2,
      path: seen.path ?? []
    });
  };
  for (const entry of [...ctx.seen.entries()].reverse()) {
    flattenRef(entry[0]);
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {
  } else {
  }
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  Object.assign(result, root.def ?? root.schema);
  const defs = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) {
      defs[seen.defId] = seen.def;
    }
  }
  if (ctx.external) {
  } else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod, createStandardJSONSchemaMethod;
var init_to_json_schema = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/to-json-schema.js"() {
    "use strict";
    init_registries();
    createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
      const ctx = initializeContext({ ...params, processors });
      process2(schema, ctx);
      extractDefs(ctx, schema);
      return finalize(ctx, schema);
    };
    createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
      const { libraryOptions, target } = params ?? {};
      const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
      process2(schema, ctx);
      extractDefs(ctx, schema);
      return finalize(ctx, schema);
    };
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/json-schema-processors.js
var formatMap, stringProcessor, numberProcessor, booleanProcessor, bigintProcessor, symbolProcessor, nullProcessor, undefinedProcessor, voidProcessor, neverProcessor, anyProcessor, unknownProcessor, dateProcessor, enumProcessor, literalProcessor, nanProcessor, templateLiteralProcessor, fileProcessor, successProcessor, customProcessor, functionProcessor, transformProcessor, mapProcessor, setProcessor, arrayProcessor, objectProcessor, unionProcessor, intersectionProcessor, tupleProcessor, recordProcessor, nullableProcessor, nonoptionalProcessor, defaultProcessor, prefaultProcessor, catchProcessor, pipeProcessor, readonlyProcessor, promiseProcessor, optionalProcessor, lazyProcessor;
var init_json_schema_processors = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/json-schema-processors.js"() {
    "use strict";
    init_to_json_schema();
    init_util();
    formatMap = {
      guid: "uuid",
      url: "uri",
      datetime: "date-time",
      json_string: "json-string",
      regex: ""
      // do not set
    };
    stringProcessor = (schema, ctx, _json, _params) => {
      const json2 = _json;
      json2.type = "string";
      const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
      if (typeof minimum === "number")
        json2.minLength = minimum;
      if (typeof maximum === "number")
        json2.maxLength = maximum;
      if (format) {
        json2.format = formatMap[format] ?? format;
        if (json2.format === "")
          delete json2.format;
        if (format === "time") {
          delete json2.format;
        }
      }
      if (contentEncoding)
        json2.contentEncoding = contentEncoding;
      if (patterns && patterns.size > 0) {
        const regexes = [...patterns];
        if (regexes.length === 1)
          json2.pattern = regexes[0].source;
        else if (regexes.length > 1) {
          json2.allOf = [
            ...regexes.map((regex) => ({
              ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
              pattern: regex.source
            }))
          ];
        }
      }
    };
    numberProcessor = (schema, ctx, _json, _params) => {
      const json2 = _json;
      const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
      if (typeof format === "string" && format.includes("int"))
        json2.type = "integer";
      else
        json2.type = "number";
      if (typeof exclusiveMinimum === "number") {
        if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
          json2.minimum = exclusiveMinimum;
          json2.exclusiveMinimum = true;
        } else {
          json2.exclusiveMinimum = exclusiveMinimum;
        }
      }
      if (typeof minimum === "number") {
        json2.minimum = minimum;
        if (typeof exclusiveMinimum === "number" && ctx.target !== "draft-04") {
          if (exclusiveMinimum >= minimum)
            delete json2.minimum;
          else
            delete json2.exclusiveMinimum;
        }
      }
      if (typeof exclusiveMaximum === "number") {
        if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
          json2.maximum = exclusiveMaximum;
          json2.exclusiveMaximum = true;
        } else {
          json2.exclusiveMaximum = exclusiveMaximum;
        }
      }
      if (typeof maximum === "number") {
        json2.maximum = maximum;
        if (typeof exclusiveMaximum === "number" && ctx.target !== "draft-04") {
          if (exclusiveMaximum <= maximum)
            delete json2.maximum;
          else
            delete json2.exclusiveMaximum;
        }
      }
      if (typeof multipleOf === "number")
        json2.multipleOf = multipleOf;
    };
    booleanProcessor = (_schema, _ctx, json2, _params) => {
      json2.type = "boolean";
    };
    bigintProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("BigInt cannot be represented in JSON Schema");
      }
    };
    symbolProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Symbols cannot be represented in JSON Schema");
      }
    };
    nullProcessor = (_schema, ctx, json2, _params) => {
      if (ctx.target === "openapi-3.0") {
        json2.type = "string";
        json2.nullable = true;
        json2.enum = [null];
      } else {
        json2.type = "null";
      }
    };
    undefinedProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Undefined cannot be represented in JSON Schema");
      }
    };
    voidProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Void cannot be represented in JSON Schema");
      }
    };
    neverProcessor = (_schema, _ctx, json2, _params) => {
      json2.not = {};
    };
    anyProcessor = (_schema, _ctx, _json, _params) => {
    };
    unknownProcessor = (_schema, _ctx, _json, _params) => {
    };
    dateProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Date cannot be represented in JSON Schema");
      }
    };
    enumProcessor = (schema, _ctx, json2, _params) => {
      const def = schema._zod.def;
      const values = getEnumValues(def.entries);
      if (values.every((v) => typeof v === "number"))
        json2.type = "number";
      if (values.every((v) => typeof v === "string"))
        json2.type = "string";
      json2.enum = values;
    };
    literalProcessor = (schema, ctx, json2, _params) => {
      const def = schema._zod.def;
      const vals = [];
      for (const val of def.values) {
        if (val === void 0) {
          if (ctx.unrepresentable === "throw") {
            throw new Error("Literal `undefined` cannot be represented in JSON Schema");
          } else {
          }
        } else if (typeof val === "bigint") {
          if (ctx.unrepresentable === "throw") {
            throw new Error("BigInt literals cannot be represented in JSON Schema");
          } else {
            vals.push(Number(val));
          }
        } else {
          vals.push(val);
        }
      }
      if (vals.length === 0) {
      } else if (vals.length === 1) {
        const val = vals[0];
        json2.type = val === null ? "null" : typeof val;
        if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
          json2.enum = [val];
        } else {
          json2.const = val;
        }
      } else {
        if (vals.every((v) => typeof v === "number"))
          json2.type = "number";
        if (vals.every((v) => typeof v === "string"))
          json2.type = "string";
        if (vals.every((v) => typeof v === "boolean"))
          json2.type = "boolean";
        if (vals.every((v) => v === null))
          json2.type = "null";
        json2.enum = vals;
      }
    };
    nanProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("NaN cannot be represented in JSON Schema");
      }
    };
    templateLiteralProcessor = (schema, _ctx, json2, _params) => {
      const _json = json2;
      const pattern = schema._zod.pattern;
      if (!pattern)
        throw new Error("Pattern not found in template literal");
      _json.type = "string";
      _json.pattern = pattern.source;
    };
    fileProcessor = (schema, _ctx, json2, _params) => {
      const _json = json2;
      const file2 = {
        type: "string",
        format: "binary",
        contentEncoding: "binary"
      };
      const { minimum, maximum, mime } = schema._zod.bag;
      if (minimum !== void 0)
        file2.minLength = minimum;
      if (maximum !== void 0)
        file2.maxLength = maximum;
      if (mime) {
        if (mime.length === 1) {
          file2.contentMediaType = mime[0];
          Object.assign(_json, file2);
        } else {
          Object.assign(_json, file2);
          _json.anyOf = mime.map((m) => ({ contentMediaType: m }));
        }
      } else {
        Object.assign(_json, file2);
      }
    };
    successProcessor = (_schema, _ctx, json2, _params) => {
      json2.type = "boolean";
    };
    customProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Custom types cannot be represented in JSON Schema");
      }
    };
    functionProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Function types cannot be represented in JSON Schema");
      }
    };
    transformProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Transforms cannot be represented in JSON Schema");
      }
    };
    mapProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Map cannot be represented in JSON Schema");
      }
    };
    setProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Set cannot be represented in JSON Schema");
      }
    };
    arrayProcessor = (schema, ctx, _json, params) => {
      const json2 = _json;
      const def = schema._zod.def;
      const { minimum, maximum } = schema._zod.bag;
      if (typeof minimum === "number")
        json2.minItems = minimum;
      if (typeof maximum === "number")
        json2.maxItems = maximum;
      json2.type = "array";
      json2.items = process2(def.element, ctx, { ...params, path: [...params.path, "items"] });
    };
    objectProcessor = (schema, ctx, _json, params) => {
      const json2 = _json;
      const def = schema._zod.def;
      json2.type = "object";
      json2.properties = {};
      const shape = def.shape;
      for (const key in shape) {
        json2.properties[key] = process2(shape[key], ctx, {
          ...params,
          path: [...params.path, "properties", key]
        });
      }
      const allKeys = new Set(Object.keys(shape));
      const requiredKeys = new Set([...allKeys].filter((key) => {
        const v = def.shape[key]._zod;
        if (ctx.io === "input") {
          return v.optin === void 0;
        } else {
          return v.optout === void 0;
        }
      }));
      if (requiredKeys.size > 0) {
        json2.required = Array.from(requiredKeys);
      }
      if (def.catchall?._zod.def.type === "never") {
        json2.additionalProperties = false;
      } else if (!def.catchall) {
        if (ctx.io === "output")
          json2.additionalProperties = false;
      } else if (def.catchall) {
        json2.additionalProperties = process2(def.catchall, ctx, {
          ...params,
          path: [...params.path, "additionalProperties"]
        });
      }
    };
    unionProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      const isExclusive = def.inclusive === false;
      const options = def.options.map((x, i) => process2(x, ctx, {
        ...params,
        path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
      }));
      if (isExclusive) {
        json2.oneOf = options;
      } else {
        json2.anyOf = options;
      }
    };
    intersectionProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      const a = process2(def.left, ctx, {
        ...params,
        path: [...params.path, "allOf", 0]
      });
      const b = process2(def.right, ctx, {
        ...params,
        path: [...params.path, "allOf", 1]
      });
      const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
      const allOf = [
        ...isSimpleIntersection(a) ? a.allOf : [a],
        ...isSimpleIntersection(b) ? b.allOf : [b]
      ];
      json2.allOf = allOf;
    };
    tupleProcessor = (schema, ctx, _json, params) => {
      const json2 = _json;
      const def = schema._zod.def;
      json2.type = "array";
      const prefixPath = ctx.target === "draft-2020-12" ? "prefixItems" : "items";
      const restPath = ctx.target === "draft-2020-12" ? "items" : ctx.target === "openapi-3.0" ? "items" : "additionalItems";
      const prefixItems = def.items.map((x, i) => process2(x, ctx, {
        ...params,
        path: [...params.path, prefixPath, i]
      }));
      const rest = def.rest ? process2(def.rest, ctx, {
        ...params,
        path: [...params.path, restPath, ...ctx.target === "openapi-3.0" ? [def.items.length] : []]
      }) : null;
      if (ctx.target === "draft-2020-12") {
        json2.prefixItems = prefixItems;
        if (rest) {
          json2.items = rest;
        }
      } else if (ctx.target === "openapi-3.0") {
        json2.items = {
          anyOf: prefixItems
        };
        if (rest) {
          json2.items.anyOf.push(rest);
        }
        json2.minItems = prefixItems.length;
        if (!rest) {
          json2.maxItems = prefixItems.length;
        }
      } else {
        json2.items = prefixItems;
        if (rest) {
          json2.additionalItems = rest;
        }
      }
      const { minimum, maximum } = schema._zod.bag;
      if (typeof minimum === "number")
        json2.minItems = minimum;
      if (typeof maximum === "number")
        json2.maxItems = maximum;
    };
    recordProcessor = (schema, ctx, _json, params) => {
      const json2 = _json;
      const def = schema._zod.def;
      json2.type = "object";
      const keyType = def.keyType;
      const keyBag = keyType._zod.bag;
      const patterns = keyBag?.patterns;
      if (def.mode === "loose" && patterns && patterns.size > 0) {
        const valueSchema = process2(def.valueType, ctx, {
          ...params,
          path: [...params.path, "patternProperties", "*"]
        });
        json2.patternProperties = {};
        for (const pattern of patterns) {
          json2.patternProperties[pattern.source] = valueSchema;
        }
      } else {
        if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
          json2.propertyNames = process2(def.keyType, ctx, {
            ...params,
            path: [...params.path, "propertyNames"]
          });
        }
        json2.additionalProperties = process2(def.valueType, ctx, {
          ...params,
          path: [...params.path, "additionalProperties"]
        });
      }
      const keyValues = keyType._zod.values;
      if (keyValues) {
        const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
        if (validKeyValues.length > 0) {
          json2.required = validKeyValues;
        }
      }
    };
    nullableProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      const inner = process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      if (ctx.target === "openapi-3.0") {
        seen.ref = def.innerType;
        json2.nullable = true;
      } else {
        json2.anyOf = [inner, { type: "null" }];
      }
    };
    nonoptionalProcessor = (schema, ctx, _json, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
    };
    defaultProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
      json2.default = JSON.parse(JSON.stringify(def.defaultValue));
    };
    prefaultProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
      if (ctx.io === "input")
        json2._prefault = JSON.parse(JSON.stringify(def.defaultValue));
    };
    catchProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
      let catchValue;
      try {
        catchValue = def.catchValue(void 0);
      } catch {
        throw new Error("Dynamic catch values are not supported in JSON Schema");
      }
      json2.default = catchValue;
    };
    pipeProcessor = (schema, ctx, _json, params) => {
      const def = schema._zod.def;
      const innerType = ctx.io === "input" ? def.in._zod.def.type === "transform" ? def.out : def.in : def.out;
      process2(innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = innerType;
    };
    readonlyProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
      json2.readOnly = true;
    };
    promiseProcessor = (schema, ctx, _json, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
    };
    optionalProcessor = (schema, ctx, _json, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
    };
    lazyProcessor = (schema, ctx, _json, params) => {
      const innerType = schema._zod.innerType;
      process2(innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = innerType;
    };
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/json-schema-generator.js
var init_json_schema_generator = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/json-schema-generator.js"() {
    "use strict";
    init_json_schema_processors();
    init_to_json_schema();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/json-schema.js
var init_json_schema = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/json-schema.js"() {
    "use strict";
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/index.js
var init_core2 = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/index.js"() {
    "use strict";
    init_core();
    init_parse();
    init_errors();
    init_schemas();
    init_checks();
    init_versions();
    init_util();
    init_regexes();
    init_locales();
    init_registries();
    init_doc();
    init_api();
    init_to_json_schema();
    init_json_schema_processors();
    init_json_schema_generator();
    init_json_schema();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/checks.js
var checks_exports2 = {};
__export(checks_exports2, {
  endsWith: () => _endsWith,
  gt: () => _gt,
  gte: () => _gte,
  includes: () => _includes,
  length: () => _length,
  lowercase: () => _lowercase,
  lt: () => _lt,
  lte: () => _lte,
  maxLength: () => _maxLength,
  maxSize: () => _maxSize,
  mime: () => _mime,
  minLength: () => _minLength,
  minSize: () => _minSize,
  multipleOf: () => _multipleOf,
  negative: () => _negative,
  nonnegative: () => _nonnegative,
  nonpositive: () => _nonpositive,
  normalize: () => _normalize,
  overwrite: () => _overwrite,
  positive: () => _positive,
  property: () => _property,
  regex: () => _regex,
  size: () => _size,
  slugify: () => _slugify,
  startsWith: () => _startsWith,
  toLowerCase: () => _toLowerCase,
  toUpperCase: () => _toUpperCase,
  trim: () => _trim,
  uppercase: () => _uppercase
});
var init_checks2 = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/checks.js"() {
    "use strict";
    init_core2();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/iso.js
var iso_exports = {};
__export(iso_exports, {
  ZodISODate: () => ZodISODate,
  ZodISODateTime: () => ZodISODateTime,
  ZodISODuration: () => ZodISODuration,
  ZodISOTime: () => ZodISOTime,
  date: () => date2,
  datetime: () => datetime2,
  duration: () => duration2,
  time: () => time2
});
function datetime2(params) {
  return _isoDateTime(ZodISODateTime, params);
}
function date2(params) {
  return _isoDate(ZodISODate, params);
}
function time2(params) {
  return _isoTime(ZodISOTime, params);
}
function duration2(params) {
  return _isoDuration(ZodISODuration, params);
}
var ZodISODateTime, ZodISODate, ZodISOTime, ZodISODuration;
var init_iso = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/iso.js"() {
    "use strict";
    init_core2();
    init_schemas2();
    ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
      $ZodISODateTime.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
      $ZodISODate.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
      $ZodISOTime.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
      $ZodISODuration.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/errors.js
var initializer2, ZodError, ZodRealError;
var init_errors2 = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/errors.js"() {
    "use strict";
    init_core2();
    init_core2();
    init_util();
    initializer2 = (inst, issues) => {
      $ZodError.init(inst, issues);
      inst.name = "ZodError";
      Object.defineProperties(inst, {
        format: {
          value: (mapper) => formatError(inst, mapper)
          // enumerable: false,
        },
        flatten: {
          value: (mapper) => flattenError(inst, mapper)
          // enumerable: false,
        },
        addIssue: {
          value: (issue2) => {
            inst.issues.push(issue2);
            inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
          }
          // enumerable: false,
        },
        addIssues: {
          value: (issues2) => {
            inst.issues.push(...issues2);
            inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
          }
          // enumerable: false,
        },
        isEmpty: {
          get() {
            return inst.issues.length === 0;
          }
          // enumerable: false,
        }
      });
    };
    ZodError = $constructor("ZodError", initializer2);
    ZodRealError = $constructor("ZodError", initializer2, {
      Parent: Error
    });
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/parse.js
var parse2, parseAsync2, safeParse2, safeParseAsync2, encode, decode, encodeAsync, decodeAsync, safeEncode, safeDecode, safeEncodeAsync, safeDecodeAsync;
var init_parse2 = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/parse.js"() {
    "use strict";
    init_core2();
    init_errors2();
    parse2 = /* @__PURE__ */ _parse(ZodRealError);
    parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
    safeParse2 = /* @__PURE__ */ _safeParse(ZodRealError);
    safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
    encode = /* @__PURE__ */ _encode(ZodRealError);
    decode = /* @__PURE__ */ _decode(ZodRealError);
    encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
    decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
    safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
    safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
    safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
    safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/schemas.js
var schemas_exports2 = {};
__export(schemas_exports2, {
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBase64: () => ZodBase64,
  ZodBase64URL: () => ZodBase64URL,
  ZodBigInt: () => ZodBigInt,
  ZodBigIntFormat: () => ZodBigIntFormat,
  ZodBoolean: () => ZodBoolean,
  ZodCIDRv4: () => ZodCIDRv4,
  ZodCIDRv6: () => ZodCIDRv6,
  ZodCUID: () => ZodCUID,
  ZodCUID2: () => ZodCUID2,
  ZodCatch: () => ZodCatch,
  ZodCodec: () => ZodCodec,
  ZodCustom: () => ZodCustom,
  ZodCustomStringFormat: () => ZodCustomStringFormat,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodE164: () => ZodE164,
  ZodEmail: () => ZodEmail,
  ZodEmoji: () => ZodEmoji,
  ZodEnum: () => ZodEnum,
  ZodExactOptional: () => ZodExactOptional,
  ZodFile: () => ZodFile,
  ZodFunction: () => ZodFunction,
  ZodGUID: () => ZodGUID,
  ZodIPv4: () => ZodIPv4,
  ZodIPv6: () => ZodIPv6,
  ZodIntersection: () => ZodIntersection,
  ZodJWT: () => ZodJWT,
  ZodKSUID: () => ZodKSUID,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMAC: () => ZodMAC,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNanoID: () => ZodNanoID,
  ZodNever: () => ZodNever,
  ZodNonOptional: () => ZodNonOptional,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodNumberFormat: () => ZodNumberFormat,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodPipe: () => ZodPipe,
  ZodPrefault: () => ZodPrefault,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodStringFormat: () => ZodStringFormat,
  ZodSuccess: () => ZodSuccess,
  ZodSymbol: () => ZodSymbol,
  ZodTemplateLiteral: () => ZodTemplateLiteral,
  ZodTransform: () => ZodTransform,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodULID: () => ZodULID,
  ZodURL: () => ZodURL,
  ZodUUID: () => ZodUUID,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  ZodXID: () => ZodXID,
  ZodXor: () => ZodXor,
  _ZodString: () => _ZodString,
  _default: () => _default,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base642,
  base64url: () => base64url2,
  bigint: () => bigint2,
  boolean: () => boolean2,
  catch: () => _catch,
  check: () => check,
  cidrv4: () => cidrv42,
  cidrv6: () => cidrv62,
  codec: () => codec,
  cuid: () => cuid3,
  cuid2: () => cuid22,
  custom: () => custom,
  date: () => date3,
  describe: () => describe2,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e1642,
  email: () => email2,
  emoji: () => emoji2,
  enum: () => _enum,
  exactOptional: () => exactOptional,
  file: () => file,
  float32: () => float32,
  float64: () => float64,
  function: () => _function,
  guid: () => guid2,
  hash: () => hash,
  hex: () => hex2,
  hostname: () => hostname2,
  httpUrl: () => httpUrl,
  instanceof: () => _instanceof,
  int: () => int,
  int32: () => int32,
  int64: () => int64,
  intersection: () => intersection,
  ipv4: () => ipv42,
  ipv6: () => ipv62,
  json: () => json,
  jwt: () => jwt,
  keyof: () => keyof,
  ksuid: () => ksuid2,
  lazy: () => lazy,
  literal: () => literal,
  looseObject: () => looseObject,
  looseRecord: () => looseRecord,
  mac: () => mac2,
  map: () => map,
  meta: () => meta2,
  nan: () => nan,
  nanoid: () => nanoid2,
  nativeEnum: () => nativeEnum,
  never: () => never,
  nonoptional: () => nonoptional,
  null: () => _null3,
  nullable: () => nullable,
  nullish: () => nullish2,
  number: () => number2,
  object: () => object,
  optional: () => optional,
  partialRecord: () => partialRecord,
  pipe: () => pipe,
  prefault: () => prefault,
  preprocess: () => preprocess,
  promise: () => promise,
  readonly: () => readonly,
  record: () => record,
  refine: () => refine,
  set: () => set,
  strictObject: () => strictObject,
  string: () => string2,
  stringFormat: () => stringFormat,
  stringbool: () => stringbool,
  success: () => success,
  superRefine: () => superRefine,
  symbol: () => symbol,
  templateLiteral: () => templateLiteral,
  transform: () => transform,
  tuple: () => tuple,
  uint32: () => uint32,
  uint64: () => uint64,
  ulid: () => ulid2,
  undefined: () => _undefined3,
  union: () => union,
  unknown: () => unknown,
  url: () => url,
  uuid: () => uuid2,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => _void2,
  xid: () => xid2,
  xor: () => xor
});
function string2(params) {
  return _string(ZodString, params);
}
function email2(params) {
  return _email(ZodEmail, params);
}
function guid2(params) {
  return _guid(ZodGUID, params);
}
function uuid2(params) {
  return _uuid(ZodUUID, params);
}
function uuidv4(params) {
  return _uuidv4(ZodUUID, params);
}
function uuidv6(params) {
  return _uuidv6(ZodUUID, params);
}
function uuidv7(params) {
  return _uuidv7(ZodUUID, params);
}
function url(params) {
  return _url(ZodURL, params);
}
function httpUrl(params) {
  return _url(ZodURL, {
    protocol: /^https?$/,
    hostname: regexes_exports.domain,
    ...util_exports.normalizeParams(params)
  });
}
function emoji2(params) {
  return _emoji2(ZodEmoji, params);
}
function nanoid2(params) {
  return _nanoid(ZodNanoID, params);
}
function cuid3(params) {
  return _cuid(ZodCUID, params);
}
function cuid22(params) {
  return _cuid2(ZodCUID2, params);
}
function ulid2(params) {
  return _ulid(ZodULID, params);
}
function xid2(params) {
  return _xid(ZodXID, params);
}
function ksuid2(params) {
  return _ksuid(ZodKSUID, params);
}
function ipv42(params) {
  return _ipv4(ZodIPv4, params);
}
function mac2(params) {
  return _mac(ZodMAC, params);
}
function ipv62(params) {
  return _ipv6(ZodIPv6, params);
}
function cidrv42(params) {
  return _cidrv4(ZodCIDRv4, params);
}
function cidrv62(params) {
  return _cidrv6(ZodCIDRv6, params);
}
function base642(params) {
  return _base64(ZodBase64, params);
}
function base64url2(params) {
  return _base64url(ZodBase64URL, params);
}
function e1642(params) {
  return _e164(ZodE164, params);
}
function jwt(params) {
  return _jwt(ZodJWT, params);
}
function stringFormat(format, fnOrRegex, _params = {}) {
  return _stringFormat(ZodCustomStringFormat, format, fnOrRegex, _params);
}
function hostname2(_params) {
  return _stringFormat(ZodCustomStringFormat, "hostname", regexes_exports.hostname, _params);
}
function hex2(_params) {
  return _stringFormat(ZodCustomStringFormat, "hex", regexes_exports.hex, _params);
}
function hash(alg, params) {
  const enc = params?.enc ?? "hex";
  const format = `${alg}_${enc}`;
  const regex = regexes_exports[format];
  if (!regex)
    throw new Error(`Unrecognized hash format: ${format}`);
  return _stringFormat(ZodCustomStringFormat, format, regex, params);
}
function number2(params) {
  return _number(ZodNumber, params);
}
function int(params) {
  return _int(ZodNumberFormat, params);
}
function float32(params) {
  return _float32(ZodNumberFormat, params);
}
function float64(params) {
  return _float64(ZodNumberFormat, params);
}
function int32(params) {
  return _int32(ZodNumberFormat, params);
}
function uint32(params) {
  return _uint32(ZodNumberFormat, params);
}
function boolean2(params) {
  return _boolean(ZodBoolean, params);
}
function bigint2(params) {
  return _bigint(ZodBigInt, params);
}
function int64(params) {
  return _int64(ZodBigIntFormat, params);
}
function uint64(params) {
  return _uint64(ZodBigIntFormat, params);
}
function symbol(params) {
  return _symbol(ZodSymbol, params);
}
function _undefined3(params) {
  return _undefined2(ZodUndefined, params);
}
function _null3(params) {
  return _null2(ZodNull, params);
}
function any() {
  return _any(ZodAny);
}
function unknown() {
  return _unknown(ZodUnknown);
}
function never(params) {
  return _never(ZodNever, params);
}
function _void2(params) {
  return _void(ZodVoid, params);
}
function date3(params) {
  return _date(ZodDate, params);
}
function array(element, params) {
  return _array(ZodArray, element, params);
}
function keyof(schema) {
  const shape = schema._zod.def.shape;
  return _enum(Object.keys(shape));
}
function object(shape, params) {
  const def = {
    type: "object",
    shape: shape ?? {},
    ...util_exports.normalizeParams(params)
  };
  return new ZodObject(def);
}
function strictObject(shape, params) {
  return new ZodObject({
    type: "object",
    shape,
    catchall: never(),
    ...util_exports.normalizeParams(params)
  });
}
function looseObject(shape, params) {
  return new ZodObject({
    type: "object",
    shape,
    catchall: unknown(),
    ...util_exports.normalizeParams(params)
  });
}
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...util_exports.normalizeParams(params)
  });
}
function xor(options, params) {
  return new ZodXor({
    type: "union",
    options,
    inclusive: false,
    ...util_exports.normalizeParams(params)
  });
}
function discriminatedUnion(discriminator, options, params) {
  return new ZodDiscriminatedUnion({
    type: "union",
    options,
    discriminator,
    ...util_exports.normalizeParams(params)
  });
}
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
function tuple(items, _paramsOrRest, _params) {
  const hasRest = _paramsOrRest instanceof $ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new ZodTuple({
    type: "tuple",
    items,
    rest,
    ...util_exports.normalizeParams(params)
  });
}
function record(keyType, valueType, params) {
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
function partialRecord(keyType, valueType, params) {
  const k = clone(keyType);
  k._zod.values = void 0;
  return new ZodRecord({
    type: "record",
    keyType: k,
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
function looseRecord(keyType, valueType, params) {
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    mode: "loose",
    ...util_exports.normalizeParams(params)
  });
}
function map(keyType, valueType, params) {
  return new ZodMap({
    type: "map",
    keyType,
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
function set(valueType, params) {
  return new ZodSet({
    type: "set",
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
function _enum(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...util_exports.normalizeParams(params)
  });
}
function nativeEnum(entries, params) {
  return new ZodEnum({
    type: "enum",
    entries,
    ...util_exports.normalizeParams(params)
  });
}
function literal(value, params) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...util_exports.normalizeParams(params)
  });
}
function file(params) {
  return _file(ZodFile, params);
}
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType
  });
}
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
function nullish2(innerType) {
  return optional(nullable(innerType));
}
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...util_exports.normalizeParams(params)
  });
}
function success(innerType) {
  return new ZodSuccess({
    type: "success",
    innerType
  });
}
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
function nan(params) {
  return _nan(ZodNaN, params);
}
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
    // ...util.normalizeParams(params),
  });
}
function codec(in_, out, params) {
  return new ZodCodec({
    type: "pipe",
    in: in_,
    out,
    transform: params.decode,
    reverseTransform: params.encode
  });
}
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
function templateLiteral(parts, params) {
  return new ZodTemplateLiteral({
    type: "template_literal",
    parts,
    ...util_exports.normalizeParams(params)
  });
}
function lazy(getter) {
  return new ZodLazy({
    type: "lazy",
    getter
  });
}
function promise(innerType) {
  return new ZodPromise({
    type: "promise",
    innerType
  });
}
function _function(params) {
  return new ZodFunction({
    type: "function",
    input: Array.isArray(params?.input) ? tuple(params?.input) : params?.input ?? array(unknown()),
    output: params?.output ?? unknown()
  });
}
function check(fn) {
  const ch = new $ZodCheck({
    check: "custom"
    // ...util.normalizeParams(params),
  });
  ch._zod.check = fn;
  return ch;
}
function custom(fn, _params) {
  return _custom(ZodCustom, fn ?? (() => true), _params);
}
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn) {
  return _superRefine(fn);
}
function _instanceof(cls, params = {}) {
  const inst = new ZodCustom({
    type: "custom",
    check: "custom",
    fn: (data) => data instanceof cls,
    abort: true,
    ...util_exports.normalizeParams(params)
  });
  inst._zod.bag.Class = cls;
  inst._zod.check = (payload) => {
    if (!(payload.value instanceof cls)) {
      payload.issues.push({
        code: "invalid_type",
        expected: cls.name,
        input: payload.value,
        inst,
        path: [...inst._zod.def.path ?? []]
      });
    }
  };
  return inst;
}
function json(params) {
  const jsonSchema = lazy(() => {
    return union([string2(params), number2(), boolean2(), _null3(), array(jsonSchema), record(string2(), jsonSchema)]);
  });
  return jsonSchema;
}
function preprocess(fn, schema) {
  return pipe(transform(fn), schema);
}
var ZodType, _ZodString, ZodString, ZodStringFormat, ZodEmail, ZodGUID, ZodUUID, ZodURL, ZodEmoji, ZodNanoID, ZodCUID, ZodCUID2, ZodULID, ZodXID, ZodKSUID, ZodIPv4, ZodMAC, ZodIPv6, ZodCIDRv4, ZodCIDRv6, ZodBase64, ZodBase64URL, ZodE164, ZodJWT, ZodCustomStringFormat, ZodNumber, ZodNumberFormat, ZodBoolean, ZodBigInt, ZodBigIntFormat, ZodSymbol, ZodUndefined, ZodNull, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodDate, ZodArray, ZodObject, ZodUnion, ZodXor, ZodDiscriminatedUnion, ZodIntersection, ZodTuple, ZodRecord, ZodMap, ZodSet, ZodEnum, ZodLiteral, ZodFile, ZodTransform, ZodOptional, ZodExactOptional, ZodNullable, ZodDefault, ZodPrefault, ZodNonOptional, ZodSuccess, ZodCatch, ZodNaN, ZodPipe, ZodCodec, ZodReadonly, ZodTemplateLiteral, ZodLazy, ZodPromise, ZodFunction, ZodCustom, describe2, meta2, stringbool;
var init_schemas2 = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/schemas.js"() {
    "use strict";
    init_core2();
    init_core2();
    init_json_schema_processors();
    init_to_json_schema();
    init_checks2();
    init_iso();
    init_parse2();
    ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
      $ZodType.init(inst, def);
      Object.assign(inst["~standard"], {
        jsonSchema: {
          input: createStandardJSONSchemaMethod(inst, "input"),
          output: createStandardJSONSchemaMethod(inst, "output")
        }
      });
      inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
      inst.def = def;
      inst.type = def.type;
      Object.defineProperty(inst, "_def", { value: def });
      inst.check = (...checks) => {
        return inst.clone(util_exports.mergeDefs(def, {
          checks: [
            ...def.checks ?? [],
            ...checks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
          ]
        }), {
          parent: true
        });
      };
      inst.with = inst.check;
      inst.clone = (def2, params) => clone(inst, def2, params);
      inst.brand = () => inst;
      inst.register = ((reg, meta3) => {
        reg.add(inst, meta3);
        return inst;
      });
      inst.parse = (data, params) => parse2(inst, data, params, { callee: inst.parse });
      inst.safeParse = (data, params) => safeParse2(inst, data, params);
      inst.parseAsync = async (data, params) => parseAsync2(inst, data, params, { callee: inst.parseAsync });
      inst.safeParseAsync = async (data, params) => safeParseAsync2(inst, data, params);
      inst.spa = inst.safeParseAsync;
      inst.encode = (data, params) => encode(inst, data, params);
      inst.decode = (data, params) => decode(inst, data, params);
      inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
      inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
      inst.safeEncode = (data, params) => safeEncode(inst, data, params);
      inst.safeDecode = (data, params) => safeDecode(inst, data, params);
      inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
      inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
      inst.refine = (check2, params) => inst.check(refine(check2, params));
      inst.superRefine = (refinement) => inst.check(superRefine(refinement));
      inst.overwrite = (fn) => inst.check(_overwrite(fn));
      inst.optional = () => optional(inst);
      inst.exactOptional = () => exactOptional(inst);
      inst.nullable = () => nullable(inst);
      inst.nullish = () => optional(nullable(inst));
      inst.nonoptional = (params) => nonoptional(inst, params);
      inst.array = () => array(inst);
      inst.or = (arg) => union([inst, arg]);
      inst.and = (arg) => intersection(inst, arg);
      inst.transform = (tx) => pipe(inst, transform(tx));
      inst.default = (def2) => _default(inst, def2);
      inst.prefault = (def2) => prefault(inst, def2);
      inst.catch = (params) => _catch(inst, params);
      inst.pipe = (target) => pipe(inst, target);
      inst.readonly = () => readonly(inst);
      inst.describe = (description) => {
        const cl = inst.clone();
        globalRegistry.add(cl, { description });
        return cl;
      };
      Object.defineProperty(inst, "description", {
        get() {
          return globalRegistry.get(inst)?.description;
        },
        configurable: true
      });
      inst.meta = (...args) => {
        if (args.length === 0) {
          return globalRegistry.get(inst);
        }
        const cl = inst.clone();
        globalRegistry.add(cl, args[0]);
        return cl;
      };
      inst.isOptional = () => inst.safeParse(void 0).success;
      inst.isNullable = () => inst.safeParse(null).success;
      inst.apply = (fn) => fn(inst);
      return inst;
    });
    _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
      $ZodString.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => stringProcessor(inst, ctx, json2, params);
      const bag = inst._zod.bag;
      inst.format = bag.format ?? null;
      inst.minLength = bag.minimum ?? null;
      inst.maxLength = bag.maximum ?? null;
      inst.regex = (...args) => inst.check(_regex(...args));
      inst.includes = (...args) => inst.check(_includes(...args));
      inst.startsWith = (...args) => inst.check(_startsWith(...args));
      inst.endsWith = (...args) => inst.check(_endsWith(...args));
      inst.min = (...args) => inst.check(_minLength(...args));
      inst.max = (...args) => inst.check(_maxLength(...args));
      inst.length = (...args) => inst.check(_length(...args));
      inst.nonempty = (...args) => inst.check(_minLength(1, ...args));
      inst.lowercase = (params) => inst.check(_lowercase(params));
      inst.uppercase = (params) => inst.check(_uppercase(params));
      inst.trim = () => inst.check(_trim());
      inst.normalize = (...args) => inst.check(_normalize(...args));
      inst.toLowerCase = () => inst.check(_toLowerCase());
      inst.toUpperCase = () => inst.check(_toUpperCase());
      inst.slugify = () => inst.check(_slugify());
    });
    ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
      $ZodString.init(inst, def);
      _ZodString.init(inst, def);
      inst.email = (params) => inst.check(_email(ZodEmail, params));
      inst.url = (params) => inst.check(_url(ZodURL, params));
      inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
      inst.emoji = (params) => inst.check(_emoji2(ZodEmoji, params));
      inst.guid = (params) => inst.check(_guid(ZodGUID, params));
      inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
      inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
      inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
      inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
      inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
      inst.guid = (params) => inst.check(_guid(ZodGUID, params));
      inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
      inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
      inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
      inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
      inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
      inst.xid = (params) => inst.check(_xid(ZodXID, params));
      inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
      inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
      inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
      inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
      inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
      inst.e164 = (params) => inst.check(_e164(ZodE164, params));
      inst.datetime = (params) => inst.check(datetime2(params));
      inst.date = (params) => inst.check(date2(params));
      inst.time = (params) => inst.check(time2(params));
      inst.duration = (params) => inst.check(duration2(params));
    });
    ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
      $ZodStringFormat.init(inst, def);
      _ZodString.init(inst, def);
    });
    ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
      $ZodEmail.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
      $ZodGUID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
      $ZodUUID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
      $ZodURL.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
      $ZodEmoji.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
      $ZodNanoID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
      $ZodCUID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
      $ZodCUID2.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
      $ZodULID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
      $ZodXID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
      $ZodKSUID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
      $ZodIPv4.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodMAC = /* @__PURE__ */ $constructor("ZodMAC", (inst, def) => {
      $ZodMAC.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
      $ZodIPv6.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
      $ZodCIDRv4.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
      $ZodCIDRv6.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
      $ZodBase64.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
      $ZodBase64URL.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
      $ZodE164.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
      $ZodJWT.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodCustomStringFormat = /* @__PURE__ */ $constructor("ZodCustomStringFormat", (inst, def) => {
      $ZodCustomStringFormat.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
      $ZodNumber.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => numberProcessor(inst, ctx, json2, params);
      inst.gt = (value, params) => inst.check(_gt(value, params));
      inst.gte = (value, params) => inst.check(_gte(value, params));
      inst.min = (value, params) => inst.check(_gte(value, params));
      inst.lt = (value, params) => inst.check(_lt(value, params));
      inst.lte = (value, params) => inst.check(_lte(value, params));
      inst.max = (value, params) => inst.check(_lte(value, params));
      inst.int = (params) => inst.check(int(params));
      inst.safe = (params) => inst.check(int(params));
      inst.positive = (params) => inst.check(_gt(0, params));
      inst.nonnegative = (params) => inst.check(_gte(0, params));
      inst.negative = (params) => inst.check(_lt(0, params));
      inst.nonpositive = (params) => inst.check(_lte(0, params));
      inst.multipleOf = (value, params) => inst.check(_multipleOf(value, params));
      inst.step = (value, params) => inst.check(_multipleOf(value, params));
      inst.finite = () => inst;
      const bag = inst._zod.bag;
      inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
      inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
      inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
      inst.isFinite = true;
      inst.format = bag.format ?? null;
    });
    ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
      $ZodNumberFormat.init(inst, def);
      ZodNumber.init(inst, def);
    });
    ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
      $ZodBoolean.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => booleanProcessor(inst, ctx, json2, params);
    });
    ZodBigInt = /* @__PURE__ */ $constructor("ZodBigInt", (inst, def) => {
      $ZodBigInt.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => bigintProcessor(inst, ctx, json2, params);
      inst.gte = (value, params) => inst.check(_gte(value, params));
      inst.min = (value, params) => inst.check(_gte(value, params));
      inst.gt = (value, params) => inst.check(_gt(value, params));
      inst.gte = (value, params) => inst.check(_gte(value, params));
      inst.min = (value, params) => inst.check(_gte(value, params));
      inst.lt = (value, params) => inst.check(_lt(value, params));
      inst.lte = (value, params) => inst.check(_lte(value, params));
      inst.max = (value, params) => inst.check(_lte(value, params));
      inst.positive = (params) => inst.check(_gt(BigInt(0), params));
      inst.negative = (params) => inst.check(_lt(BigInt(0), params));
      inst.nonpositive = (params) => inst.check(_lte(BigInt(0), params));
      inst.nonnegative = (params) => inst.check(_gte(BigInt(0), params));
      inst.multipleOf = (value, params) => inst.check(_multipleOf(value, params));
      const bag = inst._zod.bag;
      inst.minValue = bag.minimum ?? null;
      inst.maxValue = bag.maximum ?? null;
      inst.format = bag.format ?? null;
    });
    ZodBigIntFormat = /* @__PURE__ */ $constructor("ZodBigIntFormat", (inst, def) => {
      $ZodBigIntFormat.init(inst, def);
      ZodBigInt.init(inst, def);
    });
    ZodSymbol = /* @__PURE__ */ $constructor("ZodSymbol", (inst, def) => {
      $ZodSymbol.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => symbolProcessor(inst, ctx, json2, params);
    });
    ZodUndefined = /* @__PURE__ */ $constructor("ZodUndefined", (inst, def) => {
      $ZodUndefined.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => undefinedProcessor(inst, ctx, json2, params);
    });
    ZodNull = /* @__PURE__ */ $constructor("ZodNull", (inst, def) => {
      $ZodNull.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => nullProcessor(inst, ctx, json2, params);
    });
    ZodAny = /* @__PURE__ */ $constructor("ZodAny", (inst, def) => {
      $ZodAny.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => anyProcessor(inst, ctx, json2, params);
    });
    ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
      $ZodUnknown.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => unknownProcessor(inst, ctx, json2, params);
    });
    ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
      $ZodNever.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => neverProcessor(inst, ctx, json2, params);
    });
    ZodVoid = /* @__PURE__ */ $constructor("ZodVoid", (inst, def) => {
      $ZodVoid.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => voidProcessor(inst, ctx, json2, params);
    });
    ZodDate = /* @__PURE__ */ $constructor("ZodDate", (inst, def) => {
      $ZodDate.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => dateProcessor(inst, ctx, json2, params);
      inst.min = (value, params) => inst.check(_gte(value, params));
      inst.max = (value, params) => inst.check(_lte(value, params));
      const c = inst._zod.bag;
      inst.minDate = c.minimum ? new Date(c.minimum) : null;
      inst.maxDate = c.maximum ? new Date(c.maximum) : null;
    });
    ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
      $ZodArray.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => arrayProcessor(inst, ctx, json2, params);
      inst.element = def.element;
      inst.min = (minLength, params) => inst.check(_minLength(minLength, params));
      inst.nonempty = (params) => inst.check(_minLength(1, params));
      inst.max = (maxLength, params) => inst.check(_maxLength(maxLength, params));
      inst.length = (len, params) => inst.check(_length(len, params));
      inst.unwrap = () => inst.element;
    });
    ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
      $ZodObjectJIT.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => objectProcessor(inst, ctx, json2, params);
      util_exports.defineLazy(inst, "shape", () => {
        return def.shape;
      });
      inst.keyof = () => _enum(Object.keys(inst._zod.def.shape));
      inst.catchall = (catchall) => inst.clone({ ...inst._zod.def, catchall });
      inst.passthrough = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
      inst.loose = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
      inst.strict = () => inst.clone({ ...inst._zod.def, catchall: never() });
      inst.strip = () => inst.clone({ ...inst._zod.def, catchall: void 0 });
      inst.extend = (incoming) => {
        return util_exports.extend(inst, incoming);
      };
      inst.safeExtend = (incoming) => {
        return util_exports.safeExtend(inst, incoming);
      };
      inst.merge = (other) => util_exports.merge(inst, other);
      inst.pick = (mask) => util_exports.pick(inst, mask);
      inst.omit = (mask) => util_exports.omit(inst, mask);
      inst.partial = (...args) => util_exports.partial(ZodOptional, inst, args[0]);
      inst.required = (...args) => util_exports.required(ZodNonOptional, inst, args[0]);
    });
    ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
      $ZodUnion.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => unionProcessor(inst, ctx, json2, params);
      inst.options = def.options;
    });
    ZodXor = /* @__PURE__ */ $constructor("ZodXor", (inst, def) => {
      ZodUnion.init(inst, def);
      $ZodXor.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => unionProcessor(inst, ctx, json2, params);
      inst.options = def.options;
    });
    ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("ZodDiscriminatedUnion", (inst, def) => {
      ZodUnion.init(inst, def);
      $ZodDiscriminatedUnion.init(inst, def);
    });
    ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
      $ZodIntersection.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => intersectionProcessor(inst, ctx, json2, params);
    });
    ZodTuple = /* @__PURE__ */ $constructor("ZodTuple", (inst, def) => {
      $ZodTuple.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => tupleProcessor(inst, ctx, json2, params);
      inst.rest = (rest) => inst.clone({
        ...inst._zod.def,
        rest
      });
    });
    ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
      $ZodRecord.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => recordProcessor(inst, ctx, json2, params);
      inst.keyType = def.keyType;
      inst.valueType = def.valueType;
    });
    ZodMap = /* @__PURE__ */ $constructor("ZodMap", (inst, def) => {
      $ZodMap.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => mapProcessor(inst, ctx, json2, params);
      inst.keyType = def.keyType;
      inst.valueType = def.valueType;
      inst.min = (...args) => inst.check(_minSize(...args));
      inst.nonempty = (params) => inst.check(_minSize(1, params));
      inst.max = (...args) => inst.check(_maxSize(...args));
      inst.size = (...args) => inst.check(_size(...args));
    });
    ZodSet = /* @__PURE__ */ $constructor("ZodSet", (inst, def) => {
      $ZodSet.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => setProcessor(inst, ctx, json2, params);
      inst.min = (...args) => inst.check(_minSize(...args));
      inst.nonempty = (params) => inst.check(_minSize(1, params));
      inst.max = (...args) => inst.check(_maxSize(...args));
      inst.size = (...args) => inst.check(_size(...args));
    });
    ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
      $ZodEnum.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => enumProcessor(inst, ctx, json2, params);
      inst.enum = def.entries;
      inst.options = Object.values(def.entries);
      const keys = new Set(Object.keys(def.entries));
      inst.extract = (values, params) => {
        const newEntries = {};
        for (const value of values) {
          if (keys.has(value)) {
            newEntries[value] = def.entries[value];
          } else
            throw new Error(`Key ${value} not found in enum`);
        }
        return new ZodEnum({
          ...def,
          checks: [],
          ...util_exports.normalizeParams(params),
          entries: newEntries
        });
      };
      inst.exclude = (values, params) => {
        const newEntries = { ...def.entries };
        for (const value of values) {
          if (keys.has(value)) {
            delete newEntries[value];
          } else
            throw new Error(`Key ${value} not found in enum`);
        }
        return new ZodEnum({
          ...def,
          checks: [],
          ...util_exports.normalizeParams(params),
          entries: newEntries
        });
      };
    });
    ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
      $ZodLiteral.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => literalProcessor(inst, ctx, json2, params);
      inst.values = new Set(def.values);
      Object.defineProperty(inst, "value", {
        get() {
          if (def.values.length > 1) {
            throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
          }
          return def.values[0];
        }
      });
    });
    ZodFile = /* @__PURE__ */ $constructor("ZodFile", (inst, def) => {
      $ZodFile.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => fileProcessor(inst, ctx, json2, params);
      inst.min = (size, params) => inst.check(_minSize(size, params));
      inst.max = (size, params) => inst.check(_maxSize(size, params));
      inst.mime = (types, params) => inst.check(_mime(Array.isArray(types) ? types : [types], params));
    });
    ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
      $ZodTransform.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => transformProcessor(inst, ctx, json2, params);
      inst._zod.parse = (payload, _ctx) => {
        if (_ctx.direction === "backward") {
          throw new $ZodEncodeError(inst.constructor.name);
        }
        payload.addIssue = (issue2) => {
          if (typeof issue2 === "string") {
            payload.issues.push(util_exports.issue(issue2, payload.value, def));
          } else {
            const _issue = issue2;
            if (_issue.fatal)
              _issue.continue = false;
            _issue.code ?? (_issue.code = "custom");
            _issue.input ?? (_issue.input = payload.value);
            _issue.inst ?? (_issue.inst = inst);
            payload.issues.push(util_exports.issue(_issue));
          }
        };
        const output = def.transform(payload.value, payload);
        if (output instanceof Promise) {
          return output.then((output2) => {
            payload.value = output2;
            return payload;
          });
        }
        payload.value = output;
        return payload;
      };
    });
    ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
      $ZodOptional.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => optionalProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
      $ZodExactOptional.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => optionalProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
      $ZodNullable.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => nullableProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
      $ZodDefault.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => defaultProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
      inst.removeDefault = inst.unwrap;
    });
    ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
      $ZodPrefault.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => prefaultProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
      $ZodNonOptional.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => nonoptionalProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodSuccess = /* @__PURE__ */ $constructor("ZodSuccess", (inst, def) => {
      $ZodSuccess.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => successProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
      $ZodCatch.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => catchProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
      inst.removeCatch = inst.unwrap;
    });
    ZodNaN = /* @__PURE__ */ $constructor("ZodNaN", (inst, def) => {
      $ZodNaN.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => nanProcessor(inst, ctx, json2, params);
    });
    ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
      $ZodPipe.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => pipeProcessor(inst, ctx, json2, params);
      inst.in = def.in;
      inst.out = def.out;
    });
    ZodCodec = /* @__PURE__ */ $constructor("ZodCodec", (inst, def) => {
      ZodPipe.init(inst, def);
      $ZodCodec.init(inst, def);
    });
    ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
      $ZodReadonly.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => readonlyProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodTemplateLiteral = /* @__PURE__ */ $constructor("ZodTemplateLiteral", (inst, def) => {
      $ZodTemplateLiteral.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => templateLiteralProcessor(inst, ctx, json2, params);
    });
    ZodLazy = /* @__PURE__ */ $constructor("ZodLazy", (inst, def) => {
      $ZodLazy.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => lazyProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.getter();
    });
    ZodPromise = /* @__PURE__ */ $constructor("ZodPromise", (inst, def) => {
      $ZodPromise.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => promiseProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodFunction = /* @__PURE__ */ $constructor("ZodFunction", (inst, def) => {
      $ZodFunction.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => functionProcessor(inst, ctx, json2, params);
    });
    ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
      $ZodCustom.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => customProcessor(inst, ctx, json2, params);
    });
    describe2 = describe;
    meta2 = meta;
    stringbool = (...args) => _stringbool({
      Codec: ZodCodec,
      Boolean: ZodBoolean,
      String: ZodString
    }, ...args);
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/compat.js
var ZodFirstPartyTypeKind;
var init_compat = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/compat.js"() {
    "use strict";
    init_core2();
    init_core2();
    /* @__PURE__ */ (function(ZodFirstPartyTypeKind2) {
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/from-json-schema.js
var z;
var init_from_json_schema = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/from-json-schema.js"() {
    "use strict";
    init_registries();
    init_checks2();
    init_iso();
    init_schemas2();
    z = {
      ...schemas_exports2,
      ...checks_exports2,
      iso: iso_exports
    };
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/coerce.js
var init_coerce = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/coerce.js"() {
    "use strict";
    init_core2();
    init_schemas2();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/external.js
var init_external = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/external.js"() {
    "use strict";
    init_core2();
    init_schemas2();
    init_checks2();
    init_errors2();
    init_parse2();
    init_compat();
    init_core2();
    init_en();
    init_core2();
    init_json_schema_processors();
    init_from_json_schema();
    init_locales();
    init_iso();
    init_iso();
    init_coerce();
    config(en_default());
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/index.js
var init_classic = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/index.js"() {
    "use strict";
    init_external();
    init_external();
  }
});

// ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/index.js
var init_v4 = __esm({
  "../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/index.js"() {
    "use strict";
    init_classic();
    init_classic();
  }
});

// ../../node_modules/.pnpm/@modelcontextprotocol+sdk@1.26.0_zod@4.3.6/node_modules/@modelcontextprotocol/sdk/dist/esm/types.js
var RELATED_TASK_META_KEY, JSONRPC_VERSION, AssertObjectSchema, ProgressTokenSchema, CursorSchema, TaskCreationParamsSchema, TaskMetadataSchema, RelatedTaskMetadataSchema, RequestMetaSchema, BaseRequestParamsSchema, TaskAugmentedRequestParamsSchema, RequestSchema, NotificationsParamsSchema, NotificationSchema, ResultSchema, RequestIdSchema, JSONRPCRequestSchema, JSONRPCNotificationSchema, JSONRPCResultResponseSchema, ErrorCode, JSONRPCErrorResponseSchema, JSONRPCMessageSchema, JSONRPCResponseSchema, EmptyResultSchema, CancelledNotificationParamsSchema, CancelledNotificationSchema, IconSchema, IconsSchema, BaseMetadataSchema, ImplementationSchema, FormElicitationCapabilitySchema, ElicitationCapabilitySchema, ClientTasksCapabilitySchema, ServerTasksCapabilitySchema, ClientCapabilitiesSchema, InitializeRequestParamsSchema, InitializeRequestSchema, ServerCapabilitiesSchema, InitializeResultSchema, InitializedNotificationSchema, PingRequestSchema, ProgressSchema, ProgressNotificationParamsSchema, ProgressNotificationSchema, PaginatedRequestParamsSchema, PaginatedRequestSchema, PaginatedResultSchema, TaskStatusSchema, TaskSchema, CreateTaskResultSchema, TaskStatusNotificationParamsSchema, TaskStatusNotificationSchema, GetTaskRequestSchema, GetTaskResultSchema, GetTaskPayloadRequestSchema, GetTaskPayloadResultSchema, ListTasksRequestSchema, ListTasksResultSchema, CancelTaskRequestSchema, CancelTaskResultSchema, ResourceContentsSchema, TextResourceContentsSchema, Base64Schema, BlobResourceContentsSchema, RoleSchema, AnnotationsSchema, ResourceSchema, ResourceTemplateSchema, ListResourcesRequestSchema, ListResourcesResultSchema, ListResourceTemplatesRequestSchema, ListResourceTemplatesResultSchema, ResourceRequestParamsSchema, ReadResourceRequestParamsSchema, ReadResourceRequestSchema, ReadResourceResultSchema, ResourceListChangedNotificationSchema, SubscribeRequestParamsSchema, SubscribeRequestSchema, UnsubscribeRequestParamsSchema, UnsubscribeRequestSchema, ResourceUpdatedNotificationParamsSchema, ResourceUpdatedNotificationSchema, PromptArgumentSchema, PromptSchema, ListPromptsRequestSchema, ListPromptsResultSchema, GetPromptRequestParamsSchema, GetPromptRequestSchema, TextContentSchema, ImageContentSchema, AudioContentSchema, ToolUseContentSchema, EmbeddedResourceSchema, ResourceLinkSchema, ContentBlockSchema, PromptMessageSchema, GetPromptResultSchema, PromptListChangedNotificationSchema, ToolAnnotationsSchema, ToolExecutionSchema, ToolSchema, ListToolsRequestSchema, ListToolsResultSchema, CallToolResultSchema, CompatibilityCallToolResultSchema, CallToolRequestParamsSchema, CallToolRequestSchema, ToolListChangedNotificationSchema, ListChangedOptionsBaseSchema, LoggingLevelSchema, SetLevelRequestParamsSchema, SetLevelRequestSchema, LoggingMessageNotificationParamsSchema, LoggingMessageNotificationSchema, ModelHintSchema, ModelPreferencesSchema, ToolChoiceSchema, ToolResultContentSchema, SamplingContentSchema, SamplingMessageContentBlockSchema, SamplingMessageSchema, CreateMessageRequestParamsSchema, CreateMessageRequestSchema, CreateMessageResultSchema, CreateMessageResultWithToolsSchema, BooleanSchemaSchema, StringSchemaSchema, NumberSchemaSchema, UntitledSingleSelectEnumSchemaSchema, TitledSingleSelectEnumSchemaSchema, LegacyTitledEnumSchemaSchema, SingleSelectEnumSchemaSchema, UntitledMultiSelectEnumSchemaSchema, TitledMultiSelectEnumSchemaSchema, MultiSelectEnumSchemaSchema, EnumSchemaSchema, PrimitiveSchemaDefinitionSchema, ElicitRequestFormParamsSchema, ElicitRequestURLParamsSchema, ElicitRequestParamsSchema, ElicitRequestSchema, ElicitationCompleteNotificationParamsSchema, ElicitationCompleteNotificationSchema, ElicitResultSchema, ResourceTemplateReferenceSchema, PromptReferenceSchema, CompleteRequestParamsSchema, CompleteRequestSchema, CompleteResultSchema, RootSchema, ListRootsRequestSchema, ListRootsResultSchema, RootsListChangedNotificationSchema, ClientRequestSchema, ClientNotificationSchema, ClientResultSchema, ServerRequestSchema, ServerNotificationSchema, ServerResultSchema;
var init_types = __esm({
  "../../node_modules/.pnpm/@modelcontextprotocol+sdk@1.26.0_zod@4.3.6/node_modules/@modelcontextprotocol/sdk/dist/esm/types.js"() {
    "use strict";
    init_v4();
    RELATED_TASK_META_KEY = "io.modelcontextprotocol/related-task";
    JSONRPC_VERSION = "2.0";
    AssertObjectSchema = custom((v) => v !== null && (typeof v === "object" || typeof v === "function"));
    ProgressTokenSchema = union([string2(), number2().int()]);
    CursorSchema = string2();
    TaskCreationParamsSchema = looseObject({
      /**
       * Time in milliseconds to keep task results available after completion.
       * If null, the task has unlimited lifetime until manually cleaned up.
       */
      ttl: union([number2(), _null3()]).optional(),
      /**
       * Time in milliseconds to wait between task status requests.
       */
      pollInterval: number2().optional()
    });
    TaskMetadataSchema = object({
      ttl: number2().optional()
    });
    RelatedTaskMetadataSchema = object({
      taskId: string2()
    });
    RequestMetaSchema = looseObject({
      /**
       * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
       */
      progressToken: ProgressTokenSchema.optional(),
      /**
       * If specified, this request is related to the provided task.
       */
      [RELATED_TASK_META_KEY]: RelatedTaskMetadataSchema.optional()
    });
    BaseRequestParamsSchema = object({
      /**
       * See [General fields: `_meta`](/specification/draft/basic/index#meta) for notes on `_meta` usage.
       */
      _meta: RequestMetaSchema.optional()
    });
    TaskAugmentedRequestParamsSchema = BaseRequestParamsSchema.extend({
      /**
       * If specified, the caller is requesting task-augmented execution for this request.
       * The request will return a CreateTaskResult immediately, and the actual result can be
       * retrieved later via tasks/result.
       *
       * Task augmentation is subject to capability negotiation - receivers MUST declare support
       * for task augmentation of specific request types in their capabilities.
       */
      task: TaskMetadataSchema.optional()
    });
    RequestSchema = object({
      method: string2(),
      params: BaseRequestParamsSchema.loose().optional()
    });
    NotificationsParamsSchema = object({
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: RequestMetaSchema.optional()
    });
    NotificationSchema = object({
      method: string2(),
      params: NotificationsParamsSchema.loose().optional()
    });
    ResultSchema = looseObject({
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: RequestMetaSchema.optional()
    });
    RequestIdSchema = union([string2(), number2().int()]);
    JSONRPCRequestSchema = object({
      jsonrpc: literal(JSONRPC_VERSION),
      id: RequestIdSchema,
      ...RequestSchema.shape
    }).strict();
    JSONRPCNotificationSchema = object({
      jsonrpc: literal(JSONRPC_VERSION),
      ...NotificationSchema.shape
    }).strict();
    JSONRPCResultResponseSchema = object({
      jsonrpc: literal(JSONRPC_VERSION),
      id: RequestIdSchema,
      result: ResultSchema
    }).strict();
    (function(ErrorCode2) {
      ErrorCode2[ErrorCode2["ConnectionClosed"] = -32e3] = "ConnectionClosed";
      ErrorCode2[ErrorCode2["RequestTimeout"] = -32001] = "RequestTimeout";
      ErrorCode2[ErrorCode2["ParseError"] = -32700] = "ParseError";
      ErrorCode2[ErrorCode2["InvalidRequest"] = -32600] = "InvalidRequest";
      ErrorCode2[ErrorCode2["MethodNotFound"] = -32601] = "MethodNotFound";
      ErrorCode2[ErrorCode2["InvalidParams"] = -32602] = "InvalidParams";
      ErrorCode2[ErrorCode2["InternalError"] = -32603] = "InternalError";
      ErrorCode2[ErrorCode2["UrlElicitationRequired"] = -32042] = "UrlElicitationRequired";
    })(ErrorCode || (ErrorCode = {}));
    JSONRPCErrorResponseSchema = object({
      jsonrpc: literal(JSONRPC_VERSION),
      id: RequestIdSchema.optional(),
      error: object({
        /**
         * The error type that occurred.
         */
        code: number2().int(),
        /**
         * A short description of the error. The message SHOULD be limited to a concise single sentence.
         */
        message: string2(),
        /**
         * Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.).
         */
        data: unknown().optional()
      })
    }).strict();
    JSONRPCMessageSchema = union([
      JSONRPCRequestSchema,
      JSONRPCNotificationSchema,
      JSONRPCResultResponseSchema,
      JSONRPCErrorResponseSchema
    ]);
    JSONRPCResponseSchema = union([JSONRPCResultResponseSchema, JSONRPCErrorResponseSchema]);
    EmptyResultSchema = ResultSchema.strict();
    CancelledNotificationParamsSchema = NotificationsParamsSchema.extend({
      /**
       * The ID of the request to cancel.
       *
       * This MUST correspond to the ID of a request previously issued in the same direction.
       */
      requestId: RequestIdSchema.optional(),
      /**
       * An optional string describing the reason for the cancellation. This MAY be logged or presented to the user.
       */
      reason: string2().optional()
    });
    CancelledNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/cancelled"),
      params: CancelledNotificationParamsSchema
    });
    IconSchema = object({
      /**
       * URL or data URI for the icon.
       */
      src: string2(),
      /**
       * Optional MIME type for the icon.
       */
      mimeType: string2().optional(),
      /**
       * Optional array of strings that specify sizes at which the icon can be used.
       * Each string should be in WxH format (e.g., `"48x48"`, `"96x96"`) or `"any"` for scalable formats like SVG.
       *
       * If not provided, the client should assume that the icon can be used at any size.
       */
      sizes: array(string2()).optional(),
      /**
       * Optional specifier for the theme this icon is designed for. `light` indicates
       * the icon is designed to be used with a light background, and `dark` indicates
       * the icon is designed to be used with a dark background.
       *
       * If not provided, the client should assume the icon can be used with any theme.
       */
      theme: _enum(["light", "dark"]).optional()
    });
    IconsSchema = object({
      /**
       * Optional set of sized icons that the client can display in a user interface.
       *
       * Clients that support rendering icons MUST support at least the following MIME types:
       * - `image/png` - PNG images (safe, universal compatibility)
       * - `image/jpeg` (and `image/jpg`) - JPEG images (safe, universal compatibility)
       *
       * Clients that support rendering icons SHOULD also support:
       * - `image/svg+xml` - SVG images (scalable but requires security precautions)
       * - `image/webp` - WebP images (modern, efficient format)
       */
      icons: array(IconSchema).optional()
    });
    BaseMetadataSchema = object({
      /** Intended for programmatic or logical use, but used as a display name in past specs or fallback */
      name: string2(),
      /**
       * Intended for UI and end-user contexts — optimized to be human-readable and easily understood,
       * even by those unfamiliar with domain-specific terminology.
       *
       * If not provided, the name should be used for display (except for Tool,
       * where `annotations.title` should be given precedence over using `name`,
       * if present).
       */
      title: string2().optional()
    });
    ImplementationSchema = BaseMetadataSchema.extend({
      ...BaseMetadataSchema.shape,
      ...IconsSchema.shape,
      version: string2(),
      /**
       * An optional URL of the website for this implementation.
       */
      websiteUrl: string2().optional(),
      /**
       * An optional human-readable description of what this implementation does.
       *
       * This can be used by clients or servers to provide context about their purpose
       * and capabilities. For example, a server might describe the types of resources
       * or tools it provides, while a client might describe its intended use case.
       */
      description: string2().optional()
    });
    FormElicitationCapabilitySchema = intersection(object({
      applyDefaults: boolean2().optional()
    }), record(string2(), unknown()));
    ElicitationCapabilitySchema = preprocess((value) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (Object.keys(value).length === 0) {
          return { form: {} };
        }
      }
      return value;
    }, intersection(object({
      form: FormElicitationCapabilitySchema.optional(),
      url: AssertObjectSchema.optional()
    }), record(string2(), unknown()).optional()));
    ClientTasksCapabilitySchema = looseObject({
      /**
       * Present if the client supports listing tasks.
       */
      list: AssertObjectSchema.optional(),
      /**
       * Present if the client supports cancelling tasks.
       */
      cancel: AssertObjectSchema.optional(),
      /**
       * Capabilities for task creation on specific request types.
       */
      requests: looseObject({
        /**
         * Task support for sampling requests.
         */
        sampling: looseObject({
          createMessage: AssertObjectSchema.optional()
        }).optional(),
        /**
         * Task support for elicitation requests.
         */
        elicitation: looseObject({
          create: AssertObjectSchema.optional()
        }).optional()
      }).optional()
    });
    ServerTasksCapabilitySchema = looseObject({
      /**
       * Present if the server supports listing tasks.
       */
      list: AssertObjectSchema.optional(),
      /**
       * Present if the server supports cancelling tasks.
       */
      cancel: AssertObjectSchema.optional(),
      /**
       * Capabilities for task creation on specific request types.
       */
      requests: looseObject({
        /**
         * Task support for tool requests.
         */
        tools: looseObject({
          call: AssertObjectSchema.optional()
        }).optional()
      }).optional()
    });
    ClientCapabilitiesSchema = object({
      /**
       * Experimental, non-standard capabilities that the client supports.
       */
      experimental: record(string2(), AssertObjectSchema).optional(),
      /**
       * Present if the client supports sampling from an LLM.
       */
      sampling: object({
        /**
         * Present if the client supports context inclusion via includeContext parameter.
         * If not declared, servers SHOULD only use `includeContext: "none"` (or omit it).
         */
        context: AssertObjectSchema.optional(),
        /**
         * Present if the client supports tool use via tools and toolChoice parameters.
         */
        tools: AssertObjectSchema.optional()
      }).optional(),
      /**
       * Present if the client supports eliciting user input.
       */
      elicitation: ElicitationCapabilitySchema.optional(),
      /**
       * Present if the client supports listing roots.
       */
      roots: object({
        /**
         * Whether the client supports issuing notifications for changes to the roots list.
         */
        listChanged: boolean2().optional()
      }).optional(),
      /**
       * Present if the client supports task creation.
       */
      tasks: ClientTasksCapabilitySchema.optional()
    });
    InitializeRequestParamsSchema = BaseRequestParamsSchema.extend({
      /**
       * The latest version of the Model Context Protocol that the client supports. The client MAY decide to support older versions as well.
       */
      protocolVersion: string2(),
      capabilities: ClientCapabilitiesSchema,
      clientInfo: ImplementationSchema
    });
    InitializeRequestSchema = RequestSchema.extend({
      method: literal("initialize"),
      params: InitializeRequestParamsSchema
    });
    ServerCapabilitiesSchema = object({
      /**
       * Experimental, non-standard capabilities that the server supports.
       */
      experimental: record(string2(), AssertObjectSchema).optional(),
      /**
       * Present if the server supports sending log messages to the client.
       */
      logging: AssertObjectSchema.optional(),
      /**
       * Present if the server supports sending completions to the client.
       */
      completions: AssertObjectSchema.optional(),
      /**
       * Present if the server offers any prompt templates.
       */
      prompts: object({
        /**
         * Whether this server supports issuing notifications for changes to the prompt list.
         */
        listChanged: boolean2().optional()
      }).optional(),
      /**
       * Present if the server offers any resources to read.
       */
      resources: object({
        /**
         * Whether this server supports clients subscribing to resource updates.
         */
        subscribe: boolean2().optional(),
        /**
         * Whether this server supports issuing notifications for changes to the resource list.
         */
        listChanged: boolean2().optional()
      }).optional(),
      /**
       * Present if the server offers any tools to call.
       */
      tools: object({
        /**
         * Whether this server supports issuing notifications for changes to the tool list.
         */
        listChanged: boolean2().optional()
      }).optional(),
      /**
       * Present if the server supports task creation.
       */
      tasks: ServerTasksCapabilitySchema.optional()
    });
    InitializeResultSchema = ResultSchema.extend({
      /**
       * The version of the Model Context Protocol that the server wants to use. This may not match the version that the client requested. If the client cannot support this version, it MUST disconnect.
       */
      protocolVersion: string2(),
      capabilities: ServerCapabilitiesSchema,
      serverInfo: ImplementationSchema,
      /**
       * Instructions describing how to use the server and its features.
       *
       * This can be used by clients to improve the LLM's understanding of available tools, resources, etc. It can be thought of like a "hint" to the model. For example, this information MAY be added to the system prompt.
       */
      instructions: string2().optional()
    });
    InitializedNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/initialized"),
      params: NotificationsParamsSchema.optional()
    });
    PingRequestSchema = RequestSchema.extend({
      method: literal("ping"),
      params: BaseRequestParamsSchema.optional()
    });
    ProgressSchema = object({
      /**
       * The progress thus far. This should increase every time progress is made, even if the total is unknown.
       */
      progress: number2(),
      /**
       * Total number of items to process (or total progress required), if known.
       */
      total: optional(number2()),
      /**
       * An optional message describing the current progress.
       */
      message: optional(string2())
    });
    ProgressNotificationParamsSchema = object({
      ...NotificationsParamsSchema.shape,
      ...ProgressSchema.shape,
      /**
       * The progress token which was given in the initial request, used to associate this notification with the request that is proceeding.
       */
      progressToken: ProgressTokenSchema
    });
    ProgressNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/progress"),
      params: ProgressNotificationParamsSchema
    });
    PaginatedRequestParamsSchema = BaseRequestParamsSchema.extend({
      /**
       * An opaque token representing the current pagination position.
       * If provided, the server should return results starting after this cursor.
       */
      cursor: CursorSchema.optional()
    });
    PaginatedRequestSchema = RequestSchema.extend({
      params: PaginatedRequestParamsSchema.optional()
    });
    PaginatedResultSchema = ResultSchema.extend({
      /**
       * An opaque token representing the pagination position after the last returned result.
       * If present, there may be more results available.
       */
      nextCursor: CursorSchema.optional()
    });
    TaskStatusSchema = _enum(["working", "input_required", "completed", "failed", "cancelled"]);
    TaskSchema = object({
      taskId: string2(),
      status: TaskStatusSchema,
      /**
       * Time in milliseconds to keep task results available after completion.
       * If null, the task has unlimited lifetime until manually cleaned up.
       */
      ttl: union([number2(), _null3()]),
      /**
       * ISO 8601 timestamp when the task was created.
       */
      createdAt: string2(),
      /**
       * ISO 8601 timestamp when the task was last updated.
       */
      lastUpdatedAt: string2(),
      pollInterval: optional(number2()),
      /**
       * Optional diagnostic message for failed tasks or other status information.
       */
      statusMessage: optional(string2())
    });
    CreateTaskResultSchema = ResultSchema.extend({
      task: TaskSchema
    });
    TaskStatusNotificationParamsSchema = NotificationsParamsSchema.merge(TaskSchema);
    TaskStatusNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/tasks/status"),
      params: TaskStatusNotificationParamsSchema
    });
    GetTaskRequestSchema = RequestSchema.extend({
      method: literal("tasks/get"),
      params: BaseRequestParamsSchema.extend({
        taskId: string2()
      })
    });
    GetTaskResultSchema = ResultSchema.merge(TaskSchema);
    GetTaskPayloadRequestSchema = RequestSchema.extend({
      method: literal("tasks/result"),
      params: BaseRequestParamsSchema.extend({
        taskId: string2()
      })
    });
    GetTaskPayloadResultSchema = ResultSchema.loose();
    ListTasksRequestSchema = PaginatedRequestSchema.extend({
      method: literal("tasks/list")
    });
    ListTasksResultSchema = PaginatedResultSchema.extend({
      tasks: array(TaskSchema)
    });
    CancelTaskRequestSchema = RequestSchema.extend({
      method: literal("tasks/cancel"),
      params: BaseRequestParamsSchema.extend({
        taskId: string2()
      })
    });
    CancelTaskResultSchema = ResultSchema.merge(TaskSchema);
    ResourceContentsSchema = object({
      /**
       * The URI of this resource.
       */
      uri: string2(),
      /**
       * The MIME type of this resource, if known.
       */
      mimeType: optional(string2()),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    TextResourceContentsSchema = ResourceContentsSchema.extend({
      /**
       * The text of the item. This must only be set if the item can actually be represented as text (not binary data).
       */
      text: string2()
    });
    Base64Schema = string2().refine((val) => {
      try {
        atob(val);
        return true;
      } catch {
        return false;
      }
    }, { message: "Invalid Base64 string" });
    BlobResourceContentsSchema = ResourceContentsSchema.extend({
      /**
       * A base64-encoded string representing the binary data of the item.
       */
      blob: Base64Schema
    });
    RoleSchema = _enum(["user", "assistant"]);
    AnnotationsSchema = object({
      /**
       * Intended audience(s) for the resource.
       */
      audience: array(RoleSchema).optional(),
      /**
       * Importance hint for the resource, from 0 (least) to 1 (most).
       */
      priority: number2().min(0).max(1).optional(),
      /**
       * ISO 8601 timestamp for the most recent modification.
       */
      lastModified: iso_exports.datetime({ offset: true }).optional()
    });
    ResourceSchema = object({
      ...BaseMetadataSchema.shape,
      ...IconsSchema.shape,
      /**
       * The URI of this resource.
       */
      uri: string2(),
      /**
       * A description of what this resource represents.
       *
       * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
       */
      description: optional(string2()),
      /**
       * The MIME type of this resource, if known.
       */
      mimeType: optional(string2()),
      /**
       * Optional annotations for the client.
       */
      annotations: AnnotationsSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: optional(looseObject({}))
    });
    ResourceTemplateSchema = object({
      ...BaseMetadataSchema.shape,
      ...IconsSchema.shape,
      /**
       * A URI template (according to RFC 6570) that can be used to construct resource URIs.
       */
      uriTemplate: string2(),
      /**
       * A description of what this template is for.
       *
       * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
       */
      description: optional(string2()),
      /**
       * The MIME type for all resources that match this template. This should only be included if all resources matching this template have the same type.
       */
      mimeType: optional(string2()),
      /**
       * Optional annotations for the client.
       */
      annotations: AnnotationsSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: optional(looseObject({}))
    });
    ListResourcesRequestSchema = PaginatedRequestSchema.extend({
      method: literal("resources/list")
    });
    ListResourcesResultSchema = PaginatedResultSchema.extend({
      resources: array(ResourceSchema)
    });
    ListResourceTemplatesRequestSchema = PaginatedRequestSchema.extend({
      method: literal("resources/templates/list")
    });
    ListResourceTemplatesResultSchema = PaginatedResultSchema.extend({
      resourceTemplates: array(ResourceTemplateSchema)
    });
    ResourceRequestParamsSchema = BaseRequestParamsSchema.extend({
      /**
       * The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it.
       *
       * @format uri
       */
      uri: string2()
    });
    ReadResourceRequestParamsSchema = ResourceRequestParamsSchema;
    ReadResourceRequestSchema = RequestSchema.extend({
      method: literal("resources/read"),
      params: ReadResourceRequestParamsSchema
    });
    ReadResourceResultSchema = ResultSchema.extend({
      contents: array(union([TextResourceContentsSchema, BlobResourceContentsSchema]))
    });
    ResourceListChangedNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/resources/list_changed"),
      params: NotificationsParamsSchema.optional()
    });
    SubscribeRequestParamsSchema = ResourceRequestParamsSchema;
    SubscribeRequestSchema = RequestSchema.extend({
      method: literal("resources/subscribe"),
      params: SubscribeRequestParamsSchema
    });
    UnsubscribeRequestParamsSchema = ResourceRequestParamsSchema;
    UnsubscribeRequestSchema = RequestSchema.extend({
      method: literal("resources/unsubscribe"),
      params: UnsubscribeRequestParamsSchema
    });
    ResourceUpdatedNotificationParamsSchema = NotificationsParamsSchema.extend({
      /**
       * The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.
       */
      uri: string2()
    });
    ResourceUpdatedNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/resources/updated"),
      params: ResourceUpdatedNotificationParamsSchema
    });
    PromptArgumentSchema = object({
      /**
       * The name of the argument.
       */
      name: string2(),
      /**
       * A human-readable description of the argument.
       */
      description: optional(string2()),
      /**
       * Whether this argument must be provided.
       */
      required: optional(boolean2())
    });
    PromptSchema = object({
      ...BaseMetadataSchema.shape,
      ...IconsSchema.shape,
      /**
       * An optional description of what this prompt provides
       */
      description: optional(string2()),
      /**
       * A list of arguments to use for templating the prompt.
       */
      arguments: optional(array(PromptArgumentSchema)),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: optional(looseObject({}))
    });
    ListPromptsRequestSchema = PaginatedRequestSchema.extend({
      method: literal("prompts/list")
    });
    ListPromptsResultSchema = PaginatedResultSchema.extend({
      prompts: array(PromptSchema)
    });
    GetPromptRequestParamsSchema = BaseRequestParamsSchema.extend({
      /**
       * The name of the prompt or prompt template.
       */
      name: string2(),
      /**
       * Arguments to use for templating the prompt.
       */
      arguments: record(string2(), string2()).optional()
    });
    GetPromptRequestSchema = RequestSchema.extend({
      method: literal("prompts/get"),
      params: GetPromptRequestParamsSchema
    });
    TextContentSchema = object({
      type: literal("text"),
      /**
       * The text content of the message.
       */
      text: string2(),
      /**
       * Optional annotations for the client.
       */
      annotations: AnnotationsSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    ImageContentSchema = object({
      type: literal("image"),
      /**
       * The base64-encoded image data.
       */
      data: Base64Schema,
      /**
       * The MIME type of the image. Different providers may support different image types.
       */
      mimeType: string2(),
      /**
       * Optional annotations for the client.
       */
      annotations: AnnotationsSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    AudioContentSchema = object({
      type: literal("audio"),
      /**
       * The base64-encoded audio data.
       */
      data: Base64Schema,
      /**
       * The MIME type of the audio. Different providers may support different audio types.
       */
      mimeType: string2(),
      /**
       * Optional annotations for the client.
       */
      annotations: AnnotationsSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    ToolUseContentSchema = object({
      type: literal("tool_use"),
      /**
       * The name of the tool to invoke.
       * Must match a tool name from the request's tools array.
       */
      name: string2(),
      /**
       * Unique identifier for this tool call.
       * Used to correlate with ToolResultContent in subsequent messages.
       */
      id: string2(),
      /**
       * Arguments to pass to the tool.
       * Must conform to the tool's inputSchema.
       */
      input: record(string2(), unknown()),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    EmbeddedResourceSchema = object({
      type: literal("resource"),
      resource: union([TextResourceContentsSchema, BlobResourceContentsSchema]),
      /**
       * Optional annotations for the client.
       */
      annotations: AnnotationsSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    ResourceLinkSchema = ResourceSchema.extend({
      type: literal("resource_link")
    });
    ContentBlockSchema = union([
      TextContentSchema,
      ImageContentSchema,
      AudioContentSchema,
      ResourceLinkSchema,
      EmbeddedResourceSchema
    ]);
    PromptMessageSchema = object({
      role: RoleSchema,
      content: ContentBlockSchema
    });
    GetPromptResultSchema = ResultSchema.extend({
      /**
       * An optional description for the prompt.
       */
      description: string2().optional(),
      messages: array(PromptMessageSchema)
    });
    PromptListChangedNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/prompts/list_changed"),
      params: NotificationsParamsSchema.optional()
    });
    ToolAnnotationsSchema = object({
      /**
       * A human-readable title for the tool.
       */
      title: string2().optional(),
      /**
       * If true, the tool does not modify its environment.
       *
       * Default: false
       */
      readOnlyHint: boolean2().optional(),
      /**
       * If true, the tool may perform destructive updates to its environment.
       * If false, the tool performs only additive updates.
       *
       * (This property is meaningful only when `readOnlyHint == false`)
       *
       * Default: true
       */
      destructiveHint: boolean2().optional(),
      /**
       * If true, calling the tool repeatedly with the same arguments
       * will have no additional effect on the its environment.
       *
       * (This property is meaningful only when `readOnlyHint == false`)
       *
       * Default: false
       */
      idempotentHint: boolean2().optional(),
      /**
       * If true, this tool may interact with an "open world" of external
       * entities. If false, the tool's domain of interaction is closed.
       * For example, the world of a web search tool is open, whereas that
       * of a memory tool is not.
       *
       * Default: true
       */
      openWorldHint: boolean2().optional()
    });
    ToolExecutionSchema = object({
      /**
       * Indicates the tool's preference for task-augmented execution.
       * - "required": Clients MUST invoke the tool as a task
       * - "optional": Clients MAY invoke the tool as a task or normal request
       * - "forbidden": Clients MUST NOT attempt to invoke the tool as a task
       *
       * If not present, defaults to "forbidden".
       */
      taskSupport: _enum(["required", "optional", "forbidden"]).optional()
    });
    ToolSchema = object({
      ...BaseMetadataSchema.shape,
      ...IconsSchema.shape,
      /**
       * A human-readable description of the tool.
       */
      description: string2().optional(),
      /**
       * A JSON Schema 2020-12 object defining the expected parameters for the tool.
       * Must have type: 'object' at the root level per MCP spec.
       */
      inputSchema: object({
        type: literal("object"),
        properties: record(string2(), AssertObjectSchema).optional(),
        required: array(string2()).optional()
      }).catchall(unknown()),
      /**
       * An optional JSON Schema 2020-12 object defining the structure of the tool's output
       * returned in the structuredContent field of a CallToolResult.
       * Must have type: 'object' at the root level per MCP spec.
       */
      outputSchema: object({
        type: literal("object"),
        properties: record(string2(), AssertObjectSchema).optional(),
        required: array(string2()).optional()
      }).catchall(unknown()).optional(),
      /**
       * Optional additional tool information.
       */
      annotations: ToolAnnotationsSchema.optional(),
      /**
       * Execution-related properties for this tool.
       */
      execution: ToolExecutionSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    ListToolsRequestSchema = PaginatedRequestSchema.extend({
      method: literal("tools/list")
    });
    ListToolsResultSchema = PaginatedResultSchema.extend({
      tools: array(ToolSchema)
    });
    CallToolResultSchema = ResultSchema.extend({
      /**
       * A list of content objects that represent the result of the tool call.
       *
       * If the Tool does not define an outputSchema, this field MUST be present in the result.
       * For backwards compatibility, this field is always present, but it may be empty.
       */
      content: array(ContentBlockSchema).default([]),
      /**
       * An object containing structured tool output.
       *
       * If the Tool defines an outputSchema, this field MUST be present in the result, and contain a JSON object that matches the schema.
       */
      structuredContent: record(string2(), unknown()).optional(),
      /**
       * Whether the tool call ended in an error.
       *
       * If not set, this is assumed to be false (the call was successful).
       *
       * Any errors that originate from the tool SHOULD be reported inside the result
       * object, with `isError` set to true, _not_ as an MCP protocol-level error
       * response. Otherwise, the LLM would not be able to see that an error occurred
       * and self-correct.
       *
       * However, any errors in _finding_ the tool, an error indicating that the
       * server does not support tool calls, or any other exceptional conditions,
       * should be reported as an MCP error response.
       */
      isError: boolean2().optional()
    });
    CompatibilityCallToolResultSchema = CallToolResultSchema.or(ResultSchema.extend({
      toolResult: unknown()
    }));
    CallToolRequestParamsSchema = TaskAugmentedRequestParamsSchema.extend({
      /**
       * The name of the tool to call.
       */
      name: string2(),
      /**
       * Arguments to pass to the tool.
       */
      arguments: record(string2(), unknown()).optional()
    });
    CallToolRequestSchema = RequestSchema.extend({
      method: literal("tools/call"),
      params: CallToolRequestParamsSchema
    });
    ToolListChangedNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/tools/list_changed"),
      params: NotificationsParamsSchema.optional()
    });
    ListChangedOptionsBaseSchema = object({
      /**
       * If true, the list will be refreshed automatically when a list changed notification is received.
       * The callback will be called with the updated list.
       *
       * If false, the callback will be called with null items, allowing manual refresh.
       *
       * @default true
       */
      autoRefresh: boolean2().default(true),
      /**
       * Debounce time in milliseconds for list changed notification processing.
       *
       * Multiple notifications received within this timeframe will only trigger one refresh.
       * Set to 0 to disable debouncing.
       *
       * @default 300
       */
      debounceMs: number2().int().nonnegative().default(300)
    });
    LoggingLevelSchema = _enum(["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]);
    SetLevelRequestParamsSchema = BaseRequestParamsSchema.extend({
      /**
       * The level of logging that the client wants to receive from the server. The server should send all logs at this level and higher (i.e., more severe) to the client as notifications/logging/message.
       */
      level: LoggingLevelSchema
    });
    SetLevelRequestSchema = RequestSchema.extend({
      method: literal("logging/setLevel"),
      params: SetLevelRequestParamsSchema
    });
    LoggingMessageNotificationParamsSchema = NotificationsParamsSchema.extend({
      /**
       * The severity of this log message.
       */
      level: LoggingLevelSchema,
      /**
       * An optional name of the logger issuing this message.
       */
      logger: string2().optional(),
      /**
       * The data to be logged, such as a string message or an object. Any JSON serializable type is allowed here.
       */
      data: unknown()
    });
    LoggingMessageNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/message"),
      params: LoggingMessageNotificationParamsSchema
    });
    ModelHintSchema = object({
      /**
       * A hint for a model name.
       */
      name: string2().optional()
    });
    ModelPreferencesSchema = object({
      /**
       * Optional hints to use for model selection.
       */
      hints: array(ModelHintSchema).optional(),
      /**
       * How much to prioritize cost when selecting a model.
       */
      costPriority: number2().min(0).max(1).optional(),
      /**
       * How much to prioritize sampling speed (latency) when selecting a model.
       */
      speedPriority: number2().min(0).max(1).optional(),
      /**
       * How much to prioritize intelligence and capabilities when selecting a model.
       */
      intelligencePriority: number2().min(0).max(1).optional()
    });
    ToolChoiceSchema = object({
      /**
       * Controls when tools are used:
       * - "auto": Model decides whether to use tools (default)
       * - "required": Model MUST use at least one tool before completing
       * - "none": Model MUST NOT use any tools
       */
      mode: _enum(["auto", "required", "none"]).optional()
    });
    ToolResultContentSchema = object({
      type: literal("tool_result"),
      toolUseId: string2().describe("The unique identifier for the corresponding tool call."),
      content: array(ContentBlockSchema).default([]),
      structuredContent: object({}).loose().optional(),
      isError: boolean2().optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    SamplingContentSchema = discriminatedUnion("type", [TextContentSchema, ImageContentSchema, AudioContentSchema]);
    SamplingMessageContentBlockSchema = discriminatedUnion("type", [
      TextContentSchema,
      ImageContentSchema,
      AudioContentSchema,
      ToolUseContentSchema,
      ToolResultContentSchema
    ]);
    SamplingMessageSchema = object({
      role: RoleSchema,
      content: union([SamplingMessageContentBlockSchema, array(SamplingMessageContentBlockSchema)]),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    CreateMessageRequestParamsSchema = TaskAugmentedRequestParamsSchema.extend({
      messages: array(SamplingMessageSchema),
      /**
       * The server's preferences for which model to select. The client MAY modify or omit this request.
       */
      modelPreferences: ModelPreferencesSchema.optional(),
      /**
       * An optional system prompt the server wants to use for sampling. The client MAY modify or omit this prompt.
       */
      systemPrompt: string2().optional(),
      /**
       * A request to include context from one or more MCP servers (including the caller), to be attached to the prompt.
       * The client MAY ignore this request.
       *
       * Default is "none". Values "thisServer" and "allServers" are soft-deprecated. Servers SHOULD only use these values if the client
       * declares ClientCapabilities.sampling.context. These values may be removed in future spec releases.
       */
      includeContext: _enum(["none", "thisServer", "allServers"]).optional(),
      temperature: number2().optional(),
      /**
       * The requested maximum number of tokens to sample (to prevent runaway completions).
       *
       * The client MAY choose to sample fewer tokens than the requested maximum.
       */
      maxTokens: number2().int(),
      stopSequences: array(string2()).optional(),
      /**
       * Optional metadata to pass through to the LLM provider. The format of this metadata is provider-specific.
       */
      metadata: AssertObjectSchema.optional(),
      /**
       * Tools that the model may use during generation.
       * The client MUST return an error if this field is provided but ClientCapabilities.sampling.tools is not declared.
       */
      tools: array(ToolSchema).optional(),
      /**
       * Controls how the model uses tools.
       * The client MUST return an error if this field is provided but ClientCapabilities.sampling.tools is not declared.
       * Default is `{ mode: "auto" }`.
       */
      toolChoice: ToolChoiceSchema.optional()
    });
    CreateMessageRequestSchema = RequestSchema.extend({
      method: literal("sampling/createMessage"),
      params: CreateMessageRequestParamsSchema
    });
    CreateMessageResultSchema = ResultSchema.extend({
      /**
       * The name of the model that generated the message.
       */
      model: string2(),
      /**
       * The reason why sampling stopped, if known.
       *
       * Standard values:
       * - "endTurn": Natural end of the assistant's turn
       * - "stopSequence": A stop sequence was encountered
       * - "maxTokens": Maximum token limit was reached
       *
       * This field is an open string to allow for provider-specific stop reasons.
       */
      stopReason: optional(_enum(["endTurn", "stopSequence", "maxTokens"]).or(string2())),
      role: RoleSchema,
      /**
       * Response content. Single content block (text, image, or audio).
       */
      content: SamplingContentSchema
    });
    CreateMessageResultWithToolsSchema = ResultSchema.extend({
      /**
       * The name of the model that generated the message.
       */
      model: string2(),
      /**
       * The reason why sampling stopped, if known.
       *
       * Standard values:
       * - "endTurn": Natural end of the assistant's turn
       * - "stopSequence": A stop sequence was encountered
       * - "maxTokens": Maximum token limit was reached
       * - "toolUse": The model wants to use one or more tools
       *
       * This field is an open string to allow for provider-specific stop reasons.
       */
      stopReason: optional(_enum(["endTurn", "stopSequence", "maxTokens", "toolUse"]).or(string2())),
      role: RoleSchema,
      /**
       * Response content. May be a single block or array. May include ToolUseContent if stopReason is "toolUse".
       */
      content: union([SamplingMessageContentBlockSchema, array(SamplingMessageContentBlockSchema)])
    });
    BooleanSchemaSchema = object({
      type: literal("boolean"),
      title: string2().optional(),
      description: string2().optional(),
      default: boolean2().optional()
    });
    StringSchemaSchema = object({
      type: literal("string"),
      title: string2().optional(),
      description: string2().optional(),
      minLength: number2().optional(),
      maxLength: number2().optional(),
      format: _enum(["email", "uri", "date", "date-time"]).optional(),
      default: string2().optional()
    });
    NumberSchemaSchema = object({
      type: _enum(["number", "integer"]),
      title: string2().optional(),
      description: string2().optional(),
      minimum: number2().optional(),
      maximum: number2().optional(),
      default: number2().optional()
    });
    UntitledSingleSelectEnumSchemaSchema = object({
      type: literal("string"),
      title: string2().optional(),
      description: string2().optional(),
      enum: array(string2()),
      default: string2().optional()
    });
    TitledSingleSelectEnumSchemaSchema = object({
      type: literal("string"),
      title: string2().optional(),
      description: string2().optional(),
      oneOf: array(object({
        const: string2(),
        title: string2()
      })),
      default: string2().optional()
    });
    LegacyTitledEnumSchemaSchema = object({
      type: literal("string"),
      title: string2().optional(),
      description: string2().optional(),
      enum: array(string2()),
      enumNames: array(string2()).optional(),
      default: string2().optional()
    });
    SingleSelectEnumSchemaSchema = union([UntitledSingleSelectEnumSchemaSchema, TitledSingleSelectEnumSchemaSchema]);
    UntitledMultiSelectEnumSchemaSchema = object({
      type: literal("array"),
      title: string2().optional(),
      description: string2().optional(),
      minItems: number2().optional(),
      maxItems: number2().optional(),
      items: object({
        type: literal("string"),
        enum: array(string2())
      }),
      default: array(string2()).optional()
    });
    TitledMultiSelectEnumSchemaSchema = object({
      type: literal("array"),
      title: string2().optional(),
      description: string2().optional(),
      minItems: number2().optional(),
      maxItems: number2().optional(),
      items: object({
        anyOf: array(object({
          const: string2(),
          title: string2()
        }))
      }),
      default: array(string2()).optional()
    });
    MultiSelectEnumSchemaSchema = union([UntitledMultiSelectEnumSchemaSchema, TitledMultiSelectEnumSchemaSchema]);
    EnumSchemaSchema = union([LegacyTitledEnumSchemaSchema, SingleSelectEnumSchemaSchema, MultiSelectEnumSchemaSchema]);
    PrimitiveSchemaDefinitionSchema = union([EnumSchemaSchema, BooleanSchemaSchema, StringSchemaSchema, NumberSchemaSchema]);
    ElicitRequestFormParamsSchema = TaskAugmentedRequestParamsSchema.extend({
      /**
       * The elicitation mode.
       *
       * Optional for backward compatibility. Clients MUST treat missing mode as "form".
       */
      mode: literal("form").optional(),
      /**
       * The message to present to the user describing what information is being requested.
       */
      message: string2(),
      /**
       * A restricted subset of JSON Schema.
       * Only top-level properties are allowed, without nesting.
       */
      requestedSchema: object({
        type: literal("object"),
        properties: record(string2(), PrimitiveSchemaDefinitionSchema),
        required: array(string2()).optional()
      })
    });
    ElicitRequestURLParamsSchema = TaskAugmentedRequestParamsSchema.extend({
      /**
       * The elicitation mode.
       */
      mode: literal("url"),
      /**
       * The message to present to the user explaining why the interaction is needed.
       */
      message: string2(),
      /**
       * The ID of the elicitation, which must be unique within the context of the server.
       * The client MUST treat this ID as an opaque value.
       */
      elicitationId: string2(),
      /**
       * The URL that the user should navigate to.
       */
      url: string2().url()
    });
    ElicitRequestParamsSchema = union([ElicitRequestFormParamsSchema, ElicitRequestURLParamsSchema]);
    ElicitRequestSchema = RequestSchema.extend({
      method: literal("elicitation/create"),
      params: ElicitRequestParamsSchema
    });
    ElicitationCompleteNotificationParamsSchema = NotificationsParamsSchema.extend({
      /**
       * The ID of the elicitation that completed.
       */
      elicitationId: string2()
    });
    ElicitationCompleteNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/elicitation/complete"),
      params: ElicitationCompleteNotificationParamsSchema
    });
    ElicitResultSchema = ResultSchema.extend({
      /**
       * The user action in response to the elicitation.
       * - "accept": User submitted the form/confirmed the action
       * - "decline": User explicitly decline the action
       * - "cancel": User dismissed without making an explicit choice
       */
      action: _enum(["accept", "decline", "cancel"]),
      /**
       * The submitted form data, only present when action is "accept".
       * Contains values matching the requested schema.
       * Per MCP spec, content is "typically omitted" for decline/cancel actions.
       * We normalize null to undefined for leniency while maintaining type compatibility.
       */
      content: preprocess((val) => val === null ? void 0 : val, record(string2(), union([string2(), number2(), boolean2(), array(string2())])).optional())
    });
    ResourceTemplateReferenceSchema = object({
      type: literal("ref/resource"),
      /**
       * The URI or URI template of the resource.
       */
      uri: string2()
    });
    PromptReferenceSchema = object({
      type: literal("ref/prompt"),
      /**
       * The name of the prompt or prompt template
       */
      name: string2()
    });
    CompleteRequestParamsSchema = BaseRequestParamsSchema.extend({
      ref: union([PromptReferenceSchema, ResourceTemplateReferenceSchema]),
      /**
       * The argument's information
       */
      argument: object({
        /**
         * The name of the argument
         */
        name: string2(),
        /**
         * The value of the argument to use for completion matching.
         */
        value: string2()
      }),
      context: object({
        /**
         * Previously-resolved variables in a URI template or prompt.
         */
        arguments: record(string2(), string2()).optional()
      }).optional()
    });
    CompleteRequestSchema = RequestSchema.extend({
      method: literal("completion/complete"),
      params: CompleteRequestParamsSchema
    });
    CompleteResultSchema = ResultSchema.extend({
      completion: looseObject({
        /**
         * An array of completion values. Must not exceed 100 items.
         */
        values: array(string2()).max(100),
        /**
         * The total number of completion options available. This can exceed the number of values actually sent in the response.
         */
        total: optional(number2().int()),
        /**
         * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
         */
        hasMore: optional(boolean2())
      })
    });
    RootSchema = object({
      /**
       * The URI identifying the root. This *must* start with file:// for now.
       */
      uri: string2().startsWith("file://"),
      /**
       * An optional name for the root.
       */
      name: string2().optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    ListRootsRequestSchema = RequestSchema.extend({
      method: literal("roots/list"),
      params: BaseRequestParamsSchema.optional()
    });
    ListRootsResultSchema = ResultSchema.extend({
      roots: array(RootSchema)
    });
    RootsListChangedNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/roots/list_changed"),
      params: NotificationsParamsSchema.optional()
    });
    ClientRequestSchema = union([
      PingRequestSchema,
      InitializeRequestSchema,
      CompleteRequestSchema,
      SetLevelRequestSchema,
      GetPromptRequestSchema,
      ListPromptsRequestSchema,
      ListResourcesRequestSchema,
      ListResourceTemplatesRequestSchema,
      ReadResourceRequestSchema,
      SubscribeRequestSchema,
      UnsubscribeRequestSchema,
      CallToolRequestSchema,
      ListToolsRequestSchema,
      GetTaskRequestSchema,
      GetTaskPayloadRequestSchema,
      ListTasksRequestSchema,
      CancelTaskRequestSchema
    ]);
    ClientNotificationSchema = union([
      CancelledNotificationSchema,
      ProgressNotificationSchema,
      InitializedNotificationSchema,
      RootsListChangedNotificationSchema,
      TaskStatusNotificationSchema
    ]);
    ClientResultSchema = union([
      EmptyResultSchema,
      CreateMessageResultSchema,
      CreateMessageResultWithToolsSchema,
      ElicitResultSchema,
      ListRootsResultSchema,
      GetTaskResultSchema,
      ListTasksResultSchema,
      CreateTaskResultSchema
    ]);
    ServerRequestSchema = union([
      PingRequestSchema,
      CreateMessageRequestSchema,
      ElicitRequestSchema,
      ListRootsRequestSchema,
      GetTaskRequestSchema,
      GetTaskPayloadRequestSchema,
      ListTasksRequestSchema,
      CancelTaskRequestSchema
    ]);
    ServerNotificationSchema = union([
      CancelledNotificationSchema,
      ProgressNotificationSchema,
      LoggingMessageNotificationSchema,
      ResourceUpdatedNotificationSchema,
      ResourceListChangedNotificationSchema,
      ToolListChangedNotificationSchema,
      PromptListChangedNotificationSchema,
      TaskStatusNotificationSchema,
      ElicitationCompleteNotificationSchema
    ]);
    ServerResultSchema = union([
      EmptyResultSchema,
      InitializeResultSchema,
      CompleteResultSchema,
      GetPromptResultSchema,
      ListPromptsResultSchema,
      ListResourcesResultSchema,
      ListResourceTemplatesResultSchema,
      ReadResourceResultSchema,
      CallToolResultSchema,
      ListToolsResultSchema,
      GetTaskResultSchema,
      ListTasksResultSchema,
      CreateTaskResultSchema
    ]);
  }
});

// ../../node_modules/.pnpm/@modelcontextprotocol+sdk@1.26.0_zod@4.3.6/node_modules/@modelcontextprotocol/sdk/dist/esm/shared/stdio.js
function deserializeMessage(line) {
  return JSONRPCMessageSchema.parse(JSON.parse(line));
}
function serializeMessage(message) {
  return JSON.stringify(message) + "\n";
}
var ReadBuffer;
var init_stdio = __esm({
  "../../node_modules/.pnpm/@modelcontextprotocol+sdk@1.26.0_zod@4.3.6/node_modules/@modelcontextprotocol/sdk/dist/esm/shared/stdio.js"() {
    "use strict";
    init_types();
    ReadBuffer = class {
      append(chunk) {
        this._buffer = this._buffer ? Buffer.concat([this._buffer, chunk]) : chunk;
      }
      readMessage() {
        if (!this._buffer) {
          return null;
        }
        const index = this._buffer.indexOf("\n");
        if (index === -1) {
          return null;
        }
        const line = this._buffer.toString("utf8", 0, index).replace(/\r$/, "");
        this._buffer = this._buffer.subarray(index + 1);
        return deserializeMessage(line);
      }
      clear() {
        this._buffer = void 0;
      }
    };
  }
});

// ../../node_modules/.pnpm/@modelcontextprotocol+sdk@1.26.0_zod@4.3.6/node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js
var stdio_exports = {};
__export(stdio_exports, {
  StdioServerTransport: () => StdioServerTransport
});
import process3 from "process";
var StdioServerTransport;
var init_stdio2 = __esm({
  "../../node_modules/.pnpm/@modelcontextprotocol+sdk@1.26.0_zod@4.3.6/node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js"() {
    "use strict";
    init_stdio();
    StdioServerTransport = class {
      constructor(_stdin = process3.stdin, _stdout = process3.stdout) {
        this._stdin = _stdin;
        this._stdout = _stdout;
        this._readBuffer = new ReadBuffer();
        this._started = false;
        this._ondata = (chunk) => {
          this._readBuffer.append(chunk);
          this.processReadBuffer();
        };
        this._onerror = (error2) => {
          this.onerror?.(error2);
        };
      }
      /**
       * Starts listening for messages on stdin.
       */
      async start() {
        if (this._started) {
          throw new Error("StdioServerTransport already started! If using Server class, note that connect() calls start() automatically.");
        }
        this._started = true;
        this._stdin.on("data", this._ondata);
        this._stdin.on("error", this._onerror);
      }
      processReadBuffer() {
        while (true) {
          try {
            const message = this._readBuffer.readMessage();
            if (message === null) {
              break;
            }
            this.onmessage?.(message);
          } catch (error2) {
            this.onerror?.(error2);
          }
        }
      }
      async close() {
        this._stdin.off("data", this._ondata);
        this._stdin.off("error", this._onerror);
        const remainingDataListeners = this._stdin.listenerCount("data");
        if (remainingDataListeners === 0) {
          this._stdin.pause();
        }
        this._readBuffer.clear();
        this.onclose?.();
      }
      send(message) {
        return new Promise((resolve) => {
          const json2 = serializeMessage(message);
          if (this._stdout.write(json2)) {
            resolve();
          } else {
            this._stdout.once("drain", resolve);
          }
        });
      }
    };
  }
});

// src/mcp.ts
import { CommandRegistry } from "@supernal/universal-command";
import { createMCPServer } from "@supernal/universal-command/mcp";

// src/universal-commands.ts
import { UniversalCommand } from "@supernal/universal-command";
import fs22 from "fs";
import path24 from "path";

// src/cli/git-hooks.ts
import fs from "fs";
import path from "path";
var START_MARKER = "# >>> repotype-checks >>>";
var END_MARKER = "# <<< repotype-checks <<<";
var MARKER_REGEX = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}\\n?`, "m");
function findGitRoot(startPath) {
  let dir = path.resolve(startPath);
  if (fs.existsSync(dir) && fs.statSync(dir).isFile()) {
    dir = path.dirname(dir);
  }
  while (true) {
    const gitPath = path.join(dir, ".git");
    if (fs.existsSync(gitPath)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("No .git directory found in current or parent directories");
    }
    dir = parent;
  }
}
function resolveGitDir(repoRoot) {
  const dotGit = path.join(repoRoot, ".git");
  if (!fs.existsSync(dotGit)) {
    throw new Error(`.git path not found for repo root: ${repoRoot}`);
  }
  const stat = fs.statSync(dotGit);
  if (stat.isDirectory()) {
    return dotGit;
  }
  if (stat.isFile()) {
    const content = fs.readFileSync(dotGit, "utf8").trim();
    const match = content.match(/^gitdir:\s*(.+)$/i);
    if (!match) {
      throw new Error(`Unsupported .git file format at: ${dotGit}`);
    }
    const rawGitDir = match[1].trim();
    return path.isAbsolute(rawGitDir) ? rawGitDir : path.resolve(repoRoot, rawGitDir);
  }
  throw new Error(`Unsupported .git path type at: ${dotGit}`);
}
function resolveHooksDir(repoRoot) {
  const gitDir = resolveGitDir(repoRoot);
  const hooksDir = path.join(gitDir, "hooks");
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }
  return hooksDir;
}
function makeHookSnippet(repoRoot) {
  return `${START_MARKER}
REPO_ROOT="${repoRoot}"
if command -v repotype >/dev/null 2>&1; then
  repotype validate "$REPO_ROOT"
elif command -v pnpm >/dev/null 2>&1; then
  pnpm --silent exec repotype validate "$REPO_ROOT"
else
  echo "repotype CLI not found. Install @supernal/repotype or add it to PATH."
  exit 1
fi
${END_MARKER}
`;
}
function upsertHook(hookFile, snippet) {
  const shebang = "#!/usr/bin/env bash\nset -euo pipefail\n\n";
  if (!fs.existsSync(hookFile)) {
    fs.writeFileSync(hookFile, `${shebang}${snippet}`);
    fs.chmodSync(hookFile, 493);
    return "created";
  }
  let current = fs.readFileSync(hookFile, "utf8");
  if (!current.startsWith("#!")) {
    current = `${shebang}${current}`;
  }
  if (MARKER_REGEX.test(current)) {
    const next = current.replace(MARKER_REGEX, snippet);
    if (next === current) {
      fs.chmodSync(hookFile, 493);
      return "unchanged";
    }
    fs.writeFileSync(hookFile, next);
    fs.chmodSync(hookFile, 493);
    return "updated";
  }
  const separator = current.endsWith("\n") ? "\n" : "\n\n";
  fs.writeFileSync(hookFile, `${current}${separator}${snippet}`);
  fs.chmodSync(hookFile, 493);
  return "updated";
}
function installChecks(options) {
  const repoRoot = findGitRoot(options.target);
  const hooksDir = resolveHooksDir(repoRoot);
  const hookNames = options.hook === "both" ? ["pre-commit", "pre-push"] : [options.hook];
  const snippet = makeHookSnippet(repoRoot);
  const hooks = hookNames.map((hook) => {
    const hookPath = path.join(hooksDir, hook);
    const status = upsertHook(hookPath, snippet);
    return { hook, status, path: hookPath };
  });
  return { repoRoot, hooks };
}
function inspectChecks(target) {
  const repoRoot = findGitRoot(target);
  const hooksDir = resolveHooksDir(repoRoot);
  const hookNames = ["pre-commit", "pre-push"];
  const hooks = hookNames.map((hook) => {
    const hookPath = path.join(hooksDir, hook);
    if (!fs.existsSync(hookPath)) {
      return { hook, path: hookPath, exists: false, managed: false };
    }
    const content = fs.readFileSync(hookPath, "utf8");
    return {
      hook,
      path: hookPath,
      exists: true,
      managed: MARKER_REGEX.test(content)
    };
  });
  return { repoRoot, hooks };
}
function uninstallChecks(options) {
  const repoRoot = findGitRoot(options.target);
  const hooksDir = resolveHooksDir(repoRoot);
  const hookNames = options.hook === "both" ? ["pre-commit", "pre-push"] : [options.hook];
  const hooks = hookNames.map((hook) => {
    const hookPath = path.join(hooksDir, hook);
    if (!fs.existsSync(hookPath)) {
      return { hook, status: "not_found", path: hookPath };
    }
    const current = fs.readFileSync(hookPath, "utf8");
    if (!MARKER_REGEX.test(current)) {
      return { hook, status: "unchanged", path: hookPath };
    }
    const next = current.replace(MARKER_REGEX, "").trimEnd();
    fs.writeFileSync(hookPath, next.length > 0 ? `${next}
` : "");
    fs.chmodSync(hookPath, 493);
    return { hook, status: "removed", path: hookPath };
  });
  return { repoRoot, hooks };
}

// src/cli/cleanup.ts
import fs19 from "fs";
import path21 from "path";

// src/cli/use-cases.ts
import fs18 from "fs";
import path20 from "path";

// src/core/autofix.ts
import fs3 from "fs";

// src/core/markdown.ts
import fs2 from "fs";
import yaml from "js-yaml";
function parseMarkdown(filePath) {
  const raw = fs2.readFileSync(filePath, "utf8");
  return parseMarkdownContent(raw);
}
function parseMarkdownContent(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return {
      frontmatter: {},
      body: raw,
      raw
    };
  }
  const fmRaw = match[1];
  const body = match[2] || "";
  const parsed = yaml.load(fmRaw) || {};
  return {
    frontmatter: parsed,
    body,
    raw
  };
}
function serializeMarkdown(frontmatter, body) {
  const fm = yaml.dump(frontmatter, { lineWidth: -1, noRefs: true }).trimEnd();
  return `---
${fm}
---

${body.trimStart()}`;
}
function extractSections(markdownBody) {
  const matches = markdownBody.match(/^##+\s+(.+)$/gm) || [];
  return matches.map((line) => line.replace(/^##+\s+/, "").trim());
}

// src/core/autofix.ts
function applyToFile(file2, action) {
  const raw = fs3.readFileSync(file2, "utf8");
  const parsed = parseMarkdownContent(raw);
  let body = parsed.body || "";
  const frontmatter = parsed.frontmatter || {};
  if (action.type === "add_frontmatter_field") {
    const key = String(action.payload.key || "");
    if (!key || Object.hasOwn(frontmatter, key)) {
      return false;
    }
    frontmatter[key] = action.payload.value;
  }
  if (action.type === "add_section") {
    const section = String(action.payload.section || "");
    if (!section || body.includes(`## ${section}`)) {
      return false;
    }
    body = `${body.trimEnd()}

## ${section}

`;
  }
  if (action.type === "remove_template_hint") {
    const hint = String(action.payload.hint || "");
    if (!hint || !body.includes(hint)) {
      return false;
    }
    body = body.replaceAll(hint, "");
  }
  fs3.writeFileSync(file2, serializeMarkdown(frontmatter, body));
  return true;
}
function applyAutofixes(actions) {
  let applied = 0;
  const diagnostics = [];
  for (const action of actions) {
    if (!action.safe) {
      continue;
    }
    const ok = applyToFile(action.file, action);
    if (ok) {
      applied += 1;
    }
  }
  return {
    applied,
    diagnostics
  };
}

// src/core/config-loader.ts
import crypto from "crypto";
import fs5 from "fs";
import path3 from "path";
import { globSync as globSync2 } from "glob";
import yaml2 from "js-yaml";

// src/core/path-ignore.ts
import fs4 from "fs";
import path2 from "path";
import { globSync } from "glob";
import { minimatch } from "minimatch";
var MATCH_OPTS = { dot: true, nocase: false, nocomment: true };
var STATIC_IGNORES = ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"];
function normalize(value) {
  return value.replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/\/+$/, "");
}
function parseIgnoreLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  let raw = trimmed;
  let negated = false;
  if (raw.startsWith("!")) {
    negated = true;
    raw = raw.slice(1).trim();
  }
  if (!raw) {
    return null;
  }
  const directoryOnly = raw.endsWith("/");
  let pattern = directoryOnly ? raw.slice(0, -1) : raw;
  pattern = pattern.replace(/^\/+/, "");
  if (!pattern) {
    return null;
  }
  return {
    base: ".",
    pattern,
    negated,
    directoryOnly,
    hasSlash: pattern.includes("/")
  };
}
function toLocalPath(base, relativePath) {
  if (base === ".") {
    return relativePath;
  }
  if (relativePath === base) {
    return "";
  }
  if (relativePath.startsWith(`${base}/`)) {
    return relativePath.slice(base.length + 1);
  }
  return null;
}
function matchesRule(localPath, rule) {
  if (rule.directoryOnly) {
    const directoryPattern = normalize(rule.pattern);
    if (!directoryPattern) {
      return false;
    }
    return localPath === directoryPattern || minimatch(localPath, `${directoryPattern}/**`, MATCH_OPTS);
  }
  if (rule.hasSlash) {
    return minimatch(localPath, rule.pattern, MATCH_OPTS);
  }
  return minimatch(localPath, rule.pattern, { ...MATCH_OPTS, matchBase: true }) || minimatch(localPath, `**/${rule.pattern}`, MATCH_OPTS);
}
function collectIgnoreRules(repoRoot) {
  const root = path2.resolve(repoRoot);
  const ignoreFiles = globSync("**/.*ignore*", {
    cwd: root,
    absolute: true,
    nodir: true,
    dot: true,
    ignore: STATIC_IGNORES
  }).sort((a, b) => {
    const depthDiff = normalize(path2.relative(root, path2.dirname(a))).split("/").length - normalize(path2.relative(root, path2.dirname(b))).split("/").length;
    return depthDiff !== 0 ? depthDiff : a.localeCompare(b);
  });
  const rules = [];
  for (const ignoreFile of ignoreFiles) {
    const dirRel = normalize(path2.relative(root, path2.dirname(ignoreFile))) || ".";
    const lines = fs4.readFileSync(ignoreFile, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const parsed = parseIgnoreLine(line);
      if (!parsed) {
        continue;
      }
      rules.push({
        ...parsed,
        base: dirRel
      });
    }
  }
  return rules;
}
function createIgnoreMatcher(repoRoot) {
  const root = path2.resolve(repoRoot);
  const rules = collectIgnoreRules(root);
  return {
    isIgnored(absolutePath) {
      const rel = normalize(path2.relative(root, path2.resolve(absolutePath)));
      if (!rel || rel.startsWith("..")) {
        return false;
      }
      let ignored = false;
      for (const rule of rules) {
        const localPath = toLocalPath(rule.base, rel);
        if (localPath === null) {
          continue;
        }
        if (matchesRule(localPath, rule)) {
          ignored = !rule.negated;
        }
      }
      return ignored;
    }
  };
}
function getStaticIgnoreGlobs() {
  return [...STATIC_IGNORES];
}

// src/core/config-loader.ts
function findConfig(startPath) {
  const resolved = path3.resolve(startPath);
  const exists = fs5.existsSync(resolved);
  const initial = exists ? fs5.statSync(resolved).isDirectory() ? resolved : path3.dirname(resolved) : path3.dirname(resolved);
  let dir = initial;
  while (true) {
    const candidates = ["repotype.yaml", "repo-schema.yaml"];
    for (const name of candidates) {
      const candidate = path3.join(dir, name);
      if (fs5.existsSync(candidate)) {
        return candidate;
      }
    }
    const parent = path3.dirname(dir);
    if (parent === dir) {
      throw new Error("No schema config found. Expected repotype.yaml or repo-schema.yaml");
    }
    dir = parent;
  }
}
function parseConfigFile(configPath) {
  const raw = fs5.readFileSync(configPath, "utf8");
  const parsed = yaml2.load(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid schema configuration in ${configPath}`);
  }
  return parsed;
}
function asArray(input) {
  if (!input) return [];
  return Array.isArray(input) ? input : [input];
}
function mergeConfig(base, override) {
  const merged = {
    version: override.version || base.version,
    defaults: {
      ...base.defaults,
      ...override.defaults
    },
    operations: {
      hooks: {
        ...base.operations?.hooks,
        ...override.operations?.hooks
      },
      watcher: {
        ...base.operations?.watcher,
        ...override.operations?.watcher
      }
    },
    folders: [...base.folders || [], ...override.folders || []],
    files: [...base.files || [], ...override.files || []],
    templates: [...base.templates || [], ...override.templates || []],
    rules: [...base.rules || [], ...override.rules || []],
    plugins: [...base.plugins || [], ...override.plugins || []]
  };
  if (!merged.defaults || Object.keys(merged.defaults).length === 0) {
    delete merged.defaults;
  }
  if (!merged.operations || (!merged.operations.hooks || Object.keys(merged.operations.hooks).length === 0) && (!merged.operations.watcher || Object.keys(merged.operations.watcher).length === 0)) {
    delete merged.operations;
  }
  if (merged.folders?.length === 0) delete merged.folders;
  if (merged.files?.length === 0) delete merged.files;
  if (merged.templates?.length === 0) delete merged.templates;
  if (merged.rules?.length === 0) delete merged.rules;
  if (merged.plugins?.length === 0) delete merged.plugins;
  return merged;
}
function loadConfigRecursive(configPath, loading) {
  const absolutePath = path3.resolve(configPath);
  if (loading.has(absolutePath)) {
    throw new Error(`Circular config extends detected at ${absolutePath}`);
  }
  loading.add(absolutePath);
  const parsed = parseConfigFile(absolutePath);
  const parents = asArray(parsed.extends);
  let merged = {
    version: ""
  };
  for (const parentRef of parents) {
    const parentPath = path3.resolve(path3.dirname(absolutePath), parentRef);
    if (!fs5.existsSync(parentPath)) {
      throw new Error(`Extended config not found: ${parentPath} (from ${absolutePath})`);
    }
    const parentConfig = loadConfigRecursive(parentPath, loading);
    merged = mergeConfig(merged, parentConfig);
  }
  const current = {
    ...parsed
  };
  delete current.extends;
  merged = mergeConfig(merged, current);
  loading.delete(absolutePath);
  if (!merged.version) {
    throw new Error(`Missing required field: version in ${absolutePath} (or inherited configs)`);
  }
  return merged;
}
function loadConfig(configPath) {
  return loadConfigRecursive(configPath, /* @__PURE__ */ new Set());
}
function collectExtendsDeps(configPath, seen = /* @__PURE__ */ new Set()) {
  const absolutePath = path3.resolve(configPath);
  if (seen.has(absolutePath)) return [];
  seen.add(absolutePath);
  let raw;
  try {
    raw = parseConfigFile(absolutePath);
  } catch {
    return [absolutePath];
  }
  const parents = asArray(raw.extends).map((p) => path3.resolve(path3.dirname(absolutePath), p));
  return [absolutePath, ...parents.flatMap((p) => collectExtendsDeps(p, seen))];
}
function hashConfigFiles(configPaths) {
  const allDeps = configPaths.flatMap((p) => collectExtendsDeps(p));
  const unique = [...new Set(allDeps)].sort();
  const hasher = crypto.createHash("sha256");
  for (const filePath of unique) {
    hasher.update(filePath);
    hasher.update("\0");
    try {
      hasher.update(fs5.readFileSync(filePath, "utf8"));
    } catch {
    }
    hasher.update("\0");
  }
  return hasher.digest("hex");
}
var CONFIG_NAMES = ["repotype.yaml", "repo-schema.yaml"];
var WORKSPACE_CACHE_VERSION = 2;
function discoverWorkspaces(rootDir, ignoreMatcher) {
  const root = path3.resolve(rootDir);
  const allPaths = globSync2(["**/repotype.yaml", "**/repo-schema.yaml"], {
    cwd: root,
    absolute: true,
    nodir: true,
    ignore: getStaticIgnoreGlobs()
  });
  const rootConfigs = new Set(CONFIG_NAMES.map((n) => path3.join(root, n)));
  const candidates = allPaths.filter((p) => {
    if (rootConfigs.has(p)) return false;
    if (ignoreMatcher.isIgnored(p)) return false;
    return true;
  });
  const entries = candidates.map((configPath) => {
    const subtreeRoot = path3.resolve(path3.dirname(configPath));
    const depth = subtreeRoot.split(path3.sep).filter(Boolean).length;
    return { configPath, subtreeRoot, depth };
  });
  entries.sort((a, b) => {
    if (b.depth !== a.depth) return b.depth - a.depth;
    return a.subtreeRoot.localeCompare(b.subtreeRoot);
  });
  return entries;
}
function resolveOwningWorkspace(absoluteFilePath, workspaces) {
  for (const ws of workspaces) {
    if (absoluteFilePath === ws.subtreeRoot || absoluteFilePath.startsWith(ws.subtreeRoot + path3.sep)) {
      return ws;
    }
  }
  return "root";
}
function getCacheFilePath(repoRoot) {
  return path3.join(repoRoot, ".repotype", "cache", "workspace.json");
}
function loadWorkspaceCache(repoRoot) {
  const cachePath = getCacheFilePath(repoRoot);
  try {
    const raw = fs5.readFileSync(cachePath, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.version !== WORKSPACE_CACHE_VERSION) return null;
    if (parsed.repoRoot !== path3.resolve(repoRoot)) return null;
    return parsed;
  } catch {
    return null;
  }
}
function writeWorkspaceCache(repoRoot, cache) {
  const cachePath = getCacheFilePath(repoRoot);
  const cacheDir = path3.dirname(cachePath);
  fs5.mkdirSync(cacheDir, { recursive: true });
  const tmpPath = `${cachePath}.${process.pid}.tmp`;
  try {
    fs5.writeFileSync(tmpPath, JSON.stringify(cache, null, 2), "utf8");
    fs5.renameSync(tmpPath, cachePath);
  } catch {
    try {
      fs5.unlinkSync(tmpPath);
    } catch {
    }
  }
}

// src/core/plugin-runner.ts
import path4 from "path";
import { execSync } from "child_process";
function runCommand(command, repoRoot) {
  const cwd = command.cwd ? path4.resolve(repoRoot, command.cwd) : repoRoot;
  try {
    const output = execSync(command.cmd, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      shell: process.env.SHELL || "/bin/sh",
      env: process.env
    });
    return { ok: true, output: output?.trim?.() || "", code: 0 };
  } catch (error2) {
    const stdout = typeof error2?.stdout === "string" ? error2.stdout : "";
    const stderr = typeof error2?.stderr === "string" ? error2.stderr : "";
    const output = `${stdout}
${stderr}`.trim();
    return {
      ok: false,
      output,
      code: typeof error2?.status === "number" ? error2.status : 1
    };
  }
}
function isEnabled(plugin) {
  return plugin.enabled !== false;
}
function asFailureSeverity(plugin) {
  const severity = plugin.severityOnFailure || "error";
  if (severity === "warning" || severity === "suggestion") {
    return severity;
  }
  return "error";
}
function runPluginPhase(config2, repoRoot, phase) {
  const diagnostics = [];
  const plugins = config2.plugins || [];
  for (const plugin of plugins) {
    if (!isEnabled(plugin)) {
      continue;
    }
    const command = phase === "validate" ? plugin.validate : plugin.fix;
    if (!command) {
      continue;
    }
    const result = runCommand(command, repoRoot);
    if (result.ok) {
      diagnostics.push({
        code: `plugin_${phase}_ok`,
        message: `Plugin '${plugin.id}' ${phase} command succeeded`,
        severity: "suggestion",
        file: repoRoot,
        ruleId: plugin.id,
        details: {
          command: command.cmd,
          output: result.output || void 0
        }
      });
      continue;
    }
    diagnostics.push({
      code: `plugin_${phase}_failed`,
      message: `Plugin '${plugin.id}' ${phase} command failed (exit ${result.code})`,
      severity: asFailureSeverity(plugin),
      file: repoRoot,
      ruleId: plugin.id,
      details: {
        command: command.cmd,
        output: result.output || void 0
      }
    });
  }
  return diagnostics;
}
function installPlugins(config2, repoRoot) {
  const results = [];
  const plugins = config2.plugins || [];
  for (const plugin of plugins) {
    if (!isEnabled(plugin)) {
      continue;
    }
    for (const command of plugin.install || []) {
      const result = runCommand(command, repoRoot);
      results.push({
        id: plugin.id,
        ok: result.ok,
        command: command.cmd,
        code: result.code,
        output: result.output || void 0
      });
    }
  }
  return results;
}
function describePlugins(config2) {
  return (config2.plugins || []).map((plugin) => ({
    id: plugin.id,
    enabled: isEnabled(plugin),
    hasInstall: Boolean(plugin.install && plugin.install.length > 0),
    hasValidate: Boolean(plugin.validate),
    hasFix: Boolean(plugin.fix)
  }));
}

// src/core/schema-generator.ts
import fs6 from "fs";
import path5 from "path";
import { globSync as globSync3 } from "glob";
function inferType(value) {
  if (Array.isArray(value)) {
    return "array";
  }
  if (value === null) {
    return "null";
  }
  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return Number.isInteger(value) ? "integer" : "number";
    case "boolean":
      return "boolean";
    case "object":
      return "object";
    default:
      return "string";
  }
}
function inferArrayItems(values) {
  const itemTypes = /* @__PURE__ */ new Set();
  for (const value of values) {
    if (Array.isArray(value)) {
      for (const item of value) {
        itemTypes.add(inferType(item));
      }
    }
  }
  if (itemTypes.size === 0) {
    return {};
  }
  if (itemTypes.size === 1) {
    return { type: [...itemTypes][0] };
  }
  return {
    anyOf: [...itemTypes].map((type) => ({ type }))
  };
}
function inferPropertySchema(values) {
  const types = new Set(values.map((value) => inferType(value)));
  if (types.size === 0) {
    return {};
  }
  if (types.size === 1) {
    const only = [...types][0];
    if (only === "array") {
      return {
        type: "array",
        items: inferArrayItems(values)
      };
    }
    return { type: only };
  }
  return {
    anyOf: [...types].map(
      (type) => type === "array" ? { type: "array", items: inferArrayItems(values) } : { type }
    )
  };
}
function discoverMarkdownFiles(targetPath, pattern) {
  const absolute = path5.resolve(targetPath);
  const stat = fs6.statSync(absolute);
  const repoRoot = stat.isDirectory() ? absolute : path5.dirname(absolute);
  const ignoreMatcher = createIgnoreMatcher(repoRoot);
  if (stat.isFile()) {
    return ignoreMatcher.isIgnored(absolute) ? [] : [absolute];
  }
  const discovered = globSync3(pattern, {
    cwd: absolute,
    absolute: true,
    nodir: true,
    ignore: getStaticIgnoreGlobs()
  });
  return discovered.filter((filePath) => !ignoreMatcher.isIgnored(filePath));
}
function generateFrontmatterSchemaFromContent(targetPath, outputPath, pattern = "**/*.md") {
  const files = discoverMarkdownFiles(targetPath, pattern);
  const aggregate = /* @__PURE__ */ new Map();
  let filesParsed = 0;
  let filesFailed = 0;
  for (const file2 of files) {
    try {
      const parsed = parseMarkdown(file2);
      const frontmatter = parsed.frontmatter || {};
      filesParsed += 1;
      for (const [key, value] of Object.entries(frontmatter)) {
        const current = aggregate.get(key) || { count: 0, values: [] };
        current.count += 1;
        current.values.push(value);
        aggregate.set(key, current);
      }
    } catch {
      filesFailed += 1;
    }
  }
  const properties = {};
  const required2 = [];
  for (const [key, entry] of aggregate.entries()) {
    properties[key] = inferPropertySchema(entry.values);
    if (filesParsed > 0 && entry.count === filesParsed) {
      required2.push(key);
    }
  }
  const schema = {
    type: "object",
    required: required2.sort(),
    properties,
    additionalProperties: true
  };
  const outputAbsolute = path5.resolve(outputPath);
  fs6.mkdirSync(path5.dirname(outputAbsolute), { recursive: true });
  fs6.writeFileSync(outputAbsolute, `${JSON.stringify(schema, null, 2)}
`);
  return {
    output: outputAbsolute,
    filesConsidered: files.length,
    filesParsed,
    filesFailed,
    required: required2.sort(),
    properties: Object.keys(properties).sort()
  };
}

// src/core/rule-engine.ts
import path6 from "path";

// src/core/glob.ts
import { minimatch as minimatch2 } from "minimatch";
function matchesGlob(pathValue, glob) {
  return minimatch2(pathValue, glob, { dot: true, nocase: false, nocomment: true });
}

// src/core/rule-engine.ts
function normalize2(p) {
  return p.replace(/\\\\/g, "/").replace(/^\.\//, "");
}
function folderRuleMatches(rule, relativePath) {
  const directory = normalize2(path6.dirname(relativePath));
  if (rule.path) {
    const rp = normalize2(rule.path);
    return directory === rp || directory.startsWith(`${rp}/`);
  }
  if (rule.glob) {
    return matchesGlob(directory, normalize2(rule.glob));
  }
  return false;
}
function resolveEffectiveRules(config2, repoRoot, absoluteFilePath) {
  const relativePath = normalize2(path6.relative(repoRoot, absoluteFilePath));
  const folderRules = (config2.folders || []).filter((rule) => folderRuleMatches(rule, relativePath));
  const fileRules = (config2.files || []).filter((rule) => typeof rule.glob === "string" && matchesGlob(relativePath, normalize2(rule.glob)));
  const requiredSections = /* @__PURE__ */ new Set();
  const templateHints = /* @__PURE__ */ new Set();
  let schema;
  let template;
  let crossReferences;
  for (const rule of fileRules) {
    for (const section of rule.requiredSections || []) {
      requiredSections.add(section);
    }
    for (const hint of rule.templateHints || []) {
      templateHints.add(hint);
    }
    if (rule.schema) {
      schema = rule.schema;
    }
    if (rule.template) {
      template = rule.template;
    }
    if (rule.crossReferences) {
      crossReferences = rule.crossReferences;
    }
  }
  return {
    filePath: relativePath,
    folderRules,
    fileRules,
    requiredSections: [...requiredSections],
    templateHints: [...templateHints],
    schema,
    template,
    crossReferences
  };
}
function explainRules(config2, repoRoot, absoluteFilePath) {
  const effective = resolveEffectiveRules(config2, repoRoot, absoluteFilePath);
  const reason = [
    ...effective.folderRules.map((rule) => `Matched folder rule: ${rule.id || rule.path || rule.glob}`),
    ...effective.fileRules.map((rule) => `Matched file rule: ${rule.id || rule.glob}`)
  ];
  return { effective, reason };
}

// src/core/template-engine.ts
import fs7 from "fs";
import path7 from "path";
import Handlebars from "handlebars";
function renderTemplate(config2, repoRoot, templateId, variables) {
  const template = (config2.templates || []).find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  const templatePath = path7.resolve(repoRoot, template.path);
  const source = fs7.readFileSync(templatePath, "utf8");
  const compiled = Handlebars.compile(source, { noEscape: true });
  return compiled(variables);
}

// src/adapters/cross-reference-adapter.ts
import fs8 from "fs";
import path8 from "path";
function asStringArray(value) {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === "string");
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
}
var CrossReferenceAdapter = class {
  id = "cross-reference";
  supports(_filePath, context) {
    return Boolean(context.ruleSet.crossReferences);
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const cross = context.ruleSet.crossReferences;
    if (!cross) {
      return diagnostics;
    }
    let parsed;
    try {
      parsed = parseMarkdown(filePath);
    } catch (error2) {
      return [
        {
          code: "invalid_frontmatter_yaml",
          message: `Invalid YAML frontmatter: ${error2.message}`,
          severity: "error",
          file: filePath,
          details: {
            hint: "Fix YAML syntax first, then re-run validate."
          }
        }
      ];
    }
    const base = path8.dirname(filePath);
    for (const field of cross.fields) {
      const refs = asStringArray(parsed.frontmatter[field]);
      for (const ref of refs) {
        if (!cross.allowAbsolute && path8.isAbsolute(ref)) {
          diagnostics.push({
            code: "invalid_reference_absolute",
            message: `Absolute path not allowed in ${field}: ${ref}`,
            severity: "error",
            file: filePath
          });
          continue;
        }
        const resolved = path8.resolve(base, ref);
        const exists = context.globalFileIndex ? context.globalFileIndex.has(resolved) : fs8.existsSync(resolved);
        if (!exists) {
          diagnostics.push({
            code: "broken_reference",
            message: `Broken reference in ${field}: ${ref}`,
            severity: "error",
            file: filePath,
            details: { resolved }
          });
          continue;
        }
        if (cross.allowedExtensions && cross.allowedExtensions.length > 0) {
          const ext = path8.extname(resolved);
          if (!cross.allowedExtensions.includes(ext)) {
            diagnostics.push({
              code: "reference_extension_not_allowed",
              message: `Reference extension not allowed in ${field}: ${ref}`,
              severity: "error",
              file: filePath
            });
          }
        }
      }
    }
    return diagnostics;
  }
};

// src/adapters/cross-file-rule-adapter.ts
import path9 from "path";
import { globSync as globSync4 } from "glob";
import { minimatch as minimatch3 } from "minimatch";
var CrossFileRuleAdapter = class {
  id = "cross-file-rule";
  supports(filePath, context) {
    const rules = context.config.rules ?? [];
    return rules.some(
      (r) => r.kind === "cross_reference" && r.field && r.target && minimatch3(path9.relative(context.repoRoot, filePath).replace(/\\/g, "/"), r.sourceGlob, { dot: true })
    );
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const rules = context.config.rules ?? [];
    const relPath = path9.relative(context.repoRoot, filePath).replace(/\\/g, "/");
    for (const rule of rules) {
      if (rule.kind !== "cross_reference") continue;
      if (!rule.field || !rule.target) continue;
      if (!minimatch3(relPath, rule.sourceGlob, { dot: true })) continue;
      const severity = rule.severity ?? "error";
      let parsed;
      try {
        parsed = parseMarkdown(filePath);
      } catch (error2) {
        diagnostics.push({
          code: "invalid_frontmatter_yaml",
          message: `Invalid YAML frontmatter: ${error2.message}`,
          severity: "error",
          file: filePath,
          ruleId: rule.id
        });
        continue;
      }
      const rawValue = parsed.frontmatter[rule.field];
      if (rule.optional) {
        if (rawValue === void 0 || rawValue === null || rawValue === "") continue;
      }
      if (typeof rawValue !== "string" || rawValue.trim() === "") continue;
      const fieldValue = rawValue.trim();
      const targetGlob = rule.target.replace("{field_value}", fieldValue);
      const absoluteGlob = path9.isAbsolute(targetGlob) ? targetGlob : path9.join(context.repoRoot, targetGlob);
      let matches;
      if (context.globalFileIndex) {
        const normalizedGlob = absoluteGlob.replace(/\\/g, "/");
        matches = [];
        for (const entry of context.globalFileIndex) {
          if (minimatch3(entry.replace(/\\/g, "/"), normalizedGlob, { dot: true })) {
            matches.push(entry);
            break;
          }
        }
      } else {
        matches = globSync4(absoluteGlob.replace(/\\/g, "/"), { dot: true });
      }
      if (matches.length === 0) {
        diagnostics.push({
          code: "broken_cross_file_reference",
          message: `Rule '${rule.id}': field '${rule.field}' value '${fieldValue}' does not resolve to any file matching '${rule.target}'`,
          severity,
          file: filePath,
          ruleId: rule.id,
          details: {
            field: rule.field,
            value: fieldValue,
            targetPattern: rule.target
          }
        });
      }
    }
    return diagnostics;
  }
};

// src/adapters/content-policy-adapter.ts
import fs9 from "fs";
var ContentPolicyAdapter = class {
  id = "content-policy";
  supports(_filePath, context) {
    return context.ruleSet.fileRules.some(
      (rule) => Array.isArray(rule.forbidContentPatterns) && rule.forbidContentPatterns.length > 0
    );
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const raw = fs9.readFileSync(filePath, "utf8");
    for (const rule of context.ruleSet.fileRules) {
      for (const pattern of rule.forbidContentPatterns || []) {
        let regex = null;
        try {
          regex = new RegExp(pattern, "m");
        } catch (error2) {
          diagnostics.push({
            code: "invalid_forbid_content_pattern",
            message: `Invalid forbidContentPatterns regex '${pattern}': ${error2.message}`,
            severity: "warning",
            file: filePath,
            ruleId: rule.id
          });
        }
        if (!regex) {
          continue;
        }
        if (regex.test(raw)) {
          diagnostics.push({
            code: "forbidden_content_pattern",
            message: `Forbidden content pattern matched: ${pattern}`,
            severity: rule.forbidContentSeverity ?? "error",
            file: filePath,
            ruleId: rule.id,
            details: {
              hint: "Remove or redact this content, or intentionally relax the rule in repotype.yaml if this is expected."
            }
          });
        }
      }
    }
    return diagnostics;
  }
};

// src/adapters/file-schema-adapter.ts
import fs10 from "fs";
import path10 from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import yaml3 from "js-yaml";
var ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
function loadSchema(repoRoot, schemaRef) {
  const schemaPath = path10.resolve(repoRoot, schemaRef);
  const schemaRaw = fs10.readFileSync(schemaPath, "utf8");
  return JSON.parse(schemaRaw);
}
var FileSchemaAdapter = class {
  id = "file-schema";
  supports(_filePath, context) {
    const kind = context.ruleSet.schema?.kind;
    return kind === "json" || kind === "yaml";
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const binding = context.ruleSet.schema;
    if (!binding || binding.kind !== "json" && binding.kind !== "yaml") {
      return diagnostics;
    }
    const schemaRef = binding.schema;
    if (typeof schemaRef !== "string") {
      return diagnostics;
    }
    const schemaPath = path10.resolve(context.repoRoot, schemaRef);
    if (!fs10.existsSync(schemaPath)) {
      return [
        {
          code: "schema_not_found",
          message: `Schema file not found: ${schemaRef}`,
          severity: "error",
          file: filePath
        }
      ];
    }
    let schema;
    try {
      schema = loadSchema(context.repoRoot, schemaRef);
    } catch (error2) {
      return [
        {
          code: "invalid_schema_json",
          message: `Schema file is not valid JSON: ${schemaRef} (${error2.message})`,
          severity: "error",
          file: filePath
        }
      ];
    }
    const raw = fs10.readFileSync(filePath, "utf8");
    let payload;
    try {
      if (binding.kind === "json") {
        payload = JSON.parse(raw);
      } else {
        payload = yaml3.load(raw);
      }
    } catch (error2) {
      return [
        {
          code: binding.kind === "json" ? "invalid_json_syntax" : "invalid_yaml_syntax",
          message: `Invalid ${binding.kind.toUpperCase()} syntax: ${error2.message}`,
          severity: "error",
          file: filePath,
          details: {
            hint: `Fix ${binding.kind.toUpperCase()} syntax, then re-run validation.`
          }
        }
      ];
    }
    const validate = ajv.compile(schema);
    const ok = validate(payload);
    if (ok) {
      return diagnostics;
    }
    for (const err of validate.errors || []) {
      diagnostics.push({
        code: "file_schema_violation",
        message: `${err.instancePath || "/"} ${err.message || "invalid"}`,
        severity: "error",
        file: filePath,
        details: {
          kind: binding.kind
        }
      });
    }
    return diagnostics;
  }
};

// src/adapters/filename-adapter.ts
import path11 from "path";
var FilenameAdapter = class {
  id = "filename";
  supports(_filePath, context) {
    return context.ruleSet.fileRules.some((rule) => Boolean(rule.filenamePattern));
  }
  async validate(filePath, context) {
    const name = path11.basename(filePath);
    const diagnostics = [];
    for (const rule of context.ruleSet.fileRules) {
      if (!rule.filenamePattern) {
        continue;
      }
      const regex = new RegExp(rule.filenamePattern);
      if (!regex.test(name)) {
        diagnostics.push({
          code: "filename_pattern_mismatch",
          message: `Filename '${name}' does not match pattern ${rule.filenamePattern}`,
          severity: "error",
          file: filePath,
          ruleId: rule.id
        });
      }
    }
    return diagnostics;
  }
};

// src/adapters/folder-structure-adapter.ts
import fs11 from "fs";
import path12 from "path";
import { globSync as globSync5 } from "glob";
function hasGlobChars(value) {
  return /[*?[\]{}()!+@]/.test(value);
}
function matchesAny(name, patterns) {
  return patterns.some((pattern) => matchesGlob(name, pattern));
}
function collectTargetDirectories(rule, repoRoot, ignoreMatcher) {
  if (rule.path) {
    const resolved = path12.resolve(repoRoot, rule.path);
    return ignoreMatcher.isIgnored(resolved) ? [] : [resolved];
  }
  if (rule.glob) {
    const matched = globSync5(rule.glob, {
      cwd: repoRoot,
      absolute: true,
      nodir: false,
      dot: true,
      ignore: getStaticIgnoreGlobs()
    });
    return matched.filter(
      (entry) => !ignoreMatcher.isIgnored(entry) && fs11.existsSync(entry) && fs11.statSync(entry).isDirectory()
    );
  }
  return [];
}
function checkRequiredFolders(dirPath, rule, childFolders, diagnostics) {
  for (const required2 of rule.requiredFolders || []) {
    if (hasGlobChars(required2)) {
      if (!childFolders.some((child) => matchesGlob(child, required2))) {
        diagnostics.push({
          code: "required_folder_missing",
          message: `Missing required child folder pattern '${required2}' under '${dirPath}'`,
          severity: "error",
          file: dirPath,
          ruleId: rule.id,
          details: {
            hint: "Create the expected folder or update requiredFolders in repotype.yaml."
          }
        });
      }
      continue;
    }
    if (!childFolders.includes(required2)) {
      diagnostics.push({
        code: "required_folder_missing",
        message: `Missing required child folder '${required2}' under '${dirPath}'`,
        severity: "error",
        file: dirPath,
        ruleId: rule.id,
        details: {
          hint: "Create the folder or update requiredFolders in repotype.yaml."
        }
      });
    }
  }
}
function checkRequiredFiles(dirPath, rule, childFiles, diagnostics) {
  for (const required2 of rule.requiredFiles || []) {
    if (hasGlobChars(required2)) {
      if (!childFiles.some((child) => matchesGlob(child, required2))) {
        diagnostics.push({
          code: "required_file_missing",
          message: `Missing required file pattern '${required2}' under '${dirPath}'`,
          severity: "error",
          file: dirPath,
          ruleId: rule.id,
          details: {
            hint: "Add the required file or update requiredFiles in repotype.yaml."
          }
        });
      }
      continue;
    }
    if (!childFiles.includes(required2)) {
      diagnostics.push({
        code: "required_file_missing",
        message: `Missing required file '${required2}' under '${dirPath}'`,
        severity: "error",
        file: dirPath,
        ruleId: rule.id,
        details: {
          hint: "Add the file or update requiredFiles in repotype.yaml."
        }
      });
    }
  }
}
function checkAllowedFolders(dirPath, rule, childFolders, diagnostics) {
  if (!rule.allowedFolders || rule.allowedFolders.length === 0) {
    return;
  }
  for (const child of childFolders) {
    if (!matchesAny(child, rule.allowedFolders)) {
      diagnostics.push({
        code: "disallowed_child_folder",
        message: `Child folder '${child}' is not allowed under '${dirPath}'`,
        severity: "error",
        file: dirPath,
        ruleId: rule.id,
        details: {
          allowedFolders: rule.allowedFolders,
          hint: "Move/remove this folder or expand allowedFolders in repotype.yaml."
        }
      });
    }
  }
}
function checkAllowedFiles(dirPath, rule, childFiles, diagnostics) {
  if (!rule.allowedFiles || rule.allowedFiles.length === 0) {
    return;
  }
  for (const child of childFiles) {
    if (!matchesAny(child, rule.allowedFiles)) {
      diagnostics.push({
        code: "disallowed_child_file",
        message: `Child file '${child}' is not allowed under '${dirPath}'`,
        severity: "error",
        file: dirPath,
        ruleId: rule.id,
        details: {
          allowedFiles: rule.allowedFiles,
          hint: "Move/remove this file or expand allowedFiles in repotype.yaml."
        }
      });
    }
  }
}
var FolderStructureAdapter = class {
  id = "folder-structure";
  evaluated = false;
  supports(_filePath, context) {
    return (context.config.folders || []).length > 0;
  }
  async validate(_filePath, context) {
    if (this.evaluated) {
      return [];
    }
    this.evaluated = true;
    const diagnostics = [];
    const folderRules = context.config.folders || [];
    const ignoreMatcher = createIgnoreMatcher(context.repoRoot);
    for (const rule of folderRules) {
      const targets = collectTargetDirectories(rule, context.repoRoot, ignoreMatcher);
      if (rule.path && targets.length === 1 && !fs11.existsSync(targets[0])) {
        diagnostics.push({
          code: "folder_rule_path_missing",
          message: `Folder rule target path does not exist: ${rule.path}`,
          severity: "error",
          file: path12.resolve(context.repoRoot, rule.path),
          ruleId: rule.id,
          details: {
            hint: "Create this folder or update the folder rule path in repotype.yaml."
          }
        });
        continue;
      }
      if (targets.length === 0) {
        diagnostics.push({
          code: "folder_rule_no_targets",
          message: `Folder rule '${rule.id || rule.path || rule.glob}' matched no directories`,
          severity: "suggestion",
          file: context.configPath,
          ruleId: rule.id,
          details: {
            hint: "Adjust path/glob so the rule applies to actual directories."
          }
        });
        continue;
      }
      for (const targetDir of targets) {
        if (!fs11.existsSync(targetDir) || !fs11.statSync(targetDir).isDirectory()) {
          continue;
        }
        const entries = fs11.readdirSync(targetDir, { withFileTypes: true }).filter((entry) => !ignoreMatcher.isIgnored(path12.join(targetDir, entry.name)));
        const childFolders = entries.filter((e) => e.isDirectory()).map((e) => e.name);
        const childFiles = entries.filter((e) => e.isFile()).map((e) => e.name);
        checkRequiredFolders(targetDir, rule, childFolders, diagnostics);
        checkRequiredFiles(targetDir, rule, childFiles, diagnostics);
        checkAllowedFolders(targetDir, rule, childFolders, diagnostics);
        checkAllowedFiles(targetDir, rule, childFiles, diagnostics);
      }
    }
    return diagnostics;
  }
};

// src/adapters/frontmatter-schema-adapter.ts
import fs12 from "fs";
import path13 from "path";
import Ajv2 from "ajv";
import addFormats2 from "ajv-formats";
var ajv2 = new Ajv2({ allErrors: true, strict: false });
addFormats2(ajv2);
var FrontmatterSchemaAdapter = class {
  id = "frontmatter-schema";
  supports(filePath, context) {
    return filePath.endsWith(".md") && Boolean(context.ruleSet.schema?.kind === "frontmatter");
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const schemaRef = context.ruleSet.schema?.schema;
    if (!schemaRef || typeof schemaRef !== "string") {
      return diagnostics;
    }
    const schemaPath = path13.resolve(context.repoRoot, schemaRef);
    if (!fs12.existsSync(schemaPath)) {
      return [
        {
          code: "schema_not_found",
          message: `Schema file not found: ${schemaRef}`,
          severity: "error",
          file: filePath
        }
      ];
    }
    const schemaRaw = fs12.readFileSync(schemaPath, "utf8");
    const schema = JSON.parse(schemaRaw);
    const validate = ajv2.compile(schema);
    let parsed;
    try {
      parsed = parseMarkdown(filePath);
    } catch (error2) {
      return [
        {
          code: "invalid_frontmatter_yaml",
          message: `Invalid YAML frontmatter: ${error2.message}`,
          severity: "error",
          file: filePath,
          details: {
            hint: "Fix YAML syntax first, then re-run validate."
          }
        }
      ];
    }
    const ok = validate(parsed.frontmatter);
    if (ok) {
      return diagnostics;
    }
    for (const err of validate.errors || []) {
      diagnostics.push({
        code: "frontmatter_schema_violation",
        message: `${err.instancePath || "/"} ${err.message || "invalid"}`,
        severity: "error",
        file: filePath
      });
    }
    return diagnostics;
  }
};

// src/adapters/guidance-adapter.ts
import path14 from "path";
import fs13 from "fs";
import { minimatch as minimatch4 } from "minimatch";
function isInManagedFolderScope(relativePath, context) {
  const folders = context.config.folders || [];
  if (folders.length === 0) {
    return true;
  }
  return folders.some((folder) => {
    if (folder.path) {
      return relativePath === folder.path || relativePath.startsWith(`${folder.path}/`);
    }
    if (folder.glob) {
      return minimatch4(relativePath, folder.glob, { dot: true });
    }
    return false;
  });
}
function normalizePath(p) {
  return p.replace(/\\/g, "/").replace(/^\.\//, "");
}
function isTemplateSource(relativePath) {
  const normalized = normalizePath(relativePath);
  return normalized.includes("/templates/") || normalized.endsWith(".template.md");
}
function isRepotypeSystemFile(relativePath) {
  const normalized = normalizePath(relativePath);
  return normalized === "repotype.yaml" || normalized === "repo-schema.yaml";
}
function findFrontmatterCommentTruncations(body) {
  const results = [];
  if (!body.startsWith("---\n")) {
    return results;
  }
  const endMarker = body.indexOf("\n---", 4);
  if (endMarker === -1) {
    return results;
  }
  const frontmatter = body.slice(4, endMarker);
  const lines = frontmatter.split("\n");
  const plainScalarWithHash = /^(\s*)([\w][\w-]*)(\s*:\s*)([^|>['"{}\s][^\n]*)\s+#/;
  for (let i = 0; i < lines.length; i++) {
    const m = plainScalarWithHash.exec(lines[i]);
    if (m) {
      results.push({ line: i + 2, key: m[2], raw: lines[i].trim() });
    }
  }
  return results;
}
function isReferencedByConfig(relativePath, context) {
  const normalized = normalizePath(relativePath);
  if ((context.config.templates || []).some((t) => typeof t.path === "string" && normalizePath(t.path) === normalized)) {
    return true;
  }
  for (const rule of context.config.files || []) {
    if (rule.schema && typeof rule.schema.schema === "string" && normalizePath(rule.schema.schema) === normalized) {
      return true;
    }
  }
  for (const folder of context.config.folders || []) {
    const bindings = folder.schemaBindings || {};
    for (const key of Object.keys(bindings)) {
      const binding = bindings[key];
      if (typeof binding.schema === "string" && normalizePath(binding.schema) === normalized) {
        return true;
      }
    }
  }
  return false;
}
var GuidanceAdapter = class {
  id = "guidance";
  supports(_filePath, _context) {
    return true;
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const relative = context.ruleSet.filePath;
    const strictUnmatchedPolicy = context.config.defaults?.unmatchedFiles ?? "deny";
    if (context.ruleSet.fileRules.length === 0) {
      if (isRepotypeSystemFile(relative) || isReferencedByConfig(relative, context)) {
        return diagnostics;
      }
      if (strictUnmatchedPolicy === "allow") {
        diagnostics.push({
          code: "no_matching_file_rule",
          message: `No file rule matched '${relative}'. Legacy permissive mode is enabled (defaults.unmatchedFiles=allow).`,
          severity: "suggestion",
          file: filePath,
          details: {
            mode: "permissive",
            recommendation: "Set defaults.unmatchedFiles to deny for strict deny-by-default enforcement."
          }
        });
        return diagnostics;
      }
      if (!isInManagedFolderScope(relative, context) && (context.config.folders || []).length > 0) {
      }
      diagnostics.push({
        code: "no_matching_file_rule",
        message: `No file rule matched '${relative}'. Deny-by-default policy requires explicit file allow rules.`,
        severity: "error",
        file: filePath,
        details: {
          mode: "deny",
          example: `files:
  - id: ${path14.basename(relative, path14.extname(relative)) || "rule-id"}
    glob: "${relative}"`,
          compatibilityEscapeHatch: "defaults.unmatchedFiles: allow"
        }
      });
      return diagnostics;
    }
    if (!filePath.endsWith(".md")) {
      return diagnostics;
    }
    const body = fs13.readFileSync(filePath, "utf8");
    const hasFrontmatter = body.startsWith("---\n");
    if (!context.ruleSet.schema && hasFrontmatter && !isTemplateSource(relative)) {
      diagnostics.push({
        code: "missing_schema_binding",
        message: `Matched rule(s) for '${relative}' but no frontmatter schema is bound. Generate one with: repotype generate schema "${path14.dirname(filePath)}" "schemas/${path14.basename(path14.dirname(filePath))}.frontmatter.schema.json"`,
        severity: "suggestion",
        file: filePath
      });
    }
    if (context.ruleSet.requiredSections.length === 0) {
      diagnostics.push({
        code: "missing_required_sections_rule",
        message: `Matched rule(s) for '${relative}' but requiredSections is empty. Add requiredSections to enforce expected markdown structure.`,
        severity: "suggestion",
        file: filePath
      });
    }
    if (hasFrontmatter) {
      for (const hit of findFrontmatterCommentTruncations(body)) {
        diagnostics.push({
          code: "frontmatter_comment_truncation",
          message: `Frontmatter field '${hit.key}' (line ${hit.line}) contains ' #' in an unquoted scalar \u2014 YAML will silently treat everything after it as a comment. Quote the value to preserve it.`,
          severity: "warning",
          file: filePath,
          details: { line: hit.line, raw: hit.raw }
        });
      }
    }
    return diagnostics;
  }
};

// src/adapters/markdown-template-adapter.ts
import fs14 from "fs";
import path15 from "path";
function stripFencedCodeBlocks(content) {
  return content.replace(/```[\s\S]*?```/g, "");
}
function stripInlineCode(content) {
  return content.replace(/`[^`]*`/g, "");
}
function loadTemplateRequiredFields(templatePath) {
  if (!fs14.existsSync(templatePath)) {
    return [];
  }
  const raw = fs14.readFileSync(templatePath, "utf8");
  const parsed = parseMarkdownContent(raw);
  return Object.keys(parsed.frontmatter || {}).filter((key) => !key.startsWith("_"));
}
function loadTemplateSections(templatePath) {
  if (!fs14.existsSync(templatePath)) {
    return [];
  }
  const raw = fs14.readFileSync(templatePath, "utf8");
  const parsed = parseMarkdownContent(raw);
  return extractSections(parsed.body || "");
}
var MarkdownTemplateAdapter = class {
  id = "markdown-template";
  supports(filePath, _context) {
    return filePath.endsWith(".md");
  }
  async validate(filePath, context) {
    const diagnostics = [];
    let parsed;
    try {
      parsed = parseMarkdown(filePath);
    } catch (error2) {
      return [
        {
          code: "invalid_frontmatter_yaml",
          message: `Invalid YAML frontmatter: ${error2.message}`,
          severity: "error",
          file: filePath,
          details: {
            hint: "Fix YAML syntax first, then re-run validate."
          }
        }
      ];
    }
    const fileSections = extractSections(parsed.body);
    for (const section of context.ruleSet.requiredSections) {
      if (!fileSections.includes(section)) {
        diagnostics.push({
          code: "missing_section",
          message: `Missing required section: ## ${section}`,
          severity: "error",
          file: filePath,
          autofix: {
            type: "add_section",
            safe: true,
            file: filePath,
            payload: { section }
          }
        });
      }
    }
    const templateId = context.ruleSet.template?.id;
    if (templateId) {
      const template = (context.config.templates || []).find((t) => t.id === templateId);
      if (template) {
        const templatePath = path15.resolve(context.repoRoot, template.path);
        const requiredFields = loadTemplateRequiredFields(templatePath);
        const requiredTemplateSections = loadTemplateSections(templatePath);
        for (const field of requiredFields) {
          if (!Object.hasOwn(parsed.frontmatter, field)) {
            diagnostics.push({
              code: "missing_frontmatter_field",
              message: `Missing frontmatter field '${field}' required by template '${templateId}'`,
              severity: "error",
              file: filePath,
              autofix: {
                type: "add_frontmatter_field",
                safe: true,
                file: filePath,
                payload: { key: field, value: "" }
              }
            });
          }
        }
        for (const section of requiredTemplateSections) {
          if (!fileSections.includes(section)) {
            diagnostics.push({
              code: "missing_template_section",
              message: `Missing template section: ## ${section}`,
              severity: "error",
              file: filePath,
              autofix: {
                type: "add_section",
                safe: true,
                file: filePath,
                payload: { section }
              }
            });
          }
        }
      }
    }
    const configuredHints = context.ruleSet.templateHints;
    if (configuredHints.length > 0) {
      const hintTarget = stripInlineCode(stripFencedCodeBlocks(parsed.body));
      for (const hint of configuredHints) {
        if (!hintTarget.includes(hint)) continue;
        diagnostics.push({
          code: "template_hint_present",
          message: `Template hint still present: ${hint}`,
          severity: "warning",
          file: filePath,
          autofix: {
            type: "remove_template_hint",
            safe: true,
            file: filePath,
            payload: { hint }
          }
        });
      }
    }
    return diagnostics;
  }
};

// src/adapters/path-policy-adapter.ts
import path16 from "path";
function normalize3(p) {
  return p.replace(/\\/g, "/");
}
function matchesCase(value, mode) {
  if (mode === "kebab") {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  }
  if (mode === "snake") {
    return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(value);
  }
  if (mode === "camel") {
    return /^[a-z][A-Za-z0-9]*$/.test(value);
  }
  return /^[a-z0-9]+$/.test(value);
}
function segmentsForCase(relativePath) {
  const normalized = normalize3(relativePath);
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length === 0) {
    return [];
  }
  const last = parts[parts.length - 1];
  const ext = path16.extname(last);
  if (ext) {
    parts[parts.length - 1] = last.slice(0, last.length - ext.length);
  }
  return parts.filter((entry) => entry.length > 0);
}
var PathPolicyAdapter = class {
  id = "path-policy";
  supports(_filePath, context) {
    return context.ruleSet.fileRules.some((rule) => Boolean(rule.pathPattern || rule.pathCase));
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const relativePath = context.ruleSet.filePath;
    for (const rule of context.ruleSet.fileRules) {
      if (rule.pathPattern) {
        let regex = null;
        try {
          regex = new RegExp(rule.pathPattern);
        } catch (error2) {
          diagnostics.push({
            code: "invalid_path_pattern",
            message: `Invalid pathPattern regex '${rule.pathPattern}': ${error2.message}`,
            severity: "warning",
            file: filePath,
            ruleId: rule.id,
            details: {
              hint: "Fix this regex in repotype.yaml."
            }
          });
        }
        if (regex && !regex.test(relativePath)) {
          diagnostics.push({
            code: "path_pattern_mismatch",
            message: `Path '${relativePath}' does not match pattern ${rule.pathPattern}`,
            severity: "error",
            file: filePath,
            ruleId: rule.id,
            details: {
              hint: "Rename/move file or adjust pathPattern in repotype.yaml."
            }
          });
        }
      }
      if (rule.pathCase) {
        const segments = segmentsForCase(relativePath);
        for (const segment of segments) {
          if (segment.startsWith(".")) {
            continue;
          }
          if (!matchesCase(segment, rule.pathCase)) {
            diagnostics.push({
              code: "path_case_mismatch",
              message: `Path segment '${segment}' is not ${rule.pathCase}-case in '${relativePath}'`,
              severity: "error",
              file: filePath,
              ruleId: rule.id,
              details: {
                expected: rule.pathCase,
                segment,
                hint: "Rename this file/folder segment or relax pathCase in repotype.yaml."
              }
            });
          }
        }
      }
    }
    return diagnostics;
  }
};

// src/adapters/board-yaml-completeness-adapter.ts
import fs15 from "fs";
import path17 from "path";
import yaml4 from "js-yaml";
function isBoardYaml(filePath) {
  return filePath.endsWith("/board.yaml") || filePath === "board.yaml";
}
var BoardYamlCompletenessAdapter = class {
  id = "board-yaml-completeness";
  supports(filePath, _context) {
    const normalized = filePath.replace(/\\/g, "/");
    return isBoardYaml(normalized);
  }
  async validate(filePath, _context) {
    const diagnostics = [];
    let raw;
    try {
      raw = fs15.readFileSync(filePath, "utf8");
    } catch (err) {
      return [
        {
          code: "board_yaml_unreadable",
          message: `board.yaml could not be read: ${err.message}`,
          severity: "error",
          file: filePath,
          ruleId: this.id
        }
      ];
    }
    let doc;
    try {
      const parsed = yaml4.load(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return [
          {
            code: "board_yaml_not_object",
            message: "board.yaml must be a YAML mapping (object), not a scalar or array.",
            severity: "error",
            file: filePath,
            ruleId: this.id
          }
        ];
      }
      doc = parsed;
    } catch (err) {
      return [
        {
          code: "board_yaml_invalid_yaml",
          message: `board.yaml has invalid YAML syntax: ${err.message}`,
          severity: "error",
          file: filePath,
          ruleId: this.id
        }
      ];
    }
    const dirName = path17.basename(path17.dirname(filePath));
    if (!("id" in doc) || doc["id"] === void 0 || doc["id"] === null || doc["id"] === "") {
      diagnostics.push({
        code: "board_yaml_missing_id",
        message: "board.yaml must have an id field.",
        severity: "error",
        file: filePath,
        ruleId: this.id
      });
    } else if (typeof doc["id"] === "string" && doc["id"] !== dirName) {
      diagnostics.push({
        code: "board_yaml_id_mismatch",
        message: `board.yaml id "${doc["id"]}" does not match directory name "${dirName}".`,
        severity: "error",
        file: filePath,
        ruleId: this.id,
        details: { id: doc["id"], dirName }
      });
    }
    if (!("label" in doc) || doc["label"] === void 0 || doc["label"] === null || doc["label"] === "") {
      diagnostics.push({
        code: "board_yaml_missing_label",
        message: "board.yaml must have a label field.",
        severity: "error",
        file: filePath,
        ruleId: this.id
      });
    }
    if (!("description" in doc) || doc["description"] === void 0 || doc["description"] === null) {
      diagnostics.push({
        code: "board_yaml_missing_description",
        message: "board.yaml must have a description field.",
        severity: "error",
        file: filePath,
        ruleId: this.id
      });
    } else if (typeof doc["description"] === "string" && doc["description"].trim().length === 0) {
      diagnostics.push({
        code: "board_yaml_empty_description",
        message: "board.yaml description must not be empty.",
        severity: "error",
        file: filePath,
        ruleId: this.id
      });
    }
    if (!("category" in doc) || doc["category"] === void 0 || doc["category"] === null || doc["category"] === "") {
      diagnostics.push({
        code: "board_yaml_missing_category",
        message: "board.yaml should have a category field (revenue | operations | intelligence | content | custom).",
        severity: "warning",
        file: filePath,
        ruleId: this.id
      });
    }
    if (!("icon" in doc) || doc["icon"] === void 0 || doc["icon"] === null || doc["icon"] === "") {
      diagnostics.push({
        code: "board_yaml_missing_icon",
        message: "board.yaml should have an icon field (lucide icon name).",
        severity: "warning",
        file: filePath,
        ruleId: this.id
      });
    }
    const hasConnectors = "connectors" in doc && doc["connectors"] !== void 0 && doc["connectors"] !== null;
    const hasCrons = "crons" in doc && doc["crons"] !== void 0 && doc["crons"] !== null;
    const hasSecrets = "secrets" in doc && doc["secrets"] !== void 0 && doc["secrets"] !== null;
    if (!hasConnectors && !hasCrons && !hasSecrets) {
      diagnostics.push({
        code: "board_yaml_no_external_deps",
        message: "board.yaml declares no connectors, crons, or secrets \u2014 agent will have nothing to schedule or connect. Add connectors/crons/secrets sections or this note is expected for utility boards.",
        severity: "suggestion",
        file: filePath,
        ruleId: this.id
      });
    }
    if (hasConnectors && Array.isArray(doc["connectors"])) {
      const connectors = doc["connectors"];
      for (let i = 0; i < connectors.length; i++) {
        const c = connectors[i];
        if (typeof c !== "object" || c === null || Array.isArray(c)) continue;
        const connector = c;
        const missing = [];
        if (!connector["id"]) missing.push("id");
        if (!connector["label"]) missing.push("label");
        if (!connector["auth"]) missing.push("auth");
        if (missing.length > 0) {
          diagnostics.push({
            code: "board_yaml_connector_missing_fields",
            message: `connectors[${i}] is missing required fields: ${missing.join(", ")}.`,
            severity: "warning",
            file: filePath,
            ruleId: this.id,
            details: { index: i, missing }
          });
        }
      }
    }
    if (hasSecrets && Array.isArray(doc["secrets"])) {
      const secrets = doc["secrets"];
      for (let i = 0; i < secrets.length; i++) {
        const s = secrets[i];
        if (typeof s !== "object" || s === null || Array.isArray(s)) continue;
        const secret = s;
        const missing = [];
        if (!secret["key"]) missing.push("key");
        if (!secret["label"]) missing.push("label");
        if (missing.length > 0) {
          diagnostics.push({
            code: "board_yaml_secret_missing_fields",
            message: `secrets[${i}] is missing required fields: ${missing.join(", ")}.`,
            severity: "warning",
            file: filePath,
            ruleId: this.id,
            details: { index: i, missing }
          });
        }
      }
    }
    if (hasCrons && Array.isArray(doc["crons"])) {
      const crons = doc["crons"];
      for (let i = 0; i < crons.length; i++) {
        const cr = crons[i];
        if (typeof cr !== "object" || cr === null || Array.isArray(cr)) continue;
        const cron = cr;
        const missing = [];
        if (!cron["id"]) missing.push("id");
        if (!cron["schedule"]) missing.push("schedule");
        if (!cron["action"]) missing.push("action");
        if (!cron["description"]) missing.push("description");
        if (missing.length > 0) {
          diagnostics.push({
            code: "board_yaml_cron_missing_fields",
            message: `crons[${i}] is missing required fields: ${missing.join(", ")}.`,
            severity: "warning",
            file: filePath,
            ruleId: this.id,
            details: { index: i, missing }
          });
        }
      }
    }
    return diagnostics;
  }
};

// src/adapters/board-story-completeness-adapter.ts
import fs16 from "fs";
import path18 from "path";
var BOARDS_DIR_SEGMENT = `${path18.sep}packages${path18.sep}boards${path18.sep}`;
var BOARDS_DIR_SEGMENT_FWD = "/packages/boards/";
function isBoardYaml2(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return normalized.includes(BOARDS_DIR_SEGMENT_FWD) && (normalized.endsWith("/board.yaml") || normalized === "board.yaml");
}
function boardNameFromPath(filePath) {
  return path18.basename(path18.dirname(filePath));
}
var SKIP_DIRS = /* @__PURE__ */ new Set([
  "__mocks__",
  "__system__",
  "lib",
  "lib-dist",
  "scripts",
  "specs",
  "agents",
  "doc-folder"
]);
var BoardStoryCompletenessAdapter = class {
  id = "board-story-required";
  supports(filePath, _context) {
    const normalized = filePath.replace(/\\/g, "/");
    if (!isBoardYaml2(normalized)) return false;
    const boardName = boardNameFromPath(filePath);
    return !SKIP_DIRS.has(boardName);
  }
  async validate(filePath, _context) {
    const boardDir = path18.dirname(filePath);
    const boardName = boardNameFromPath(filePath);
    const storiesDir = path18.join(boardDir, "stories");
    if (!fs16.existsSync(storiesDir) || !fs16.statSync(storiesDir).isDirectory()) {
      return [
        {
          code: "board_story_missing",
          message: `Board '${boardName}' has no stories/ directory. Every board must have at least one .feature file in stories/. Run the Story Generation Agent to create it.`,
          severity: "error",
          file: filePath,
          ruleId: this.id,
          details: { boardName, expectedDir: storiesDir }
        }
      ];
    }
    const featureFiles = fs16.readdirSync(storiesDir).filter((f) => f.endsWith(".feature"));
    if (featureFiles.length === 0) {
      return [
        {
          code: "board_story_empty",
          message: `Board '${boardName}' has a stories/ directory but no .feature files. Add at least one .feature file or run the Story Generation Agent.`,
          severity: "error",
          file: filePath,
          ruleId: this.id,
          details: { boardName, storiesDir }
        }
      ];
    }
    return [];
  }
};

// src/core/validator-framework.ts
import fs17 from "fs";
import os from "os";
import path19 from "path";
import { globSync as globSync6 } from "glob";
var CONFIG_FILE_NAMES = /* @__PURE__ */ new Set(["repotype.yaml", "repo-schema.yaml"]);
function scanFiles(targetPath, repoRoot, sharedIgnoreMatcher) {
  const ignoreMatcher = sharedIgnoreMatcher ?? createIgnoreMatcher(repoRoot);
  const stats = fs17.statSync(targetPath);
  if (stats.isFile()) {
    const absoluteFile = path19.resolve(targetPath);
    if (CONFIG_FILE_NAMES.has(path19.basename(absoluteFile))) return [];
    return ignoreMatcher.isIgnored(absoluteFile) ? [] : [absoluteFile];
  }
  const files = globSync6("**/*", {
    cwd: targetPath,
    absolute: true,
    nodir: true,
    ignore: getStaticIgnoreGlobs()
  });
  return files.filter((filePath) => {
    if (CONFIG_FILE_NAMES.has(path19.basename(filePath))) return false;
    return !ignoreMatcher.isIgnored(filePath);
  });
}
function createSemaphore(concurrency) {
  let active = 0;
  const queue = [];
  function next() {
    if (active < concurrency && queue.length > 0) {
      active++;
      const run = queue.shift();
      run();
    }
  }
  return function acquire(fn) {
    return new Promise((resolve, reject) => {
      queue.push(() => {
        fn().then(
          (value) => {
            active--;
            next();
            resolve(value);
          },
          (err) => {
            active--;
            next();
            reject(err);
          }
        );
      });
      next();
    });
  };
}
function classifyOverbroadGlob(glob) {
  const normalized = glob.replace(/\\+/g, "/");
  if (normalized === "**/*" || normalized.endsWith("/**") || normalized.endsWith("/**/*")) {
    return { level: "high", depth: 3 };
  }
  if (normalized.includes("/**/*.{")) {
    return { level: "medium", depth: 2 };
  }
  if (normalized.includes("/**/*.")) {
    return { level: "low", depth: 1 };
  }
  return null;
}
function lintConfigGlobs(config2, configPath) {
  const diagnostics = [];
  for (const rule of config2.files || []) {
    if (!rule.glob) continue;
    if (rule.lint?.allowOverbroad) continue;
    const classification = classifyOverbroadGlob(rule.glob);
    if (classification) {
      diagnostics.push({
        code: "overbroad_glob_pattern",
        message: `Overbroad file glob '${rule.glob}' in rule '${rule.id || "unnamed"}' (level: ${classification.level}, depth: ${classification.depth}). Prefer explicit allowlist paths.`,
        severity: "warning",
        file: configPath,
        ruleId: rule.id,
        details: {
          glob: rule.glob,
          level: classification.level,
          depth: classification.depth,
          recommendation: "Replace broad globs with explicit folder/file rules where possible."
        }
      });
    }
  }
  for (const rule of config2.folders || []) {
    if (!rule.glob) continue;
    const classification = classifyOverbroadGlob(rule.glob);
    if (classification) {
      diagnostics.push({
        code: "overbroad_glob_pattern",
        message: `Overbroad folder glob '${rule.glob}' in rule '${rule.id || "unnamed"}' (level: ${classification.level}, depth: ${classification.depth}).`,
        severity: "warning",
        file: configPath,
        ruleId: rule.id,
        details: {
          glob: rule.glob,
          level: classification.level,
          depth: classification.depth,
          recommendation: "Use explicit folder paths in allowedFolders/requiredFolders."
        }
      });
    }
  }
  return diagnostics;
}
function getGlobExtension(glob) {
  const match = glob.match(/\*\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : null;
}
function globsCouldOverlap(globA, globB) {
  const extA = getGlobExtension(globA);
  const extB = getGlobExtension(globB);
  if (extA && extB && extA !== extB) return false;
  return true;
}
function rootGlobCouldMatchSubtree(rootGlob, relSubtreeFromRoot) {
  const normalized = rootGlob.replace(/\\/g, "/");
  if (normalized.startsWith("**/") || !normalized.includes("/")) return true;
  const firstWild = normalized.indexOf("*");
  const literalPrefix = firstWild >= 0 ? normalized.slice(0, firstWild) : normalized + "/";
  const relNorm = relSubtreeFromRoot.replace(/\\/g, "/") + "/";
  return relNorm.startsWith(literalPrefix) || literalPrefix.startsWith(relNorm);
}
function fileRulesConflict(rootRule, childRule) {
  const rootSections = [...rootRule.requiredSections ?? []].sort().join(",");
  const childSections = [...childRule.requiredSections ?? []].sort().join(",");
  if (rootSections !== childSections && (rootSections || childSections)) return true;
  if ((rootRule.schema?.schema ?? null) !== (childRule.schema?.schema ?? null)) return true;
  if ((rootRule.filenamePattern ?? null) !== (childRule.filenamePattern ?? null)) return true;
  if ((rootRule.pathCase ?? null) !== (childRule.pathCase ?? null)) return true;
  const rootForbid = [...rootRule.forbidContentPatterns ?? []].sort().join(",");
  const childForbid = [...childRule.forbidContentPatterns ?? []].sort().join(",");
  if (rootForbid !== childForbid && (rootForbid || childForbid)) return true;
  return false;
}
var ValidationEngine = class {
  constructor(adapters) {
    this.adapters = adapters;
  }
  async validate(targetPath, options) {
    const absoluteTarget = path19.resolve(targetPath);
    const targetRoot = fs17.existsSync(absoluteTarget) && fs17.statSync(absoluteTarget).isDirectory() ? absoluteTarget : path19.dirname(absoluteTarget);
    const configPath = options?.configPath ? path19.resolve(options.configPath) : findConfig(absoluteTarget);
    const repoRoot = options?.configPath ? targetRoot : path19.dirname(configPath);
    const config2 = loadConfig(configPath);
    const files = options?.fileList ?? scanFiles(absoluteTarget, repoRoot, options?.sharedIgnoreMatcher);
    const diagnostics = [...lintConfigGlobs(config2, configPath)];
    for (const filePath of files) {
      const ruleSet = resolveEffectiveRules(config2, repoRoot, filePath);
      const context = {
        repoRoot,
        configPath,
        config: config2,
        ruleSet,
        globalFileIndex: options?.globalFileIndex
      };
      for (const adapter of this.adapters) {
        if (!adapter.supports(filePath, context)) {
          continue;
        }
        try {
          const adapterDiagnostics = await adapter.validate(filePath, context);
          if (options?.workspaceTag) {
            for (const d of adapterDiagnostics) {
              d.workspace = options.workspaceTag;
            }
          }
          diagnostics.push(...adapterDiagnostics);
        } catch (error2) {
          diagnostics.push({
            code: "validator_adapter_failure",
            message: `${adapter.id} failed for ${context.ruleSet.filePath}: ${error2.message}`,
            severity: "error",
            file: filePath,
            details: {
              adapter: adapter.id
            },
            workspace: options?.workspaceTag
          });
        }
      }
    }
    return {
      ok: diagnostics.every((d) => d.severity !== "error"),
      diagnostics,
      filesScanned: files.length
    };
  }
  /**
   * Validate a workspace (root + all child workspace subtrees) in parallel.
   * Auto-detects child configs under rootDir.
   */
  async validateWorkspace(rootDir, options = {}) {
    const root = path19.resolve(rootDir);
    const rootConfigPath = findConfig(root);
    const repoRoot = path19.dirname(rootConfigPath);
    const sharedIgnoreMatcher = createIgnoreMatcher(repoRoot);
    const workspaces = discoverWorkspaces(repoRoot, sharedIgnoreMatcher);
    if (workspaces.length === 0) {
      const result = await this.validate(rootDir, { configPath: rootConfigPath, sharedIgnoreMatcher });
      return { mode: "flat", result };
    }
    const allConfigPaths = [rootConfigPath, ...workspaces.map((ws) => ws.configPath)];
    const currentHash = hashConfigFiles(allConfigPaths);
    let cachedWorkspaces = null;
    let cachedResolvedConfigs = null;
    let staleCIDiag = null;
    if (!options.noCache) {
      const cached2 = loadWorkspaceCache(repoRoot);
      if (cached2 && cached2.hash === currentHash) {
        cachedWorkspaces = cached2.workspaces;
        cachedResolvedConfigs = cached2.resolvedConfigs;
      } else if (cached2 && process.env.CI === "true") {
        staleCIDiag = {
          code: "workspace_cache_stale",
          severity: "warning",
          message: "workspace cache is stale \u2014 regenerate locally with `repotype validate .`",
          parentConfigPath: rootConfigPath,
          childConfigPath: rootConfigPath
        };
        cachedWorkspaces = null;
        cachedResolvedConfigs = null;
      }
    }
    let activeWorkspaces = workspaces;
    if (cachedWorkspaces) {
      activeWorkspaces = cachedWorkspaces;
    } else if (!options.noCache && process.env.CI !== "true") {
      const resolvedConfigs = {};
      for (const ws of workspaces) {
        try {
          resolvedConfigs[ws.configPath] = loadConfig(ws.configPath);
        } catch {
        }
      }
      try {
        resolvedConfigs[rootConfigPath] = loadConfig(rootConfigPath);
      } catch {
      }
      writeWorkspaceCache(repoRoot, {
        version: 2,
        hash: currentHash,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        repoRoot,
        workspaces,
        resolvedConfigs
      });
    }
    const rootFiles = scanFiles(repoRoot, repoRoot, sharedIgnoreMatcher);
    const childFiles = activeWorkspaces.flatMap(
      (ws) => scanFiles(ws.subtreeRoot, repoRoot, sharedIgnoreMatcher)
    );
    const globalFileIndex = /* @__PURE__ */ new Set([...rootFiles, ...childFiles]);
    const concurrency = Math.min(activeWorkspaces.length + 1, 8, os.cpus().length);
    const semaphore = createSemaphore(concurrency);
    const childValidations = await Promise.all(
      activeWorkspaces.map(
        (ws) => semaphore(
          () => this.validate(ws.subtreeRoot, {
            configPath: ws.configPath,
            sharedIgnoreMatcher,
            globalFileIndex,
            workspaceTag: ws.configPath
          }).then((result) => ({ configPath: ws.configPath, subtreeRoot: ws.subtreeRoot, result }))
        )
      )
    );
    const allRootFiles = scanFiles(repoRoot, repoRoot, sharedIgnoreMatcher);
    const rootOwnedFiles = allRootFiles.filter(
      (f) => resolveOwningWorkspace(f, activeWorkspaces) === "root"
    );
    const rawRootResult = await semaphore(
      () => this.validate(repoRoot, {
        configPath: rootConfigPath,
        sharedIgnoreMatcher,
        globalFileIndex,
        workspaceTag: rootConfigPath,
        fileList: rootOwnedFiles
      })
    );
    const rootResult = {
      ok: rawRootResult.diagnostics.every((d) => d.severity !== "error"),
      diagnostics: rawRootResult.diagnostics,
      filesScanned: rootOwnedFiles.length
    };
    const conflicts = [];
    const rootConfig = loadConfig(rootConfigPath);
    for (const ws of activeWorkspaces) {
      let childConfig;
      try {
        childConfig = cachedResolvedConfigs?.[ws.configPath] ?? loadConfig(ws.configPath);
      } catch {
        continue;
      }
      for (const folder of rootConfig.folders ?? []) {
        for (const reqFile of folder.requiredFiles ?? []) {
          const absReqFile = path19.resolve(repoRoot, reqFile);
          if (absReqFile.startsWith(ws.subtreeRoot + path19.sep) || absReqFile === ws.subtreeRoot) {
            const childRequires = (childConfig.folders ?? []).some(
              (cf) => (cf.requiredFiles ?? []).some((rf) => path19.resolve(ws.subtreeRoot, rf) === absReqFile)
            );
            if (!childRequires) {
              conflicts.push({
                code: "workspace_required_file_gap",
                severity: "error",
                message: `Root config requires '${reqFile}' which is inside child subtree '${ws.subtreeRoot}'. Child config does not require it \u2014 enforcement gap.`,
                parentConfigPath: rootConfigPath,
                childConfigPath: ws.configPath,
                details: { requiredFile: reqFile, subtreeRoot: ws.subtreeRoot }
              });
            }
          }
        }
      }
      const relSubtree = path19.relative(repoRoot, ws.subtreeRoot);
      for (const rootRule of rootConfig.files ?? []) {
        if (!rootGlobCouldMatchSubtree(rootRule.glob, relSubtree)) continue;
        for (const childRule of childConfig.files ?? []) {
          if (!globsCouldOverlap(rootRule.glob, childRule.glob)) continue;
          if (fileRulesConflict(rootRule, childRule)) {
            conflicts.push({
              code: "workspace_pattern_conflict",
              severity: "warning",
              message: `Root rule glob '${rootRule.glob}' and child rule glob '${childRule.glob}' in '${ws.subtreeRoot}' may match the same files with different constraints.`,
              parentConfigPath: rootConfigPath,
              childConfigPath: ws.configPath,
              details: { rootGlob: rootRule.glob, childGlob: childRule.glob, subtreeRoot: ws.subtreeRoot }
            });
            break;
          }
        }
      }
      const rootUnmatched = rootConfig.defaults?.unmatchedFiles;
      const childUnmatched = childConfig.defaults?.unmatchedFiles;
      if (rootUnmatched && childUnmatched && rootUnmatched !== childUnmatched) {
        conflicts.push({
          code: "workspace_unmatched_files_asymmetry",
          severity: "warning",
          message: `Root config has unmatchedFiles='${rootUnmatched}' but child config '${ws.subtreeRoot}' has unmatchedFiles='${childUnmatched}'. Files in child subtree are subject to different rules.`,
          parentConfigPath: rootConfigPath,
          childConfigPath: ws.configPath,
          details: { rootUnmatched, childUnmatched }
        });
      }
    }
    if (staleCIDiag) {
      conflicts.push(staleCIDiag);
    }
    if (!cachedWorkspaces) {
      const activationDiag = {
        code: "workspace_mode_active",
        severity: "suggestion",
        message: `workspace mode active \u2014 ${activeWorkspaces.length} child config(s) found. Files in child subtrees are now governed by their own repotype.yaml. Root rules no longer apply to those subtrees. Run \`repotype status\` to review workspace boundaries.`,
        file: rootConfigPath,
        workspace: rootConfigPath
      };
      rootResult.diagnostics.unshift(activationDiag);
    }
    const totalFilesScanned = rootResult.filesScanned + childValidations.reduce((acc, cv) => acc + cv.result.filesScanned, 0);
    const allOk = rootResult.ok && childValidations.every((cv) => cv.result.ok) && !conflicts.some((c) => c.severity === "error");
    const workspaceResult = {
      ok: allOk,
      mode: "workspace",
      filesScanned: totalFilesScanned,
      workspaces: childValidations,
      conflicts,
      rootResult
    };
    return { mode: "workspace", result: workspaceResult };
  }
};

// src/cli/runtime.ts
function createDefaultEngine() {
  return new ValidationEngine([
    new FilenameAdapter(),
    new PathPolicyAdapter(),
    new FolderStructureAdapter(),
    new MarkdownTemplateAdapter(),
    new FrontmatterSchemaAdapter(),
    new FileSchemaAdapter(),
    new CrossReferenceAdapter(),
    new CrossFileRuleAdapter(),
    new ContentPolicyAdapter(),
    new GuidanceAdapter(),
    new BoardYamlCompletenessAdapter(),
    new BoardStoryCompletenessAdapter()
  ]);
}

// src/core/presets.ts
function baseDefaults() {
  return {
    inheritance: "merge",
    strictness: "balanced",
    unmatchedFiles: "deny"
  };
}
function defaultPreset() {
  return {
    version: "1",
    defaults: baseDefaults(),
    folders: [
      {
        id: "docs-root",
        path: "docs",
        requiredFolders: ["requirements"]
      }
    ],
    files: [
      {
        id: "requirement-md",
        glob: "docs/requirements/**/*.md",
        filenamePattern: "^req-[a-z0-9-]+\\.md$",
        requiredSections: ["Description", "Acceptance Criteria", "Test Strategy"]
      },
      {
        id: "repotype-config",
        glob: "repotype.yaml"
      }
    ]
  };
}
function strictPreset() {
  return {
    version: "1",
    defaults: {
      ...baseDefaults(),
      strictness: "strict",
      unmatchedFiles: "deny"
    },
    folders: [
      {
        id: "root-allowlist",
        path: ".",
        allowedFolders: ["docs", "schemas", "examples"],
        allowedFiles: ["repotype.yaml", "README.md"]
      }
    ],
    files: [
      { id: "repotype-config", glob: "repotype.yaml" },
      { id: "docs-markdown", glob: "docs/**/*.md" },
      { id: "schemas-json", glob: "schemas/**/*.json" },
      { id: "templates-markdown", glob: "examples/templates/**/*.md" }
    ]
  };
}
function createPresetConfig(type) {
  if (type === "default") return defaultPreset();
  if (type === "strict") return strictPreset();
  throw new Error(`Unsupported preset type '${type}'.`);
}
function listPresetTypes() {
  return ["default", "strict"];
}

// src/sdk/report-sdk.ts
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function renderMarkdownComplianceReport(report) {
  const lines = [];
  lines.push("# Repotype Compliance Report");
  lines.push("");
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Target: ${report.target}`);
  lines.push(`- Repo root: ${report.repoRoot}`);
  lines.push(`- Config: ${report.configPath}`);
  lines.push(`- Status: ${report.ok ? "PASS" : "FAIL"}`);
  lines.push(`- Files scanned: ${report.filesScanned}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Severity | Count |");
  lines.push("| --- | ---: |");
  lines.push(`| error | ${report.totals.errors} |`);
  lines.push(`| warning | ${report.totals.warnings} |`);
  lines.push(`| suggestion | ${report.totals.suggestions} |`);
  lines.push(`| total diagnostics | ${report.totals.diagnostics} |`);
  lines.push("");
  lines.push("## Diagnostics By Code");
  lines.push("");
  lines.push("| Code | Severity | Count |");
  lines.push("| --- | --- | ---: |");
  for (const code of report.byCode) {
    lines.push(`| ${code.code} | ${code.severity} | ${code.count} |`);
  }
  lines.push("");
  lines.push("## Sample Findings");
  lines.push("");
  if (report.sampleFindings.length === 0) {
    lines.push("- No findings.");
  } else {
    for (const finding of report.sampleFindings) {
      lines.push(`- [${finding.severity}] ${finding.code}: ${finding.message} (${finding.file})`);
    }
  }
  lines.push("");
  return lines.join("\n");
}
function renderHtmlComplianceReport(report) {
  const byCodeRows = report.byCode.map(
    (item) => `<tr><td><code>${escapeHtml(item.code)}</code></td><td>${escapeHtml(item.severity)}</td><td class="num">${item.count}</td></tr>`
  ).join("\n");
  const sampleRows = report.sampleFindings.length === 0 ? '<tr><td colspan="4">No findings.</td></tr>' : report.sampleFindings.map(
    (item) => `<tr><td>${escapeHtml(item.severity)}</td><td><code>${escapeHtml(item.code)}</code></td><td>${escapeHtml(item.message)}</td><td><code>${escapeHtml(item.file)}</code></td></tr>`
  ).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Repotype Compliance Report</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 24px; line-height: 1.5; }
    h1, h2 { margin: 0 0 12px; }
    section { margin: 24px 0; }
    .meta { margin: 0; padding-left: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #9ca3af; padding: 8px; text-align: left; vertical-align: top; }
    .num { text-align: right; }
    .badge { display: inline-block; border: 1px solid #9ca3af; border-radius: 999px; padding: 2px 10px; font-weight: 600; }
    code { white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <h1>Repotype Compliance Report</h1>
  <p><span class="badge">Status: ${report.ok ? "PASS" : "FAIL"}</span></p>

  <section>
    <h2>Metadata</h2>
    <ul class="meta">
      <li>Generated: <code>${escapeHtml(report.generatedAt)}</code></li>
      <li>Target: <code>${escapeHtml(report.target)}</code></li>
      <li>Repo root: <code>${escapeHtml(report.repoRoot)}</code></li>
      <li>Config: <code>${escapeHtml(report.configPath)}</code></li>
      <li>Files scanned: <code>${report.filesScanned}</code></li>
    </ul>
  </section>

  <section>
    <h2>Summary</h2>
    <table>
      <thead><tr><th>Severity</th><th>Count</th></tr></thead>
      <tbody>
        <tr><td>error</td><td class="num">${report.totals.errors}</td></tr>
        <tr><td>warning</td><td class="num">${report.totals.warnings}</td></tr>
        <tr><td>suggestion</td><td class="num">${report.totals.suggestions}</td></tr>
        <tr><td>total diagnostics</td><td class="num">${report.totals.diagnostics}</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Diagnostics By Code</h2>
    <table>
      <thead><tr><th>Code</th><th>Severity</th><th>Count</th></tr></thead>
      <tbody>
        ${byCodeRows}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Sample Findings</h2>
    <table>
      <thead><tr><th>Severity</th><th>Code</th><th>Message</th><th>File</th></tr></thead>
      <tbody>
        ${sampleRows}
      </tbody>
    </table>
  </section>

  <script type="application/json" id="repotype-report-data">${escapeHtml(JSON.stringify(report))}</script>
</body>
</html>
`;
}
function renderComplianceReport(report, format = "markdown") {
  if (format === "json") {
    return JSON.stringify(report, null, 2);
  }
  if (format === "html") {
    return renderHtmlComplianceReport(report);
  }
  return renderMarkdownComplianceReport(report);
}

// src/cli/use-cases.ts
import yaml5 from "js-yaml";
function deriveTargetRoot(targetPath) {
  if (fs18.existsSync(targetPath) && fs18.statSync(targetPath).isDirectory()) {
    return targetPath;
  }
  return path20.dirname(targetPath);
}
async function validatePath(target, configOverridePath, opts = {}) {
  const absolute = path20.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path20.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path20.dirname(configPath);
  const config2 = loadConfig(configPath);
  const engine = createDefaultEngine();
  const isDirectory = fs18.existsSync(absolute) && fs18.statSync(absolute).isDirectory();
  const workspaceEnabled = opts.workspace !== false;
  if (isDirectory && workspaceEnabled && !configOverridePath) {
    const wsResult = await engine.validateWorkspace(absolute, { noCache: opts.noCache });
    if (wsResult.mode === "workspace") {
      const pluginDiagnostics3 = runPluginPhase(config2, repoRoot, "validate");
      if (pluginDiagnostics3.length > 0) {
        wsResult.result.rootResult.diagnostics.push(...pluginDiagnostics3);
        wsResult.result.rootResult.ok = wsResult.result.rootResult.diagnostics.every(
          (d) => d.severity !== "error"
        );
        wsResult.result.ok = wsResult.result.ok && wsResult.result.rootResult.ok;
      }
      return wsResult;
    }
    const pluginDiagnostics2 = runPluginPhase(config2, repoRoot, "validate");
    const diagnostics2 = [...wsResult.result.diagnostics, ...pluginDiagnostics2];
    return {
      mode: "flat",
      result: {
        ...wsResult.result,
        diagnostics: diagnostics2,
        ok: diagnostics2.every((d) => d.severity !== "error")
      }
    };
  }
  const result = await engine.validate(target, { configPath });
  const pluginDiagnostics = runPluginPhase(config2, repoRoot, "validate");
  const diagnostics = [...result.diagnostics, ...pluginDiagnostics];
  return {
    mode: "flat",
    result: {
      ...result,
      diagnostics,
      ok: diagnostics.every((d) => d.severity !== "error")
    }
  };
}
function explainPath(target, configOverridePath) {
  const absolute = path20.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path20.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path20.dirname(configPath);
  const config2 = loadConfig(configPath);
  return explainRules(config2, repoRoot, absolute);
}
async function fixPath(target, configOverridePath, opts = {}) {
  const absolute = path20.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path20.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path20.dirname(configPath);
  const config2 = loadConfig(configPath);
  const validateResult = await validatePath(target, configOverridePath, opts);
  if (validateResult.mode === "workspace") {
    const wsResult = validateResult.result;
    const rootActions = wsResult.rootResult.diagnostics.map((d) => d.autofix).filter((action) => Boolean(action));
    const rootFix = applyAutofixes(rootActions);
    const childFixes = wsResult.workspaces.map((ws) => {
      const actions2 = ws.result.diagnostics.map((d) => d.autofix).filter((action) => Boolean(action));
      const fix = applyAutofixes(actions2);
      return { configPath: ws.configPath, subtreeRoot: ws.subtreeRoot, fix };
    });
    const pluginDiagnostics2 = runPluginPhase(config2, repoRoot, "fix");
    wsResult.rootResult.diagnostics.push(...pluginDiagnostics2);
    wsResult.rootResult.ok = wsResult.rootResult.diagnostics.every((d) => d.severity !== "error");
    wsResult.ok = wsResult.ok && wsResult.rootResult.ok;
    const totalApplied = rootFix.applied + childFixes.reduce((acc, cf) => acc + cf.fix.applied, 0);
    return {
      validation: validateResult,
      fix: { applied: totalApplied },
      workspaceFixes: { root: rootFix, children: childFixes }
    };
  }
  const result = validateResult.result;
  const actions = result.diagnostics.map((d) => d.autofix).filter((action) => Boolean(action));
  const fixResult = applyAutofixes(actions);
  const pluginDiagnostics = runPluginPhase(config2, repoRoot, "fix");
  const diagnostics = [...result.diagnostics, ...pluginDiagnostics];
  const validation = {
    mode: "flat",
    result: {
      ...result,
      diagnostics,
      ok: diagnostics.every((d) => d.severity !== "error")
    }
  };
  return {
    validation,
    fix: fixResult
  };
}
function scaffoldFromTemplate(templateId, outputPath, variables) {
  const absolute = path20.resolve(outputPath);
  const configPath = findConfig(absolute);
  const repoRoot = path20.dirname(configPath);
  const config2 = loadConfig(configPath);
  const content = renderTemplate(config2, repoRoot, templateId, variables);
  const parent = path20.dirname(absolute);
  if (!fs18.existsSync(parent)) {
    fs18.mkdirSync(parent, { recursive: true });
  }
  fs18.writeFileSync(absolute, content);
  return absolute;
}
function generateSchemaFromContent(target, output, pattern = "**/*.md") {
  return generateFrontmatterSchemaFromContent(target, output, pattern);
}
function initRepotypeConfig(targetDir, options = {}) {
  const type = options.type ?? "default";
  const force = options.force ?? false;
  const absoluteTarget = path20.resolve(targetDir);
  const outputPath = path20.join(absoluteTarget, "repotype.yaml");
  if (fs18.existsSync(outputPath) && !force) {
    throw new Error(`repotype.yaml already exists at ${outputPath}. Use --force to overwrite.`);
  }
  const config2 = options.from ? yaml5.load(fs18.readFileSync(path20.resolve(options.from), "utf8")) : createPresetConfig(type);
  if (!config2 || typeof config2 !== "object" || !config2.version) {
    throw new Error('Source config is invalid. Expected YAML with top-level "version".');
  }
  const rendered = yaml5.dump(config2, { lineWidth: 120 });
  fs18.mkdirSync(absoluteTarget, { recursive: true });
  fs18.writeFileSync(outputPath, rendered);
  return {
    outputPath,
    source: options.from ? `file:${path20.resolve(options.from)}` : `preset:${type}`
  };
}
function getRepotypePresetMetadata() {
  return {
    types: listPresetTypes()
  };
}
function installPluginRequirements(target) {
  const absolute = path20.resolve(target);
  const configPath = findConfig(absolute);
  const repoRoot = path20.dirname(configPath);
  const config2 = loadConfig(configPath);
  const installs = installPlugins(config2, repoRoot);
  return {
    repoRoot,
    configPath,
    installs,
    ok: installs.every((entry) => entry.ok)
  };
}
function pluginStatus(target) {
  const absolute = path20.resolve(target);
  const configPath = findConfig(absolute);
  const repoRoot = path20.dirname(configPath);
  const config2 = loadConfig(configPath);
  const plugins = describePlugins(config2);
  return {
    repoRoot,
    configPath,
    plugins
  };
}
async function generateComplianceReport(target, format = "markdown", configOverridePath) {
  const absolute = path20.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path20.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path20.dirname(configPath);
  const validateResult = await validatePath(target, configOverridePath);
  const allDiagnostics = validateResult.mode === "workspace" ? [
    ...validateResult.result.rootResult.diagnostics,
    ...validateResult.result.workspaces.flatMap((ws) => ws.result.diagnostics)
  ] : validateResult.result.diagnostics;
  const ok = validateResult.result.ok;
  const filesScanned = validateResult.result.filesScanned;
  const totals = allDiagnostics.reduce(
    (acc, diagnostic) => {
      if (diagnostic.severity === "error") acc.errors += 1;
      if (diagnostic.severity === "warning") acc.warnings += 1;
      if (diagnostic.severity === "suggestion") acc.suggestions += 1;
      acc.diagnostics += 1;
      return acc;
    },
    { errors: 0, warnings: 0, suggestions: 0, diagnostics: 0 }
  );
  const byCodeMap = /* @__PURE__ */ new Map();
  for (const diagnostic of allDiagnostics) {
    const entry = byCodeMap.get(diagnostic.code);
    if (entry) {
      entry.count += 1;
      continue;
    }
    byCodeMap.set(diagnostic.code, {
      severity: diagnostic.severity,
      count: 1
    });
  }
  const severityRank = {
    error: 0,
    warning: 1,
    suggestion: 2
  };
  const byCode = [...byCodeMap.entries()].map(([code, value]) => ({ code, severity: value.severity, count: value.count })).sort((a, b) => {
    const severityDiff = severityRank[a.severity] - severityRank[b.severity];
    if (severityDiff !== 0) {
      return severityDiff;
    }
    return b.count - a.count;
  });
  const sampleFindings = allDiagnostics.slice(0, 50).map((diagnostic) => ({
    code: diagnostic.code,
    severity: diagnostic.severity,
    file: diagnostic.file,
    message: diagnostic.message
  }));
  const report = {
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    target: absolute,
    repoRoot,
    configPath,
    ok,
    filesScanned,
    totals,
    byCode,
    sampleFindings
  };
  return {
    ok,
    report,
    rendered: renderComplianceReport(report, format)
  };
}

// src/cli/cleanup.ts
function ensureDir(dir) {
  if (!fs19.existsSync(dir)) {
    fs19.mkdirSync(dir, { recursive: true });
  }
}
function getTimestamp() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function dedupe(items) {
  return [...new Set(items)];
}
function safeDestination(baseQueue, targetRoot, sourceFile) {
  const relative = path21.relative(targetRoot, sourceFile);
  const clamped = relative.startsWith("..") ? path21.basename(sourceFile) : relative;
  const destination = path21.join(baseQueue, clamped);
  if (!fs19.existsSync(destination)) {
    return destination;
  }
  const ext = path21.extname(destination);
  const stem = destination.slice(0, destination.length - ext.length);
  return `${stem}.moved-${Date.now()}${ext}`;
}
function writeAuditLogs(queueDir, entries) {
  ensureDir(queueDir);
  const jsonlPath = path21.join(queueDir, "cleanup-log.jsonl");
  const textPath = path21.join(queueDir, "cleanup-log.md");
  for (const entry of entries) {
    fs19.appendFileSync(jsonlPath, `${JSON.stringify(entry)}
`);
    const summary = [
      `- ${entry.timestamp}`,
      `  - source: ${entry.source}`,
      `  - destination: ${entry.destination}`,
      `  - moved: ${entry.moved ? "yes" : "no (dry-run)"}`,
      `  - errors: ${entry.errorCount}`,
      ...entry.diagnostics.map((d) => `  - ${d.code}: ${d.message}`),
      ""
    ].join("\n");
    fs19.appendFileSync(textPath, summary);
  }
}
async function runCleanup(options) {
  const targetRoot = path21.resolve(options.target);
  const queueDir = path21.resolve(options.queueDir);
  ensureDir(queueDir);
  const validateResult = await validatePath(targetRoot);
  const allDiagnostics = validateResult.mode === "workspace" ? [
    ...validateResult.result.rootResult.diagnostics,
    ...validateResult.result.workspaces.flatMap((ws) => ws.result.diagnostics)
  ] : validateResult.result.diagnostics;
  const validation = {
    diagnostics: allDiagnostics,
    filesScanned: validateResult.result.filesScanned
  };
  const errorDiagnostics = validation.diagnostics.filter((d) => d.severity === "error");
  const files = dedupe(errorDiagnostics.map((d) => d.file));
  const entries = [];
  let moved = 0;
  for (const file2 of files) {
    if (!fs19.existsSync(file2)) {
      continue;
    }
    const diagnostics = errorDiagnostics.filter((d) => d.file === file2);
    if (diagnostics.length < options.minErrors) {
      continue;
    }
    const destination = safeDestination(queueDir, targetRoot, file2);
    ensureDir(path21.dirname(destination));
    if (!options.dryRun) {
      fs19.renameSync(file2, destination);
      moved += 1;
    }
    entries.push({
      timestamp: getTimestamp(),
      source: file2,
      destination,
      errorCount: diagnostics.length,
      diagnostics: diagnostics.map((d) => ({ code: d.code, message: d.message })),
      moved: !options.dryRun
    });
  }
  if (entries.length > 0) {
    writeAuditLogs(queueDir, entries);
  }
  return {
    scanned: validation.filesScanned,
    candidates: entries.length,
    moved,
    entries: entries.map((entry) => ({
      source: entry.source,
      destination: entry.destination,
      errorCount: entry.errorCount,
      moved: entry.moved
    }))
  };
}

// src/cli/watcher.ts
import fs20 from "fs";
import path22 from "path";
import { spawnSync } from "child_process";
function shQuote(input) {
  return `'${input.replace(/'/g, `'"'"'`)}'`;
}
function readCrontab() {
  const read = spawnSync("crontab", ["-l"], { encoding: "utf8" });
  if (read.status !== 0) {
    return "";
  }
  return read.stdout || "";
}
function writeCrontab(content) {
  const write = spawnSync("crontab", ["-"], { input: content, encoding: "utf8" });
  if (write.status !== 0) {
    throw new Error(write.stderr || "Failed to write crontab");
  }
}
function installWatcher(options) {
  const target = path22.resolve(options.target);
  const queueDir = path22.resolve(options.queueDir);
  const logFile = path22.resolve(options.logFile);
  fs20.mkdirSync(path22.dirname(logFile), { recursive: true });
  fs20.mkdirSync(queueDir, { recursive: true });
  const marker = `# REPOTYPE_WATCHER:${target}`;
  const command = [
    `cd ${shQuote(target)}`,
    `&& repotype cleanup-run ${shQuote(target)}`,
    `--queue ${shQuote(queueDir)}`,
    `--min-errors ${options.minErrors}`,
    `>> ${shQuote(logFile)} 2>&1`
  ].join(" ");
  const line = `${options.schedule} ${command} ${marker}`;
  const current = readCrontab();
  const lines = current.split("\n").map((entry) => entry.trimEnd()).filter((entry) => entry.length > 0);
  const filtered = lines.filter((entry) => !entry.includes(marker));
  const changed = filtered.length !== lines.length || !lines.includes(line);
  const nextLines = [...filtered, line];
  const next = `${nextLines.join("\n")}
`;
  if (!options.dryRun && changed) {
    writeCrontab(next);
  }
  return {
    marker,
    schedule: options.schedule,
    command,
    line,
    changed
  };
}
function inspectWatcher(target) {
  const resolved = path22.resolve(target);
  const marker = `# REPOTYPE_WATCHER:${resolved}`;
  const current = readCrontab();
  const lines = current.split("\n").map((entry) => entry.trimEnd()).filter((entry) => entry.length > 0);
  const line = lines.find((entry) => entry.includes(marker));
  return {
    marker,
    installed: Boolean(line),
    line
  };
}
function uninstallWatcher(target, dryRun = false) {
  const resolved = path22.resolve(target);
  const marker = `# REPOTYPE_WATCHER:${resolved}`;
  const current = readCrontab();
  const lines = current.split("\n").map((entry) => entry.trimEnd()).filter((entry) => entry.length > 0);
  const filtered = lines.filter((entry) => !entry.includes(marker));
  const changed = filtered.length !== lines.length;
  if (changed && !dryRun) {
    const next = filtered.length > 0 ? `${filtered.join("\n")}
` : "";
    writeCrontab(next);
  }
  return {
    marker,
    removed: changed,
    changed
  };
}

// src/cli/operations.ts
import fs21 from "fs";
import path23 from "path";
function resolveRepoRoot(target) {
  const absolute = path23.resolve(target);
  const configPath = findConfig(absolute);
  const repoRoot = path23.dirname(configPath);
  return { repoRoot, configPath };
}
function normalizeOperations(target) {
  const { repoRoot, configPath } = resolveRepoRoot(target);
  const config2 = loadConfig(configPath);
  const normalized = {
    hooks: {
      enabled: config2.operations?.hooks?.enabled ?? false,
      hook: config2.operations?.hooks?.hook ?? "both"
    },
    watcher: {
      enabled: config2.operations?.watcher?.enabled ?? false,
      schedule: config2.operations?.watcher?.schedule ?? "*/15 * * * *",
      queueDir: path23.resolve(repoRoot, config2.operations?.watcher?.queueDir ?? "sort_queue"),
      minErrors: config2.operations?.watcher?.minErrors ?? 3,
      logFile: path23.resolve(repoRoot, config2.operations?.watcher?.logFile ?? ".repotype/logs/watcher.log")
    }
  };
  return {
    repoRoot,
    configPath,
    config: normalized
  };
}
function readLastCleanupEntry(queueDir) {
  const logPath = path23.join(queueDir, "cleanup-log.jsonl");
  if (!fs21.existsSync(logPath)) {
    return { found: false };
  }
  const lines = fs21.readFileSync(logPath, "utf8").split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { found: false };
  }
  try {
    return { found: true, entry: JSON.parse(lines[lines.length - 1]) };
  } catch {
    return { found: false };
  }
}
function getOperationsStatus(target) {
  const normalized = normalizeOperations(target);
  const hooks = inspectChecks(normalized.repoRoot);
  const watcher = inspectWatcher(normalized.repoRoot);
  const cleanup = {
    queueDir: normalized.config.watcher.queueDir,
    lastRun: readLastCleanupEntry(normalized.config.watcher.queueDir)
  };
  const ignoreMatcher = createIgnoreMatcher(normalized.repoRoot);
  const childWorkspaces = discoverWorkspaces(normalized.repoRoot, ignoreMatcher);
  const workspace = {
    mode: childWorkspaces.length > 0 ? "workspace" : "flat",
    childCount: childWorkspaces.length,
    children: childWorkspaces.map((ws) => ({ configPath: ws.configPath, subtreeRoot: ws.subtreeRoot }))
  };
  return {
    repoRoot: normalized.repoRoot,
    configPath: normalized.configPath,
    config: normalized.config,
    hooks,
    watcher,
    cleanup,
    workspace
  };
}
function applyOperationsConfig(target) {
  const normalized = normalizeOperations(target);
  const hooks = normalized.config.hooks.enabled ? installChecks({ target: normalized.repoRoot, hook: normalized.config.hooks.hook }) : uninstallChecks({ target: normalized.repoRoot, hook: normalized.config.hooks.hook });
  const watcher = normalized.config.watcher.enabled ? installWatcher({
    target: normalized.repoRoot,
    schedule: normalized.config.watcher.schedule,
    queueDir: normalized.config.watcher.queueDir,
    minErrors: normalized.config.watcher.minErrors,
    logFile: normalized.config.watcher.logFile,
    dryRun: false
  }) : uninstallWatcher(normalized.repoRoot);
  return {
    repoRoot: normalized.repoRoot,
    configPath: normalized.configPath,
    applied: {
      hooks,
      watcher
    }
  };
}

// src/universal-commands.ts
function parseSetFlags(values = []) {
  const output = {};
  for (const entry of values) {
    const idx = entry.indexOf("=");
    if (idx <= 0) continue;
    const key = entry.slice(0, idx);
    const value = entry.slice(idx + 1);
    output[key] = value;
  }
  return output;
}
var repotypeValidateCommand = new UniversalCommand({
  name: "repotype validate",
  description: "Validate repository structure and markdown/frontmatter rules against repotype.yaml",
  scope: "project",
  keywords: ["repo", "schema", "lint", "markdown", "frontmatter", "validation"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Target file/directory to validate",
        positional: true,
        required: false
      },
      {
        name: "config",
        type: "string",
        description: "Explicit config path",
        positional: false,
        required: false
      }
    ]
  },
  output: {
    type: "json"
  },
  cli: {
    format(result) {
      if (!result.ok) process.exitCode = 1;
      return JSON.stringify(result, null, 2);
    }
  },
  async handler({ target = ".", config: config2 }) {
    const validateResult = await validatePath(target, config2);
    if (validateResult.mode === "workspace") {
      const wsResult = validateResult.result;
      const allDiagnostics = [
        ...wsResult.rootResult.diagnostics,
        ...wsResult.workspaces.flatMap((ws) => ws.result.diagnostics)
      ];
      return {
        ok: wsResult.ok,
        filesScanned: wsResult.filesScanned,
        diagnostics: allDiagnostics,
        mode: "workspace",
        workspaces: wsResult.workspaces.map((ws) => ws.subtreeRoot)
      };
    }
    return {
      ok: validateResult.result.ok,
      filesScanned: validateResult.result.filesScanned,
      diagnostics: validateResult.result.diagnostics,
      mode: "flat"
    };
  }
});
var repotypeExplainCommand = new UniversalCommand({
  name: "repotype explain",
  description: "Explain which schema rules apply to a specific file",
  scope: "project",
  keywords: ["repo", "schema", "explain", "rules"],
  input: {
    parameters: [
      {
        name: "file",
        type: "string",
        description: "File path to explain",
        positional: true,
        required: true
      },
      {
        name: "config",
        type: "string",
        description: "Explicit config path",
        positional: false,
        required: false
      }
    ]
  },
  output: {
    type: "json"
  },
  async handler({ file: file2, config: config2 }) {
    const output = explainPath(file2, config2);
    return {
      reason: output.reason,
      effective: output.effective
    };
  }
});
var repotypeStatusCommand = new UniversalCommand({
  name: "repotype status",
  description: "Show repotype-managed hooks, watcher state, and cleanup log status",
  scope: "project",
  keywords: ["repotype", "status", "hooks", "watcher", "cleanup"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Repository path",
        positional: true,
        required: false
      }
    ]
  },
  output: {
    type: "json"
  },
  async handler({ target = "." }) {
    return getOperationsStatus(target);
  }
});
var repotypeApplyCommand = new UniversalCommand({
  name: "repotype apply",
  description: "Apply operations config from repotype.yaml (hooks and watcher)",
  scope: "project",
  keywords: ["repotype", "apply", "operations", "hooks", "watcher"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Repository path",
        positional: true,
        required: false
      }
    ]
  },
  output: {
    type: "json"
  },
  async handler({ target = "." }) {
    return applyOperationsConfig(target);
  }
});
var repotypeReportCommand = new UniversalCommand({
  name: "repotype report",
  description: "Generate compliance evidence report for a target path",
  scope: "project",
  keywords: ["repotype", "report", "evidence", "compliance"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Target file/directory to report on",
        positional: true,
        required: false
      },
      {
        name: "format",
        type: "string",
        description: "Report format (markdown|json|html)",
        positional: false,
        required: false
      },
      {
        name: "config",
        type: "string",
        description: "Explicit config path",
        positional: false,
        required: false
      },
      {
        name: "output",
        type: "string",
        description: "Write rendered report to this file path",
        positional: false,
        required: false
      }
    ]
  },
  output: {
    type: "json"
  },
  cli: {
    // The installed @supernal/universal-command@0.1.0 calls format(result) with
    // no args, so all arg-dependent logic lives in the handler instead.
    // This format function only controls what gets printed to stdout.
    format(result) {
      if (!result.ok) process.exitCode = 1;
      if (result._writtenTo) {
        return JSON.stringify(
          { ok: result.ok, output: result._writtenTo },
          null,
          2
        );
      }
      return result.rendered;
    }
  },
  async handler({ target = ".", format = "markdown", config: config2, output }) {
    const result = await generateComplianceReport(target, format, config2);
    if (output) {
      const outPath = path24.resolve(output);
      fs22.mkdirSync(path24.dirname(outPath), { recursive: true });
      fs22.writeFileSync(outPath, result.rendered);
      return { ...result, _writtenTo: outPath };
    }
    return result;
  }
});
var repotypeFixCommand = new UniversalCommand({
  name: "repotype fix",
  description: "Apply safe autofixes and return remaining diagnostics",
  scope: "project",
  keywords: ["repotype", "fix", "autofix", "validation"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Target file or directory",
        positional: true,
        required: false
      },
      {
        name: "config",
        type: "string",
        description: "Explicit config path",
        positional: false,
        required: false
      }
    ]
  },
  output: { type: "json" },
  async handler({ target = ".", config: config2 }) {
    return fixPath(target, config2);
  }
});
var repotypeCleanupRunCommand = new UniversalCommand({
  name: "repotype cleanup-run",
  description: "Move severely invalid files into a triage queue",
  scope: "project",
  keywords: ["repotype", "cleanup", "triage", "sort_queue"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Target path",
        positional: true,
        required: false
      },
      {
        name: "queue",
        type: "string",
        description: "Queue directory",
        positional: false,
        required: false
      },
      {
        name: "minErrors",
        type: "number",
        description: "Minimum error count before moving",
        positional: false,
        required: false
      },
      {
        name: "dryRun",
        type: "boolean",
        description: "Dry run only",
        positional: false,
        required: false
      }
    ]
  },
  output: { type: "json" },
  async handler({
    target = ".",
    queue = "sort_queue",
    minErrors = 3,
    dryRun = false
  }) {
    const absoluteTarget = path24.resolve(target);
    const queueDir = path24.isAbsolute(queue) ? queue : path24.resolve(absoluteTarget, queue);
    return runCleanup({ target: absoluteTarget, queueDir, minErrors, dryRun });
  }
});
var repotypeInstallChecksCommand = new UniversalCommand({
  name: "repotype install-checks",
  description: "Install repotype git hooks (pre-commit/pre-push)",
  scope: "project",
  keywords: ["repotype", "git", "hooks", "pre-commit", "pre-push"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Repository path",
        positional: false,
        required: false
      },
      {
        name: "hook",
        type: "string",
        description: "Hook mode: pre-commit|pre-push|both",
        positional: false,
        required: false
      }
    ]
  },
  output: { type: "json" },
  async handler({ target = ".", hook = "both" }) {
    return installChecks({ target, hook });
  }
});
var repotypeInstallWatcherCommand = new UniversalCommand({
  name: "repotype install-watcher",
  description: "Install cron watcher for repotype cleanup automation",
  scope: "project",
  keywords: ["repotype", "watcher", "cron", "cleanup"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Repository path",
        positional: false,
        required: false
      },
      {
        name: "schedule",
        type: "string",
        description: "Cron schedule",
        positional: false,
        required: false
      },
      {
        name: "queue",
        type: "string",
        description: "Queue directory",
        positional: false,
        required: false
      },
      {
        name: "minErrors",
        type: "number",
        description: "Minimum errors threshold",
        positional: false,
        required: false
      },
      {
        name: "logFile",
        type: "string",
        description: "Watcher log file path",
        positional: false,
        required: false
      },
      {
        name: "dryRun",
        type: "boolean",
        description: "Dry-run installation",
        positional: false,
        required: false
      }
    ]
  },
  output: { type: "json" },
  async handler({
    target = ".",
    schedule = "*/15 * * * *",
    queue = "sort_queue",
    minErrors = 3,
    logFile = ".repotype/logs/watcher.log",
    dryRun = true
  }) {
    const resolvedTarget = path24.resolve(target);
    const queueDir = path24.isAbsolute(queue) ? queue : path24.resolve(resolvedTarget, queue);
    const resolvedLogFile = path24.isAbsolute(logFile) ? logFile : path24.resolve(resolvedTarget, logFile);
    return installWatcher({
      target: resolvedTarget,
      schedule,
      queueDir,
      minErrors,
      logFile: resolvedLogFile,
      dryRun
    });
  }
});
var repotypeScaffoldCommand = new UniversalCommand({
  name: "repotype scaffold",
  description: "Create a file from a configured template",
  scope: "project",
  keywords: ["repotype", "scaffold", "template", "generate"],
  input: {
    parameters: [
      {
        name: "templateId",
        type: "string",
        description: "Template id",
        positional: true,
        required: true
      },
      {
        name: "output",
        type: "string",
        description: "Output path",
        positional: true,
        required: true
      },
      {
        name: "set",
        type: "string",
        description: "Template variable key=value (repeatable)",
        positional: false,
        required: false
      }
    ]
  },
  output: { type: "json" },
  async handler({ templateId, output, set: set2 = [] }) {
    const created = scaffoldFromTemplate(
      templateId,
      output,
      parseSetFlags(Array.isArray(set2) ? set2 : [set2])
    );
    return { created };
  }
});
var repotypeGenerateSchemaCommand = new UniversalCommand({
  name: "repotype generate schema",
  description: "Generate frontmatter JSON schema from markdown content",
  scope: "project",
  keywords: ["repotype", "generate", "schema", "frontmatter"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "File or directory target",
        positional: true,
        required: true
      },
      {
        name: "output",
        type: "string",
        description: "Output schema path",
        positional: true,
        required: true
      },
      {
        name: "pattern",
        type: "string",
        description: "Glob pattern when target is directory",
        positional: false,
        required: false
      }
    ]
  },
  output: { type: "json" },
  cli: {
    format(result) {
      return `schema written: ${result.output}
${JSON.stringify(result, null, 2)}`;
    }
  },
  async handler({ target, output, pattern = "**/*.md" }) {
    return generateSchemaFromContent(target, output, pattern);
  }
});
var repotypeInitCommand = new UniversalCommand({
  name: "repotype init",
  description: "Initialize repotype.yaml from generic preset or external source",
  scope: "project",
  keywords: ["repotype", "init", "profile", "bootstrap"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Target directory",
        positional: true,
        required: false
      },
      {
        name: "type",
        type: "string",
        description: "Profile type (default)",
        positional: false,
        required: false
      },
      {
        name: "from",
        type: "string",
        description: "External config path",
        positional: false,
        required: false
      },
      {
        name: "force",
        type: "boolean",
        description: "Overwrite existing config",
        positional: false,
        required: false
      }
    ]
  },
  output: { type: "json" },
  async handler({ target = ".", type = "default", from, force = false }) {
    const metadata = getRepotypePresetMetadata();
    if (!metadata.types.includes(type)) {
      throw new Error(`Unsupported preset type '${type}'.`);
    }
    return initRepotypeConfig(target, { type, from, force });
  }
});
var repotypePluginsStatusCommand = new UniversalCommand({
  name: "repotype plugins status",
  description: "Show configured plugin requirement status",
  scope: "project",
  keywords: ["repotype", "plugins", "status"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Repository path",
        positional: true,
        required: false
      }
    ]
  },
  output: { type: "json" },
  async handler({ target = "." }) {
    return pluginStatus(target);
  }
});
var repotypePluginsInstallCommand = new UniversalCommand({
  name: "repotype plugins install",
  description: "Run configured plugin installation commands",
  scope: "project",
  keywords: ["repotype", "plugins", "install"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Repository path",
        positional: true,
        required: false
      }
    ]
  },
  output: { type: "json" },
  async handler({ target = "." }) {
    return installPluginRequirements(target);
  }
});

// src/mcp.ts
function buildRepotypeRegistry() {
  const registry2 = new CommandRegistry();
  const commands = [
    repotypeValidateCommand,
    repotypeExplainCommand,
    repotypeStatusCommand,
    repotypeApplyCommand,
    repotypeReportCommand,
    repotypeFixCommand,
    repotypeCleanupRunCommand,
    repotypeInstallChecksCommand,
    repotypeInstallWatcherCommand,
    repotypeScaffoldCommand,
    repotypeGenerateSchemaCommand,
    repotypeInitCommand,
    repotypePluginsStatusCommand,
    repotypePluginsInstallCommand
  ];
  for (const cmd of commands) {
    registry2.register(cmd);
  }
  return registry2;
}
async function startMCPServer() {
  const registry2 = buildRepotypeRegistry();
  const server = await createMCPServer(registry2, {
    name: "repotype",
    version: "0.1.0"
  });
  const { StdioServerTransport: StdioServerTransport2 } = await Promise.resolve().then(() => (init_stdio2(), stdio_exports));
  const transport = new StdioServerTransport2();
  await server.connect(transport);
  process.stderr.write("repotype MCP server running on stdio\n");
}
export {
  buildRepotypeRegistry,
  startMCPServer
};
//# sourceMappingURL=mcp.js.map