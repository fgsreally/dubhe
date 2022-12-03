export function isParent() {
  return self === top && window.__IS_DUBHE__
}


export function isChild(){
  return parent?.window.__IS_DUBHE__ ||false
}