import './libs/lib1';

require('./libs/lib3');

const p = document.createElement('p');
p.innerHTML = "I AM MAIN";
document.body.append(p);
