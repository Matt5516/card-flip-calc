(function(){
  var F = window.FEES, $ = function(id){return document.getElementById(id);};
  var GRADES = [['10 (Gem Mint)',150,25],['9 (Mint)',80,45],['8 (NM-MT)',50,20],['7 or lower',30,10]];
  var tb = document.querySelector('#gradeInputs tbody');
  GRADES.forEach(function(g,i){
    var tr=document.createElement('tr');
    tr.innerHTML='<td>'+g[0]+'</td><td><input aria-label="Sale price grade '+g[0]+'" id="gv'+i+'" type="number" inputmode="decimal" min="0" step="0.01" value="'+g[1]+'"></td><td><input aria-label="Odds grade '+g[0]+'" id="gp'+i+'" type="number" inputmode="decimal" min="0" max="100" step="1" value="'+g[2]+'"></td>';
    tb.appendChild(tr);
  });
  Object.keys(F.graders).forEach(function(k){ $('company').add(new Option(k,k)); });
  function fillTiers(){
    var g=F.graders[$('company').value]; $('tier').innerHTML='';
    g.tiers.forEach(function(t,i){ $('tier').add(new Option(t.name+' — $'+t.fee.toFixed(2),i)); });
    pickTier();
  }
  function pickTier(){
    var g=F.graders[$('company').value], t=g.tiers[+$('tier').value];
    $('gradingFee').value=t.fee; $('tierNote').textContent=(t.maxValue?'Max declared value $'+t.maxValue.toLocaleString()+'. ':'')+g.note;
    run();
  }
  function run(){
    var g=F.graders[$('company').value], t=g.tiers[+$('tier').value]||{};
    var e=Object.assign({},F.ebay,{rate:Site.num('fvfRate')/100});
    var grades=GRADES.map(function(x,i){return {label:x[0],value:Site.num('gv'+i),prob:Site.num('gp'+i)/100};});
    var r=FlipCalc.analyze({cardCost:Site.num('cardCost'),rawValue:Site.num('rawValue'),gradingFee:Site.num('gradingFee'),shipToGrader:Site.num('shipToGrader'),returnShip:Site.num('returnShip'),otherCosts:Site.num('otherCosts'),shipOut:Site.num('shipOut'),taxRate:Site.num('taxRate')/100,ebay:e,grades:grades,tierMax:t.maxValue});
    var m=Site.money, h='<h2>Results</h2><div class="verdict '+r.rec.level+'"><strong>Recommendation:</strong> '+Site.esc(r.rec.text)+'</div>';
    h+='<div class="grid cols-3" style="margin-top:12px"><div><div class="hint">Total cost if graded</div><strong>'+m(r.totalCost)+'</strong></div><div><div class="hint">Break-even graded sale price</div><strong>'+m(r.breakEven)+'</strong></div><div><div class="hint">Profit selling raw</div><strong class="'+(r.rawProfit===null?'':Site.cls(r.rawProfit))+'">'+(r.rawProfit===null?'—':m(r.rawProfit))+'</strong></div></div>';
    h+='<div class="table-scroll" style="margin-top:12px"><table><thead><tr><th>Grade</th><th>Sale</th><th>eBay fees</th><th>Net profit</th><th>vs raw</th></tr></thead><tbody>';
    r.rows.forEach(function(x){ h+='<tr><td>'+Site.esc(x.label)+(x.overTier?' <span class="hint" title="Above this tier\'s max declared value; the grader may upcharge">⚠ tier</span>':'')+'</td><td>'+m(x.value)+'</td><td>'+m(x.fees)+'</td><td class="'+Site.cls(x.profit)+'">'+m(x.profit)+'</td><td class="'+(x.vsRaw===null?'':Site.cls(x.vsRaw))+'">'+(x.vsRaw===null?'—':m(x.vsRaw))+'</td></tr>'; });
    h+='</tbody></table></div>';
    if (r.expected!==null) h+='<p>Probability-weighted profit if graded: <strong class="'+Site.cls(r.expected)+'">'+m(r.expected)+'</strong></p>';
    if (r.rows.some(function(x){return x.overTier;})) h+='<p class="hint">⚠ One or more grade values exceed the selected tier\'s max declared value. Graders may move the card to a higher (more expensive) tier.</p>';
    $('results').innerHTML=h;
  }
  $('company').addEventListener('change',fillTiers); $('tier').addEventListener('change',pickTier);
  document.getElementById('tool').addEventListener('input',run);
  $('checked').textContent=F.checked;
  var ul=$('sourceList');
  Object.keys(F.graders).forEach(function(k){ var g=F.graders[k]; var li=document.createElement('li'); li.innerHTML='<strong>'+k+'</strong>: '+g.tiers.map(function(t){return Site.esc(t.name)+' $'+t.fee;}).join('; ')+'. '+Site.esc(g.note)+' Source: <a rel="nofollow noopener" href="'+g.url+'">'+g.url+'</a>'; ul.appendChild(li); });
  var li=document.createElement('li'); li.innerHTML='<strong>eBay</strong>: Trading Cards final value fee 13.25% of total sale up to $7,500 + 2.35% above; per-order fee $0.30 (≤$10) or $0.40. Insertion fees not included (first 250 listings/month free). Source: <a rel="nofollow noopener" href="'+F.ebay.url+'">'+F.ebay.url+'</a>'; ul.appendChild(li);
  fillTiers();
})();
