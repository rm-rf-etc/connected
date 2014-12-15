
// ;(function(){

function Binding(data){
  var _data = {}, _bindings = {}, set_cb, _name

  if (typeOf(data) === 'Array') _data = []

  _name = 'this'
  for (var each in data) {
    if (data && data.hasOwnProperty(each)) { property(each, _name) }
  }
  function property(prop, _name){
    var name = _name + '.' + prop
    _bindings[name] = new MicroEvent()

    set_cb = function(name,data){ _bindings[name].trigger(name,data)
      // console.log(name,data)
    }

    init(_data, prop, name, set_cb)
    switch (familyOf(data[prop])) {
      case 'simple': _data[prop] = data[prop]; break;
      case 'complex': _data[prop] = Binding(data[prop]).checkout(); break;
      default: console.log('unknown'); break;
    }
  }
  function bind(prop, set_cb){
    if (! _bindings.hasOwnProperty(prop)) _bindings[prop] = new MicroEvent()
    _bindings[prop].bind(prop,set_cb)
  }
  function unbind(prop, set_cb){
    if (_bindings.hasOwnProperty(prop)) _bindings[prop].unbind(set_cb)
  }
  return {
    bind: bind
  , unbind: unbind
  , checkout: function(){ return _data }
  }
}

// })()

function familyOf (thing) {
  if (typeOf(thing)) {
    return {
      String: 'simple'
    , Number: 'simple'
    , Boolean: 'simple'
    , Function: 'simple'
    , Date: 'simple'
    , Array: 'complex'
    , Object: 'complex'
    }[typeOf(thing)] || 'complex'
  } else {
    return false
  }
}

function typeOf (thing) {
  return (thing != null && !Number.isNaN(thing) && thing.constructor) ? thing.constructor.name : null
}

function init(obj, prop, name, set_cb){
  var _val = undefined
  Object.defineProperty(obj, prop, {
    get: function(){ return _val }
  , set: function(val){ _val = val; set_cb(name,val) }
  , enumerable: true
  })
}
