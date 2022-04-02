import Observer from './Observer';

export default function(obj) {
  if (typeof obj !== 'object') return; // d
  let ob;
  if (typeof obj.__ob__ !== 'undefined') {
    ob = obj.__ob__;
  } else {
    ob = new Observer(obj,JSON.stringify(obj));
  }
  return ob;
}