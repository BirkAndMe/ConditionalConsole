cci.once().log('First (shown)');
cci.once().log('Second (not shown)');
cci.once('some label').log('First with label (shown)');
cci.once('some label').log('Second with label (not shown)');

cci.resetOnce().once('some label').log('Shown again, after reset.');
