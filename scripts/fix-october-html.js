const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets', 'october');

fs.readdir(dir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach(file => {
    if (path.extname(file) === '.html') {
      const filePath = path.join(dir, file);
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', file, err);
          return;
        }

        let fixed = data;

        // Fix body tag
        fixed = fixed.replace(
          /<body class="([^<]*)<header class="([^"]*)">/,
          '<body class="$1">\n<header class="$2">'
        );

        // Fix h1
        fixed = fixed.replace(
          /<h1 class="text-2xl font-bold text-purple-600 ([^"]*)<\/h1>/,
          '<h1 class="text-2xl font-bold text-purple-600">$1</h1>'
        );

        // Fix p in header
        fixed = fixed.replace(
          /<p class="text-sm text-gray-600 ([^"]*)<\/p>/,
          '<p class="text-sm text-gray-600">$1</p>'
        );

        // Fix h3
        fixed = fixed.replace(
          /<h3 class="text-lg font-semibold text-gray-800 of ([^<]*)<\/h3>/,
          '<h3 class="text-lg font-semibold text-gray-800">$1</h3>'
        );

        // Fix p under h3
        fixed = fixed.replace(
          /<p class="text-sm text-gray-600 readings may replace the weekday readings\.<\/p>/,
          '<p class="text-sm text-gray-600">These readings may replace the weekday readings.</p>'
        );

        // Fix responsorial psalm p
        fixed = fixed.replace(
          /<p class="text-700 leading-relaxed">/,
          '<p class="text-gray-700 leading-relaxed">'
        );

        // Fix nav a tags
        fixed = fixed.replace(
          /<a href="index\.html" class="flex flex-col items-center px-3 py-2 rounded-lg text-purple-600 <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">\s*<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" \/>\s*<\/svg>\s*<span class="text-xs font-medium">Home<\/span>\s*<\/a>/,
          '<a href="index.html" class="flex flex-col items-center px-3 py-2 rounded-lg text-purple-600">\n  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">\n  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />\n  </svg>\n  <span class="text-xs font-medium">Home</span>\n  </a>'
        );

        fixed = fixed.replace(
          /<a id="masifuAsubuhiLink" class="flex flex-col items-center px-3 py-2 rounded-lg text-gray-600 hover:text-gray-800 <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">\s*<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15\.364 6\.364l-\.707-\.707M6\.343 6\.343l-\.707-\.707m12\.728 0l-\.707\.707M6\.343 17\.657l-\.707\.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" \/>\s*<\/svg>\s*<span class="text-xs font-medium">Lauds<\/span>\s*<\/a>/,
          '<a id="masifuAsubuhiLink" class="flex flex-col items-center px-3 py-2 rounded-lg text-gray-600 hover:text-gray-800">\n  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">\n  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />\n  </svg>\n  <span class="text-xs font-medium">Lauds</span>\n  </a>'
        );

        fixed = fixed.replace(
          /<a href="calendar\.html" class="flex flex-col items-center px-3 py-2 rounded-lg text-gray-600 hover:text-gray-800 <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">\s*<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" \/>\s*<\/svg>\s*<span class="text-xs font-medium">Calendar<\/span>\s*<\/a>/,
          '<a href="calendar.html" class="flex flex-col items-center px-3 py-2 rounded-lg text-gray-600 hover:text-gray-800">\n  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">\n  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />\n  </svg>\n  <span class="text-xs font-medium">Calendar</span>\n  </a>'
        );

        fixed = fixed.replace(
          /<a href="settings\.html" class="flex flex-col items-center px-3 py-2 rounded-lg text-gray-600 hover:text-gray-800 <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">\s*<path stroke-linecap="round" stroke-linejoin="round" d="M10\.325 4\.317c\.426-1\.756 2\.924-1\.756 3\.35 0a1\.724 1\.724 0 002\.573 1\.066c1\.543-\.94 3\.31\.826 2\.37 2\.37a1\.724 1\.724 0 001\.065 2\.572c1\.756\.426 1\.756 2\.924 0 3\.35a1\.724 1\.724 0 00-1\.066 2\.573c\.94 1\.543-\.826 3\.31-2\.37 2\.37a1\.724 1\.724 0 00-2\.572 1\.065c-\.426 1\.756-2\.924 1\.756-3\.35 0a1\.724 1\.724 0 00-2\.573-1\.066c-1\.543\.94-3\.31-\.826-2\.37-2\.37a1\.724 1\.724 0 00-1\.065-2\.572c-1\.756-\.426-1\.756-2\.924 0-3\.35a1\.724 1\.724 0 001\.066-2\.573c-\.94-1\.543\.826-3\.31 2\.37-2\.37\.996\.608 2\.296\.07 2\.572-1\.065z" \/>\s*<\/svg>\s*<span class="text-xs font-medium">Settings<\/span>\s*<\/a>/,
          '<a href="settings.html" class="flex flex-col items-center px-3 py-2 rounded-lg text-gray-600 hover:text-gray-800">\n  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">\n  <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />\n  </svg>\n  <span class="text-xs font-medium">Settings</span>\n  </a>'
        );

        fs.writeFile(filePath, fixed, 'utf8', (err) => {
          if (err) {
            console.error('Error writing file:', file, err);
            return;
          }
          console.log('Fixed:', file);
        });
      });
    }
  });
});