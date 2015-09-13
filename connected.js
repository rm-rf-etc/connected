
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

Semi-colon line terminators are just FUD. If your minifier can't handle this code, switch to one that is JS-compliant.
http://blog.izs.me/post/2353458699/an-open-letter-to-javascript-leaders-regarding
http://inimino.org/~inimino/blog/javascript_semicolons

*/


;(function(){

	var familyOf = require('typeof').familyOf
	var typeOf = require('typeof').typeOf
	var MicroEvent = require('microevent')



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

	function BindableObject(data){
		Object.keys(data).map(function(prop){
			this._new_property_ = [prop, data[prop]]
		}.bind(this))
	}
	DEFINE(BindableObject.prototype, 'bind', { enumerable:false, configurable:false, value:bind })
	DEFINE(BindableObject.prototype, 'unbind', { enumerable:false, configurable:false, value:unbind })
	DEFINE(BindableObject.prototype, 'trigger', { enumerable:false, configurable:false, value:trigger })
	DEFINE(BindableObject.prototype, 'recompute', { enumerable:false, configurable:false, value:recompute })
	DEFINE(BindableObject.prototype, 'fieldManager', { enumerable:false, configurable:false, value:fieldManager })
	DEFINE(BindableObject.prototype, 'onChange', { enumerable:false, configurable:false,
		value:function(props, cb){
			var self = this
			if (typeOf(props) !== 'Array') return
			props.forEach(function(prop){ self.bind(prop,cb) })
		}
	})
	DEFINE(BindableObject.prototype, '_new_property_', { enumerable:false, configurable:false,
		set:function(pair){ addProperty.call(this, this, pair) }
	})
	DEFINE(BindableObject.prototype, 'accept_id', { enumerable:false, configurable:false,
		value:function(id){
			if (id === PROPERTY_MANIPULATOR) this._new_property_ = PROPERTY_MANIPULATOR
		}
	})


	function BindableArray(array){
		var self = []

		var _id
		DEFINE(self, '_timeout', { enumerable:false, configurable:false, value:60 })
		DEFINE(self, 'bind', { enumerable:false, configurable:false, value:bind })
		DEFINE(self, 'unbind', { enumerable:false, configurable:false, value:unbind })
		DEFINE(self, 'trigger', { enumerable:false, configurable:false, value:trigger })
		DEFINE(self, 'recompute', { enumerable:false, configurable:false, value:recompute })
		DEFINE(self, 'fieldManager', { enumerable:false, configurable:false, value:fieldManager })
		DEFINE(self, 'accept_id', { enumerable:false, configurable:false,
			value:function(id){
				if (id === PROPERTY_MANIPULATOR) _id = id().id
			}
		})
		DEFINE(self, '_new_property_', { enumerable:false, configurable:false,
			set:function(pair){ addProperty.call(self, self, pair) }
		})
		OVERRIDE(self, 'push', function(obj){

			self._new_property_ = [self.length, obj]
			debounce(self._timeout, 'push'+_id, function(){
				_events.trigger(_id, [self.length-1, self[self.length-1]], 'push')
				console.log( 'emit: push'+_id )
			})

		})
		OVERRIDE(self, 'pop', function(){

			var r = self[self.length-1]
			self.length = self.length-1
			debounce(self._timeout, 'pop'+_id, function(){
				_events.trigger(_id, r, 'pop')
				console.log( 'emit: pop'+_id )
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
			debounce(self._timeout, 'shift'+_id, function(){
				_events.trigger(_id, r, 'shift')
				console.log( 'emit: shift'+_id )
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
			debounce(self._timeout, 'unshift'+_id, function(){
				_events.trigger(_id, self, 'unshift')
				console.log( 'emit: unshift'+_id )
			})
			return self.length

		})
		OVERRIDE(self, 'splice', function(){

			debounce(self._timeout, 'splice'+_id, function(){
				_events.trigger(_id, self, 'splice')
				console.log( 'emit: splice'+_id )
			})
			Array.prototype.splice.apply(self, arguments)

		})
		OVERRIDE(self, 'slice', function(){

			Array.prototype.slice.apply(self, arguments)
			debounce(self._timeout, 'slice'+_id, function(){
				_events.trigger(_id, self, 'slice')
				console.log( 'emit: slice'+_id )
			})

		})
		OVERRIDE(self, 'reverse', function(idx1, idx2){ // This works, but it's not optimized yet.

			for (var l=0; l < Math.floor(self.length/2); l++) {
				// Method 1 is this.
				var r = self.length-1 - l
				swapIds.call(self,l,r)
				// Method 2 would be something like this.
				// Array.prototype.push.call(self, self[ length ])
				// Array.prototype.splice.call(self, length, 1)
			}
			Array.prototype.reverse.call(self)
			debounce(self._timeout, 'reverse'+_id, function(){
				_events.trigger(_id, self, 'reverse')
				console.log( 'emit: reverse'+_id )
			})
			return self

		})
		OVERRIDE(self, 'concat', function(arr){
			self.trigger(PROPERTY_MANIPULATOR({id:_id}))

			// This method is not implemented according to the standard, as it modifies the object it's being called upon.
			// In the future we'll aim to fix this, making it conform to the standard.

			if (typeOf(arr) === 'Array' && arr.length) {
				Object.keys(arr).map(function(key){
					self._new_property_ = [self.length, arr[key]]
				})
			}
			debounce(self._timeout, 'concat'+_id, function(){
				_events.trigger(_id, self, 'concat')
				console.log( 'emit: concat'+_id )
			})

			return self

		})

		Object.keys(array).map(function(idx){
			self._new_property_ = [+idx, array[+idx]]
		})

		return self

	}

	function swapIds(l,r){
		this[r] = PROPERTY_MANIPULATOR({ fetch:function(r_id){
			this[l] = PROPERTY_MANIPULATOR({ fetch:function(l_id){
				this[r] = PROPERTY_MANIPULATOR({id:l_id})
				this[l] = PROPERTY_MANIPULATOR({id:r_id})
			}})
		}})
	}


	/*  Class Methods  */

	function addProperty(parent, pair){
		var _val, _id, _prop, val
		_id = +Math.random().toString().split('.')[1]

		if (typeOf(pair) === 'Array') {
			_prop = pair[0]
			val = pair[1]
		} else {
			console.log('Abort! Bad property assignment:',pair)
			console.trace()
			return
		}
		parent.trigger('_id', '_new_property_:'+_prop)

		DEFINE(this, _prop, {
			enumerable: true,
			configurable: true,
			get: function(){ return _val },
			set: function(value){
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
					_val.accept_id(PROPERTY_MANIPULATOR({id:_id}))
					_events.trigger(_id, _val)
				}
				else {
					_val = value
					_events.trigger(_id, _val)
				}
			}
		})
		this[_prop] = val
		if (familyOf(val) === 'complex') this[_prop].accept_id( PROPERTY_MANIPULATOR({id:_id}) )
	}

	function trigger(event){
		var _id
		if (event === PROPERTY_MANIPULATOR) _id = PROPERTY_MANIPULATOR().id
		if (event && event === '_id') _events.trigger(_id)
	}

	function bind(property, setter_cb){
		var self = this
		// console.log('WHAT PROPERTY?',property)
		self[property] = PROPERTY_MANIPULATOR({
			fetch:function(id){ /*console.log('WHICH ID?',id);*/ _events.bind(id,setter_cb) }
		})
	}

	function unbind(setter_cb){
		_events.unbind(setter_cb)
	}

	function recompute(data){
		if (familyOf(data) === 'complex')
			this.constructor.apply(this,data)
		return this
	}



	/* Takes a form DOM object and a Binding object, and does the rest for you. */

	function bindForm(form, bindable){

		;[].forEach.call(form.querySelectorAll('input'), function(field){

			bindField(field, bindable)

		})

	}

	function bindField(field, bindable){

		if (field.name in bindable) {

			var wrap = fieldManager()

			field.addEventListener('input', function(ev){
				var do_it = function(){ bindable[field.name] = ev.target.value }
				wrap.input( do_it )
			})

			bindable.bind(field.name, function(val){
				var do_it = function(){ field.value = val }
				wrap.output( do_it )
			})

			field.value = bindable[field.name]
		}

	}



	/* Inverts control: Prevents inputs from receiving updates while they are the sender. */

	function fieldManager(){
		var _sent_by_me = false

		return {
			"input": function inputManager(do_it){
				_sent_by_me = true
				do_it()
			},
			"output": function outputManager(do_it){
				_sent_by_me ? _sent_by_me = false : do_it()
			}
		}
	}



	/* Our entry point for creating bindable objects, keeps a reference to the object created. */

	function NewBindable(data){
		var bindable = new Bindable(data)
		_bindables.push(bindable)
		return bindable
	}



	/*  HELPERS  */

	var debounce
	;(function(){
		var bounced = {}
		debounce = function(t, id, cb){
			clearTimeout( bounced[id] )
			bounced[id] = setTimeout(cb, t)
		}
	})()



	NewBindable.fieldManager = fieldManager
	NewBindable.bindField = bindField
	NewBindable.bindForm = bindForm
	NewBindable.unbind = unbind
	NewBindable.bind = bind

	DEFINE(NewBindable, 'bindables', {get:function(){return _bindables}, enumerable:true})
	DEFINE(NewBindable, 'PROPERTY_MANIPULATOR', {value:PROPERTY_MANIPULATOR, writeable:false})


	if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
		var object = {
		// , Bindable: Bindable
			Bindable: NewBindable
		, familyOf: familyOf
		, typeOf: typeOf
		, unbind: unbind
		, bind: bind
		}
		module.exports = object
	} else {
		// window.Bindable   = Bindable
		window.Connected  = NewBindable
		window.familyOf   = familyOf
		window.typeOf     = typeOf
	}

})();
