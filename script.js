window.JPC=(function(){
  "use strict";

  function yen(n){var neg=n<0;n=Math.round(Math.abs(n));var s="¥"+n.toLocaleString("en-US");return neg?"−"+s:s;}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function $(id){return document.getElementById(id);}

  /* ---- FY2026 forward tax model, shared by both calculators ---- */
  /* 2025 reform: ¥650,000 floor (was ¥550,000 up to ¥1,625,000) */
  function employmentDeduction(s){
    if(s<=1900000)return 650000;
    if(s<=3600000)return s*0.30+80000;
    if(s<=6600000)return s*0.20+440000;
    if(s<=8500000)return s*0.10+1100000;
    return 1950000;
  }
  function progressiveTax(base){
    var b=[[1950000,.05,0],[3300000,.10,97500],[6950000,.20,427500],
           [9000000,.23,636000],[18000000,.33,1536000],[40000000,.40,2796000],
           [Infinity,.45,4796000]];
    for(var i=0;i<b.length;i++){if(base<=b[i][0])return base*b[i][1]-b[i][2];}
    return 0;
  }
  /* Basic deduction by total income. National: 2025 reform, with the
     ¥880k/¥680k/¥630k middle tiers that apply to 2025-2026 only.
     Both phase out to zero above ¥25M. */
  function basicDeductionNational(inc){
    var b=[[1320000,950000],[3360000,880000],[4890000,680000],[6550000,630000],
           [23500000,580000],[24000000,480000],[24500000,320000],[25000000,160000]];
    for(var i=0;i<b.length;i++){if(inc<=b[i][0])return b[i][1];}
    return 0;
  }
  function basicDeductionResident(inc){
    if(inc<=24000000)return 430000;
    if(inc<=24500000)return 290000;
    if(inc<=25000000)return 150000;
    return 0;
  }
  /* Employee premiums stop at the top standard monthly remuneration grade:
     pension ¥650,000/mo, health ¥1,390,000/mo. Employment insurance is uncapped. */
  function employeeSocial(sal){
    var mo=sal/12;
    var pension=Math.min(mo,650000)*0.0915*12;
    var health=Math.min(mo,1390000)*0.05*12;
    return pension+health+sal*0.006;
  }
  function computeTax(sal,worker,firstYear,blueReturn){
    var isEmp=worker==="employee";
    var deduction=isEmp?employmentDeduction(sal):(blueReturn?650000:0);
    var taxable=Math.max(0,sal-deduction);
    var social;
    if(isEmp){social=employeeSocial(sal);}
    /* NHI is capped per household; ¥920,000 = medical + elderly-support maximums */
    else{social=(firstYear?50000:Math.min(sal*0.08,920000))+215040;}
    var incBase=Math.max(0,taxable-basicDeductionNational(taxable)-social);
    var incomeTax=Math.max(0,progressiveTax(incBase))*1.021;
    var resident=0;
    if(!firstYear){resident=Math.max(0,taxable-basicDeductionResident(taxable)-social)*0.10+5000;}
    var net=sal-social-incomeTax-resident;
    return {sal:sal,social:social,incomeTax:incomeTax,resident:resident,net:net,
      socialPct:sal>0?social/sal*100:0,incPct:sal>0?incomeTax/sal*100:0,resPct:sal>0?resident/sal*100:0};
  }

  /* ---- shared "you work as / situation" control wiring ---- */
  /* $ is passed in so callers can scope lookups (e.g. by id prefix) when
     more than one instance of these controls exists on the same page. */
  function wireWorkerSituation(state,render,$scoped){
    var find=$scoped||$;
    function setWorker(w){
      state.worker=w;
      find("wEmp").setAttribute("aria-pressed",w==="employee");
      find("wFree").setAttribute("aria-pressed",w==="freelancer");
      find("tBlue").classList.toggle("hidden",w!=="freelancer");
      if(w!=="freelancer"){state.blueReturn=false;find("tBlue").setAttribute("aria-pressed","false");}
      render();
    }
    find("wEmp").addEventListener("click",function(){setWorker("employee");});
    find("wFree").addEventListener("click",function(){setWorker("freelancer");});
    find("tFirst").addEventListener("click",function(){state.firstYear=!state.firstYear;this.setAttribute("aria-pressed",state.firstYear);render();});
    find("tBlue").addEventListener("click",function(){state.blueReturn=!state.blueReturn;this.setAttribute("aria-pressed",state.blueReturn);render();});
  }

  return {
    yen:yen,clamp:clamp,$:$,
    employmentDeduction:employmentDeduction,progressiveTax:progressiveTax,computeTax:computeTax,
    wireWorkerSituation:wireWorkerSituation
  };
})();
