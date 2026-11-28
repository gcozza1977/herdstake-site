(function(){
  var D=null, IDX=null;
  var ST={AL:1,AK:1,AZ:1,AR:1,CA:1,CO:1,CT:1,DE:1,DC:1,FL:1,GA:1,HI:1,ID:1,IL:1,IN:1,IA:1,KS:1,KY:1,LA:1,ME:1,MD:1,MA:1,MI:1,MN:1,MS:1,MO:1,MT:1,NE:1,NV:1,NH:1,NJ:1,NM:1,NY:1,NC:1,ND:1,OH:1,OK:1,OR:1,PA:1,RI:1,SC:1,SD:1,TN:1,TX:1,UT:1,VT:1,VA:1,WA:1,WV:1,WI:1,WY:1};
  var FULL={alabama:'AL',alaska:'AK',arizona:'AZ',arkansas:'AR',california:'CA',colorado:'CO',connecticut:'CT',delaware:'DE','district of columbia':'DC',florida:'FL',georgia:'GA',hawaii:'HI',idaho:'ID',illinois:'IL',indiana:'IN',iowa:'IA',kansas:'KS',kentucky:'KY',louisiana:'LA',maine:'ME',maryland:'MD',massachusetts:'MA',michigan:'MI',minnesota:'MN',mississippi:'MS',missouri:'MO',montana:'MT',nebraska:'NE',nevada:'NV','new hampshire':'NH','new jersey':'NJ','new mexico':'NM','new york':'NY','north carolina':'NC','north dakota':'ND',ohio:'OH',oklahoma:'OK',oregon:'OR',pennsylvania:'PA','rhode island':'RI','south carolina':'SC','south dakota':'SD',tennessee:'TN',texas:'TX',utah:'UT',vermont:'VT',virginia:'VA',washington:'WA','west virginia':'WV',wisconsin:'WI',wyoming:'WY'};
  function norm(s){return s.normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\b(county|parish|borough|co\.?)\b/g,'').replace(/^st\.?\s/,'saint ').replace(/[^a-z]/g,'');}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function fmt(d){var m=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];var p=d.split('-');return m[+p[1]-1]+' '+(+p[2])+', '+p[0];}
  function build(){IDX={};for(var g in D.names){var n=D.names[g],i=n.lastIndexOf(', ');var c=n.slice(0,i),st=n.slice(i+2);IDX[st+'|'+norm(c)]=g;IDX[st+'|'+norm(c.replace(/^St\.? /,'Saint '))]=g;}}
  function parse(line){
    var parts=line.split(/[,\t]/).map(function(x){return x.trim();}).filter(Boolean);
    if(parts.length<2){var m=line.trim().match(/^(.*\S)\s+([A-Za-z]{2})$/);if(m)parts=[m[1],m[2]];else return null;}
    var st=parts[parts.length-1],stU=st.toUpperCase();
    if(!ST[stU]){stU=FULL[st.toLowerCase()]||null;}
    if(!stU)return null;
    return {county:parts[parts.length-2],st:stU,label:parts.slice(0,-2).join(', ')};
  }
  function hitText(g){var h=D.hits[g],out=[];
    if(h.z){out.push('Texas infested zone in part of the county'+(h.zd?' (latest TAHC order '+fmt(h.zd)+': <a href="'+esc(h.zu)+'">order PDF</a>)':' (see the <a href="https://www.tahc.texas.gov/emergency/nws.html">TAHC order list</a>)'));}
    if(h.d){out.push('confirmed detection on USDA’s list (data as of '+fmt(D.asof_det)+')');}
    return out.join('; ');}
  function rule(st){return st==='TX'?' Animals leaving a Texas zone need prior TAHC authorization, an inspection and a movement certificate (<a href="https://www.tahc.texas.gov/animal_health/feverticks-pests/pdf/EMGuide_NWS-LivestockMovement-InfestedZone.pdf">TAHC guide</a>).':' Movement rules follow the state animal health agency; zone maps are linked from <a href="https://www.aphis.usda.gov/animals/animal-health/livestock-and-poultry-disease/stop-screwworm/current-status">USDA’s current-status page</a>.';}
  function run(){
    var lines=document.getElementById('cc-in').value.split(/\n/).filter(function(l){return l.trim();}).slice(0,500);
    var rows=[];
    lines.forEach(function(l){
      var p=parse(l),r;
      if(!p){rows.push('<div class="row"><span>'+esc(l)+'</span><b>Write it as County, ST</b></div>');return;}
      var g=IDX[p.st+'|'+norm(p.county)];
      var name=(p.label?esc(p.label)+' · ':'')+esc(p.county.replace(/\s+county$/i,''))+', '+p.st;
      if(!g){rows.push('<div class="row"><span>'+name+'</span><b>County not found</b></div>');return;}
      if(D.hits[g]){r='<b style="color:#b4231a">In: detection or zone</b></div><div class="note" style="margin:0 0 10px">'+hitText(g)+'.'+(p.st==='TX'&&!D.hits[g].z?' TAHC’s current notice does not list a zone in this county.':rule(p.st))+'</div>';}
      else if(D.borders[g]){r='<b style="color:#a35a00">Borders one</b></div><div class="note" style="margin:0 0 10px">Next to '+D.borders[g].map(function(n){return esc(D.names[n])+' ('+hitText(n)+')';}).join('; ')+'.</div>';}
      else{r='<b class="good">Neither</b></div><div class="note" style="margin:0 0 10px">No detection or Texas zone in or next to this county as of the dates below.</div>';}
      rows.push('<div class="row"><span>'+name+'</span>'+r);
    });
    document.getElementById('cc-out').innerHTML=rows.join('')||'<p class="note">Type at least one county and state.</p>';
  }
  function go(){
    if(D){run();return;}
    document.getElementById('cc-out').innerHTML='<p class="note">Loading county data…</p>';
    fetch('/data/screwworm-counties.json').then(function(r){return r.json();}).then(function(j){D=j;build();run();}).catch(function(){document.getElementById('cc-out').innerHTML='<p class="note">Could not load the county data. Email your list to team@herdstake.com instead.</p>';});
  }
  document.addEventListener('DOMContentLoaded',function(){var b=document.getElementById('cc-go');if(b)b.addEventListener('click',go);});
})();
