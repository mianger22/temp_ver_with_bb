// для внутренней отладки (для отладки в процессае разработки)
function cDebugger(isClear: boolean, val: any) {
  if (isClear) {
    console.clear();
  }
  
  console.log(`"${val}:"`, val);
}

export default cDebugger