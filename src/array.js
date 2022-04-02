import utils from "./utils";

const arrayPrototype = Array.prototype
export const arrayMethods = Object.create(arrayPrototype)

const arrayMethodChange = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
]


arrayMethodChange.forEach(methodName=>{
  let copyMethod = arrayMethods[methodName];
  utils(arrayMethods,methodName,function(){
    let result = copyMethod.apply(this,arguments)
    let args = [...arguments];
    const ob = this.__ob__
    let arrData = [];
    switch(methodName){
      case 'push':
      case 'unshift':
        arrData = args;
        break;
      case 'splice':
        arrData = args.slice(2);
        break;
    }
    if (arrData.length!==0) {
      ob.optionArr(arrData)
    }

    console.log('快来看看');
    return result;
  },false)
})