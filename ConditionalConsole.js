/*! MIT License - Copyright (c) 2016 Philip Birk-Jensen <philip@birk-jensen.dk> */

/*global module, define */
(function (scope) {
  'use strict';

  var
    /**
     * The ConditionalConsole class.
     *
     * @class ConditionalConsole
     *
     * @example
     * var cci = ConditionalCondition.getInstance();
     * cci.log('one'); // outputs one.
     * cci.check(false).log('two'); // outputs nothing.
     * cci.check(true).log('three'); // outputs three.
     */
    ConditionalConsole = function () {
      this._once = {};
      this._types = {
        all: 0,
      };
    },

    /**
     * Holder for all the instances created through the getInstance() function.
     * @private
     */
    instances = {};

  /**
   * Get a global ConditionalConsole instance.
   *
   * The most common usecase is simply calling this with no arguments to get
   * a ConditionalConsole which intergrates with all the console functions (like
   * log, warn, error, table and so on).
   *
   * @param  {String} [name=cci]
   *   The name of the instance.
   * @param  {Boolean} [nohandlers=false]
   *   Leaving this false will automatically add all the available console
   *   functions.
   *
   * @return {ConditionalConsole}
   */
  ConditionalConsole.getInstance = function (name, nohandlers) {
    if (name === undefined) {
      name = 'cci';
    }


    if (instances[name] === undefined) {
      instances[name] = new ConditionalConsole();

      if (nohandlers !== true) {
        addConsoleFunctions(instances[name]);
      }
    }

    return instances[name];
  };

  /** @lends ConditionalConsole.prototype */
  ConditionalConsole.prototype = {
    /**
     * The current state, of wether or not to call the last output function.
     * @type {boolean}
     * @private
     */
    __state: true,

    /**
     * If the state is locked.
     * @type {Boolean}
     * @private
     */
    __is_locked: false,

    /**
     * The state when it was locked.
     * @type {Boolean}
     * @private
     */
    __locked_state: true,

    /**
     * What operator will be used setting the next state.
     *
     * This is typically and/or but future more advanced checks could be
     * implemented.
     *
     * @type {Boolean}
     * @private
     */
    __logical_operator: 'and',

    /**
     * The current types to output.
     * @type {Number}
     * @private
     */
    __reporting: 0,

    /**
     * Set the current state.
     *
     * @param  {String} state [description]
     *
     * @return {ConditionalConsole}
     *   Chainable.
     *
     * @private
     */
    __setState: function (state) {
      state = !!state;

      switch (this.__logical_operator) {
        case 'and':
          this.__state = this.__state && state;
          break;

        case 'or':
          this.__state = this.__state || state;
          break;
      }

      return this;
    },

    /**
     * Get the state.
     *
     * This respects if the state is locked, and will return the locked_state
     * if that is the case.
     *
     * @return {Boolean}
     *   The state.
     *
     * @private
     */
    __getState: function () {
      return this.__is_locked === true ? this.__locked_state : this.__state;
    },

    /**
     * Reset the state.
     *
     * This returns the state prior to reset for convinience.
     *
     * @return {Boolean}
     *   The state before reset.
     *
     * @private
     */
    __resetState: function () {
      var result = this.__getState();

      this.__state = true;

      return result;
    },

    /**
     * Add an output function to the ConditionalConsole.
     *
     * @param  {String} key
     *   Name of the function to add.
     * @param  {Function} fn
     *   The function
     *
     * @return {ConditionalConsole}
     *   Chainable.
     */
    _addFunction: function (key, fn) {
      // Make sure it doesn't collide with any existing ConditionalConsole
      // properties.
      if (this.hasOwnProperty(key)) {
        throw new Error('Unable to add ' + key + ' function to the ConditionalConsole, because it already exists.');
      }

      // Add the function.
      Object.defineProperty(this, key, {
        get: function () {
          return this.__resetState() ? fn : this.nop;
        },
      });

      return this;
    },

    /**
     * No operation.
     *
     * The function called when we're in a false state, and nothing should be
     * outputted.
     */
    nop: function () { },

    /**
     * The following conditions will be OR'ed on.
     *
     * @return {ConditionalConsole}
     *   Chainable.
     */
    or: function () {
      this.__logical_operator = 'or';
      return this;
    },

    /**
     * The following conditions will be AND'ed on.
     *
     * @return {ConditionalConsole}
     *   Chainable.
     */
    and: function () {
      this.__logical_operator = 'and';
      return this;
    },

    /**
     * Add a reporting type.
     *
     * @param  {String} name
     *   Name of the reporting type.
     *
     * @return {ConditionalConsole}
     *   Chainable.
     */
    addType: function (name) {
      if (name === 'all') {
        throw new Error('The reporting type "all" is reserved for turning on all reportings.');
      }

      if (this._types[name] === undefined) {
        this._types[name] = 1 << (Object.keys(this._types).length);
        this._types.all |= this._types[name];
      }

      return this;
    },

    /**
     * Get the number for the reporting type.
     *
     * @return {Integer}
     *   The number used for binary checks.
     */
    getType: function (name) {
      if (this._types[name] === undefined) {
        this.addType(name);
      }

      return this._types[name];
    },

    /**
     * Set which types to allow.
     *
     * A simple string with the names of the types, separated by a single space,
     * and prefixed with '+' for adding, '-' for removing and nothing for setting
     * it exclusively. There's always an 'all' type that sets all types.
     *
     * @example
     * cci.setReporting('a +b +c +d'); // Allow a, b, c and d.
     * cci.setReporting('-a'); // Allow b, c and d.
     * cci.setReporting('all -c'); // Allow a, b and d.
     *
     * // Be careful not to add an exclusive later in the string, because it will
     * // override everything before it.
     * cci.setReporting('all a +d'); // Allow a and d.
     */
    setReporting: function (input) {
      var
        i,
        parts = input.split(' ');

      for (i in parts) {
        switch (parts[i].charAt(0)) {
          case '+':
            this.__reporting |= this.getType(parts[i].substr(1));
            break;

          case '-':
            this.__reporting &= ~this.getType(parts[i].substr(1));
            break;

          default:
            this.__reporting = this.getType(parts[i]);
            break;
        }
      }

      return this;
    },

    /**
     * Check if the type is allowed.
     *
     * @param  {String} name
     *   The type name.
     *
     * @return {ConditionalConsole}
     *   Chainable.
     */
    type: function (name) {
      return this.__setState(this.getType(name) & this.__reporting);
    },

    /**
     * Lock the current state.
     *
     * The locked state will be reused across resets.
     *
     * @see releaseLock()
     *
     * @return {ConditionalConsole}
     *   Chainable.
     */
    lock: function () {
      this.__locked_state = this.__state;
      this.__is_locked = true;

      return this;
    },

    /**
     * Release the locked state.
     *
     * @see lock()
     *
     * @return {ConditionalConsole}
     *   Chainable.
     */
    releaseLock: function () {
      this.__is_locked = false;

      return this;
    },

    /**
     * A simple check on the condition.
     *
     * This is the 'if' statement of ConditionalConsole, it basically just wraps
     * the _setState() function.
     *
     * @param  {mixed} condition
     *   This is the condition to check.
     *
     * @return {ConditionalConsole}
     *   Chainable.
     */
    check: function (condition) {
      return this.__setState(condition);
    },

    /**
     * Only proceed if once isn't called before.
     *
     * @example
     * cci.once('test').log('first'); // Outputs 'first'.
     * cci.once('test').log('second'); // Outputs nothing.
     *
     * @param  {String} label
     *   The name to once condition.
     *
     * @return {ConditionalConsole}
     *   Chainable.
     */
    once: function (label) {
      if (this._once[label] !== undefined) {
        return this.__setState(false);
      }

      if (this.__getState()) {
        this._once[label] = true;
      }

      return this;
    },

    /**
     * Reset once calls.
     *
     * @example
     * cci.once('test').log('first'); // Outputs 'first'.
     * cci.resetOnce('test');
     * cci.once('test').log('second'); // Outputs 'second'.
     *
     * @param  {String} label
     *   The name to once condition.
     *   If this is left blank every once will be reset.
     *
     * @return {ConditionalConsole}
     *   Chainable.
     */
    resetOnce: function (label) {
      if (label === undefined) {
        this._once = {};
      } else {
        delete this._once[label];
      }

      return this;
    },
  };

  // ---------------------------------------------------------------------------
  // Helper function, that adds all the console methods to the given
  // ConditionalConsole instance.
  function addConsoleFunctions(cc) {
    var
      i,
      key,
      // Traversing the console object and adding all it's functions to the
      // ConditionalConsole throws an error in nodejs, so we hardcode a list of
      // known functions to add.
      console_methods = [
        'debug', 'error', 'info', 'log', 'warn', 'dir', 'dirxml', 'table',
        'trace', 'group', 'groupCollapsed', 'groupEnd', 'clear', 'count',
        'assert', 'markTimeline', 'profile', 'profileEnd', 'timeline',
        'timelineEnd', 'time', 'timeEnd', 'timeStamp', 'memory'
      ],
      // The dummy function is added if the current implementation of the
      // console object doesn't support on of the hardcoded functions.
      dummy = function () { };

    for (i = console_methods.length; i > 0; i--) {
      key = console_methods[i];

      // Add the console function to the ConditionalConsole instance, and if it
      // doesn't exists add the dummy function to avoid errors of missing
      // properties.
      if (console !== undefined && console.hasOwnProperty(key)) {
        cc._addFunction(key, console[key]);
      } else {
        cc._addFunction(key, dummy);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Expose this to nodejs, AMD or any scope.
  if (typeof module === 'object' && module.exports) {
    module.exports = ConditionalConsole;
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return ConditionalConsole; });
  } else {
    scope.ConditionalConsole = ConditionalConsole;
    scope.cci = ConditionalConsole.getInstance();
  }

}(this));
