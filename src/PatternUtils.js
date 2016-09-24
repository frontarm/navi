function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function compilePattern(pattern, paramTypes) {
  var regexpSource = '';
  var pathParamNames = [];
  var tokens = [];

  // given branch param types, we can create routes with optional params

  var match,
      paramType,
      lastIndex = 0,
      matcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  while (match = matcher.exec(pattern)) {
    if (match.index !== lastIndex) {
      tokens.push(pattern.slice(lastIndex, match.index));
      regexpSource += escapeRegExp(pattern.slice(lastIndex, match.index));
    }

    if (match[1]) {
      paramType = paramTypes[match[1]]

      if (!paramType) {
        throw new Error(`An unknown param "${match[1]}" was referenced in the pattern "${pattern}".`)
      }

      pathParamNames.push(match[1]);
      regexpSource += paramType.optional ? '([^/]*)' : '([^/]+)';
    }

    tokens.push(match[0]);

    lastIndex = matcher.lastIndex;
  }

  if (lastIndex !== pattern.length) {
    tokens.push(pattern.slice(lastIndex, pattern.length));
    regexpSource += escapeRegExp(pattern.slice(lastIndex, pattern.length));
  }

  return {
    pattern: pattern,
    regexpSource: regexpSource,
    pathParamNames: pathParamNames,
    tokens: tokens
  };
}


/**
 * Returns a version of the given pattern with params interpolated. Throws
 * if there is a dynamic segment of the pattern for which there is no param.
 */
export function formatPattern(compiledPattern, params) {
  params = params || {};

  var tokens = compiledPattern.tokens;
  var pathname = '';
  var token,
      paramName,
      paramValue;

  for (var i = 0, len = tokens.length; i < len; ++i) {
    token = tokens[i];

    if (token.charAt(0) === ':') {
      paramName = token.substring(1);
      paramValue = params[paramName];

      if (!paramValue) {
        throw new Error(`Missing "${paramName}" parameter for path "${pattern}"`)
      }
      else {
          pathname += encodeURIComponent(paramValue)
      }
    } else {
      pathname += token;
    }
  }

  return pathname.replace(/\/+/g, '/');
}
