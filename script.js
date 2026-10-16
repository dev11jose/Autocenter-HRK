const vehicles = [
  {id:1, client:"Davi Demarchi Escududeiro", model:"Honda Civic", plate:"ABC1D23", service:"Troca de óleo e filtros", status:"Aguardando aprovação", due:"Hoje, 15:00", price:680, phone:""},
  {id:2, client:"Lucca Kawassaki", model:"Volkswagen Polo", plate:"DEF4G56", service:"Revisão dos freios", status:"Em manutenção", due:"Hoje, 17:30", price:450, phone:""},
  {id:3, client:"Gustavo Kai", model:"Chevrolet Onix", plate:"GHI7J89", service:"Diagnóstico do motor", status:"Aguardando aprovação", due:"Amanhã, 10:00", price:1250, phone:""},
  {id:4, client:"Gustavo Oliveira de Santos", model:"Toyota Corolla", plate:"JKL2M34", service:"Suspensão dianteira", status:"Em manutenção", due:"Hoje, 16:00", price:890, phone:""},
  {id:5, client:"Daniel Kenzo", model:"Fiat Argo", plate:"NOP5Q67", service:"Substituição da bateria", status:"Pronto para retirada", due:"Concluído", price:520, phone:""},
  {id:6, client:"Felipe mogger", model:"Hyundai HB20", plate:"RST8U90", service:"Troca de pastilhas", status:"Aguardando peças", due:"Amanhã, 14:00", price:390, phone:""}
];
let nextId = 7;
let activeView = "dashboard";
const $ = (id) => document.getElementById(id);
const brl = (n) => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const statusClass = (s) => ({
  "Aguardando aprovação":"status-pending",
  "Em manutenção":"status-progress",
  "Aguardando peças":"status-parts",
  "Pronto para retirada":"status-ready"
}[s] || "status-progress");

function toast(message){
  const el=$("toast"); el.textContent=message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2800);
}
function vehicleRow(v){
  return `<tr>
    <td><div class="vehicle-cell"><div class="car-icon">🚘</div><div><strong>${escapeHtml(v.model)}</strong><span>${escapeHtml(v.client)} · ${escapeHtml(v.plate)}</span></div></div></td>
    <td>${escapeHtml(v.service)}</td><td><span class="status ${statusClass(v.status)}">${escapeHtml(v.status)}</span></td><td>${escapeHtml(v.due)}</td>
    <td><button class="more-btn" title="Atualizar status" aria-label="Atualizar status de ${escapeHtml(v.model)}" data-status-id="${v.id}">⋯</button></td>
  </tr>`;
}
function escapeHtml(value){
  return String(value ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function renderRows(target, query="", status="all"){
  const q=query.trim().toLowerCase();
  const list=vehicles.filter(v=>(status==="all"||v.status===status) && [v.client,v.model,v.plate,v.service].some(x=>x.toLowerCase().includes(q)));
  $(target).innerHTML=list.length?list.map(vehicleRow).join():`<tr><td colspan="5"><div class="empty-state">Nenhum veículo encontrado com esses filtros.</div></td></tr>`;
}
function pendingVehicles(){return vehicles.filter(v=>v.status==="Aguardando aprovação")}
function approvalCard(v, compact=false){
  return `<article class="approval-item">
    <div class="approval-title"><strong>${escapeHtml(v.model)} · ${escapeHtml(v.plate)}</strong><span>${escapeHtml(v.client)}</span></div>
    <p>${escapeHtml(v.service)}${compact?"":`<br>Orçamento demonstrativo para peças e mão de obra.`}</p>
    <div class="approval-bottom"><div class="money">${brl(v.price)} <small>estimado</small></div>
      <div><button class="approve-btn" data-approve="${v.id}">✓ Aprovar</button> <button class="reject-btn" data-reject="${v.id}">Recusar</button></div>
    </div>
  </article>`;
}
function renderApprovals(){
  const pending=pendingVehicles();
  $("approvalList").innerHTML=pending.length?pending.map(v=>approvalCard(v,true)).join():`<div class="empty-state">Tudo certo! Não há orçamentos pendentes.</div>`;
  $("budgetPageList").innerHTML=pending.length?pending.map(v=>approvalCard(v,false)).join():`<div class="empty-state">Não há orçamentos pendentes no momento.</div>`;
  $("pendingCount").textContent=`${pending.length} pendente${pending.length===1?"":"s"}`;
  $("pendingNav").textContent=pending.length;
}
function updateStats(){
  $("statVehicles").textContent=vehicles.length;
  $("statPending").textContent=vehicles.filter(v=>v.status==="Aguardando aprovação").length;
  $("statProgress").textContent=vehicles.filter(v=>v.status==="Em manutenção").length;
  $("statReady").textContent=vehicles.filter(v=>v.status==="Pronto para retirada").length;
}
function render(){
  renderRows("vehicleRows",$("searchInput").value,$("statusFilter").value);
  renderRows("vehicleRows2",$("searchInput2").value,$("statusFilter2").value);
  renderApprovals(); updateStats();
}
function go(view){
  activeView=view;
  ["dashboard","vehicles","budgets"].forEach(v=>$(v+"View").classList.toggle("hidden",v!==view));
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $("crumb").textContent=({dashboard:"Visão geral",vehicles:"Veículos",budgets:"Orçamentos"})[view];
  if(view==="vehicles") renderRows("vehicleRows2",$("searchInput2").value,$("statusFilter2").value);
}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
$("searchInput").addEventListener("input",()=>renderRows("vehicleRows",$("searchInput").value,$("statusFilter").value));
$("statusFilter").addEventListener("change",()=>renderRows("vehicleRows",$("searchInput").value,$("statusFilter").value));
$("searchInput2").addEventListener("input",()=>renderRows("vehicleRows2",$("searchInput2").value,$("statusFilter2").value));
$("statusFilter2").addEventListener("change",()=>renderRows("vehicleRows2",$("searchInput2").value,$("statusFilter2").value));

document.addEventListener("click",e=>{
  const approve=e.target.closest("[data-approve]");
  const reject=e.target.closest("[data-reject]");
  const status=e.target.closest("[data-status-id]");
  if(approve){
    const v=vehicles.find(x=>x.id===Number(approve.dataset.approve));
    if(v){v.status="Em manutenção";toast(`Orçamento de ${v.model} aprovado (simulação).`);render();}
  }else if(reject){
    const v=vehicles.find(x=>x.id===Number(reject.dataset.reject));
    if(v){v.status="Aguardando aprovação";toast("A recusa seria registrada aqui. No protótipo, o status continua pendente.");}
  }else if(status){
    const v=vehicles.find(x=>x.id===Number(status.dataset.statusId));
    if(v){
      const options=["Aguardando aprovação","Em manutenção","Aguardando peças","Pronto para retirada"];
      const current=options.indexOf(v.status);
      v.status=options[(current+1)%options.length];
      toast(`Status atualizado para: ${v.status}`);
      render();
    }
  }
});
const dialog=$("vehicleDialog");
function openDialog(){dialog.showModal()}
$("newVehicleBtn").addEventListener("click",openDialog);
$("newVehicleBtn2").addEventListener("click",openDialog);
$("closeDialog").addEventListener("click",()=>dialog.close());
$("cancelDialog").addEventListener("click",()=>dialog.close());
$("vehicleForm").addEventListener("submit",e=>{
  e.preventDefault();
  const f=new FormData(e.currentTarget);
  vehicles.unshift({id:nextId++,client:f.get("client"),phone:f.get("phone"),model:f.get("model"),plate:f.get("plate").toUpperCase(),service:f.get("service"),status:f.get("status"),due:f.get("due")||"A definir",price:0});
  e.currentTarget.reset();dialog.close();render();toast("Veículo cadastrado com sucesso.");go("vehicles");
});
$("today").textContent=new Intl.DateTimeFormat("pt-BR",{weekday:"short",day:"2-digit",month:"short"}).format(new Date());
render();
