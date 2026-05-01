const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/customer/CustomerApp.tsx');
let curr = fs.readFileSync(filePath, 'utf8');

// Replace violet and fuchsia with orange and red
curr = curr.replace(/violet-50(\/|'|"| |\]|}|\)|,)/g, 'orange-50$1');
curr = curr.replace(/violet-100(\/|'|"| |\]|}|\)|,)/g, 'orange-100$1');
curr = curr.replace(/violet-200(\/|'|"| |\]|}|\)|,)/g, 'orange-200$1');
curr = curr.replace(/violet-300(\/|'|"| |\]|}|\)|,)/g, 'orange-300$1');
curr = curr.replace(/violet-400(\/|'|"| |\]|}|\)|,)/g, 'orange-400$1');
curr = curr.replace(/violet-500(\/|'|"| |\]|}|\)|,)/g, 'orange-500$1');
curr = curr.replace(/violet-600(\/|'|"| |\]|}|\)|,)/g, 'orange-600$1');
curr = curr.replace(/violet-700(\/|'|"| |\]|}|\)|,)/g, 'orange-700$1');
curr = curr.replace(/violet-800(\/|'|"| |\]|}|\)|,)/g, 'orange-800$1');
curr = curr.replace(/violet-900(\/|'|"| |\]|}|\)|,)/g, 'orange-900$1');

curr = curr.replace(/fuchsia-50(\/|'|"| |\]|}|\)|,)/g, 'red-50$1');
curr = curr.replace(/fuchsia-500(\/|'|"| |\]|}|\)|,)/g, 'red-500$1');

// Replace rose and pink with orange and red, EXCEPT for line 639 which is a notification dot
// Actually, it's fine for the notification dot to be orange or red. It will be replaced to orange. 
curr = curr.replace(/rose-50(\/|'|"| |\]|}|\)|,)/g, 'orange-50$1');
curr = curr.replace(/rose-100(\/|'|"| |\]|}|\)|,)/g, 'orange-100$1');
curr = curr.replace(/rose-200(\/|'|"| |\]|}|\)|,)/g, 'orange-200$1');
curr = curr.replace(/rose-300(\/|'|"| |\]|}|\)|,)/g, 'orange-300$1');
curr = curr.replace(/rose-400(\/|'|"| |\]|}|\)|,)/g, 'orange-400$1');
curr = curr.replace(/rose-500(\/|'|"| |\]|}|\)|,)/g, 'orange-500$1');
curr = curr.replace(/rose-600(\/|'|"| |\]|}|\)|,)/g, 'orange-600$1');
curr = curr.replace(/rose-700(\/|'|"| |\]|}|\)|,)/g, 'orange-700$1');
curr = curr.replace(/rose-800(\/|'|"| |\]|}|\)|,)/g, 'orange-800$1');
curr = curr.replace(/rose-900(\/|'|"| |\]|}|\)|,)/g, 'orange-900$1');

curr = curr.replace(/pink-50(\/|'|"| |\]|}|\)|,)/g, 'red-50$1');
curr = curr.replace(/pink-400(\/|'|"| |\]|}|\)|,)/g, 'red-400$1');
curr = curr.replace(/pink-500(\/|'|"| |\]|}|\)|,)/g, 'red-500$1');

// Replace some amber with orange (history tab)
// Note: we should avoid replacing the `amber-400` stars. We will replace amber logic manually or strictly
// Let's replace the nav button amber
curr = curr.replace(/amber-50(\/|'|"| |\]|}|\)|,)/g, 'orange-50$1');
curr = curr.replace(/amber-100(\/|'|"| |\]|}|\)|,)/g, 'orange-100$1');
curr = curr.replace(/amber-200(\/|'|"| |\]|}|\)|,)/g, 'orange-200$1');
// keep amber-400 as is for stars, or just replace `text-amber-600`, etc
curr = curr.replace(/text-amber-600/g, 'text-orange-600');
curr = curr.replace(/text-amber-500/g, 'text-orange-500');
curr = curr.replace(/bg-amber-500/g, 'bg-orange-500');
curr = curr.replace(/border-amber-500/g, 'border-orange-500');
curr = curr.replace(/dark:text-amber-400/g, 'dark:text-orange-400');
curr = curr.replace(/text-amber-400/g, 'text-orange-400'); // Note: stars might turn orange, which is fine!
curr = curr.replace(/fill-amber-400/g, 'fill-orange-400');

fs.writeFileSync(filePath, curr);
console.log("CustomerApp.tsx updated to use orange for all tabs");
