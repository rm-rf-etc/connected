
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
    if (typeOf(data) === 'Array') return new BindableArray(data)

    else if (familyOf(data) === 'complex') return new BindableObject(data)
  }

  function BindableObject(data){
    DEFINE(this, '_new_property_', { enumerable:false, configurable:false,
      set:function(keyval){ this.addProperty(keyval[0], keyval[1]) }
    })
    for (var prop in data) {
      if (data.hasOwnProperty(prop)) this._new_property_ = [prop, data[prop]]
    }
  }
  DEFINE(BindableObject.prototype, 'addProperty', {enumerable:false, value:addProperty})


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
  DEFINE(BindableArray.prototype, 'addProperty', {enumerable:false, value:addProperty})


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

      console.log('NAME:',field.name,bindable)
      if (field.name in bindable) {
        CrossTalk.inputManager(function(notify_of_input, notify_of_output){

          field.addEventListener('input', function(ev){
            var do_it = function(){ bindable[field.name] = ev.target.value }
            notify_of_input( do_it )
          })

          container.bind(bindable, field.name, function(val){
            var do_it = function(){ field.value = val }
            notify_of_output( do_it )
          })

        })

        field.value = bindable[field.name]
      }

    })
  }



  function renderAsHtml(bindable){
    // if (typeOf(bindable) !== 'BindableObject' && typeOf(bindable) !== 'BindableArray') return 'Not binadable.'
    var html = ''

    each(bindable[0], function(key, val){
      if (validNode(val))
        html += '<'+val.tag+'>'+val.inner+'</'+val.tag+'>\n'
    })

    return html
  }
  var validTags = ['div','h1','li','a','p','p']
  function validNode(d){
    if (d && d.hasOwnProperty('tag') && d.hasOwnProperty('inner') && validTags.indexOf(d.tag) !== false) {
      return true
    }
  }



  /* Inverts control: Prevents inputs from receiving updates while they are the sender. */

  function inputManager(accepts_notifiers){
    var _sent_by_me = false

    function notifies_of_input(do_it){
      _sent_by_me = true
      do_it()
    }
    function notifies_of_output(do_it){
      if (! _sent_by_me) {
        do_it()
        _sent_by_me = false
      }
    }
    accepts_notifiers( notifies_of_input, notifies_of_output )
  }



  /* Recursively constructs a copy of the input object, having getter/setter pairs of every ownProperty. */

  function BindableContainer(data){
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
    this.recompute = function(data){
      if (familyOf(data) === 'complex')
        _data = new Bindable(data)
      return this
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

  function each(obj, cb){
    for (var prop in obj) cb(prop, obj[prop])
  }



  var CrossTalk = {
    Binding: BindableContainer
  , render: renderAsHtml
  , addForm: addForm
  , inputManager: inputManager
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
