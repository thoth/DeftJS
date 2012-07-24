/*!
DeftJS 0.6.8pre

Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

/**
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

Ext.define('Deft.log.Logger', {
  alternateClassName: ['Deft.Logger'],
  singleton: true,
  log: function(message, priority) {},
  error: function(message) {
    this.log(message, 'error');
  },
  info: function(message) {
    this.log(message, 'info');
  },
  verbose: function(message) {
    this.log(message, 'verbose');
  },
  warn: function(message) {
    this.log(message, 'warn');
  },
  deprecate: function(message) {
    this.log(message, 'deprecate');
  }
}, function() {
  var _ref;
  if (Ext.isFunction((_ref = Ext.Logger) != null ? _ref.log : void 0)) {
    this.log = Ext.bind(Ext.Logger.log, Ext.Logger);
  } else if (Ext.isFunction(Ext.log)) {
    this.log = function(message, priority) {
      if (priority == null) {
        priority = 'info';
      }
      if (priority === 'deprecate') {
        priority = 'warn';
      }
      Ext.log({
        msg: message,
        level: priority
      });
    };
  }
});
/**
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

Ext.define('Deft.util.Function', {
  alternateClassName: ['Deft.Function'],
  statics: {
    /**
    		Creates a new wrapper function that spreads the passed Array over the target function arguments.
    */

    spread: function(fn, scope) {
      return function(array) {
        if (!Ext.isArray(array)) {
          Ext.Error.raise({
            msg: "Error spreading passed Array over target function arguments: passed a non-Array."
          });
        }
        return fn.apply(scope, array);
      };
    },
    /**
    		Returns a new wrapper function that caches the return value for previously processed function argument(s).
    */

    memoize: function(fn, scope, hashFn) {
      var memo;
      memo = {};
      return function(value) {
        var key;
        key = Ext.isFunction(hashFn) ? hashFn.apply(scope, arguments) : value;
        if (!(key in memo)) {
          memo[key] = fn.apply(scope, arguments);
        }
        return memo[key];
      };
    }
  }
});
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

Ext.define('Deft.event.LiveEventListener', {
  requires: ['Ext.ComponentQuery'],
  constructor: function(config) {
    var component, components, _i, _len;
    Ext.apply(this, config);
    this.components = [];
    components = Ext.ComponentQuery.query(this.selector, this.container);
    for (_i = 0, _len = components.length; _i < _len; _i++) {
      component = components[_i];
      this.components.push(component);
      component.on(this.eventName, this.fn, this.scope, this.options);
    }
  },
  destroy: function() {
    var component, _i, _len, _ref;
    _ref = this.components;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      component = _ref[_i];
      component.un(this.eventName, this.fn, this.scope);
    }
    this.components = null;
  },
  register: function(component) {
    if (this.matches(component)) {
      this.components.push(component);
      component.on(this.eventName, this.fn, this.scope, this.options);
    }
  },
  unregister: function(component) {
    var index;
    index = Ext.Array.indexOf(this.components, component);
    if (index !== -1) {
      component.un(this.eventName, this.fn, this.scope);
      Ext.Array.erase(this.components, index, 1);
    }
  },
  matches: function(component) {
    if (this.selector === null && this.container === component) {
      return true;
    }
    if (this.container === null && Ext.Array.contains(Ext.ComponentQuery.query(this.selector), component)) {
      return true;
    }
    if (component.isDescendantOf(this.container) && Ext.Array.contains(this.container.query(this.selector), component)) {
      return true;
    }
    return false;
  }
});
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

Ext.define('Deft.event.LiveEventBus', {
  alternateClassName: ['Deft.LiveEventBus'],
  requires: ['Ext.ComponentManager', 'Deft.event.LiveEventListener'],
  singleton: true,
  constructor: function() {
    this.listeners = [];
  },
  destroy: function() {
    var listener, _i, _len, _ref;
    _ref = this.listeners;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listener = _ref[_i];
      listener.destroy();
    }
    this.listeners = null;
  },
  addListener: function(container, selector, eventName, fn, scope, options) {
    var listener;
    listener = Ext.create('Deft.event.LiveEventListener', {
      container: container,
      selector: selector,
      eventName: eventName,
      fn: fn,
      scope: scope,
      options: options
    });
    this.listeners.push(listener);
  },
  removeListener: function(container, selector, eventName, fn, scope) {
    var listener;
    listener = this.findListener(container, selector, eventName, fn, scope);
    if (listener != null) {
      Ext.Array.remove(this.listeners, listener);
      listener.destroy();
    }
  },
  on: function(container, selector, eventName, fn, scope, options) {
    return this.addListener(container, selector, eventName, fn, scope, options);
  },
  un: function(container, selector, eventName, fn, scope) {
    return this.removeListener(container, selector, eventName, fn, scope);
  },
  findListener: function(container, selector, eventName, fn, scope) {
    var listener, _i, _len, _ref;
    _ref = this.listeners;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listener = _ref[_i];
      if (listener.container === container && listener.selector === selector && listener.eventName === eventName && listener.fn === fn && listener.scope === scope) {
        return listener;
      }
    }
    return null;
  },
  register: function(component) {
    component.on('added', this.onComponentAdded, this);
    component.on('removed', this.onComponentRemoved, this);
  },
  unregister: function(component) {
    component.un('added', this.onComponentAdded, this);
    component.un('removed', this.onComponentRemoved, this);
  },
  onComponentAdded: function(component, container, eOpts) {
    var listener, _i, _len, _ref;
    _ref = this.listeners;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listener = _ref[_i];
      listener.register(component);
    }
  },
  onComponentRemoved: function(component, container, eOpts) {
    var listener, _i, _len, _ref;
    _ref = this.listeners;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listener = _ref[_i];
      listener.unregister(component);
    }
  }
}, function() {
  if (Ext.getVersion('touch') != null) {
    Ext.define('Deft.Component', {
      override: 'Ext.Component',
      setParent: function(newParent) {
        var oldParent, result;
        oldParent = this.getParent();
        result = this.callParent(arguments);
        if (oldParent === null && newParent !== null) {
          this.fireEvent('added', this, newParent);
        } else if (oldParent !== null && newParent !== null) {
          this.fireEvent('removed', this, oldParent);
          this.fireEvent('added', this, newParent);
        } else if (oldParent !== null && newParent === null) {
          this.fireEvent('removed', this, oldParent);
        }
        return result;
      },
      isDescendantOf: function(container) {
        var ancestor;
        ancestor = this.getParent();
        while (ancestor != null) {
          if (ancestor === container) {
            return true;
          }
          ancestor = ancestor.getParent();
        }
        return false;
      }
    });
  }
  Ext.Function.interceptAfter(Ext.ComponentManager, 'register', function(component) {
    Deft.event.LiveEventBus.register(component);
  });
  Ext.Function.interceptAfter(Ext.ComponentManager, 'unregister', function(component) {
    Deft.event.LiveEventBus.unregister(component);
  });
});
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

/**
@private

Used by {@link Deft.ioc.Injector}.
*/

Ext.define('Deft.ioc.DependencyProvider', {
  requires: ['Deft.log.Logger'],
  config: {
    identifier: null,
    /**
    		Class to be instantiated, by either full name, alias or alternate name, to resolve this dependency.
    */

    className: null,
    /**
    		Optional arguments to pass to the class' constructor when instantiating a class to resolve this dependency.
    */

    parameters: null,
    /**
    		Factory function to be executed to obtain the corresponding object instance or value to resolve this dependency.
    		
    		NOTE: For lazily instantiated dependencies, this function will be passed the object instance for which the dependency is being resolved.
    */

    fn: null,
    /**
    		Value to use to resolve this dependency.
    */

    value: null,
    /**
    		Indicates whether this dependency should be resolved as a singleton, or as a transient value for each resolution request.
    */

    singleton: true,
    /**
    		Indicates whether this dependency should be 'eagerly' instantiated when this provider is defined, rather than 'lazily' instantiated when later requested.
    		
    		NOTE: Only valid when either a factory function or class is specified as a singleton.
    */

    eager: false
  },
  constructor: function(config) {
    var classDefinition;
    this.initConfig(config);
    if ((config.value != null) && config.value.constructor === Object) {
      this.setValue(config.value);
    }
    if (this.getEager()) {
      if (this.getValue() != null) {
        Ext.Error.raise({
          msg: "Error while configuring '" + (this.getIdentifier()) + "': a 'value' cannot be created eagerly."
        });
      }
      if (!this.getSingleton()) {
        Ext.Error.raise({
          msg: "Error while configuring '" + (this.getIdentifier()) + "': only singletons can be created eagerly."
        });
      }
    }
    if (this.getClassName() != null) {
      classDefinition = Ext.ClassManager.get(this.getClassName());
      if (!(classDefinition != null)) {
        Deft.Logger.warn("Synchronously loading '" + (this.getClassName()) + "'; consider adding Ext.require('" + (this.getClassName()) + "') above Ext.onReady.");
        Ext.syncRequire(this.getClassName());
        classDefinition = Ext.ClassManager.get(this.getClassName());
      }
      if (!(classDefinition != null)) {
        Ext.Error.raise({
          msg: "Error while configuring rule for '" + (this.getIdentifier()) + "': unrecognized class name or alias: '" + (this.getClassName()) + "'"
        });
      }
    }
    if (!this.getSingleton()) {
      if (this.getClassName() != null) {
        if (Ext.ClassManager.get(this.getClassName()).singleton) {
          Ext.Error.raise({
            msg: "Error while configuring rule for '" + (this.getIdentifier()) + "': singleton classes cannot be configured for injection as a prototype. Consider removing 'singleton: true' from the class definition."
          });
        }
      }
      if (this.getValue() != null) {
        Ext.Error.raise({
          msg: "Error while configuring '" + (this.getIdentifier()) + "': a 'value' can only be configured as a singleton."
        });
      }
    } else {
      if ((this.getClassName() != null) && (this.getParameters() != null)) {
        if (Ext.ClassManager.get(this.getClassName()).singleton) {
          Ext.Error.raise({
            msg: "Error while configuring rule for '" + (this.getIdentifier()) + "': parameters cannot be applied to singleton classes. Consider removing 'singleton: true' from the class definition."
          });
        }
      }
    }
    return this;
  },
  /**
  	Resolve a target instance's dependency with an object instance or value generated by this dependency provider.
  */

  resolve: function(targetInstance) {
    var instance, parameters;
    Deft.Logger.log("Resolving '" + (this.getIdentifier()) + "'.");
    if (this.getValue() != null) {
      return this.getValue();
    }
    instance = null;
    if (this.getFn() != null) {
      Deft.Logger.log("Executing factory function.");
      instance = this.getFn().call(null, targetInstance);
    } else if (this.getClassName() != null) {
      if (Ext.ClassManager.get(this.getClassName()).singleton) {
        Deft.Logger.log("Using existing singleton instance of '" + (this.getClassName()) + "'.");
        instance = Ext.ClassManager.get(this.getClassName());
      } else {
        Deft.Logger.log("Creating instance of '" + (this.getClassName()) + "'.");
        parameters = this.getParameters() != null ? [this.getClassName()].concat(this.getParameters()) : [this.getClassName()];
        instance = Ext.create.apply(this, parameters);
      }
    } else {
      Ext.Error.raise({
        msg: "Error while configuring rule for '" + (this.getIdentifier()) + "': no 'value', 'fn', or 'className' was specified."
      });
    }
    if (this.getSingleton()) {
      this.setValue(instance);
    }
    return instance;
  }
});
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

/**
A lightweight IoC container for dependency injection.

Used in conjunction with {@link Deft.mixin.Injectable}.
*/

Ext.define('Deft.ioc.Injector', {
  alternateClassName: ['Deft.Injector'],
  requires: ['Deft.log.Logger', 'Deft.ioc.DependencyProvider'],
  singleton: true,
  constructor: function() {
    this.providers = {};
    return this;
  },
  /**
  	Configure the Injector.
  */

  configure: function(configuration) {
    Deft.Logger.log('Configuring injector.');
    Ext.Object.each(configuration, function(identifier, config) {
      var provider;
      Deft.Logger.log("Configuring dependency provider for '" + identifier + "'.");
      if (Ext.isString(config)) {
        provider = Ext.create('Deft.ioc.DependencyProvider', {
          identifier: identifier,
          className: config
        });
      } else {
        provider = Ext.create('Deft.ioc.DependencyProvider', Ext.apply({
          identifier: identifier
        }, config));
      }
      this.providers[identifier] = provider;
    }, this);
    Ext.Object.each(this.providers, function(identifier, provider) {
      if (provider.getEager()) {
        Deft.Logger.log("Eagerly creating '" + (provider.getIdentifier()) + "'.");
        provider.resolve();
      }
    }, this);
  },
  /**
  	Indicates whether the Injector can resolve a dependency by the specified identifier with the corresponding object instance or value.
  */

  canResolve: function(identifier) {
    var provider;
    provider = this.providers[identifier];
    return provider != null;
  },
  /**
  	Resolve a dependency (by identifier) with the corresponding object instance or value.
  	
  	Optionally, the caller may specify the target instance (to be supplied to the dependency provider's factory function, if applicable).
  */

  resolve: function(identifier, targetInstance) {
    var provider;
    provider = this.providers[identifier];
    if (provider != null) {
      return provider.resolve(targetInstance);
    } else {
      Ext.Error.raise({
        msg: "Error while resolving value to inject: no dependency provider found for '" + identifier + "'."
      });
    }
  },
  /**
  	Inject dependencies (by their identifiers) into the target object instance.
  */

  inject: function(identifiers, targetInstance, targetInstanceIsInitialized) {
    var injectConfig, name, originalInitConfigFunction, setterFunctionName, value;
    if (targetInstanceIsInitialized == null) {
      targetInstanceIsInitialized = true;
    }
    injectConfig = {};
    if (Ext.isString(identifiers)) {
      identifiers = [identifiers];
    }
    Ext.Object.each(identifiers, function(key, value) {
      var identifier, resolvedValue, targetProperty;
      targetProperty = Ext.isArray(identifiers) ? value : key;
      identifier = value;
      resolvedValue = this.resolve(identifier, targetInstance);
      if (targetProperty in targetInstance.config) {
        Deft.Logger.log("Injecting '" + identifier + "' into '" + targetProperty + "' config.");
        injectConfig[targetProperty] = resolvedValue;
      } else {
        Deft.Logger.log("Injecting '" + identifier + "' into '" + targetProperty + "' property.");
        targetInstance[targetProperty] = resolvedValue;
      }
    }, this);
    if (targetInstanceIsInitialized) {
      for (name in injectConfig) {
        value = injectConfig[name];
        setterFunctionName = 'set' + Ext.String.capitalize(name);
        targetInstance[setterFunctionName].call(targetInstance, value);
      }
    } else {
      if (Ext.isFunction(targetInstance.initConfig)) {
        originalInitConfigFunction = targetInstance.initConfig;
        targetInstance.initConfig = function(config) {
          var result;
          result = originalInitConfigFunction.call(this, Ext.Object.merge({}, config || {}, injectConfig));
          return result;
        };
      }
    }
    return targetInstance;
  }
});
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

/**
A mixin that marks a class as participating in dependency injection.

Used in conjunction with {@link Deft.ioc.Injector}.
*/

Ext.define('Deft.mixin.Injectable', {
  requires: ['Deft.ioc.Injector'],
  /**
  	@private
  */

  onClassMixedIn: function(targetClass) {
    targetClass.prototype.constructor = Ext.Function.createInterceptor(targetClass.prototype.constructor, function() {
      return Deft.Injector.inject(this.inject, this, false);
    });
  }
});
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

Ext.define('Deft.mvc.ComponentSelectorListener', {
  requires: ['Deft.event.LiveEventBus'],
  constructor: function(config) {
    var component, _i, _len, _ref;
    Ext.apply(this, config);
    if (this.componentSelector.live) {
      Deft.LiveEventBus.addListener(this.componentSelector.view, this.componentSelector.selector, this.eventName, this.fn, this.scope, this.options);
    } else {
      _ref = this.componentSelector.components;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        component = _ref[_i];
        component.on(this.eventName, this.fn, this.scope, this.options);
      }
    }
    return this;
  },
  destroy: function() {
    var component, _i, _len, _ref;
    if (this.componentSelector.live) {
      Deft.LiveEventBus.removeListener(this.componentSelector.view, this.componentSelector.selector, this.eventName, this.fn, this.scope);
    } else {
      _ref = this.componentSelector.components;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        component = _ref[_i];
        component.un(this.eventName, this.fn, this.scope);
      }
    }
  }
});
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

Ext.define('Deft.mvc.ComponentSelector', {
  requires: ['Ext.ComponentQuery', 'Deft.log.Logger', 'Deft.mvc.ComponentSelectorListener'],
  constructor: function(config) {
    var eventName, fn, listener, options, scope, _ref;
    Ext.apply(this, config);
    if (!this.live) {
      this.components = this.selector != null ? Ext.ComponentQuery.query(this.selector, this.view) : [this.view];
    }
    this.selectorListeners = [];
    if (Ext.isObject(this.listeners)) {
      _ref = this.listeners;
      for (eventName in _ref) {
        listener = _ref[eventName];
        fn = listener;
        scope = this.scope;
        options = null;
        if (Ext.isObject(listener)) {
          options = Ext.apply({}, listener);
          if (options.fn != null) {
            fn = options.fn;
            delete options.fn;
          }
          if (options.scope != null) {
            scope = options.scope;
            delete options.scope;
          }
        }
        if (Ext.isString(fn) && Ext.isFunction(scope[fn])) {
          fn = scope[fn];
        }
        if (!Ext.isFunction(fn)) {
          Ext.Error.raise({
            msg: "Error adding '" + eventName + "' listener: the specified handler '" + fn + "' is not a Function or does not exist."
          });
        }
        this.addListener(eventName, fn, scope, options);
      }
    }
    return this;
  },
  destroy: function() {
    var selectorListener, _i, _len, _ref;
    _ref = this.selectorListeners;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      selectorListener = _ref[_i];
      selectorListener.destroy();
    }
    this.selectorListeners = [];
  },
  addListener: function(eventName, fn, scope, options) {
    var selectorListener;
    if (this.findListener(eventName, fn, scope) != null) {
      Ext.Error.raise({
        msg: "Error adding '" + eventName + "' listener: an existing listener was already registered for '" + this.id + "."
      });
    }
    Deft.Logger.log("Adding '" + eventName + "' listener to '" + this.id + "'.");
    selectorListener = Ext.create('Deft.mvc.ComponentSelectorListener', {
      componentSelector: this,
      eventName: eventName,
      fn: fn,
      scope: scope,
      options: options
    });
    this.selectorListeners.push(selectorListener);
  },
  removeListener: function(eventName, fn, scope) {
    var selectorListener;
    selectorListener = this.findListener(eventName, fn, scope);
    if (selectorListener != null) {
      Deft.Logger.log("Removing '" + eventName + "' listener from '" + this.id + "'.");
      selectorListener.destroy();
      Ext.Array.remove(this.selectorListeners, selectorListener);
    }
  },
  findListener: function(eventName, fn, scope) {
    var selectorListener, _i, _len, _ref;
    _ref = this.selectorListeners;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      selectorListener = _ref[_i];
      if (selectorListener.eventName === eventName && selectorListener.fn === fn && selectorListener.scope === scope) {
        return selectorListener;
      }
    }
    return null;
  },
  locate: function() {
    var matches;
    if (this.selector != null) {
      matches = Ext.ComponentQuery.query(this.selector, this.view);
      if (matches.length === 0) {
        return null;
      } else if (matches.length === 1) {
        return matches[0];
      } else {
        return matches;
      }
    } else {
      return this.view;
    }
  }
});
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

/**
A lightweight MVC view controller.

Used in conjunction with {@link Deft.mixin.Controllable}.
*/

Ext.define('Deft.mvc.ViewController', {
  alternateClassName: ['Deft.ViewController'],
  requires: ['Deft.log.Logger', 'Deft.mvc.ComponentSelector'],
  config: {
    /**
    		View controlled by this ViewController.
    */

    view: null
  },
  constructor: function(config) {
    if (config == null) {
      config = {};
    }
    if (config.view) {
      this.controlView(config.view);
    }
    return this.initConfig(config);
  },
  /**
  	@protected
  */

  controlView: function(view) {
    if (view instanceof Ext.ClassManager.get('Ext.Container')) {
      this.setView(view);
      this.registeredComponentSelectors = {};
      if (Ext.getVersion('extjs') != null) {
        if (this.getView().rendered) {
          this.onViewInitialize();
        } else {
          this.getView().on('afterrender', this.onViewInitialize, this, {
            single: true
          });
        }
      } else {
        if (this.getView().initialized) {
          this.onViewInitialize();
        } else {
          this.getView().on('initialize', this.onViewInitialize, this, {
            single: true
          });
        }
      }
    } else {
      Ext.Error.raise({
        msg: 'Error constructing ViewController: the configured \'view\' is not an Ext.Container.'
      });
    }
  },
  /**
  	Initialize the ViewController
  */

  init: function() {},
  /**
  	Destroy the ViewController
  */

  destroy: function() {
    return true;
  },
  /**
  	@private
  */

  onViewInitialize: function() {
    var config, id, listeners, live, originalViewDestroyFunction, selector, self, _ref;
    if (Ext.getVersion('extjs') != null) {
      this.getView().on('beforedestroy', this.onViewBeforeDestroy, this);
      this.getView().on('destroy', this.onViewDestroy, this, {
        single: true
      });
    } else {
      self = this;
      originalViewDestroyFunction = this.getView().destroy;
      this.getView().destroy = function() {
        if (self.destroy()) {
          originalViewDestroyFunction.call(this);
        }
      };
    }
    _ref = this.control;
    for (id in _ref) {
      config = _ref[id];
      selector = null;
      if (id !== 'view') {
        if (Ext.isString(config)) {
          selector = config;
        } else if (config.selector != null) {
          selector = config.selector;
        } else {
          selector = '#' + id;
        }
      }
      listeners = null;
      if (Ext.isObject(config.listeners)) {
        listeners = config.listeners;
      } else {
        if (!((config.selector != null) || (config.live != null))) {
          listeners = config;
        }
      }
      live = (config.live != null) && config.live;
      this.registerComponent(id, selector, listeners, live);
    }
    this.init();
  },
  /**
  	@private
  */

  onViewBeforeDestroy: function() {
    if (this.destroy()) {
      this.getView().un('beforedestroy', this.onBeforeDestroy, this);
      return true;
    }
    return false;
  },
  /**
  	@private
  */

  onViewDestroy: function() {
    var id;
    for (id in this.registeredComponentSelectors) {
      this.unregisterComponent(id);
    }
  },
  registerComponent: function(id, selector, listeners, live) {
    var componentSelector, getterName, matches;
    if (live == null) {
      live = false;
    }
    Deft.Logger.log("Registering '" + id + "' component.");
    if (this.registeredComponentSelectors[id] != null) {
      Ext.Error.raise({
        msg: "Error registering component: an existing component already registered as '" + id + "'."
      });
    }
    componentSelector = Ext.create('Deft.mvc.ComponentSelector', {
      id: id,
      view: this.getView(),
      selector: selector,
      listeners: listeners,
      scope: this,
      live: live
    });
    if (id !== 'view') {
      getterName = 'get' + Ext.String.capitalize(id);
      if (this[getterName] == null) {
        if (live) {
          this[getterName] = function() {
            return componentSelector.locate();
          };
        } else {
          matches = componentSelector.locate();
          if (matches == null) {
            Ext.Error.raise({
              msg: "Error locating component: no component(s) found matching '" + selector + "'."
            });
          }
          this[getterName] = function() {
            return matches;
          };
        }
        this[getterName].generated = true;
      }
    }
    this.registeredComponentSelectors[id] = componentSelector;
  },
  unregisterComponent: function(id) {
    var componentSelector, getterName;
    Deft.Logger.log("Unregistering '" + id + "' component.");
    if (this.registeredComponentSelectors[id] == null) {
      Ext.Error.raise({
        msg: "Error unregistering component: no component is registered as '" + id + "'."
      });
    }
    componentSelector = this.registeredComponentSelectors[id];
    componentSelector.destroy();
    if (id !== 'view') {
      getterName = 'get' + Ext.String.capitalize(id);
      if (this[getterName].generated) {
        this[getterName] = null;
      }
    }
    this.registeredComponentSelectors[id] = null;
  }
});
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

/**
A mixin that creates and attaches the specified view controller(s) to the target view.

Used in conjunction with {@link Deft.mvc.ViewController}.
*/

Ext.define('Deft.mixin.Controllable', {});

Ext.Class.registerPreprocessor('controller', function(Class, data, hooks, callback) {
  var controllerClass, originalConstructor, originalDestroy, parameters, self;
  if (arguments.length === 3) {
    parameters = Ext.toArray(arguments);
    hooks = parameters[1];
    callback = parameters[2];
  }
  if ((data.mixins != null) && Ext.Array.contains(Ext.Object.getValues(data.mixins), Ext.ClassManager.get('Deft.mixin.Controllable'))) {
    controllerClass = data.controller;
    delete data.controller;
    if (controllerClass != null) {
      if (!data.hasOwnProperty('constructor')) {
        data.constructor = function() {
          return this.callParent(arguments);
        };
      }
      originalConstructor = data.constructor;
      data.constructor = function(config) {
        var controller;
        if (config == null) {
          config = {};
        }
        if (this.getController === void 0) {
          try {
            controller = Ext.create(controllerClass, config.controllerConfig || this.controllerConfig || {});
          } catch (error) {
            Deft.Logger.warn("Error initializing Controllable instance: an error occurred while creating an instance of the specified controller: '" + controllerClass + "'.");
            throw error;
          }
          this.getController = function() {
            return controller;
          };
          originalConstructor.apply(this, arguments);
          controller.controlView(this);
          return this;
        }
        return originalConstructor.apply(this, arguments);
      };
      if (!data.hasOwnProperty('destroy')) {
        data.destroy = function() {
          return this.callParent(arguments);
        };
      }
      originalDestroy = data.destroy;
      data.destroy = function() {
        delete this.getController;
        return originalDestroy.apply(this, arguments);
      };
      self = this;
      Ext.require([controllerClass], function() {
        if (callback != null) {
          callback.call(self, Class, data, hooks);
        }
      });
      return false;
    }
  }
});

Ext.Class.setDefaultPreprocessorPosition('controller', 'before', 'mixins');
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

Ext.define('Deft.promise.Deferred', {
  alternateClassName: ['Deft.Deferred'],
  constructor: function() {
    this.state = 'pending';
    this.progress = void 0;
    this.value = void 0;
    this.progressCallbacks = [];
    this.successCallbacks = [];
    this.failureCallbacks = [];
    this.cancelCallbacks = [];
    this.promise = Ext.create('Deft.Promise', this);
    return this;
  },
  /**
  	Returns a new {@link Deft.promise.Promise} with the specified callbacks registered to be called when this {@link Deft.promise.Deferred} is resolved, rejected, updated or cancelled.
  */

  then: function(callbacks) {
    var callback, cancelCallback, deferred, failureCallback, progressCallback, successCallback, wrapCallback, wrapProgressCallback, _i, _len, _ref;
    if (Ext.isObject(callbacks)) {
      successCallback = callbacks.success, failureCallback = callbacks.failure, progressCallback = callbacks.progress, cancelCallback = callbacks.cancel;
    } else {
      successCallback = arguments[0], failureCallback = arguments[1], progressCallback = arguments[2], cancelCallback = arguments[3];
    }
    _ref = [successCallback, failureCallback, progressCallback, cancelCallback];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      callback = _ref[_i];
      if (!(Ext.isFunction(callback) || callback === null || callback === void 0)) {
        Ext.Error.raise({
          msg: 'Error while configuring callback: a non-function specified.'
        });
      }
    }
    deferred = Ext.create('Deft.promise.Deferred');
    wrapCallback = function(callback, action) {
      return function(value) {
        var result;
        if (Ext.isFunction(callback)) {
          try {
            result = callback(value);
            if (result instanceof Ext.ClassManager.get('Deft.promise.Promise') || result instanceof Ext.ClassManager.get('Deft.promise.Deferred')) {
              result.then(Ext.bind(deferred.resolve, deferred), Ext.bind(deferred.reject, deferred), Ext.bind(deferred.update, deferred), Ext.bind(deferred.cancel, deferred));
            } else {
              deferred.resolve(result);
            }
          } catch (error) {
            deferred.reject(error);
          }
        } else {
          deferred[action](value);
        }
      };
    };
    this.register(wrapCallback(successCallback, 'resolve'), this.successCallbacks, 'resolved', this.value);
    this.register(wrapCallback(failureCallback, 'reject'), this.failureCallbacks, 'rejected', this.value);
    this.register(wrapCallback(cancelCallback, 'cancel'), this.cancelCallbacks, 'cancelled', this.value);
    wrapProgressCallback = function(callback) {
      return function(value) {
        var result;
        if (Ext.isFunction(callback)) {
          result = callback(value);
          deferred.update(result);
        } else {
          deferred.update(value);
        }
      };
    };
    this.register(wrapProgressCallback(progressCallback), this.progressCallbacks, 'pending', this.progress);
    return deferred.getPromise();
  },
  /**
  	Returns a new {@link Deft.promise.Promise} with the specified callback registered to be called when this {@link Deft.promise.Deferred} is rejected.
  */

  otherwise: function(callback) {
    return this.then({
      failure: callback
    });
  },
  /**
  	Returns a new {@link Deft.promise.Promise} with the specified callback registered to be called when this {@link Deft.promise.Deferred} is either resolved, rejected, or cancelled.
  */

  always: function(callback) {
    return this.then({
      success: callback,
      failure: callback,
      cancel: callback
    });
  },
  /**
  	Update progress for this {@link Deft.promise.Deferred} and notify relevant callbacks.
  */

  update: function(progress) {
    if (this.state === 'pending') {
      this.progress = progress;
      this.notify(this.progressCallbacks, progress);
    } else {
      if (this.state !== 'cancelled') {
        Ext.Error.raise({
          msg: 'Error: this Deferred has already been completed and cannot be modified.'
        });
      }
    }
  },
  /**
  	Resolve this {@link Deft.promise.Deferred} and notify relevant callbacks.
  */

  resolve: function(value) {
    this.complete('resolved', value, this.successCallbacks);
  },
  /**
  	Reject this {@link Deft.promise.Deferred} and notify relevant callbacks.
  */

  reject: function(error) {
    this.complete('rejected', error, this.failureCallbacks);
  },
  /**
  	Cancel this {@link Deft.promise.Deferred} and notify relevant callbacks.
  */

  cancel: function(reason) {
    this.complete('cancelled', reason, this.cancelCallbacks);
  },
  /**
  	Get this {@link Deft.promise.Deferred}'s associated {@link Deft.promise.Promise}.
  */

  getPromise: function() {
    return this.promise;
  },
  /**
  	Get this {@link Deft.promise.Deferred}'s current state.
  */

  getState: function() {
    return this.state;
  },
  /**
  	Register a callback for this {@link Deft.promise.Deferred} for the specified callbacks and state, immediately notifying with the specified value (if applicable).
  	@private
  */

  register: function(callback, callbacks, state, value) {
    if (Ext.isFunction(callback)) {
      if (this.state === 'pending') {
        callbacks.push(callback);
        if (this.state === state && value !== void 0) {
          this.notify([callback], value);
        }
      } else {
        if (this.state === state) {
          this.notify([callback], value);
        }
      }
    }
  },
  /**
  	Complete this {@link Deft.promise.Deferred} with the specified state and value.
  	@private
  */

  complete: function(state, value, callbacks) {
    if (this.state === 'pending') {
      this.state = state;
      this.value = value;
      this.notify(callbacks, value);
      this.releaseCallbacks();
    } else {
      if (this.state !== 'cancelled') {
        Ext.Error.raise({
          msg: 'Error: this Deferred has already been completed and cannot be modified.'
        });
      }
    }
  },
  /**
  	Notify the specified callbacks with the specified value.
  	@private
  */

  notify: function(callbacks, value) {
    var callback, _i, _len;
    for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
      callback = callbacks[_i];
      callback(value);
    }
  },
  /**
  	Release references to all callbacks registered with this {@link Deft.promise.Deferred}.
  	@private
  */

  releaseCallbacks: function() {
    this.progressCallbacks = null;
    this.successCallbacks = null;
    this.failureCallbacks = null;
    this.cancelCallbacks = null;
  }
});
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).

Promise.when(), all(), any(), map() and reduce() methods adapted from:
[when.js](https://github.com/cujojs/when)
Copyright (c) B Cavalier & J Hann
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

Ext.define('Deft.promise.Promise', {
  alternateClassName: ['Deft.Promise'],
  statics: {
    /**
    		Returns a new {@link Deft.promise.Promise} that:
    		- resolves immediately for the specified value, or
    		- resolves, rejects, updates or cancels when the specified {@link Deft.promise.Deferred} or {@link Deft.promise.Promise} is resolved, rejected, updated or cancelled.
    */

    when: function(promiseOrValue) {
      var deferred;
      if (promiseOrValue instanceof Ext.ClassManager.get('Deft.promise.Promise') || promiseOrValue instanceof Ext.ClassManager.get('Deft.promise.Deferred')) {
        return promiseOrValue.then();
      } else if (Ext.isObject(promiseOrValue) && Ext.isFunction(promiseOrValue.then)) {
        deferred = Ext.create('Deft.promise.Deferred');
        promiseOrValue.then(function(value) {
          deferred.resolve(value);
        }, function(error) {
          deferred.reject(error);
        });
        return deferred.then();
      } else {
        deferred = Ext.create('Deft.promise.Deferred');
        deferred.resolve(promiseOrValue);
        return deferred.then();
      }
    },
    /**
    		Returns a new {@link Deft.promise.Promise} that will only resolve once all the specified `promisesOrValues` have resolved.
    		The resolution value will be an Array containing the resolution value of each of the `promisesOrValues`.
    */

    all: function(promisesOrValues) {
      var cancelFunction, canceller, complete, createSuccessFunction, deferred, failureFunction, index, progressFunction, promiseOrValue, rejecter, resolvedCount, resolvedValues, resolver, total, updater, _i, _len;
      deferred = Ext.create('Deft.promise.Deferred');
      total = promisesOrValues.length;
      resolvedValues = new Array(promisesOrValues);
      resolvedCount = 0;
      updater = function(progress) {
        deferred.update(progress);
      };
      resolver = function(index, value) {
        resolvedValues[index] = value;
        resolvedCount++;
        if (resolvedCount === total) {
          complete();
          deferred.resolve(resolvedValues);
        }
      };
      rejecter = function(error) {
        complete();
        deferred.reject(error);
      };
      canceller = function(reason) {
        complete();
        deferred.cancel(reason);
      };
      complete = function() {
        return updater = resolver = rejecter = canceller = Ext.emptyFn;
      };
      createSuccessFunction = function(index) {
        return function(value) {
          return resolver(index, value);
        };
      };
      failureFunction = function(value) {
        return rejecter(value);
      };
      progressFunction = function(value) {
        return updater(value);
      };
      cancelFunction = function(value) {
        return canceller(value);
      };
      for (index = _i = 0, _len = promisesOrValues.length; _i < _len; index = ++_i) {
        promiseOrValue = promisesOrValues[index];
        if (index in promisesOrValues) {
          this.when(promiseOrValue).then({
            success: createSuccessFunction(index),
            failure: failureFunction,
            progress: progressFunction,
            cancel: cancelFunction
          });
        }
      }
      return deferred.getPromise();
    },
    /**
    		Returns a new {@link Deft.promise.Promise} that will only resolve once any one of the the specified `promisesOrValues` has resolved.
    		The resolution value will be the resolution value of the triggering `promiseOrValue`.
    */

    any: function(promisesOrValues) {
      var cancelFunction, canceller, complete, deferred, failureFunction, index, progressFunction, promiseOrValue, rejecter, resolver, successFunction, updater, _i, _len;
      deferred = Ext.create('Deft.promise.Deferred');
      updater = function(progress) {
        deferred.update(progress);
      };
      resolver = function(value) {
        complete();
        deferred.resolve(value);
      };
      rejecter = function(error) {
        complete();
        deferred.reject(error);
      };
      canceller = function(reason) {
        complete();
        return deferred.cancel(reason);
      };
      complete = function() {
        return updater = resolver = rejecter = canceller = Ext.emptyFn;
      };
      successFunction = function(value) {
        return resolver(value);
      };
      failureFunction = function(value) {
        return rejecter(value);
      };
      progressFunction = function(value) {
        return updater(value);
      };
      cancelFunction = function(value) {
        return canceller(value);
      };
      for (index = _i = 0, _len = promisesOrValues.length; _i < _len; index = ++_i) {
        promiseOrValue = promisesOrValues[index];
        if (index in promisesOrValues) {
          this.when(promiseOrValue).then({
            success: successFunction,
            failure: failureFunction,
            progress: progressFunction,
            cancel: cancelFunction
          });
        }
      }
      return deferred.getPromise();
    },
    /**
    		Returns a new function that wraps the specified function and caches the results for previously processed inputs.
    		Similar to `Deft.util.Function::memoize()`, except it allows input to contain promises and/or values.
    */

    memoize: function(fn, scope, hashFn) {
      return this.all(Ext.Array.toArray(arguments)).then(Deft.util.Function.spread(function() {
        return Deft.util.memoize(arguments, scope, hashFn);
      }, scope));
    },
    /**
    		Traditional map function, similar to `Array.prototype.map()`, that allows input to contain promises and/or values.
    		The specified map function may return either a value or a promise.
    */

    map: function(promisesOrValues, mapFunction) {
      var index, promiseOrValue, results, _i, _len;
      results = new Array(promisesOrValues.length);
      for (index = _i = 0, _len = promisesOrValues.length; _i < _len; index = ++_i) {
        promiseOrValue = promisesOrValues[index];
        if (index in promisesOrValues) {
          results[index] = this.when(promiseOrValue).then(mapFunction);
        }
      }
      return this.reduce(results, this.reduceIntoArray, results);
    },
    /**
    		Traditional reduce function, similar to `Array.reduce()`, that allows input to contain promises and/or values.
    */

    reduce: function(promisesOrValues, reduceFunction, initialValue) {
      var reduceArguments, whenFn;
      whenFn = this.when;
      reduceArguments = [
        function(previousValueOrPromise, currentValueOrPromise, currentIndex) {
          return whenFn(previousValueOrPromise).then(function(previousValue) {
            return whenFn(currentValueOrPromise).then(function(currentValue) {
              return reduceFunction(previousValue, currentValue, currentIndex, promisesOrValues);
            });
          });
        }
      ];
      if (arguments.length === 3) {
        reduceArguments.push(initialValue);
      }
      return this.when(this.reduceArray.apply(promisesOrValues, reduceArguments));
    },
    /**
    		Fallback implementation when Array.reduce is not available.
    		@private
    */

    reduceArray: function(reduceFunction, initialValue) {
      var args, array, index, length, reduced;
      index = 0;
      array = Object(this);
      length = array.length >>> 0;
      args = arguments;
      if (args.length <= 1) {
        while (true) {
          if (index in array) {
            reduced = array[index++];
            break;
          }
          if (++index >= length) {
            throw new TypeError();
          }
        }
      } else {
        reduced = args[1];
      }
      while (index < length) {
        if (index in array) {
          reduced = reduceFunction(reduced, array[index], index, array);
        }
        index++;
      }
      return reduced;
    },
    /**
    		@private
    */

    reduceIntoArray: function(previousValue, currentValue, currentIndex) {
      previousValue[currentIndex] = currentValue;
      return previousValue;
    }
  },
  constructor: function(deferred) {
    this.deferred = deferred;
    return this;
  },
  /**
  	Returns a new {@link Deft.promise.Promise} with the specified callbacks registered to be called when this {@link Deft.promise.Promise} is resolved, rejected, updated or cancelled.
  */

  then: function(callbacks) {
    return this.deferred.then.apply(this.deferred, arguments);
  },
  /**
  	Returns a new {@link Deft.promise.Promise} with the specified callback registered to be called when this {@link Deft.promise.Promise} is rejected.
  */

  otherwise: function(callback) {
    return this.deferred.otherwise(callback);
  },
  /**
  	Returns a new {@link Deft.promise.Promise} with the specified callback registered to be called when this {@link Deft.promise.Promise} is resolved, rejected or cancelled.
  */

  always: function(callback) {
    return this.deferred.always(callback);
  },
  /**
  	Cancel this {@link Deft.promise.Promise} and notify relevant callbacks.
  */

  cancel: function(reason) {
    return this.deferred.cancel(reason);
  },
  /**
  	Get this {@link Deft.promise.Promise}'s current state.
  */

  getState: function() {
    return this.deferred.getState();
  }
}, function() {
  if (Array.prototype.reduce != null) {
    this.reduceArray = Array.prototype.reduce;
  }
});
