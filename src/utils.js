export default function(data,key,value,enumerable){
  Object.defineProperty(data,key,{
    value,
    enumerable,
  })
}