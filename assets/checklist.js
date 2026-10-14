/* Printable submission checklist with progress saved in localStorage */
addEventListener('DOMContentLoaded',function(){ var KEY='gof-check', ITEMS=[
 'Run every card through the grading calculator or bulk planner; keep only “Grade it” cards',
 'Look up recent sold prices (eBay sold, 130point) for raw, 9 and 10',
 'Check centering, corners, edges and surface under a bright light',
 'Pick the grader and the cheapest tier whose max value covers each card’s graded value',
 'Create or log in to the grader account and fill out the online submission form',
 'Write each card’s declared value on your list (avoid upcharges)',
 'Put each card in a fresh penny sleeve, then a semi-rigid holder (Card Saver)',
 'Team-bag or tape the holders; sandwich between cardboard; pack in a box, not an envelope',
 'Print the packing slip from the grader’s site and put it in the box',
 'Ship with tracking and insurance for the full declared value; save the receipt',
 'Add the submission to the turnaround tracker',
 'When grades post, pay return shipping and check every slab on arrival'];
 var st=UI.store.get(KEY,{}), ul=document.getElementById('clList');
 function draw(){ ul.innerHTML=ITEMS.map(function(t,i){ return '<li><input type="checkbox" id="cl'+i+'"'+(st[i]?' checked':'')+'><label for="cl'+i+'" class="'+(st[i]?'done':'')+'">'+t+'</label></li>'; }).join(''); }
 ul.addEventListener('change',function(e){ var i=+e.target.id.slice(2); st[i]=e.target.checked; UI.store.set(KEY,st); draw(); });
 document.getElementById('clReset').addEventListener('click',function(){ st={}; UI.store.set(KEY,st); draw(); }); draw(); });
