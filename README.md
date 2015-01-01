# CrossTalk.js

(WIP)

_Connected.js_ is my humble attempt at a stand-alone two-way data binding library. All updates occur through event emitters, triggered by property setters. This is more efficient than some of the other implementations out there.

## Demo

Right now this implementation only supports recursive creation of bindable objects, and binding them to forms, where the form name attribute matches the object property.

See [index.html](//github.com/rm-rf-etc/crosstalk/blob/master/index.html).
``` javascript
  new Connected.Binding({
    one: 'Your'
  , two: 'input'
  , three: 'goes'
  , four: 'here.'
  })

  CrossTalk.addForm(document.querySelector('#form1'), container)
  CrossTalk.addForm(document.querySelector('#form2'), container)
  CrossTalk.addForm(document.querySelector('#form3'), container)
```

## License

CrossTalk.js is available under the [MIT License](//github.com/rm-rf-etc/crosstalk/blob/master/LICENSE.txt).
