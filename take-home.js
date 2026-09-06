(function(){
  "use strict";
  var yen=JPC.yen,clamp=JPC.clamp;
  function $(id){return document.getElementById("th-"+id);}

  var CATS=[
    {key:"rent",     name:"Rent",             min:0,max:300000,step:5000,presets:[50000,90000,160000]},
    {key:"food",     name:"Food & groceries", min:0,max:150000,step:2000,presets:[30000,50000,90000]},
    {key:"util",     name:"Utilities",        min:0,max:40000, step:1000,presets:[10000,15000,22000]},
    {key:"phone",    name:"Phone & internet", min:0,max:30000, step:1000,presets:[5000,10000,15000]},
    {key:"transport",name:"Transport",        min:0,max:40000, step:1000,presets:[5000,10000,20000]},
    {key:"leisure",  name:"Leisure & other",  min:0,max:200000,step:2500,presets:[15000,35000,70000]}
  ];
  var LIFE=[0,1,2];

  var state={salary:4500000,worker:"employee",firstYear:false,blueReturn:false,lifestyle:1,exp:{}};
  CATS.forEach(function(c){state.exp[c.key]=c.presets[1];});

  function compute(){return JPC.computeTax(state.salary,state.worker,state.firstYear,state.blueReturn);}
  function monthlyExpenses(){var t=0;CATS.forEach(function(c){t+=state.exp[c.key];});return t;}
  function presetAnnual(i){var t=0;CATS.forEach(function(c){t+=c.presets[i];});return t*12;}

  var expList=$("expList"),sumRow=expList.querySelector(".exp-sum");
  CATS.forEach(function(c){
    var w=document.createElement("div");w.className="exp";
    w.innerHTML=
      '<div class="exp-top"><span class="n">'+c.name+'</span><span class="v" id="th-v_'+c.key+'"></span></div>'+
      '<input type="range" class="slider" id="th-s_'+c.key+'" min="'+c.min+'" max="'+c.max+'" step="'+c.step+'" aria-label="'+c.name+' monthly cost">'+
      '<div class="exp-hint">¥'+c.presets[0].toLocaleString()+' – ¥'+c.presets[2].toLocaleString()+'</div>';
    expList.insertBefore(w,sumRow);
    w.querySelector("input").addEventListener("input",function(e){
      state.exp[c.key]=+e.target.value;state.lifestyle=-1;syncLife();render();
    });
  });

  var rangeBars=$("rangeBars");
  var LB=[{n:"Frugal",jp:"質素"},{n:"Standard",jp:"普通"},{n:"Comfortable",jp:"余裕"}];
  LIFE.forEach(function(_,i){
    var d=document.createElement("div");d.className="rbar";d.id="th-rb_"+i;
    d.innerHTML=
      '<div class="rbar-top"><span class="n"><b>'+LB[i].n+'</b> · '+LB[i].jp+'</span><span class="v" id="th-rbv_'+i+'"></span></div>'+
      '<div class="track"><div class="fill" id="th-rbf_'+i+'"></div></div>'+
      '<div class="rsub" id="th-rbs_'+i+'"></div>';
    rangeBars.appendChild(d);
  });

  function render(){
    var t=compute(),moExp=monthlyExpenses(),yrExp=moExp*12;
    var savings=t.net-yrExp,rate=t.net>0?savings/t.net*100:0;

    $("rSalary").textContent=yen(t.sal);
    $("rSocial").textContent="− "+yen(t.social);
    $("rIncome").textContent="− "+yen(t.incomeTax);
    $("rResident").textContent="− "+yen(t.resident);
    $("rNet").textContent=yen(t.net);
    $("rExpenses").textContent="− "+yen(yrExp);
    $("mSalary").textContent=yen(t.sal/12)+" /mo";
    $("mSocial").textContent="− "+yen(t.social/12)+" /mo";
    $("mIncome").textContent="− "+yen(t.incomeTax/12)+" /mo";
    $("mResident").textContent="− "+yen(t.resident/12)+" /mo";
    $("mNet").textContent=yen(t.net/12)+" /mo";
    $("mExpenses").textContent="− "+yen(moExp)+" /mo";
    $("rSocialPct").textContent=(state.worker==="employee"?"social insurance · ":"NHI + pension · ")+t.socialPct.toFixed(1)+"%";
    $("rIncPct").textContent="national + 2.1% · "+t.incPct.toFixed(1)+"%";
    $("rResPct").textContent=state.firstYear?"waived · first year":"local, 10% + ¥5,000";

    var big=$("rSavings");big.textContent=yen(savings);big.className="big "+(savings>=0?"pos":"neg");
    $("rSavingsMo").textContent=yen(savings/12)+" / month";
    var tag=$("rRate");
    tag.textContent=(savings<0?"over budget":Math.round(rate)+"% of take-home");
    tag.className="tag"+(savings<0?" neg":"");

    $("expTotal").textContent=yen(moExp);
    CATS.forEach(function(c){$("v_"+c.key).textContent=yen(state.exp[c.key]);$("s_"+c.key).value=state.exp[c.key];});

    var vals=LIFE.map(function(_,i){return t.net-presetAnnual(i);});
    var scale=Math.max(t.net,1);
    vals.forEach(function(v,i){
      $("rbv_"+i).textContent=yen(v);
      var f=$("rbf_"+i);
      f.style.width=clamp(Math.abs(v)/scale*100,0,100)+"%";
      f.className="fill"+(v<0?" neg":"");
      var r=t.net>0?v/t.net*100:0;
      $("rbs_"+i).textContent=(v<0?"over budget":Math.round(r)+"% of take-home")+" · "+yen(v/12)+"/mo";
      $("rb_"+i).classList.toggle("on",i===state.lifestyle);
    });

    $("salaryRange").value=state.salary;
  }

  var salaryText=$("salaryText");
  salaryText.addEventListener("input",function(){
    var n=clamp(parseInt(salaryText.value.replace(/[^\d]/g,"")||"0",10),0,20000000);
    state.salary=n;salaryText.value=n?n.toLocaleString("en-US"):"";render();
  });
  salaryText.addEventListener("blur",function(){salaryText.value=state.salary.toLocaleString("en-US");});
  $("salaryRange").addEventListener("input",function(e){state.salary=+e.target.value;salaryText.value=state.salary.toLocaleString("en-US");render();});

  JPC.wireWorkerSituation(state,render,$);

  function syncLife(){
    $("lFrugal").setAttribute("aria-pressed",state.lifestyle===0);
    $("lStandard").setAttribute("aria-pressed",state.lifestyle===1);
    $("lComfort").setAttribute("aria-pressed",state.lifestyle===2);
  }
  function setLife(i){state.lifestyle=i;CATS.forEach(function(c){state.exp[c.key]=c.presets[i];});syncLife();render();}
  $("lFrugal").addEventListener("click",function(){setLife(0);});
  $("lStandard").addEventListener("click",function(){setLife(1);});
  $("lComfort").addEventListener("click",function(){setLife(2);});

  render();
})();
