/* Pure calculation functions. Works in browser (window.FlipCalc) and Node (module.exports) for tests. */
(function(root){
  function ebayFee(price, opt){
    // eBay final value fee is charged on the total amount of the sale (item + buyer-paid shipping + sales tax).
    opt = opt || {};
    var e = opt.ebay, total = price * (1 + (opt.taxRate||0)) + (opt.buyerShipping||0);
    if (price <= 0) return 0;
    var pct = e.rate * Math.min(total, e.threshold) + e.rateAbove * Math.max(0, total - e.threshold);
    var perOrder = total <= e.smallMax ? e.perOrderSmall : e.perOrderLarge;
    return round2(pct + perOrder);
  }
  function net(price, opt){ return price + (opt.buyerShipping||0) - ebayFee(price,opt) - (opt.shipOut||0); }
  function breakEven(cost, opt){
    // smallest sale price whose proceeds after eBay fees and outbound shipping cover cost
    var lo = 0, hi = Math.max(1, cost) * 3 + 100;
    while (net(hi,opt) < cost) hi *= 2;
    for (var i=0;i<60;i++){ var mid=(lo+hi)/2; if (net(mid,opt) >= cost) hi=mid; else lo=mid; }
    var p = Math.ceil(hi*100)/100;
    while (p > 0.01 && net(round2(p-0.01),opt) >= cost - 1e-9) p = round2(p-0.01); // fees round to cents
    return p;
  }
  function round2(n){ return Math.round(parseFloat((n*100).toFixed(6)))/100; } // avoids 20.275 -> 20.27 float error
  /* inp: {cardCost, rawValue, gradingFee, shipToGrader, returnShip, otherCosts, shipOut, buyerShipping, taxRate, ebay, grades:[{label,value,prob}], tierMax} */
  function analyze(inp){
    var opt = {ebay:inp.ebay, taxRate:inp.taxRate||0, buyerShipping:inp.buyerShipping||0, shipOut:inp.shipOut||0};
    var gradeCost = (inp.gradingFee||0) + (inp.shipToGrader||0) + (inp.returnShip||0) + (inp.otherCosts||0);
    var totalCost = (inp.cardCost||0) + gradeCost;
    var rawFees = inp.rawValue>0 ? ebayFee(inp.rawValue,opt) : 0;
    var rawProfit = inp.rawValue>0 ? round2(net(inp.rawValue,opt) - (inp.cardCost||0)) : null;
    var be = breakEven(totalCost, opt);
    var probSum = 0, ev = 0;
    var rows = (inp.grades||[]).filter(function(g){return g.value>0;}).map(function(g){
      var fees = ebayFee(g.value,opt), profit = round2(net(g.value,opt) - totalCost);
      if (g.prob>0){ probSum += g.prob; ev += g.prob*profit; }
      return {label:g.label, value:g.value, prob:g.prob||0, fees:fees, profit:profit,
              vsRaw: rawProfit===null?null:round2(profit-rawProfit),
              overTier: inp.tierMax ? g.value > inp.tierMax : false};
    });
    var expected = probSum>0 ? round2(ev/probSum) : null;
    var rec;
    if (!rows.length) rec = {level:'warn', text:'Enter at least one expected graded value.'};
    else {
      var cmp = expected!==null ? expected : rows[0].profit; // fall back to best listed grade
      var basis = expected!==null ? 'probability-weighted' : 'top-grade';
      if (rawProfit!==null && cmp <= rawProfit) rec = {level:'bad', text:'Sell raw. Your '+basis+' graded profit ('+fmt(cmp)+') does not beat selling raw ('+fmt(rawProfit)+').'};
      else if (cmp < 0) rec = {level:'bad', text:'Skip grading. The '+basis+' result is a loss of '+fmt(-cmp)+'.'};
      else if (rawProfit!==null && cmp - rawProfit < gradeCost*0.5) rec = {level:'warn', text:'Marginal. Grading adds only '+fmt(cmp-rawProfit)+' over selling raw for the risk and wait. Grade only if you are confident in the grade.'};
      else rec = {level:'good', text:'Grade it. The '+basis+' profit is '+fmt(cmp)+(rawProfit!==null?' vs '+fmt(rawProfit)+' selling raw':'')+'.'};
      if (expected===null) rec.text += ' Add grade odds for a more realistic answer.';
    }
    return {gradeCost:round2(gradeCost), totalCost:round2(totalCost), rawFees:rawFees, rawProfit:rawProfit, breakEven:be, rows:rows, expected:expected, rec:rec};
  }
  function fmt(n){ return (n<0?'-$':'$')+Math.abs(n).toFixed(2); }
  var api = {ebayFee:ebayFee, breakEven:breakEven, analyze:analyze};
  if (typeof module!=='undefined' && module.exports) module.exports = api; else root.FlipCalc = api;
})(this);
