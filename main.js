
/*
The MIT License (MIT)

Copyright (c) 2014 Rob Christian

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



/*

Semi-colons are just FUD. If your minifier can't handle this code, switch to one that is JS-compliant.

*/


;(function(){



  /*  Private Class Data  */

  var DEFINE = Object.defineProperty
  var OVERRIDE = function(object, method_name, method){
    DEFINE(object, method_name, { enumerable:false, configurable:false, value:method })
  }
  var _property_modifier_ = null
  var PROPERTY_MODIFIER = function(obj){
    if (! obj) return _property_modifier_
    else _property_modifier_ = obj
    return PROPERTY_MODIFIER
  }

  var _bindables = []
  var _events = new MicroEvent()
  function _setter_cb(id,val){ _events.trigger(id,val) }



  /*  Bindable Classes  */

  function Bindable(data){
    if (typeOf(data) === 'Array')
      return new BindableArray(data)
    else if (familyOf(data) === 'complex')
      return new BindableObject(data)
  }
  function bind(parent, property, setter_cb){
    parent[property] = PROPERTY_MODIFIER({
      send:function(id){ _events.bind(id,setter_cb) }
    })
    // parent[property] = PROPERTY_MODIFIER
  }
  function unbind(property, setter_cb){
    _events.unbind(setter_cb)
  }
  function recompute(data){
    if (familyOf(data) === 'complex')
      this.constructor(data)
    return this
  }


  function BindableObject(data){
    Object.keys(data).map(function(prop){
      this._new_property_ = [prop, data[prop]]
    }.bind(this))
  }
  DEFINE(BindableObject.prototype, 'bind', { enumerable:false, configurable:false, value:bind })
  DEFINE(BindableObject.prototype, 'unbind', { enumerable:false, configurable:false, value:unbind })
  DEFINE(BindableObject.prototype, 'recompute', { enumerable:false, configurable:false, value:recompute })
  DEFINE(BindableObject.prototype, '_new_property_', { enumerable:false, configurable:false,
    set:function(keyval){ addProperty.apply(this, keyval) }
  })


  function BindableArray(array){
    var self = []

    DEFINE(self, 'bind', { enumerable:false, configurable:false, value:bind })
    DEFINE(self, 'unbind', { enumerable:false, configurable:false, value:unbind })
    DEFINE(self, 'recompute', { enumerable:false, configurable:false, value:recompute })
    DEFINE(self, '_new_property_', { enumerable:false, configurable:false,
      set:function(keyval){ addProperty.apply(self, keyval) }
    })
    OVERRIDE(self, 'push', function(v){ self._new_property_ = [self.length, v] })
    OVERRIDE(self, 'pop', function(){ var r = self[self.length-1]; self.length = self.length-1; return r })
    OVERRIDE(self, 'shift', function(){
      var r = self[0]
      Object.keys(self).map(function(idx){
        self[+idx-1] = self[+idx]
      })
      self.length = self.length-1
      return r
    })
    OVERRIDE(self, 'unshift', function(obj){

      Object.keys(self).map(function(idx){
        console.log(+idx+1, +idx)
        self._new_property_ = [+idx+1, self[+idx]]
        self[+idx] = PROPERTY_MODIFIER({
          send:function(id){ self[+idx+1] = PROPERTY_MODIFIER({id:id}) }
        })
      })

      self._new_property_ = [0, obj]
    })
    OVERRIDE(self, 'concat', function(arr){
      if (arr && arr.length) {
        Object.keys(arr).map(function(key){
          self._new_property_ = [self.length, arr[key]]
        })
      }
    })
    Object.keys(array).map(function(key){
      self._new_property_ = [key, array[key]]
    })

    return self
  }


  function addProperty(key, val){
    var _val = undefined
    var _id = Math.random().toString().split('.')[1]
    console.log('addProperty', key, val)

    DEFINE(this, key, {
      enumerable: true
    , configurable: true
    , get: function(){ return _val }
    , set: function(value){
        if (value === PROPERTY_MODIFIER && PROPERTY_MODIFIER().send) {
          PROPERTY_MODIFIER().send(_id)
        }
        else if (value === PROPERTY_MODIFIER && PROPERTY_MODIFIER().id) {
          _id = PROPERTY_MODIFIER().id
        }
        else if (familyOf(value) === 'complex') {
          _val = new Bindable(value)
          _setter_cb(_id, _val)
        }
        else {
          _val = value
          _setter_cb(_id, _val)
        }
      }
    })
    this[key] = val
  }



  /* Takes a form DOM object and a Binding object, and does the rest for you. */

  function bindForm(form, container){
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



  /* Our entry point for creating bindable objects, keeps a reference to the object created. */

  function NewBindable(data){
    var bindable = new Bindable(data)
    _bindables.push(bindable)
    return bindable
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
    Binding: NewBindable
  , fieldManager: fieldManager
  , bindForm: bindForm
  }
  DEFINE(CrossTalk, 'bindables', {get:function(){return _bindables}, enumerable: true})
  DEFINE(CrossTalk, 'PROPERTY_MODIFIER', {value:PROPERTY_MODIFIER, writeable:false})


  if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = CrossTalk
  } else {
    window.CrossTalk = CrossTalk
    window.familyOf = familyOf
    window.typeOf = typeOf
    window.Bindable = Bindable
  }

})()
