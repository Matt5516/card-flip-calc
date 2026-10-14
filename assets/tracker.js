/* Grading turnaround tracker: estimated return date from posted business-day turnaround; stored in localStorage */
addEventListener('DOMContentLoaded',function(){ var $=UI.$, F=FEES, KEY='gof-subs';
  function tiers(){ var g=F.graders[$('ttG').value]; $('ttT').innerHTML=g.tiers.map(function(t,i){return '<option value="'+i+'">'+UI.esc(t.name)+'</option>';}).join(''); }
  function addBiz(date,days){ var d=new Date(date+'T12:00:00'), k=0; while(k<days){ d.setDate(d.getDate()+1); var w=d.getDay(); if(w&&w<6) k++; } return d; }
  function fmt(d){ return d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}); }
  function est(){ var g=F.graders[$('ttG').value], t=g.tiers[+$('ttT').value]; if(!t||!$('ttD').value){ $('ttEst').textContent='Pick a date to see the estimate.'; return null; }
    var due=addBiz($('ttD').value,t.days||30); $('ttEst').innerHTML='Estimated grades by <b>'+fmt(due)+'</b> ('+(t.days||30)+' business days, '+UI.esc(t.name)+').'; return {due:due,t:t}; }
  function list(){ var L=UI.store.get(KEY,[]), now=new Date();
    $('ttList').innerHTML=L.length?L.map(function(s,i){ var due=new Date(s.due), left=Math.ceil((due-now)/864e5), p=Math.min(100,Math.max(0,Math.round((now-new Date(s.start))/(due-new Date(s.start))*100)));
      return '<li><span><b>'+UI.esc(s.name||s.grader+' submission')+'</b><span class="hint" style="display:block">'+UI.esc(s.grader+' · '+s.tier)+' · due '+fmt(due)+'</span><span class="hint" style="display:block">'+(left>0?left+' days to go ('+p+'%)':'Past estimated date: check the grader\'s order status')+'</span></span><button type="button" class="icon-btn" data-rm="'+i+'" aria-label="Remove">✕</button></li>'; }).join(''):'<li class="hint">Nothing tracked yet.</li>'; }
  $('ttG').addEventListener('change',function(){ tiers(); est(); }); $('ttT').addEventListener('change',est); $('ttD').addEventListener('input',est);
  $('ttAdd').addEventListener('click',function(){ var e=est(); if(!e){ UI.toast('Pick the arrival date first'); return; } var L=UI.store.get(KEY,[]);
    L.push({name:$('ttN').value.trim(),grader:$('ttG').value,tier:e.t.name.replace(/\s*\(.*\)/,''),start:$('ttD').value+'T12:00:00',due:e.due.toISOString()}); UI.store.set(KEY,L); list(); UI.toast('Tracking saved in this browser'); });
  $('ttList').addEventListener('click',function(e){ var b=e.target.closest('[data-rm]'); if(!b) return; var L=UI.store.get(KEY,[]); L.splice(+b.dataset.rm,1); UI.store.set(KEY,L); list(); });
  $('ttD').value=new Date().toISOString().slice(0,10); tiers(); est(); list(); });
