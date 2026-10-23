/* LibraryDesk frontend demo. Data is stored in this browser's localStorage, not in a server database. */
const DB = {
  get(key, fallback=[]) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};
function seedData() {
  if (!localStorage.getItem("lm_books")) DB.set("lm_books", [
    {id:1,title:"The Alchemist",author:"Paulo Coelho",category:"Fiction",qty:5},
    {id:2,title:"Clean Code",author:"Robert C. Martin",category:"Technology",qty:3},
    {id:3,title:"A Brief History of Time",author:"Stephen Hawking",category:"Science",qty:4}
  ]);
  if (!localStorage.getItem("lm_members")) DB.set("lm_members", [
    {id:1,name:"Aarav Patel",email:"aarav@example.com",phone:"9876543210"},
    {id:2,name:"Diya Shah",email:"diya@example.com",phone:"9876501234"}
  ]);
  if (!localStorage.getItem("lm_loans")) DB.set("lm_loans", [
    {id:1,bookId:1,memberId:1,issued:"2026-10-18",due:"2026-10-30",status:"Borrowed"},
    {id:2,bookId:2,memberId:2,issued:"2026-10-01",due:"2026-10-15",status:"Returned"}
  ]);
}
function esc(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function notice(message, type="success") { const el=document.getElementById("notice"); if(el) el.innerHTML=`<div class="alert alert-${type} mb-3" role="alert">${esc(message)}</div>`; }
function nextId(items) { return items.reduce((max,item)=>Math.max(max,Number(item.id)||0),0)+1; }
function signedIn() { return localStorage.getItem("lm_signed_in")==="yes"; }
function updateAuthLink() { const link=document.getElementById("authLink"); if(!link)return; if(signedIn()){link.textContent="Logout";link.href="#";link.onclick=(e)=>{e.preventDefault();localStorage.removeItem("lm_signed_in");location.href="index.html";};}else{link.textContent="Login";link.href="login.html";} }
function initDashboard() {
 const books=DB.get("lm_books"),members=DB.get("lm_members"),loans=DB.get("lm_loans");
 document.getElementById("bookCount").textContent=books.length;
 document.getElementById("memberCount").textContent=members.length;
 document.getElementById("loanCount").textContent=loans.length;
}
function renderBooks(filter="") {
 const books=DB.get("lm_books").filter(b=>(b.title+" "+b.author).toLowerCase().includes(filter.toLowerCase()));
 const tbody=document.getElementById("booksTable"); if(!tbody)return;
 document.getElementById("bookResultCount").textContent=`${books.length} book${books.length===1?"":"s"}`;
 tbody.innerHTML=books.length?books.map(b=>`<tr><td><div class="book-name">${esc(b.title)}</div><div class="subtext">ID: ${b.id}</div></td><td>${esc(b.author)}</td><td><span class="badge-soft">${esc(b.category)}</span></td><td>${esc(b.qty)}</td><td class="text-end text-nowrap"><a class="btn btn-sm btn-light" href="book-form.html?id=${b.id}">Edit</a> <button class="btn btn-sm btn-outline-danger" data-delete-book="${b.id}">Delete</button></td></tr>`).join(""):`<tr><td colspan="5"><div class="empty-state"><strong>No books found</strong>Try another search or add a new book.</div></td></tr>`;
 tbody.querySelectorAll("[data-delete-book]").forEach(btn=>btn.addEventListener("click",()=>{if(confirm("Delete this book?")){DB.set("lm_books",DB.get("lm_books").filter(b=>b.id!==Number(btn.dataset.deleteBook)));renderBooks(document.getElementById("bookSearch").value);notice("Book deleted successfully.");}}));
}
function initBookForm() {
 const form=document.getElementById("bookForm"); if(!form)return;
 const id=Number(new URLSearchParams(location.search).get("id")||0), existing=DB.get("lm_books").find(b=>b.id===id);
 if(existing){document.getElementById("formTitle").textContent="Edit book";["title","author","category","qty"].forEach(k=>document.getElementById(k).value=existing[k]);document.getElementById("bookId").value=existing.id;}
 form.addEventListener("submit",e=>{e.preventDefault();const books=DB.get("lm_books");const item={id:existing?existing.id:nextId(books),title:document.getElementById("title").value.trim(),author:document.getElementById("author").value.trim(),category:document.getElementById("category").value,qty:Number(document.getElementById("qty").value)};
 if(!item.title||!item.author||!item.category||item.qty<1){notice("Please complete all required fields.","danger");return;}
 DB.set("lm_books",existing?books.map(b=>b.id===existing.id?item:b):[...books,item]);location.href="books.html";});
}
function renderMembers() {
 const members=DB.get("lm_members"),tbody=document.getElementById("membersTable");if(!tbody)return;
 tbody.innerHTML=members.length?members.map(m=>`<tr><td><div class="book-name">${esc(m.name)}</div><div class="subtext">ID: ${m.id}</div></td><td>${esc(m.email)}</td><td>${esc(m.phone||"—")}</td><td class="text-end text-nowrap"><a class="btn btn-sm btn-light" href="member-form.html?id=${m.id}">Edit</a> <button class="btn btn-sm btn-outline-danger" data-delete-member="${m.id}">Delete</button></td></tr>`).join(""):`<tr><td colspan="4"><div class="empty-state"><strong>No members yet</strong>Add a member to get started.</div></td></tr>`;
 tbody.querySelectorAll("[data-delete-member]").forEach(btn=>btn.addEventListener("click",()=>{if(confirm("Delete this member?")){DB.set("lm_members",DB.get("lm_members").filter(m=>m.id!==Number(btn.dataset.deleteMember)));renderMembers();notice("Member deleted successfully.");}}));
}
function initMemberForm() {
 const form=document.getElementById("memberForm");if(!form)return;
 const id=Number(new URLSearchParams(location.search).get("id")||0),existing=DB.get("lm_members").find(m=>m.id===id);
 if(existing){document.getElementById("formTitle").textContent="Edit member";document.getElementById("name").value=existing.name;document.getElementById("memberEmail").value=existing.email;document.getElementById("phone").value=existing.phone||"";}
 form.addEventListener("submit",e=>{e.preventDefault();const members=DB.get("lm_members");const item={id:existing?existing.id:nextId(members),name:document.getElementById("name").value.trim(),email:document.getElementById("memberEmail").value.trim(),phone:document.getElementById("phone").value.trim()};if(!item.name||!item.email){notice("Please fill in name and email.","danger");return;}DB.set("lm_members",existing?members.map(m=>m.id===existing.id?item:m):[...members,item]);location.href="members.html";});
}
function renderLoans() {
 const loans=DB.get("lm_loans"),books=DB.get("lm_books"),members=DB.get("lm_members"),tbody=document.getElementById("loansTable");if(!tbody)return;
 document.getElementById("totalLoans").textContent=loans.length;document.getElementById("borrowedLoans").textContent=loans.filter(l=>l.status==="Borrowed").length;document.getElementById("returnedLoans").textContent=loans.filter(l=>l.status==="Returned").length;
 tbody.innerHTML=loans.length?loans.map(l=>{const b=books.find(x=>x.id===l.bookId),m=members.find(x=>x.id===l.memberId);return `<tr><td>${esc(b?.title||"Deleted book")}</td><td>${esc(m?.name||"Deleted member")}</td><td>${esc(l.issued)}</td><td>${esc(l.due)}</td><td><span class="badge-soft ${l.status==="Returned"?"badge-success":"badge-warning"}">${esc(l.status)}</span></td><td class="text-end">${l.status==="Borrowed"?`<button class="btn btn-sm btn-light" data-return-loan="${l.id}">Mark returned</button>`:"—"}</td></tr>`}).join(""):`<tr><td colspan="6"><div class="empty-state"><strong>No loan records</strong>Use “Add demo loan” to create a sample record.</div></td></tr>`;
 tbody.querySelectorAll("[data-return-loan]").forEach(btn=>btn.addEventListener("click",()=>{DB.set("lm_loans",DB.get("lm_loans").map(l=>l.id===Number(btn.dataset.returnLoan)?{...l,status:"Returned"}:l));renderLoans();notice("Loan marked as returned.");}));
 const add=document.getElementById("addDemoLoan");if(add)add.onclick=()=>{const books=DB.get("lm_books"),members=DB.get("lm_members");if(!books.length||!members.length){notice("Add at least one book and one member first.","warning");return;}const today=new Date();const date=today.toISOString().slice(0,10);const due=new Date(today.getTime()+14*86400000).toISOString().slice(0,10);const all=DB.get("lm_loans");DB.set("lm_loans",[...all,{id:nextId(all),bookId:books[0].id,memberId:members[0].id,issued:date,due,status:"Borrowed"}]);renderLoans();notice("Demo loan record added.");};
}
function initLogin() {
 const form=document.getElementById("loginForm");if(!form)return;
 form.addEventListener("submit",e=>{e.preventDefault();const email=document.getElementById("email").value.trim(),password=document.getElementById("password").value;if(!email||!password){notice("Enter an email and password.","danger");return;}localStorage.setItem("lm_signed_in","yes");location.href="index.html";});
}
document.addEventListener("DOMContentLoaded",()=>{seedData();updateAuthLink();const page=document.body.dataset.page;
 if(page==="dashboard")initDashboard();if(page==="books"){renderBooks();document.getElementById("bookSearch").addEventListener("input",e=>renderBooks(e.target.value));}
 if(page==="book-form")initBookForm();if(page==="members")renderMembers();if(page==="member-form")initMemberForm();if(page==="loans")renderLoans();if(page==="login")initLogin();
});
