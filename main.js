
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
  var _property_manipulator_
  var PROPERTY_MANIPULATOR = function(obj){
    if (! obj) return _property_manipulator_
    else _property_manipulator_ = obj
    return PROPERTY_MANIPULATOR
  }

  var _bindables = []
  var _events = new MicroEvent()



  /*  Bindable Classes  */

  function Bindable(data){
    if (typeOf(data) === 'Array')
      return new BindableArray(data)
    else if (familyOf(data) === 'complex')
      return new BindableObject(data)
  }

  function bind(){ // console.log('BIND', arguments)
    var setter_cb, property, parent, opts

    opts = Array.prototype.slice.call(arguments)

    if (opts.length === 3) {
      parent = opts[0]
      property = opts[1]
      setter_cb = opts[2]

      parent[property] = PROPERTY_MANIPULATOR({
        fetch:function(id){ _events.bind(id,setter_cb) }
      })
    }

    else if (typeOf(opts[0] === 'Array')) {
      setter_cb = opts[1]
      // opts[0]._array_events_ = PROPERTY_MANIPULATOR({
      //   fetch:function(id){ _events.bind(id,setter_cb) }
      // })
      _events.bind(opts[0]._id,setter_cb)
    }

  }

  function unbind(setter_cb){
    _events.unbind(setter_cb)
  }

  function recompute(data){
    if (familyOf(data) === 'complex')
      this.constructor.apply(this,data)
    return this
  }


  function BindableObject(data){ console.log(data)
    Object.keys(data).map(function(prop){
      this._new_property_ = [prop, data[prop]]
    }.bind(this))
  }
  DEFINE(BindableObject.prototype, 'bind', { enumerable:false, configurable:false, value:bind })
  DEFINE(BindableObject.prototype, 'unbind', { enumerable:false, configurable:false, value:unbind })
  DEFINE(BindableObject.prototype, 'recompute', { enumerable:false, configurable:false, value:recompute })
  DEFINE(BindableObject.prototype, '_new_property_', { enumerable:false, configurable:false,
    set:function(){ addProperty.apply(this, arguments) }
  })


  function BindableArray(array){
    var self = []

    DEFINE(self, '_id', { enumerable:false, configurable:false, value:+Math.random().toString().split('.')[1] })
    DEFINE(self, '_timeout', { enumerable:false, configurable:false, value:60 })
    DEFINE(self, 'bind', { enumerable:false, configurable:false, value:bind })
    DEFINE(self, 'unbind', { enumerable:false, configurable:false, value:unbind })
    DEFINE(self, 'recompute', { enumerable:false, configurable:false, value:recompute })
    DEFINE(self, '_new_property_', { enumerable:false, configurable:false,
      set:function(){ addProperty.apply(self, arguments) }
    })
    DEFINE(self, '_array_events_', { enumerable:false, configurable:false,
      set:function(manipulator){
        if (manipulator === PROPERTY_MANIPULATOR && PROPERTY_MANIPULATOR().fetch)
          PROPERTY_MANIPULATOR().fetch(self._id)
      }
    })
    OVERRIDE(self, 'push', function(obj){

      self._new_property_ = [self.length, obj]
      debounce(self._timeout, 'push'+self._id, function(){
        _events.trigger(self._id, [self.length-1, self[self.length-1]], 'push')
        console.log( 'emit: push'+self._id )
      })

    })
    OVERRIDE(self, 'pop', function(){

      var r = self[self.length-1]
      self.length = self.length-1
      debounce(self._timeout, 'pop'+self._id, function(){
        _events.trigger(self._id, r, 'pop')
        console.log( 'emit: pop'+self._id )
      })
      return r

    })
    OVERRIDE(self, 'shift', function(){

      var r = self[0]
      Object.keys(self).map(function(idx){
        self[+idx] = self[+idx+1]
        self[+idx] = PROPERTY_MANIPULATOR({
          fetch:function(id){ self[+idx] = PROPERTY_MANIPULATOR({id:id}) }
        })
      })
      self.length = self.length-1
      debounce(self._timeout, 'shift'+self._id, function(){
        _events.trigger(self._id, r, 'shift')
        console.log( 'emit: shift'+self._id )
      })
      return r

    })
    OVERRIDE(self, 'unshift', function(obj){

      Object.keys(self).reverse().map(function(idx){
        console.log(+idx+1, +idx)
        self._new_property_ = [+idx+1, self[+idx]]
        self[+idx] = PROPERTY_MANIPULATOR({
          fetch:function(id){ self[+idx+1] = PROPERTY_MANIPULATOR({id:id}) }
        })
      })
      self._new_property_ = [0, obj]
      debounce(self._timeout, 'unshift'+self._id, function(){
        _events.trigger(self._id, self, 'unshift')
        console.log( 'emit: unshift'+self._id )
      })
      return self.length

    })
    OVERRIDE(self, 'splice', function(){

      debounce(self._timeout, 'splice'+self._id, function(){
        _events.trigger(self._id, self, 'splice')
        console.log( 'emit: splice'+self._id )
      })
      Array.prototype.splice.apply(self, arguments)

    })
    OVERRIDE(self, 'slice', function(){

      Array.prototype.slice.apply(self, arguments)
      debounce(self._timeout, 'slice'+self._id, function(){
        _events.trigger(self._id, self, 'slice')
        console.log( 'emit: slice'+self._id )
      })

    })
    OVERRIDE(self, 'reverse', function(idx1, idx2){ // This works, but it's not optimized yet.

      for (var l=0; l < Math.floor(self.length/2); l++) {
        // Method 1 is this.
        var r = self.length-1 - l
        self[r] = PROPERTY_MANIPULATOR({ fetch:function(r_id){
          self[l] = PROPERTY_MANIPULATOR({ fetch:function(l_id){
            self[r] = PROPERTY_MANIPULATOR({id:l_id})
            self[l] = PROPERTY_MANIPULATOR({id:r_id})
          }})
        }})
        // Method 2 would be something like this.
        // Array.prototype.push.call(self, self[ length ])
        // Array.prototype.splice.call(self, length, 1)
      }
      Array.prototype.reverse.call(self)
      debounce(self._timeout, 'reverse'+self._id, function(){
        _events.trigger(self._id, self, 'reverse')
        console.log( 'emit: reverse'+self._id )
      })
      return self

    })
    OVERRIDE(self, 'concat', function(arr){

      // This method is not implemented according to the standard, as it modifies the object it's being called upon.
      // In the future we'll aim to fix this, making it conform to the standard.

      if (typeOf(arr) === 'Array' && arr.length) {
        Object.keys(arr).map(function(key){
          self._new_property_ = [self.length, arr[key]]
        })
      }
      debounce(self._timeout, 'concat'+self._id, function(){
        _events.trigger(self._id, self, 'concat')
        console.log( 'emit: concat'+self._id )
      })
      return self

    })
    Object.keys(array).map(function(idx){
      self._new_property_ = [+idx, array[+idx]]
    })
    return self

  }


  function addProperty(args){
    var _val, _id, key, val
    _id = +Math.random().toString().split('.')[1]

    if (typeOf(args) === 'Array') {
      key = args[0]
      val = args[1]
    } else {
      console.log('Abort! Bad property assignment:',args)
      return
    }
    // console.log('addProperty', key, val)

    DEFINE(this, key, {
      enumerable: true
    , configurable: true
    , get: function(){ return _val }
    , set: function(value){
        if (value === PROPERTY_MANIPULATOR && PROPERTY_MANIPULATOR().fetch) {
          PROPERTY_MANIPULATOR().fetch(_id)
        }
        // else if (value === PROPERTY_MANIPULATOR && PROPERTY_MANIPULATOR().updated) {
        //   // if (typeOf(_val) === 'complex') _val = PROPERTY_MANIPULATOR({updated:true})
        //   // else _events.trigger(_id, _val)
        // }
        else if (value === PROPERTY_MANIPULATOR && PROPERTY_MANIPULATOR().id) {
          _id = PROPERTY_MANIPULATOR().id
        }
        else if (familyOf(value) === 'complex') {
          _val = new Bindable(value)
          _events.trigger(_id, _val)
        }
        else {
          _val = value
          _events.trigger(_id, _val)
        }
      }
    })
    this[key] = val
  }



  /* Takes a form DOM object and a Binding object, and does the rest for you. */

  function bindForm(form, bindable){

    ;[].forEach.call(form.querySelectorAll('input'), function(field){

      if (field.name in bindable) {
        fieldManager(function(input_handler, output_handler){

          field.addEventListener('input', function(ev){
            var do_it = function(){ bindable[field.name] = ev.target.value }
            input_handler( do_it )
          })

          bindable.bind(bindable, field.name, function(val){
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
    var type = typeOf(thing)
    if (type) {
      return {
        Date: 'simple'
      , String: 'simple'
      , Number: 'simple'
      , Boolean: 'simple'
      , Function: 'simple'
      , Array: 'complex'
      , Object: 'complex'
      , 'undefined': 'falsey'
      , 'null': 'falsey'
      }[type] || (/^HTML\w*Element$/g.test(type) ? 'HTMLElement' : 'complex')
    } else {
      return false
    }
  }

  function typeOf(thing){
    // Using `!=` so that `false` will evaluate to true, while all other falsey values are false.
    return (thing != null && !Number.isNaN(thing) && thing.constructor) ? thing.constructor.name : '' + thing
  }

  var debounce
  ;(function(){
    var bounced = {}
    debounce = function(t, id, cb){
      clearTimeout( bounced[id] )
      bounced[id] = setTimeout(cb, t)
    }
  })()



  NewBindable.fieldManager = fieldManager
  NewBindable.bindForm = bindForm

  DEFINE(NewBindable, 'bindables', {get:function(){return _bindables}, enumerable:true})
  DEFINE(NewBindable, 'PROPERTY_MANIPULATOR', {value:PROPERTY_MANIPULATOR, writeable:false})


  if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = NewBindable
  } else {
    window.Connected  = NewBindable
    window.Bindable   = Bindable
    window.familyOf   = familyOf
    window.typeOf     = typeOf
  }

})()
