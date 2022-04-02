
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