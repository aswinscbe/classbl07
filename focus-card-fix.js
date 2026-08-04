(()=>{
  const ensureVisible=()=>{
    const card=document.getElementById('focusCard');
    if(!card)return;

    card.style.visibility='visible';
    card.style.opacity='1';

    try{
      if(typeof window.renderFocus==='function') window.renderFocus();
      else if(typeof renderFocus==='function') renderFocus();
    }catch(error){
      console.error('Focus card render failed',error);
    }

    const hasUsefulContent=card.textContent.trim().length>0;
    if(!hasUsefulContent){
      card.innerHTML='<div class="focusStage"><span class="focusState"><i></i>Schedule</span><h2>Loading your next class…</h2><p class="focusMeta">Your schedule is available below while this card refreshes.</p></div>';
    }

    card.querySelectorAll('*').forEach(node=>{
      node.style.visibility='visible';
      node.style.opacity='1';
    });
  };

  const start=()=>{
    ensureVisible();
    setTimeout(ensureVisible,250);
    setTimeout(ensureVisible,1000);
    setTimeout(ensureVisible,2500);
    setInterval(ensureVisible,30000);
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
