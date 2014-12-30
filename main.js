
/*

Semi-colons are just FUD. If your minifier can't handle this code, switch to one that is JS-compliant.

*/


;(function(){



  /*  Private Class Data  */

  var DEFINE = Object.defineProperty
  var ID_GETTER_KEY = {}

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
    else if (familyOf(data) === 'complex')
      return new BindableObject(data)
  }

  function BindableObject(data){
    DEFINE(this, '_new_property_', { enumerable:false, configurable:false,
      set:function(keyval){ addProperty.apply(this, keyval) }
    })
    for (var prop in data) {
      if (data.hasOwnProperty(prop)) this._new_property_ = [prop, data[prop]]
    }
  }


  function BindableArray(){
    var args = Array.prototype.slice.apply(arguments)[0]
    var self = []

    DEFINE(self, '_new_property_', { enumerable:false, configurable:false,
      set:function(keyval){ addProperty.apply(self, keyval) }
    })
    for (var i in args) {
      if (args.hasOwnProperty(i)) self._new_property_ = [i, args[i]]
    }

    return self
  }


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



  /* Takes a form DOM object and a Binding object, and does the rest for you. */

  function addForm(form, container){
    var bindable = container.bindable

    ;[].forEach.call(form.querySelectorAll('input'), function(field){

      if (field.name in bindable) {
        CrossTalk.fieldManager(function(input_handler, output_handler){

          field.addEventListener('input', function(ev){
            var do_it = function(){ bindable[field.name] = ev.target.value }
            input_handler( do_it )
          })

          container.bind(bindable, field.name, function(val){
            var do_it = function(){ field.value = val }
            output_handler( do_it )
          })

        })

        field.value = bindable[field.name]
      }

    })
  }



  /* Inverts control: Prevents inputs from receiving updates while they are the sender. */

  function fieldManager(receive_handlers){
    var _sent_by_me = false

    function input_handler(do_it){
      _sent_by_me = true
      do_it()
    }
    function output_handler(do_it){
      _sent_by_me ? _sent_by_me = false : do_it()
    }
    receive_handlers( input_handler, output_handler )
  }



  /* Recursively constructs a copy of the input object, having getter/setter pairs of every ownProperty. */

  function BindableContainer(data){
    var _data
    if (familyOf(data) !== 'complex') return null

    _data = new Bindable(data)

    this.bind = bind
    this.unbind = unbind
    this.recompute = function(data){
      if (familyOf(data) === 'complex')
        _data = new Bindable(data)
      return this
    }
    DEFINE(this, 'bindable', {get:function(){return _data}, enumerable:true, configurable:false})

    _bindables.push(_data)
  }
  function bind(parent, property, setter_cb){
    CrossTalk.takeId(function(id){ _events.bind(id, setter_cb) })
    parent[property] = ID_GETTER_KEY
  }
  function unbind(property, setter_cb){
    _events.unbind(setter_cb)
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
      , Array: 'complex'
      , Object: 'complex'
      }[typeOf(thing)] || 'complex'
    } else {
      return false
    }
  }

  function typeOf(thing){
    return (thing != null && !Number.isNaN(thing) && thing.constructor) ? thing.constructor.name : '' + thing
  }

  function each(obj, cb){
    // if (typeOf(obj) === 'BindableObject' || typeOf(obj) === 'BindableArray')
    //   obj = obj

    for (var prop in obj)
      cb(prop, obj[prop])
  }



  var CrossTalk = {
    Binding: BindableContainer
  , fieldManager: fieldManager
  , addForm: addForm
  , takeId: function(cb){ _ct.send_id = cb }
  }
  DEFINE(CrossTalk, 'bindables', {get:function(){return _bindables}, enumerable: true})
  DEFINE(CrossTalk, 'ID_GETTER_KEY', {value:ID_GETTER_KEY, writeable:false})


  if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = CrossTalk
  } else {
    window.CrossTalk = CrossTalk
    window.familyOf = familyOf
    window.typeOf = typeOf
    window.Bindable = Bindable
  }

})()
