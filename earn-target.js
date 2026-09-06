(function(){
  "use strict";
  var yen=JPC.yen,clamp=JPC.clamp;
  function $(id){return document.getElementById("et-"+id);}

  var state={targetAnnualNet:4200000,mode:"month",worker:"employee",firstYear:false,blueReturn:false};

  /* ---- non-linear slider: cubic curve gives the low (entry-level) range most of the travel ---- */
  var CURVE=3;
  function maxForMode(){return state.mode==="month"?10000000:120000000;}
  function stepForMode(){return state.mode==="month"?10000:100000;}
  function posToVal(pos){var f=clamp(pos/1000,0,1);var st=stepForMode();return Math.round(maxForMode()*Math.pow(f,CURVE)/st)*st;}
  function valToPos(v){return Math.round(Math.pow(clamp(v/maxForMode(),0,1),1/CURVE)*1000);}

  function computeFor(sal){return JPC.computeTax(sal,state.worker,state.firstYear,state.blueReturn);}

  /* ---- invert: find gross that yields a target net (net is monotonic in gross) ---- */
  function requiredGross(targetNet){
    if(targetNet<=0)return 0;
    var lo=0,hi=500000000,mid;
    for(var i=0;i<60;i++){
      mid=(lo+hi)/2;
      if(computeFor(mid).net<targetNet)lo=mid;else hi=mid;
    }
    return Math.round(hi/10000)*10000;
  }

  function render(){
    var gross=requiredGross(state.targetAnnualNet);
    var b=computeFor(gross);
    var per=state.mode==="month"?"month":"year";
    var targetShown=state.mode==="month"?state.targetAnnualNet/12:state.targetAnnualNet;

    $("heroLabel").textContent="To take home "+yen(targetShown)+" / "+per+", you need";
    $("grossBig").textContent=yen(gross);
    $("grossMo").textContent=yen(gross/12)+" / month gross";
    var rate=gross>0?(gross-b.net)/gross*100:0;
    $("rate").textContent=Math.round(rate)+"% to tax & insurance";

    $("rGross").textContent=yen(gross);      $("mGross").textContent=yen(gross/12)+" /mo";
    $("rSocial").textContent="− "+yen(b.social);   $("mSocial").textContent="− "+yen(b.social/12)+" /mo";
    $("rIncome").textContent="− "+yen(b.incomeTax); $("mIncome").textContent="− "+yen(b.incomeTax/12)+" /mo";
    $("rResident").textContent="− "+yen(b.resident);$("mResident").textContent="− "+yen(b.resident/12)+" /mo";
    $("rNet").textContent=yen(b.net);        $("mNet").textContent=yen(b.net/12)+" /mo";

    $("rSocialPct").textContent=(state.worker==="employee"?"social insurance · ":"NHI + pension · ")+b.socialPct.toFixed(1)+"%";
    $("rIncPct").textContent="national + 2.1% · "+b.incPct.toFixed(1)+"%";
    $("rResPct").textContent=state.firstYear?"waived · first year":"local, 10% + ¥5,000";

    $("targetRange").value=valToPos(state.mode==="month"?state.targetAnnualNet/12:state.targetAnnualNet);
  }

  /* ---- wiring ---- */
  function setMode(m){
    state.mode=m;
    $("mMonth").setAttribute("aria-pressed",m==="month");
    $("mYear").setAttribute("aria-pressed",m==="year");
    var sl=$("targetRange");
    sl.min=0;sl.max=1000;sl.step=1;
    var disp=m==="month"?state.targetAnnualNet/12:state.targetAnnualNet;
    sl.value=valToPos(disp);
    $("targetText").value=Math.round(disp).toLocaleString("en-US");
    $("targetUnit").textContent=m==="month"?"/ month":"/ year";
    render();
  }
  $("mMonth").addEventListener("click",function(){setMode("month");});
  $("mYear").addEventListener("click",function(){setMode("year");});

  var tText=$("targetText");
  function setFromDisp(disp){
    var maxD=state.mode==="month"?10000000:120000000;
    disp=clamp(disp,0,maxD);
    state.targetAnnualNet=state.mode==="month"?disp*12:disp;
    return disp;
  }
  tText.addEventListener("input",function(){
    var disp=parseInt(tText.value.replace(/[^\d]/g,"")||"0",10);
    disp=setFromDisp(disp);
    tText.value=disp?disp.toLocaleString("en-US"):"";
    render();
  });
  tText.addEventListener("blur",function(){
    var disp=state.mode==="month"?state.targetAnnualNet/12:state.targetAnnualNet;
    tText.value=Math.round(disp).toLocaleString("en-US");
  });
  $("targetRange").addEventListener("input",function(e){
    var disp=setFromDisp(posToVal(+e.target.value));
    tText.value=Math.round(disp).toLocaleString("en-US");
    render();
  });

  JPC.wireWorkerSituation(state,render,$);

  render();
})();
