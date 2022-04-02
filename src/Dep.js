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