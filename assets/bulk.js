/* Bulk grading planner: one row per card, shared shipping split across the order, cheapest eligible tier per card. */
addEventListener('DOMContentLoaded', function(){
  var $=function(i){return document.getElementById(i);}, C=window.FlipCalc, F=window.FEES, rows=$('bkRows');
  var DEF=[['Rookie auto',80,400,150,30],['Base rookie',8,30,12,40],['Pokémon alt art',60,260,90,35]];
  function addRow(v){ v=v||['',0,0,0,30]; var tr=document.createElement('tr');
    tr.innerHTML='<td><input aria-label="Card name" value="'+UI.esc(v[0])+'" placeholder="Card"></td>'+[1,2,3].map(function(i){return '<td><input aria-label="'+['','Raw value','Price at 10','Price at 9'][i]+'" type="number" min="0" step="0.01" inputmode="decimal" value="'+v[i]+'"></td>';}).join('')+
      '<td><input aria-label="Odds of a 10 (%)" type="number" min="0" max="100" step="1" inputmode="decimal" value="'+v[4]+'"></td><td class="bk-v"></td><td><button type="button" class="icon-btn" aria-label="Remove card">✕</button></td>';
    tr.querySelector('button').onclick=function(){ tr.remove(); run(); }; rows.appendChild(tr); }
  function data(){ return [].map.call(rows.rows,function(tr){ var i=tr.querySelectorAll('input'); return [i[0].value,+i[1].value||0,+i[2].value||0,+i[3].value||0,+i[4].value||0]; }); }
  function run(){
    var d=data(), g=F.graders[$('bkG').value], n=Math.max(1,d.length), ship=(+$('bkShip').value||0)/n, out=+$('bkOut').value||0, tot={fee:0,grade:0,gain:0};
    d.forEach(function(v,i){ var cell=rows.rows[i].querySelector('.bk-v'), t=C.autoTier(g, Math.max(v[1],v[2],v[3]), n);
      if(!v[2]&&!v[3]){ cell.innerHTML='<span class="badge warn">Add prices</span>'; return; }
      if(!t){ cell.innerHTML='<span class="badge warn">No tier</span>'; return; }
      var p=v[4]/100, r=C.analyze({cardCost:v[1],rawValue:v[1],gradingFee:t.tier.fee,shipToGrader:ship/2,returnShip:ship/2,shipOut:out,ebay:F.ebay,tierMax:t.tier.maxValue,
        grades:[{label:'10',value:v[2],prob:p},{label:'9',value:v[3],prob:1-p}]});
      var go=r.expected!==null && (r.rawProfit===null || r.expected>r.rawProfit);
      cell.innerHTML='<span class="badge '+(go?'good':'bad')+'">'+(go?'Grade it':'Sell raw')+'</span><span class="hint" style="display:block">'+UI.money(t.tier.fee)+' · '+UI.signed(r.expected-(r.rawProfit||0))+'</span>';
      if(go){ tot.grade++; tot.fee+=t.tier.fee+ship; tot.gain+=r.expected-(r.rawProfit||0); } });
    $('bkSum').innerHTML='<div class="stat"><div class="k">Cards to send</div><div class="v">'+tot.grade+' of '+d.length+'</div></div><div class="stat"><div class="k">Grading + shipping</div><div class="v">'+UI.money(tot.fee,true)+'</div></div><div class="stat"><div class="k">Expected gain vs raw</div><div class="v '+(tot.gain>=0?'pos':'neg')+'">'+UI.signed(tot.gain)+'</div></div>';
    history.replaceState(null,'','?g='+$('bkG').value+'&s='+$('bkShip').value+'&c='+encodeURIComponent(JSON.stringify(d)));
  }
  var q=new URLSearchParams(location.search), init=DEF;
  try{ if(q.get('c')) init=JSON.parse(q.get('c')); }catch(e){}
  if(q.get('g')) $('bkG').value=q.get('g'); if(q.get('s')) $('bkShip').value=q.get('s');
  init.forEach(addRow); rows.addEventListener('input',UI.debounce(run,120)); ['bkG','bkShip','bkOut'].forEach(function(i){ $(i).addEventListener('input',run); });
  $('bkAdd').onclick=function(){ addRow(); run(); rows.rows[rows.rows.length-1].querySelector('input').focus(); };
  $('bkSaved').onclick=function(){ var L=UI.store.get('gof-saved',[]); if(!L.length){ UI.toast('No saved cards yet. Use Save card in the grading calculator.'); return; } L.forEach(function(c){ addRow([c.name,c.raw||0,c.ten||0,c.nine||0,c.odds10||25]); }); run(); UI.toast(L.length+' saved cards added'); };
  $('bkShare').onclick=function(){ UI.copy(location.href,'Link copied'); }; run();
});
