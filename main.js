
/*

Semi-colons are just FUD. If your minifier can't handle this code, switch to one that is JS-compliant.

*/


;(function(){



  /*  Private Class Data  */

  var DEFINE = Object.defineProperty
  var ID_GETTER_KEY = 7203445781487972

  var _bindables = []
  var _events = new MicroEvent()
  var _ct = {
    setter_cb: function(id,val){ _events.trigger(id,val) }
  , send_id: function(){}
  }



  /*  Bindable Classes  */

  function Bindable(data){
    if (typeOf(data) === 'Array')
      return new BindableArray(data)
    else
      return new BindableObject(data)
  }

  function BindableObject(data){
    DEFINE(this, '_new_property_', { enumerable:false, configurable:false,
      set:function(keyval){ this.addProperty(keyval[0], keyval[1]) }
    })
    for (var prop in data) {
      if (data.hasOwnProperty(prop)) this._new_property_ = [prop, data[prop]]
    }
  }
  BindableObject.prototype.addProperty = addProperty


  function BindableArray(data){
    var self = Array.prototype.slice.apply(arguments)

    DEFINE(self, '_new_property_', { enumerable:false, configurable:false,
      set:function(keyval){ addProperty.call(self, keyval[0], keyval[1]) }
    })
    for (var i in data) {
      if (data.hasOwnProperty(i)) this._new_property_ = [i, data[i]]
    }

    return self
  }
  BindableArray.prototype.addProperty = addProperty


  function addProperty(key, val){
    var _val = undefined
    var _id = Math.random().toString().split('.')[1]

    DEFINE(this, key, {
      enumerable: true
    , get: function(){ return _val }
    , set: function(value){
        if (value === ID_GETTER_KEY) { _ct.send_id(_id) }
        else { _val = value; _ct.setter_cb(_id, value) }
      }
    })

    if (familyOf(val) === 'complex') val = new Bindable(val)
    this[key] = val
  }



  var CrossTalk = {
    Binding: NewBindable
  , addForm: addForm
  , inputManager: blockify
  , takeId: function(cb){ _ct.send_id = cb }
  }
  DEFINE(CrossTalk, 'bindables', {get:function(){return _bindables}, enumerable: true})
  DEFINE(CrossTalk, 'ID_GETTER_KEY', {value:ID_GETTER_KEY, writeable:false})



  /* Takes a form DOM object and a Binding object, and does the rest for you. */

  function addForm(form, container){
    var bindable = container.bindable

    ;[].forEach.call(form.querySelectorAll('input'), formFieldInitializer)

    function formFieldInitializer(field){

      function setup_input(notify){
        function eventHandler(ev){
          notify(function(){ bindable[field.name] = ev.target.value })
        }
        field.addEventListener('input', eventHandler)
      }

      function setup_output(notify){
        function eventHandler(val){
          notify(function(){ field.value = val })
        }
        container.bind(bindable, field.name, eventHandler)
      }

      CrossTalk.inputManager( setup_input, setup_output )
      field.value = bindable[field.name]
    }
  }



  /* Inverts control: Allows inputs to block update events when they are the sender. */

  function blockify(setup_input, setup_output){
    var sender = false
    setup_input(function(run){ sender = true; run() })
    setup_output(function(run){ if (! sender) run(); sender = false })
  }



  /* Recursively constructs a copy of the input object, having getter/setter pairs of every ownProperty. */

  function NewBindable(data){
    var _data
    if (familyOf(data) !== 'complex') return null

    _data = new Bindable(data)

    this.bind = function(parent, property, setter_cb){
      CrossTalk.takeId(function(id){ _events.bind(id, setter_cb) })
      parent[property] = ID_GETTER_KEY
    }
    this.unbind = function(property, setter_cb){
      _events.unbind(setter_cb)
    }
    DEFINE(this, 'bindable', {get:function(){return _data}, enumerable:true, configurable:false})

    _bindables.push(_data)
  }



  /*  HELPERS  */

  function familyOf(thing){
    if (typeOf(thing)) {
      return {
        Date: 'simple'
      , String: 'simple'
      , Number: 'simple'
      , Boolean: 'simple'
      , Function: 'simple'
      , Object: 'complex'
      , Array: 'complex'
      }[typeOf(thing)] || 'complex'
    } else {
      return false
    }
  }

  function typeOf(thing){
    return (thing != null && !Number.isNaN(thing) && thing.constructor) ? thing.constructor.name : null
  }


  if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = CrossTalk
  } else {
    window.CrossTalk = CrossTalk
  }

})()
