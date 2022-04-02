import observe from './observe'
import Watcher from './Watcher'



let data = {
  a:{
    m:{
      c:{
        d:123
      }
    }
  },
  b:444
}

observe(data)

new Watcher(data,'a.m.c.d',(val,oldval)=>{
  console.log(val,oldval);
})
console.log('----------------------------');

new Watcher(data,'b',(val)=>{
  console.log(val);
})

data.b = {
  z:123
}
console.log(data.b.z);

data.b.z = 32
console.log(data.b.z);

// obj.b.a.s = {
//   c:{
//     b:12
//   }
// }
// console.log(obj.b.a.s.c.b);