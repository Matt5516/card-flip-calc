(function(){
  'use strict';
  var F=window.FEES, $=UI.$, n=UI.num, m=UI.money;
  var GRADES=[['10','Gem Mint',150,25],['9','Mint',80,45],['8','NM-MT',50,20],['7-','7 or lower',30,10]];
  var GCOL=['#059669','#0ea5e9','#f59e0b','#94a3b8'];
  var tb=$('gradeRows');
  GRADES.forEach(function(g,i){ var tr=document.createElement('tr'), up=!!$('gv'+i);
    tr.innerHTML='<th scope="row" style="text-align:left;text-transform:none;font-size:.9rem;color:var(--ink)">'+g[0]+' <span class="hint" style="display:inline">'+g[1]+'</span></th>'+
      '<td>'+(up?'<span class="hint">set above</span>':'<div class="money"><input aria-label="Sold price at grade '+g[0]+'" id="gv'+i+'" data-state type="number" inputmode="decimal" min="0" step="0.01" value="'+g[2]+'"></div>')+'</td>'+
      '<td style="width:96px"><div class="pct"><input aria-label="Odds of grade '+g[0]+'" id="gp'+i+'" data-state type="number" inputmode="decimal" min="0" max="100" step="1" value="'+g[3]+'"></div></td>';
    tb.appendChild(tr); });
  // Smart defaults: graded prices and cost follow the raw value until the user types their own
  var MULT={cardCost:1,gv0:3,gv1:1.3,gv2:0.9,gv3:0.6}, dirty={};
  var COND={perfect:[55,35,8,2],good:[25,45,20,10],worn:[5,25,40,30]};
  function follow(){ var r=n('rawValue'); Object.keys(MULT).forEach(function(k){ if(!dirty[k]&&$(k)) $(k).value=Math.round(r*MULT[k]*100)/100; }); }
  function setCond(){ var o=COND[$('cond').value]||COND.good; o.forEach(function(v,i){ $('gp'+i).value=v; }); }
  function lookup(){ var q=($('cardName').value||'').trim(), e=encodeURIComponent(q);
    $('lookup').innerHTML=q?['<a rel="nofollow noopener" target="_blank" href="https://www.ebay.com/sch/i.html?_nkw='+e+'&LH_Sold=1&LH_Complete=1">eBay sold (raw + graded)</a>',
      '<a rel="nofollow noopener" target="_blank" href="https://www.ebay.com/sch/i.html?_nkw='+encodeURIComponent(q+' PSA 10')+'&LH_Sold=1&LH_Complete=1">PSA 10 sold</a>',
      '<a rel="nofollow noopener" target="_blank" href="https://www.ebay.com/sch/i.html?_nkw='+encodeURIComponent(q+' PSA 9')+'&LH_Sold=1&LH_Complete=1">PSA 9 sold</a>',
      '<a rel="nofollow noopener" target="_blank" href="https://130point.com/sales/">130point sales search</a>',
      '<a rel="nofollow noopener" target="_blank" href="https://www.psacard.com/pop">PSA pop report</a>',
      '<a rel="nofollow noopener" target="_blank" href="https://www.gosgc.com/pop-report">SGC pop report</a>'].join(''):'<span class="hint">Type a card name. Get sold-price and pop-report links.</span>'; }
  // Saved cards (this browser only)
  var SKEY='gof-saved';
  function renderSaved(){ var L=UI.store.get(SKEY,[]), box=$('saved'); if(!box) return;
    box.innerHTML=L.length?'<h2 id="savedH" style="font-size:1.05rem">Saved cards ('+L.length+')</h2><ul class="list-plain">'+L.map(function(c,i){ return '<li><a href="'+UI.esc(c.url)+'">'+UI.esc(c.name||'Card')+'</a><span><span class="badge '+(c.level||'')+'">'+UI.esc(c.word||'')+'</span> <button type="button" class="icon-btn" data-del="'+i+'" aria-label="Remove '+UI.esc(c.name||'card')+'">✕</button></span></li>'; }).join('')+'</ul><p class="hint">Send them all to the <a href="../bulk-planner/">bulk planner</a>.</p>':''; }
  function grader(){ return F.graders[$('company').value]||F.graders.PSA; }
  function fillTiers(keep){
    var g=grader(), sel=$('tier'), prev=keep?sel.value:'auto';
    sel.innerHTML='<option value="auto">Auto: cheapest tier that covers this card</option>';
    g.tiers.forEach(function(t,i){ sel.add(new Option(t.name+' · $'+t.fee.toFixed(2)+(t.maxValue?' · up to $'+t.maxValue.toLocaleString():''),String(i))); });
    sel.value = (prev==='auto'||g.tiers[+prev]) ? prev : 'auto';
  }
  function declared(){ var v=n('rawValue'); for(var i=0;i<4;i++) v=Math.max(v,n('gv'+i)); return v; }
  function currentTier(){
    var g=grader(), sel=$('tier').value, cards=Math.max(1,Math.round(n('cards')));
    if (sel==='auto'){ var a=FlipCalc.autoTier(g,declared(),cards); return a?a.tier:null; }
    return g.tiers[+sel];
  }
  var lastTierKey='';
  function ebayCfg(){ var mk=$('market').value, e=Object.assign({},F.ebay,{rate:n('fvfRate')/100});
    if (mk!=='ebay'){ e.noPerOrder=true; e.rateAbove=e.rate; } return e; }
  function inputsBase(fee,tierMax){
    var cards=Math.max(1,Math.round(n('cards')));
    return {cardCost:n('cardCost'),rawValue:n('rawValue'),gradingFee:fee,shipToGrader:n('orderShip')/cards,returnShip:n('returnShip')/cards,otherCosts:n('otherCosts'),shipOut:n('shipOut'),taxRate:n('taxRate')/100,ebay:ebayCfg(),tierMax:tierMax,
      grades:GRADES.map(function(g,i){return {label:g[0]==='7-'?'7 or lower':'Grade '+g[0],short:g[0],value:n('gv'+i),prob:n('gp'+i)/100};})};
  }
  function validate(){
    var errs=[]; document.querySelectorAll('#form input[type=number]').forEach(function(el){ var bad=el.value!==''&&(+el.value<0||!isFinite(+el.value)); el.setAttribute('aria-invalid',bad?'true':'false'); if(bad) errs.push(el); });
    return errs;
  }
  var lastSummary='', lastRec=null;
  function run(){
    var g=grader(), t=currentTier(), cards=Math.max(1,Math.round(n('cards')));
    var key=$('company').value+'|'+$('tier').value+'|'+(t?t.name:'');
    if (key!==lastTierKey){ lastTierKey=key; $('gradingFee').value=t?t.fee:''; }
    $('tierNote').textContent = t ? ((t.days?'About '+t.days+' business days. ':'')+(t.maxValue?'Max declared value $'+t.maxValue.toLocaleString()+'. ':'No value cap listed. ')+g.note) : 'No '+$('company').value+' tier covers a card worth '+m(declared(),true)+'. Pick a tier yourself or try another grader.';
    var sum=0; for(var i=0;i<4;i++) sum+=n('gp'+i); $('oddsSum').textContent='They add up to '+Math.round(sum)+'%'+(Math.round(sum)!==100?' (we scale them to 100%).':'.');
    var R=$('results'), errs=validate();
    if (errs.length){ R.innerHTML='<div class="alert err">'+UI.icon('alert')+'<div>Fix the highlighted fields. Numbers can’t be negative.</div></div>'; return; }
    if (!(n('gv0')||n('gv1')||n('gv2')||n('gv3'))){ R.innerHTML='<div class="empty">'+UI.icon('card')+'<p><strong>Add graded sold prices</strong><br>Enter what a 10, 9, 8 and 7 sell for. Your profit shows up here.</p></div>'; return; }
    var fee=$('gradingFee').value===''?(t?t.fee:0):n('gradingFee');
    var base=inputsBase(fee,t?t.maxValue:null), r=FlipCalc.analyze(base);
    var need=FlipCalc.topGradeOddsNeeded(r.rows, r.rawProfit===null?0:r.rawProfit), win=FlipCalc.lowestWinningGrade(r.rows,r.rawProfit);
    var icon=r.rec.level==='good'?'check':r.rec.level==='bad'?'x':'alert';
    var h='<h2>'+UI.icon('chart')+'Your result</h2>';
    h+='<div class="verdict '+r.rec.level+'"><span class="vicon">'+UI.icon(icon)+'</span><div><strong class="big">'+UI.esc(r.rec.word||'')+'</strong><span>'+UI.esc(r.rec.text)+'</span></div></div>';
    h+='<div class="stats s3">'+
      stat('Expected profit if graded', r.expected!==null?UI.signed(r.expected):'—', r.expected)+
      stat('Profit selling raw', r.rawProfit!==null?UI.signed(r.rawProfit):'—', r.rawProfit)+
      stat('Total cost if graded', m(r.totalCost))+
      stat('Break-even graded sale', m(r.breakEven))+
      stat('Odds of a 10 needed', need===null?'Not reachable':need+'%')+
      stat('Lowest grade that wins', win?win.label.replace('Grade ',''):'None')+'</div>';
    h+=UI.bars(r.rows.map(function(x,i){return {label:x.short,value:x.profit};}).concat(r.rawProfit!==null?[{label:'Raw',value:r.rawProfit,color:'var(--muted)'}]:[]),{label:'Net profit by grade compared with selling raw',fmt:function(v){return UI.short(v);}});
    h+='<div class="table-scroll"><table><caption class="sr-only">Profit at each grade</caption><thead><tr><th scope="col">Grade</th><th scope="col">Sale</th><th scope="col">Fees</th><th scope="col">Profit</th><th scope="col">vs raw</th></tr></thead><tbody>';
    r.rows.forEach(function(x){ h+='<tr><td>'+UI.esc(x.label)+(x.overTier?' <span class="badge warn" title="Above the tier\'s max declared value, so expect an upcharge">upcharge risk</span>':'')+'</td><td>'+m(x.value)+'</td><td>'+m(x.fees)+'</td><td class="'+UI.cls(x.profit)+'">'+UI.signed(x.profit)+'</td><td class="'+(x.vsRaw===null?'':UI.cls(x.vsRaw))+'">'+(x.vsRaw===null?'—':UI.signed(x.vsRaw))+'</td></tr>'; });
    h+='</tbody></table></div>';
    // grader comparison
    var cmp=FlipCalc.compareGraders(Object.assign({},base),F,declared(),cards);
    h+='<h3 style="margin-top:18px">Best grader for this card</h3><p class="hint" style="margin-top:0">Each company at its cheapest open tier for a card worth '+m(declared(),true)+'.</p><div class="table-scroll"><table><thead><tr><th scope="col">Grader</th><th scope="col">Tier</th><th scope="col">Fee</th><th scope="col">Days</th><th scope="col">Expected</th></tr></thead><tbody>';
    cmp.forEach(function(c,i){ if(!c.available){ h+='<tr><td>'+c.grader+'</td><td colspan="4" style="text-align:right"><span class="badge">no tier covers this value</span></td></tr>'; return; }
      var ev=c.expected!==null?c.expected:c.top; h+='<tr class="'+(i===0?'best':'')+'"><td><strong>'+c.grader+'</strong>'+(i===0?' <span class="badge good">best</span>':'')+'</td><td>'+UI.esc(c.tier.name.replace(/\s*\(.*\)/,''))+'</td><td>'+m(c.tier.fee)+'</td><td>'+(c.tier.days||'—')+'</td><td class="'+UI.cls(ev)+'">'+UI.signed(ev)+'</td></tr>'; });
    h+='</tbody></table></div><p class="hint">Same sale prices for every company. PSA slabs often sell for more, so adjust the prices when you compare.</p>';
    if (r.rows.some(function(x){return x.overTier;})) h+='<div class="alert">'+UI.icon('alert')+'<div>Some grade values top this tier\'s max declared value. The grader may bump the card up a tier and bill you the difference.</div></div>';
    h+='<div class="actions"><button type="button" class="btn sm" id="saveBtn">'+UI.icon('check')+'Save card</button><button type="button" class="btn ghost sm" data-print>'+UI.icon('copy')+'Print / PDF</button><button type="button" class="btn sm" id="shareBtn">'+UI.icon('share')+'Share result</button><button type="button" class="btn ghost sm" id="copyBtn">'+UI.icon('copy')+'Copy summary</button><button type="button" class="btn ghost sm" id="linkBtn">'+UI.icon('link')+'Copy link</button></div>';
    R.innerHTML=h; lastRec=r.rec;
    lastSummary='Card grading check ('+$('company').value+(t?' '+t.name.replace(/\s*\(.*\)/,''):'')+'): '+(r.rec.word||'')+'. '+
      'Paid '+m(n('cardCost'))+', raw '+m(n('rawValue'))+'. Total cost if graded '+m(r.totalCost)+', break-even '+m(r.breakEven)+'. '+
      r.rows.map(function(x){return x.label+': '+UI.signed(x.profit);}).join(', ')+'. '+(r.expected!==null?'Expected '+UI.signed(r.expected)+' vs raw '+UI.signed(r.rawProfit||0)+'. ':'');
    history.replaceState(null,'',UI.stateURL({fee: $('gradingFee').value!==String(t?t.fee:'')?$('gradingFee').value:''}));
  }
  function stat(k,v,num){ return '<div class="stat"><div class="k">'+k+'</div><div class="v'+(num!==undefined&&num!==null?' '+UI.cls(num):'')+'">'+v+'</div></div>'; }
  // events
  var go=UI.debounce(run,40);
  $('form').addEventListener('input',function(e){ var id=e.target.id; if(MULT[id]) dirty[id]=1; if(id==='rawValue'){ follow(); var an=$('autoNote'); if(an) an.hidden=dirty.gv0&&dirty.gv1; } if(/^gp/.test(id)) dirty.gp=1; if(id==='cardName') lookup(); go(); });
  $('cond').addEventListener('change',function(){ setCond(); run(); });
  $('company').addEventListener('change',function(){ fillTiers(false); lastTierKey=''; run(); });
  $('tier').addEventListener('change',function(){ lastTierKey=''; run(); });
  $('market').addEventListener('change',function(){ var mk=$('market').value; $('fvfRate').value = mk==='ebay'?'13.25':mk==='local'?'0':$('fvfRate').value; run(); });
  $('resetBtn').addEventListener('click',function(){ location.href=location.pathname; });
  document.addEventListener('click',function(e){
    if (e.target.closest('#shareBtn')) UI.share(location.href,'Is it worth grading?',lastSummary);
    if (e.target.closest('#copyBtn')) UI.copy(lastSummary+' '+location.href,'Summary copied');
    if (e.target.closest('#linkBtn')) UI.copy(location.href,'Link copied');
    if (e.target.closest('#saveBtn')){ var L=UI.store.get(SKEY,[]); var nm=($('cardName').value||'').trim()||('Card raw '+m(n('rawValue')));
      L=L.filter(function(c){return c.name!==nm;}); L.unshift({name:nm,url:location.href,raw:n('rawValue'),ten:n('gv0'),nine:n('gv1'),odds10:n('gp0'),word:lastRec&&lastRec.word,level:lastRec&&lastRec.level,date:new Date().toISOString().slice(0,10)});
      UI.store.set(SKEY,L.slice(0,50)); renderSaved(); UI.toast('Saved in this browser'); }
    var del=e.target.closest('[data-del]'); if(del){ var L2=UI.store.get(SKEY,[]); L2.splice(+del.dataset.del,1); UI.store.set(SKEY,L2); renderSaved(); }
  });
  // fee reference tables + sources
  var ft='';
  Object.keys(F.graders).forEach(function(k){ var g=F.graders[k]; ft+='<h3>'+k+'</h3><div class="table-scroll"><table><thead><tr><th scope="col">Tier</th><th scope="col">Fee</th><th scope="col">Max value</th><th scope="col">Est. days</th></tr></thead><tbody>'+
    g.tiers.map(function(t){return '<tr><td>'+UI.esc(t.name.replace(/\s*\(.*\)/,''))+'</td><td>'+m(t.fee)+'</td><td>'+(t.maxValue?'$'+t.maxValue.toLocaleString():'—')+'</td><td>'+(t.days||'—')+'</td></tr>';}).join('')+'</tbody></table></div><p class="hint">'+UI.esc(g.note)+'</p>'; });
  if($('feeTables')) $('feeTables').innerHTML=ft;
  var sl=Object.keys(F.graders).map(function(k){return '<li><strong>'+k+'</strong>: <a rel="nofollow noopener" href="'+F.graders[k].url+'">'+F.graders[k].url.replace(/^https?:\/\//,'')+'</a></li>';}).join('');
  sl+='<li><strong>eBay selling fees</strong>: <a rel="nofollow noopener" href="'+F.ebay.url+'">ebay.com/help/selling/fees-credits-invoices/selling-fees</a>. Trading cards 13.25% up to $7,500, 2.35% above, plus $0.30/$0.40 per order.</li>';
  if($('sourceList')) $('sourceList').innerHTML=sl;
  // init: URL state then render
  var st=UI.readState(); Object.keys(MULT).concat(['gv2','gv3']).forEach(function(k){ if(st.params.has(k)) dirty[k]=1; });
  ['gp0','gp1','gp2','gp3'].forEach(function(k){ if(st.params.has(k)) dirty.gp=1; });
  if(!dirty.gp && st.params.has('cond')) setCond(); lookup(); renderSaved(); fillTiers(true); if (st.params.has('tier')) $('tier').value=st.params.get('tier');
  UI.segs(); UI.syncSegs();
  if (st.params.has('fee')){ run(); $('gradingFee').value=st.params.get('fee'); }
  run();
})();
