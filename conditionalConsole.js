(function () {
  "use strict";

  /**
   *
   */
  const neverendingObject = new Proxy(function () { }, {
    apply: function () { return neverendingObject; },
    get: function () { return neverendingObject; }
  });

  /**
   *
   */
  let _verbosityLevel = 0;

  /**
   *
   */
  let _tags = {}

  /**
   *
   */
  console.and = function (condition) {
    if (condition) {
      return console;
    }

    return neverendingObject;
  }

  /**
   *
   */
  console.verbosity = function (verbosityLevel) {
    if (verbosityLevel <= _verbosityLevel) {
      return console;
    }

    return neverendingObject;
  }

  /**
   *
   */
  console.setVerbosity = function (verbosityLevel) {
    _verbosityLevel = verbosityLevel;

    return this;
  }

  /**
   * @param {string|string[]} tags
   */
  console.tags = function (tags) {
    if (!Array.isArray(tags)) {
      tags = tags.split(' ');
    }

    if (tags.some(function (tag) { return _tags[tag]; })) {
      return console;
    }

    return neverendingObject;
  }

  /**
   * @param {string|string[]} tags
   */
  console.setTags = function (tags) {
    if (!Array.isArray(tags)) {
      tags = tags.split(' ');
    }

    tags.forEach(function (tag) {
      switch (tag[0]) {
        case '+':
          _tags[tag.substring(1)] = true;
          break;

        case '-':
          delete _tags[tag.substring(1)];
          break;

        default:
          _tags[tag] = true;
          break;
      }
    });

    return console;
  }

  // Initialize with query parameters.
  console.setTags((new URLSearchParams(location.search)).get('cc-tags') || '');
  console.setVerbosity((new URLSearchParams(location.search)).get('cc-verbosity') || 0);

}());
