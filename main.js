
;(function(){

  var _objects = []

  var CrossTalk = {
    Binding: Binding
  , addForm: addForm
  , inputManager: blockify
  , bindings: function(){ return _objects }
  }


  /*
  Takes a form DOM object and a Binding object, and does the rest for you.
  */
  function addForm(form, binding_object){

    var data = binding_object.checkout()
    form = formigate(form)

    for (var prop in form) {
      if (form.hasOwnProperty(prop)) {

        ;(function(field){
          var field
          var setup_input = function(notify){
            field.addEventListener('input', function(ev){
              var execute = function(){ data[field.name] = ev.target.value }
              notify(execute)
            })
          }
          var setup_output = function(notify){
            binding_object.bind(field.name, function(val){
              var execute = function(){ field.value = val }
              notify(execute)
            })
          }
          CrossTalk.inputManager( setup_input, setup_output )
        })(form[prop])

      }
    }
  }


  /*
  Converts a form into an object where the field name is the key and DOM object the value.
  CURRENTLY DEPENDS ON JQUERY. PLANNING ON CHANGING THIS.
  */
  function formigate(form){
    var $form = $(form)
    form = {}

    $form.children().each(function(i, field){
      var event_string = field.name
      form[field.name] = field
    })

    return form
  }


  /*
  Inverts control: Allows inputs to block update events when they are the sender.
  */
  function blockify(setup_input, setup_output){
    var sender = false
    setup_input(function(run){ sender = true; run() })
    setup_output(function(run){ if (! sender) run(); sender = false })
  }


  /*
  Recursively constructs a copy of the input object, having getter/setter pairs of every ownProperty.
  */
  function Binding(data){
    if (typeOf(data) !== 'Object' || familyOf(data) !== 'complex') return null
    var _data, _bindings, set_cb, _prop_path

    _bindings = {}
    _prop_path = []

    function recursive(data, property){

      prop_path = _prop_path.concat(property)
      var _data = {}
      if (typeOf(data) === 'Array') _data = []

      for (var each in data) {
        if (data.hasOwnProperty(each)) processProperty(each, prop_path.concat(each))
      }
      function processProperty(property, prop_path){
        var event_id = prop_path.join('.')

        _bindings[event_id] = new MicroEvent()
        set_cb = function(data){ // console.log(event_string,data)
          _bindings[event_id].trigger(event_id,data)
        }

        init(_data, property, event_id, set_cb)

        switch (familyOf(data[property])) {
          case 'simple': _data[property] = data[property]; break;
          default: _data[property] = recursive(data[property], property); break;
        }
      }
      return _data
    }
    _data = recursive(data, [])
    _prop_path

    this.bind = function bind(property, set_cb){
      if (! _bindings.hasOwnProperty(property)) _bindings[property] = new MicroEvent()
      _bindings[property].bind(property, set_cb)
    }
    this.unbind = function unbind(property, set_cb){
      if (_bindings.hasOwnProperty(property)) _bindings[property].unbind(set_cb)
    }
    this.checkout = function(){ return _data }

    _objects.push(_data)
  }

  function init(obj, property, prop_path, set_cb){
    var _val = undefined
    Object.defineProperty(obj, property, {
      get: function(){ return _val }
    , set: function(val){ _val = val; set_cb(val) }
    , enumerable: true
    })
  }

  function familyOf (thing) {
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

  function typeOf (thing) {
    return (thing != null && !Number.isNaN(thing) && thing.constructor) ? thing.constructor.name : null
  }

  if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = CrossTalk
  } else {
    window.CrossTalk = CrossTalk
  }

})()
