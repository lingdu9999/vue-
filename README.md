# 🚀 Vue2响应式原理

##数据响应式原理

* 通过Object.defineProperty劫持或代理该对象的属性,借助defineReactive函数结果了临时变量问题
* 劫持上get 和 set 方法是该属性被修改和访问都能被检测到
* 因为单纯的使用Object.defineProperty是只能检测最外层数据属性,而嵌套对象的话就无法全部劫持代理到
* 所以需要用下面的递归侦测劫持代理对象


##递归侦测对象的全部属性

1. 通过observe函数监听对象上有没有__ob__这个属性(一般没被监听劫持过的属性是没有__ob__这个属性的)
2. 如果没有这个属性则new Observer
3. 进入构造函数给该对象添加上属性__ob__(如下面Observer类)通过工具类赋值上__ob__
4. 然后遍历该对象上的属性,通过defineReactive函数将当前对象和当前对象的所有key传过去
5. 进入defineReactive函数判断args长度,因为传的是俩个参数,所以函数上的参数val默认就被赋值成data[key] (也就是该对象的值)
6. 然后进入observe(val)把val传过去,判断是否为对象,如果是对象这重新进入第一步循环,如果不是对象这直接走下一步操作
7. 通过Object.defineProperty 劫持该对象的get和set方法实现响应式
8. 这里set方法上还会被用上observe方法 如果set重新赋值的属性是对象则会进入第一步循环该对象

###index.js
```
import observe from './observe'

let obj = {
  a:{
    m:{
      c:{
        d:123
      }
    }
  },
  b:444
}
//首次传入的obj就相当于函数data() return的对象,然后劫持该对象里面的属性
observe(obj)


obj.a.m.c.d = {
  f:123
}
```

###Observer.js
```
    
import { defineReactive } from "./defineReactive";
import utils from "./utils";

export default class Observer{
  constructor(val){
    utils(val,'__ob__',this,false);
    this.optionObj(val)//a , m ,c
  }

  optionObj(obj){
    for (const key in obj) {
      defineReactive(obj,key)
    }
  }
}

```

###defineReactive.js
```
import observe from "./observe";

export const defineReactive = function(data,key,val){
  if (arguments.length === 2) {
    val = data[key]
  }
  let childObj = observe(val)
  Object.defineProperty(data,key,{
    enumerable:true,
    configurable:true,
    get(){
      console.log('defineProperty'+ key + '被访问');
      return val
    },
    set(newValue){
      console.log('defineProperty'+ key + '被改变');
      val = newValue
      childObj = observe(newValue)
    }
  })
}

```

###observe.js
```
import Observer from './Observer';

export default function(obj) {
  if (typeof obj !== 'object') return; // d
  let ob;
  if (typeof obj.__ob__ !== 'undefined') {
    ob = obj.__ob__;
  } else {
    ob = new Observer(obj);
  }
  return ob;
}
```

![图片](./1648912998(1).jpg)
> 该图片来自于 coderwhy 的 https://www.bilibili.com/video/BV15741177Eh?p=232&spm_id_from=pageDriver 哔哩哔哩的231集


##添加 Dep(订阅者) 和 Watcher(观察者)

* 通过给Observer劫持data的每个属性添加上dep(订阅者实例)
* 当界面使用上data的属性后,就会给每个属性创建一个watcher(观察者实例)
* 因为data上的属性已经被劫持get和set 所以当界面上使用了data的属性后
* 就会触发属性上的get方法,从而将watcher(观察者实例)添加到dep(订阅者实例)的subs数组(用于存放watcher的数组)
    * 因为当watcher依赖本身去观察(收集)属性就会触发被劫持属性上的get方法,依赖本身就会被dep(订阅者实例)添加到subs数组上
    * 如设置一个全局唯一属性(依赖本身这里使用Dep.target)设置为this本身(watcher示例)
    * 然后触发get后dep实例就会把当前的全局唯一属性(watcher实例)添加到subs数组里面
    * 以便数据发生变化时然当前数据上的dep(订阅者实例)去遍历subs的watcher实例,调用update(相当于通知watcher数据发生变化)去更新视图
* 当数据发生改变时则会触发set方法,通过在set方法上调用当前数据的dep实例的notify()方法
    * 遍历subs数组 通知每一个watcher(观察者实例)去update(也就是更新视图操作);

------------------------------------------

####以下代码对于array的响应式也做了一定处理,但不做过多笔记了

###Dep.js
```
    export default class Dep{
      constructor(name){
        this.name = name
        this.subs = []
      }
      addSub(sub){
        this.subs.push(sub)
      }
      depend(){
        if (Dep.target) {
          this.addSub(Dep.target);
          console.log('添加订阅watcher',this);
        }
      }
      notify(){
        const subs = this.subs.slice();
        for (let i = 0, l = subs.length; i < l; i++) {
            subs[i].update();
        }
      }
    }
```
###Watcher.js

```
    import Dep from "./Dep";
    
    
    export default class Watcher {
      constructor(target, expression, callback) {
        this.target = target; //data
        this.getter = parsePath(expression); 
        this.callback = callback;
        this.value = this.get();
      }
      update() {
        this.run();
      }
      get() {
        // 进入依赖收集阶段。让全局的Dep.target设置为Watcher本身，那么就是进入依赖收集阶段
        Dep.target = this;
        const obj = this.target;
        var value;
    
        // 只要能找，就一直找
        try {
          value = this.getter(obj);
        } finally {
          Dep.target = null;
        }
    
        return value;
      }
      run() {
        this.getAndInvoke(this.callback);
      }
      getAndInvoke(cb) {
        const value = this.get();
    
        if (value !== this.value || typeof value == 'object') {
          const oldValue = this.value;
          this.value = value;
          cb.call(this.target, value, oldValue);
        }
      }
    };
    
    function parsePath(str) {
      var segments = str.split('.');
      //a,b,c,d
      return (obj) => {
        for (let i = 0; i < segments.length; i++) {
          if (!obj) return;
          obj = obj[segments[i]]
        }
        return obj;
      };
    }
```

###index.js

```
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
```

###Observer.js
```

import { defineReactive } from "./defineReactive";
import utils from "./utils";
import { arrayMethods } from './array'
import observe from "./observe";
import Dep from "./Dep";

export default class Observer{
  constructor(val,name){
    utils(val,'__ob__',this,false);
    this.name = name
    this.dep = new Dep(this.name);

    if (Array.isArray(val)) {
      Object.setPrototypeOf(val,arrayMethods)
    }else{
      this.optionObj(val)
    }
  }

  optionObj(obj){
    for (const key in obj) {
      defineReactive(obj,key)
    }
  }

  optionArr(arr){
    for (let i = 0,l = arr.length; i < l; i++) {
      observe(arr[i])
    }
  }
}

```

###array.js

```
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
```


###defineReactive.js
```
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
```

###observe.js

```
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
```

###utils.js

```
export default function(data,key,value,enumerable){
  Object.defineProperty(data,key,{
    value,
    enumerable,
  })
}
```