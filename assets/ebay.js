/* eBay fee calculator page */
addEventListener('DOMContentLoaded',function(){ var $=UI.$,n=UI.num,m=UI.money;
  function r(){ var p=n('ebP'),t=n('ebT')/100,s=n('ebS'),b=n('ebB'),c=n('ebC'),f=FlipCalc.ebayFee(p,{ebay:FEES.ebay,taxRate:t,buyerShipping:b}),keep=p+b-f-s;
    $('ebOut').innerHTML='<div class="stats s3" style="margin:0"><div class="stat"><div class="k">eBay fee</div><div class="v">'+m(f)+'</div></div><div class="stat"><div class="k">You keep</div><div class="v pos">'+m(keep)+'</div></div><div class="stat"><div class="k">'+(c?'Profit':'Fee as % of price')+'</div><div class="v '+(c?UI.cls(keep-c):'')+'">'+(c?UI.signed(keep-c):(p?(f/p*100).toFixed(1)+'%':'—'))+'</div></div></div>'+
      '<p class="hint" style="margin:8px 0 0">13.25% of the total (price + buyer shipping + tax) up to $7,500, 2.35% above, plus $'+(p+b<=10?'0.30':'0.40')+' per order. Trading card category, standard seller.</p>';
    history.replaceState(null,'',UI.stateURL()); }
  UI.readState(); document.addEventListener('input',UI.debounce(r,30)); r(); UI.syncPresets(); });
