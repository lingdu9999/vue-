import Dep from "./Dep";
import observe from "./observe";

export const defineReactive = function(data,key,val){
  const dep = new Dep();

  if (arguments.length === 2) {
    val = data[key]
  }
  let childObj = observe(val)
  Object.defineProperty(data,key,{
    enumerable:true,
    configurable:true,
    get(){
      console.log('defineProperty'+ key + '被访问');
      if (Dep.target) {
        dep.depend();
        if (childObj) {
          childObj.dep.depend();
        }
      }
      return val
    },
    set(newValue){
      console.log('defineProperty'+ key + '被改变');
      val = newValue
      childObj = observe(newValue)
      dep.notify();
    }
  })
}