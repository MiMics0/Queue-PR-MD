var q = [
  {id:1,name:'สมชาย', role:'user',    st:'waiting'},
  {id:2,name:'สมหญิง',role:'operator',st:'waiting'},
  {id:3,name:'วิชัย', role:'user',    st:'waiting'},
  {id:4,name:'นภา',   role:'user',    st:'waiting'}
];
var nid=5, round=1;

function showToast(msg){
  var t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},2800);
}
function isOut(st){return st==='done'||st==='skip'||st==='away';}
function allFinished(){
  if(!q.length) return false;
  for(var i=0;i<q.length;i++) if(!isOut(q[i].st)) return false;
  return true;
}
function softReset(){
  round++;
  for(var i=0;i<q.length;i++) if(q[i].st!=='away') q[i].st='waiting';
  ensureActive();
  showToast('รอบที่ '+round+' เริ่มแล้ว');
  render();
}
function hardReset(){q=[];nid=1;round=1;render();}
function actIdx(){for(var i=0;i<q.length;i++) if(q[i].st==='active') return i; return -1;}
function ensureActive(){
  if(actIdx()===-1)
    for(var i=0;i<q.length;i++) if(q[i].st==='waiting'){q[i].st='active';break;}
}
function nextWaiting(){
  var c=actIdx(),s=c===-1?0:c+1;
  for(var i=s;i<q.length;i++) if(q[i].st==='waiting') return i;
  return -1;
}
function byId(id){for(var i=0;i<q.length;i++) if(q[i].id===id) return q[i]; return null;}
function idxOf(id){for(var i=0;i<q.length;i++) if(q[i].id===id) return i; return -1;}

function add(){
  var inp=document.getElementById('ni'),role=document.getElementById('rs').value,name=inp.value.trim();
  if(!name){inp.focus();return;}
  q.push({id:nid++,name:name,role:role,st:'waiting'});
  inp.value=''; ensureActive(); render();
}
function checkDone(id){
  var p=byId(id); if(!p) return;
  p.st='done';
  var n=nextWaiting(); if(n!==-1) q[n].st='active';
  if(allFinished()) setTimeout(softReset,600); else render();
}
function doSkip(id){
  var p=byId(id); if(!p) return;
  var wasA=p.st==='active'; p.st='skip';
  if(wasA){var n=nextWaiting();if(n!==-1) q[n].st='active';}
  if(allFinished()) setTimeout(softReset,600); else render();
}
function doAway(id){
  var p=byId(id); if(!p) return;
  var wasA=p.st==='active'; p.st='away';
  if(wasA){var n=nextWaiting();if(n!==-1) q[n].st='active';}
  if(allFinished()) setTimeout(softReset,600); else render();
}
function doBack(id){
  var p=byId(id); if(!p) return;
  p.st='waiting'; ensureActive(); render();
}
function doDelete(id){
  var i=idxOf(id); if(i===-1) return;
  var wasA=q[i].st==='active'; q.splice(i,1);
  if(wasA) for(var j=0;j<q.length;j++) if(q[j].st==='waiting'){q[j].st='active';break;}
  render();
}
function moveUp(id){
  var i=idxOf(id); if(i<=0) return;
  var t=q[i-1];q[i-1]=q[i];q[i]=t; ensureActive(); render();
}
function moveDown(id){
  var i=idxOf(id); if(i===-1||i>=q.length-1) return;
  var t=q[i+1];q[i+1]=q[i];q[i]=t; ensureActive(); render();
}

function badge(st){
  if(st==='waiting') return '<span class="badge badge-wait">รอ</span>';
  if(st==='active')  return '<span class="badge badge-active">กำลังดำเนิน</span>';
  if(st==='done')    return '<span class="badge badge-done">เสร็จแล้ว</span>';
  if(st==='skip')    return '<span class="badge badge-skip">ไม่ว่าง/ข้าม</span>';
  if(st==='away')    return '<span class="badge badge-away">ไม่ว่างยาว</span>';
  return '';
}

function render(){
  ensureActive();
  var tb=document.getElementById('qb'),em=document.getElementById('em');
  document.getElementById('roundLabel').innerHTML=round>1?'<span class="round-badge">รอบที่ '+round+'</span>':'';
  if(!q.length){tb.innerHTML='';em.style.display='block';return;}
  em.style.display='none';
  var rows='',n=0;
  for(var i=0;i<q.length;i++){
    var p=q[i];
    if(p.st==='waiting'||p.st==='active') n++;
    var rc=p.st==='active'?'row-active':p.st==='done'?'row-done':p.st==='skip'?'row-skip':p.st==='away'?'row-away':'';
    var rb=p.role==='operator'?'<span class="role-op">Operator</span>':'<span class="role-user">ทั่วไป</span>';
    var opNote=p.role==='operator'?'<span class="op-note">(ข้าม)</span>':'';
    var canMove=p.st==='waiting'||p.st==='active';
    var upDis=(!canMove||i===0)?' disabled':'';
    var dnDis=(!canMove||i===q.length-1)?' disabled':'';
    var arrows='<div class="move-col">'
      +'<button class="mbtn"'+upDis+' onclick="moveUp('+p.id+')">^</button>'
      +'<button class="mbtn"'+dnDis+' onclick="moveDown('+p.id+')">v</button>'
      +'</div>';
    var btns='';
    if(p.st==='active'){
      btns+='<button class="xbtn xbtn-check" onclick="checkDone('+p.id+')">เช็ค</button>';
      btns+='<button class="xbtn xbtn-skip" onclick="doSkip('+p.id+')">ไม่ว่าง</button>';
      btns+='<button class="xbtn xbtn-away" onclick="doAway('+p.id+')">ไม่ว่างยาว</button>';
    } else if(p.st==='waiting'){
      btns+='<button class="xbtn xbtn-skip" onclick="doSkip('+p.id+')">ไม่ว่าง</button>';
      btns+='<button class="xbtn xbtn-away" onclick="doAway('+p.id+')">ไม่ว่างยาว</button>';
    } else if(p.st==='skip'){
      btns+='<button class="xbtn xbtn-check" onclick="checkDone('+p.id+')">เสร็จแล้ว</button>';
      btns+='<button class="xbtn xbtn-away" onclick="doAway('+p.id+')">ไม่ว่างยาว</button>';
    } else if(p.st==='away'){
      btns+='<button class="xbtn xbtn-back" onclick="doBack('+p.id+')">กลับเข้าคิว</button>';
    }
    btns+='<button class="xbtn xbtn-del" onclick="doDelete('+p.id+')">ลบ</button>';
    var numD=isOut(p.st)?'-':n;
    rows+='<tr class="'+rc+'">'
      +'<td class="num">'+numD+'</td>'
      +'<td><span class="name-txt">'+p.name+'</span>'+opNote+'</td>'
      +'<td>'+rb+'</td>'
      +'<td>'+badge(p.st)+'</td>'
      +'<td><div class="acts">'+arrows+'<div class="sep"></div>'+btns+'</div></td>'
      +'</tr>';
  }
  tb.innerHTML=rows;
  var cW=0,cD=0,cS=0,cA=0;
  for(var i=0;i<q.length;i++){
    var s=q[i].st;
    if(s==='waiting')cW++; else if(s==='done')cD++; else if(s==='skip')cS++; else if(s==='away')cA++;
  }
  document.getElementById('stats').innerHTML=
    '<div class="stat">รอ: <b>'+cW+'</b></div>'+
    '<div class="stat">เสร็จ: <b>'+cD+'</b></div>'+
    '<div class="stat">ข้าม: <b>'+cS+'</b></div>'+
    '<div class="stat">ไม่ว่างยาว: <b>'+cA+'</b></div>'+
    '<div class="stat">ทั้งหมด: <b>'+q.length+'</b></div>';
}

document.addEventListener('DOMContentLoaded', function(){
  document.getElementById('ni').addEventListener('keydown',function(e){if(e.key==='Enter')add();});
  render();
});
