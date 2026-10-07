// Loads js/liturgical-calendar.js (a plain browser script) into a sandbox and
// returns the API it puts on window.LiturgicalCalendar.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

module.exports = function loadCalendar() {
    const code = fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'liturgical-calendar.js'), 'utf8');
    const sandbox = { window: {} };
    vm.runInNewContext(code, sandbox, { filename: 'liturgical-calendar.js' });
    return sandbox.window.LiturgicalCalendar;
};
