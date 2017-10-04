cci
  // Add the types we're going to use.
  .addType('error')
  .addType('warning')
  .addType('info')
  // Set the reporting.
  .setReporting('all -info');

cci.type('error').log('We log error messages.');
cci.type('info').log('But not simple information.');
cci.type('warning').log('Warnings are also logged.');

// Adding new types in the reporting also creates the type via the addType()
// function.
cci.setReporting('+info +secondary');

cci.type('info').log('Logging info now.')
cci.type('secondary').log('Secondary create in previous setReporting.')
cci.type('something').log('Something do not exist, so it\'s not logged.')
