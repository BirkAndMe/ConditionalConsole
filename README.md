# ConditionalConsole
This allows for chained conditions, before outputting to `console.log()`. And (the important part) it supports showing the correct line, from where the log is called.

## Installation
```
npm install conditional-console
```

Or include the `ConditionalConsole.min.js` file in..
```html
<script src="ConditionalConsole.min.js"></script>
```

## Usage
This simple example gives the general idea.
```js
cci.check(1 === 1).log('This is logged');
cci.check(1 !== 1).check(1 === 2).log('And this is not')
```

There's also an build in reporting system.
```js
cci.setReporting('all -verbose')
cci.type('verbose').log('Not shown.');
cci.type('error').log('Shown.');
cci.type('error').check(false).log('Not shown, because of the check.');
```
