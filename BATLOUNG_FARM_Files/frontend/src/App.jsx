import React,{useEffect,useState,useCallback} from 'react';
import {LayoutDashboard,Apple,Truck,Users,Boxes,ShoppingCart,Receipt,BarChart3,Wallet,RefreshCw,Plus,Trash2,Save,MapPin,LogOut,LockKeyhole,TrendingUp,Activity,PackageCheck,Tag,CalendarDays} from 'lucide-react';
const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
const MAPS_KEY=import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY||'';
async function request(path,method='GET',body){
  const token=sessionStorage.getItem('batloung-admin-token');
  const r=await fetch(API+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){if(r.status===401&&path!=='/auth/login'){sessionStorage.removeItem('batloung-admin-token');window.dispatchEvent(new Event('batloung-session-expired'));}throw new Error(d.error||`HTTP ${r.status}`);}
  return d;
}
const nav=[['Dashboard',LayoutDashboard],['Fruits',Apple],['Stock',Boxes],['Suppliers',Truck],['Vendors',Users],['Purchases',ShoppingCart],['Sales',Receipt],['Payments',Wallet],['Reports',BarChart3]];
const money=x=>'M '+Number(x||0).toLocaleString('en-LS',{minimumFractionDigits:2,maximumFractionDigits:2});

// Local fruit catalogue images: bundled with the frontend (no API calls or image-host dependencies).
const FRUIT_PHOTOS = {
  'red apples': '/assets/fruits/red-apples.webp',
  'green apples': '/assets/fruits/green-apples.webp',
  'yellow apples': '/assets/fruits/yellow-apples.webp',
  'bananas': '/assets/fruits/bananas.webp',
  'oranges': '/assets/fruits/oranges.webp',
  'mangoes': '/assets/fruits/mangoes.webp',
  'green grapes': '/assets/fruits/green-grapes.webp',
  'purple grapes': '/assets/fruits/purple-grapes.webp'
};
const fruitPhoto = name => FRUIT_PHOTOS[String(name || '').trim().toLowerCase()] || null;

// Stock availability is based on both administrative availability and actual box quantity.
// An AVAILABLE fruit with zero boxes cannot be sold until it is restocked.
function boxesAvailable(row){return ['small','medium','large'].reduce((n,k)=>n+Number(row[k]??row[k+'_boxes']??0),0)}
function stockAvailability(row){
  if(row.status!=='AVAILABLE')return 'Unavailable';
  return boxesAvailable(row)>0?'In stock':'Out of stock';
}
function StockState({value}){return <span className={'pill '+(value==='In stock'?'good':'bad')}>{value}</span>}
function QuantityState({quantity,enabled=true}){
  const n=Number(quantity||0), available=enabled&&n>0;
  return <div className="qty-status"><strong className={available?'stock-count':'low'}>{n}</strong><span className={available?'size-in':'size-out'}>{available?'In stock':'Out of stock'}</span></div>;
}

function Panel({title,children,actions}){return <section className="panel"><div className="panel-head"><h2>{title}</h2>{actions}</div>{children}</section>}
function DataTable({columns,rows,onRowHover}){return <div className="table-wrap"><table><thead><tr>{columns.map(x=><th key={x[0]}>{x[1]}</th>)}</tr></thead><tbody>{rows?.length?rows.map((r,i)=><tr tabIndex={onRowHover?0:undefined} onMouseEnter={()=>onRowHover?.(r)} onFocus={()=>onRowHover?.(r)} key={r.id||r.fruit_id||r.stock_id||r.sale_id||r.purchase_id||r.vendor_id||r.supplier_id||i}>{columns.map(([key,,render])=><td key={key}>{render?render(r[key],r):String(r[key]??'—')}</td>)}</tr>):<tr><td colSpan={columns.length} className="muted">No records found</td></tr>}</tbody></table></div>}
const emptyFruit={fruit_name:'',description:'',status:'AVAILABLE',price_small:'',price_medium:'',price_large:''};
const emptyVendor={vendor_name:'',phone_number:'',location:''};
const emptySupplier={business_name:'',contact_person:'',phone:'',province:'',address:''};
function Field({label,value,onChange,type='text',options,required=true}){return <label className="field"><span>{label}</span>{options?<select value={value??''} onChange={e=>onChange(e.target.value)}>{options.map(opt=>Array.isArray(opt)?<option value={opt[0]} key={opt[0]}>{opt[1]}</option>:<option key={opt}>{opt}</option>)}</select>:<input type={type} step={type==='number'?'any':undefined} required={required} value={value??''} onChange={e=>onChange(e.target.value)}/>}</label>}
function LoginScreen({onLogin}){
  const[username,setUsername]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{const result=await request('/auth/login','POST',{username,password});sessionStorage.setItem('batloung-admin-token',result.token);onLogin(result.token);setPassword('');}catch(err){setError(err.message);}finally{setBusy(false);}}
  return <div className="login-screen"><div className="login-story"><div className="login-story-logo"><img src="/assets/batloung-citrus-mark.svg" alt=""/><div><strong>Batloung</strong><span>Farm Distribution</span></div></div><h2>Welcome <em>Back!</em></h2><p>Manage your farm distribution with ease.</p><div className="login-features"><div><TrendingUp size={22}/><span><b>Track stock &amp; sales</b><small>See your latest business activity</small></span></div><div><Truck size={22}/><span><b>Manage suppliers &amp; vendors</b><small>Keep fruit distribution organised</small></span></div><div><Apple size={22}/><span><b>Grow your business</b><small>Make informed decisions</small></span></div></div></div><form className="login-card" onSubmit={submit}><div className="login-emblem"><LockKeyhole size={34}/></div><span className="eyebrow">BATLOUNG FARM DISTRIBUTION</span><h1>Login</h1><p>Sign in to manage fruit sales, suppliers, vendors and stock.</p>{error&&<div className="notice error">{error}</div>}<label className="field">Username<input autoComplete="username" required value={username} onChange={e=>setUsername(e.target.value)}/></label><label className="field">Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn login-submit" disabled={busy}><LockKeyhole size={17}/>{busy?'Signing in...':'Sign in'}</button><p className="small-muted">First time? For the password enter "BatloungFarm" and for the Username "FarmAdministrator"</p></form></div>
}
function MapsPreview({kind,record}){
  const name=kind==='supplier'?record?.business_name:record?.vendor_name;
  const place=kind==='supplier'? [record?.address,record?.province].filter(Boolean).join(', '):record?.location;
  const query=[name,place].filter(Boolean).join(', ');
  const openUrl='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query);
  const embedUrl=MAPS_KEY?'https://www.google.com/maps/embed/v1/place?key='+encodeURIComponent(MAPS_KEY)+'&q='+encodeURIComponent(query):'';
  return <section className="map-panel"><div className="map-top"><MapPin size={19}/><div><strong>{record?name:'Google Maps location preview'}</strong><span>{record?place:'Hover over or focus a table row to preview its saved location.'}</span></div></div>
  {record?(<>{MAPS_KEY?<iframe title={'Google Maps location of '+name} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={embedUrl}/>:<div className="map-unconfigured"><MapPin size={32}/><strong>Map preview is ready to configure</strong><p>Add a restricted Google Maps Embed API key to <code>frontend/.env</code> to see the interactive map here.</p></div>}<a href={openUrl} target="_blank" rel="noopener noreferrer" className="map-open">View saved location in Google Maps ↗</a><p className="small-muted">This is an address-based Google Maps search, not real-time GPS tracking. Verify the pin in Google Maps.</p></>):<div className="map-placeholder">Choose a supplier or vendor from the directory.</div>}
  </section>;
}
function RingChart({paid=0,partial=0,unpaid=0}){
 const all=Math.max(1,paid+partial+unpaid);const a=paid/all*100,b=partial/all*100;
 return <div className="ring-chart-block"><div className="ring-chart" style={{background:`conic-gradient(#fa54c5 0 ${a}%,#9850ec ${a}% ${a+b}%,#31204f ${a+b}% 100%)`}}><div className="ring-hole"><strong>{paid+partial+unpaid}</strong><span>sales</span></div></div><div className="ring-legend"><span><i style={{background:'#fa54c5'}}/> Paid: {paid}</span><span><i style={{background:'#9850ec'}}/> Partial: {partial}</span><span><i style={{background:'#31204f'}}/> Unpaid: {unpaid}</span></div></div>;
}
function SalesBars({sales,purchases}){
 const month=(x)=>String(x||'').slice(0,7);
 const keys=[...new Set([...sales.map(x=>month(x.sale_date)),...purchases.map(x=>month(x.purchase_date))])].filter(Boolean).sort().slice(-6);
 const rows=keys.map(k=>({key:k,sales:sales.filter(x=>month(x.sale_date)===k).reduce((a,x)=>a+Number(x.total_amount||0),0),purchases:purchases.filter(x=>month(x.purchase_date)===k).reduce((a,x)=>a+Number(x.total_amount||0),0)}));
 const max=Math.max(1,...rows.flatMap(x=>[x.sales,x.purchases]));
 return <div className="bar-overview"><div className="bar-legend"><span className="dot-pink"/> Sales revenue <span className="dot-purple"/> Purchase cost</div><div className="bar-plot">{rows.length?rows.map(x=><div className="bar-group" key={x.key}><div className="bar-pair"><div title={`Sales: ${money(x.sales)}`} className="bar-sale" style={{height:`${Math.max(x.sales?3:0,x.sales/max*100)}%`}}/><div title={`Purchases: ${money(x.purchases)}`} className="bar-buy" style={{height:`${Math.max(x.purchases?3:0,x.purchases/max*100)}%`}}/></div><span>{x.key.slice(5)}</span></div>):<p className="muted">Record purchases or sales to see trends.</p>}</div></div>;
}
function SupplierPriceEditor({supplier,fruits,onClose,onSaved}){
 const [rows,setRows]=useState([]);
 const [fruit,setFruit]=useState(()=>fruits[0]?String(fruits[0].fruit_id):'');
 const [size,setSize]=useState('SMALL');
 const [cost,setCost]=useState('');
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const [saving,setSaving]=useState(false);
 const [loading,setLoading]=useState(true);
 const loadPrices=useCallback(async()=>{
   setLoading(true);
   try{setRows(await request(`/supplier-prices/${supplier.supplier_id}`));setError('');}
   catch(e){setError(e.message)}
   finally{setLoading(false)}
 },[supplier.supplier_id]);
 useEffect(()=>{loadPrices()},[loadPrices]);
 useEffect(()=>{if(!fruit&&fruits.length)setFruit(String(fruits[0].fruit_id))},[fruit,fruits]);
 const existing=rows.find(r=>String(r.fruit_id)===String(fruit)&&r.packaging_size===size);
 // Show the saved price when revisiting a fruit/size; otherwise start with an empty field.
 useEffect(()=>{if(!loading)setCost(existing?String(existing.unit_cost):'')},[fruit,size,loading,rows]);
 const validCost=cost.trim()!==''&&/^\d+(?:\.\d{1,2})?$/.test(cost.trim())&&Number(cost)>=0&&Number(cost)<=9999999.99;
 async function submit(e){
   e.preventDefault();if(!fruit||!validCost||saving)return;
   setSaving(true);setError('');setSuccess('');
   try{
     await request(`/supplier-prices/${supplier.supplier_id}`,'PUT',{
       fruit_id:Number(fruit),packaging_size:size,unit_cost:cost.trim()
     });
     await loadPrices();
     setSuccess(`Saved ${fruits.find(f=>String(f.fruit_id)===String(fruit))?.fruit_name||'fruit'} ${size} at ${money(cost)} per box.`);
     onSaved?.();
   }catch(e){setError(e.message)}finally{setSaving(false)}
 }
 return <div className="overlay"><div className="modal pricing-modal">
   <div className="panel-head"><h2>Supplier price list · {supplier.business_name}</h2><button className="close" onClick={onClose} aria-label="Close">×</button></div>
   <p className="small-muted">Save the cost this supplier charges for one box of a chosen fruit and size. These prices are used automatically in new purchases; earlier purchases keep their original costs.</p>
   {error&&<div className="notice error" role="alert">{error}</div>}
   {success&&<div className="notice" role="status">{success}</div>}
   <form onSubmit={submit}>
     <div className="formgrid">
       <Field label="Fruit" value={fruit} onChange={v=>{setFruit(v);setSuccess('')}} options={[["","Select fruit"],...fruits.map(f=>[String(f.fruit_id),`#${f.fruit_id} · ${f.fruit_name}`])]}/>
       <Field label="Box size" value={size} onChange={v=>{setSize(v);setSuccess('')}} options={['SMALL','MEDIUM','LARGE']}/>
       <Field label="Supplier cost per box (M)" type="number" value={cost} onChange={v=>{setCost(v);setSuccess('')}}/>
     </div>
     <p className="price-help" role="status">{loading?'Loading saved prices…':existing?'Saved cost loaded. Change the amount to update this supplier price.':'No price saved for this combination. Enter a cost per box and click Save.'}</p>
     {cost!==''&&!validCost&&<p className="price-help invalid">Enter an amount from M0.00 to M9,999,999.99 with no more than two decimal places.</p>}
     <button type="submit" className="btn" disabled={!fruit||!validCost||saving||loading}><Save size={16}/> {saving?'Saving…':existing?'Update supplier price':'Save supplier price'}</button>
   </form>
   <div className="pricing-list">{rows.length?<DataTable rows={rows.map(r=>({...r,id:`${r.fruit_id}-${r.packaging_size}`}))} columns={[["fruit_id","Fruit ID"],["fruit_id_name","Fruit",(_,r)=>fruits.find(f=>Number(f.fruit_id)===Number(r.fruit_id))?.fruit_name||`Fruit #${r.fruit_id}`],["packaging_size","Box size"],["unit_cost","Cost per box",money]]}/>:<p className="small-muted">No supplier prices set yet. Save at least one above to enable automatic purchasing.</p>}</div>
 </div></div>;
}

export default function App(){const[token,setToken]=useState(()=>sessionStorage.getItem('batloung-admin-token')),[page,setPage]=useState('Dashboard'),[data,setData]=useState({}),[busy,setBusy]=useState(false),[message,setMessage]=useState(null),[edit,setEdit]=useState(null),[search,setSearch]=useState(''),[mapSelection,setMapSelection]=useState({supplier:null,vendor:null}),[priceSupplier,setPriceSupplier]=useState(null);
const load=useCallback(async()=>{setBusy(true);try{const paths={fruits:'/fruits',stock:'/stock',suppliers:'/suppliers',vendors:'/vendors',purchases:'/purchases',sales:'/sales',balances:'/reports/balances'};const entries=await Promise.all(Object.entries(paths).map(async([k,p])=>[k,await request(p)]));setData(Object.fromEntries(entries));setMessage(null);}catch(e){setMessage({type:'error',text:e.message});}finally{setBusy(false)}},[]);
useEffect(()=>{if(token)load()},[load,token]);
useEffect(()=>{const expired=()=>{setToken(null);setData({});setMessage(null);};window.addEventListener('batloung-session-expired',expired);return()=>window.removeEventListener('batloung-session-expired',expired);},[]);const notify=(text,type='success')=>setMessage({text,type});const save=async(path,method,payload)=>{setBusy(true);try{await request(path,method,payload);notify('Saved successfully.');setEdit(null);await load();}catch(e){notify(e.message,'error')}finally{setBusy(false)}};
const removeRecord=async(type,record)=>{const id=type==='supplier'?record.supplier_id:record.vendor_id;const label=type==='supplier'?record.business_name:record.vendor_name;if(!window.confirm(`Delete ${label}? This cannot be undone. Records linked to purchases or sales cannot be deleted.`))return;setBusy(true);try{await request(`/${type==='supplier'?'suppliers':'vendors'}/${id}`,'DELETE');setMapSelection(old=>({...old,[type]:null}));await load();notify(`${label} deleted successfully.`);}catch(e){notify(e.message,'error');}finally{setBusy(false);}};
const logout=()=>{sessionStorage.removeItem('batloung-admin-token');setToken(null);setData({});setEdit(null);};
const fruits=data.fruits||[],stock=data.stock||[],suppliers=data.suppliers||[],vendors=data.vendors||[],purchases=data.purchases||[],sales=data.sales||[];const totalStock=stock.reduce((n,x)=>n+Number(x.available_quantity),0);const outstanding=sales.reduce((n,x)=>n+Number(x.outstanding_balance),0);
const stockGrouped=fruits.map(f=>{const entry={fruit_id:f.fruit_id,fruit_name:f.fruit_name,status:f.status};for(const size of ['SMALL','MEDIUM','LARGE'])entry[size.toLowerCase()]=Number(stock.find(x=>Number(x.fruit_id)===Number(f.fruit_id)&&x.packaging_size===size)?.available_quantity||0);return entry;});
const paidCount=sales.filter(x=>x.payment_status==='PAID').length,partialCount=sales.filter(x=>x.payment_status==='PARTIALLY_PAID').length,unpaidCount=sales.filter(x=>x.payment_status==='UNPAID').length;
const salesRevenue=sales.reduce((n,x)=>n+Number(x.total_amount||0),0),purchasesCost=purchases.reduce((n,x)=>n+Number(x.total_amount||0),0);
const recent=[...sales.map(x=>({id:'sale-'+x.sale_id,kind:'Sale',name:x.vendor_name,when:x.sale_date,total:x.total_amount})),...purchases.map(x=>({id:'buy-'+x.purchase_id,kind:'Purchase',name:x.supplier_name,when:x.purchase_date,total:x.total_amount}))].sort((a,b)=>new Date(b.when)-new Date(a.when)).slice(0,7);

if(!token)return <LoginScreen onLogin={setToken}/>;
return <div className="shell"><aside className="sidebar"><div className="brand"><span className="brand-mark"><img src="/assets/batloung-citrus-mark.svg" alt="Batloung Farm logo"/></span><div><strong>BATLOUNG</strong><small>FARM DISTRIBUTION</small></div></div><div className="nav-label">WORKSPACE</div><nav>{nav.map(([name,Icon])=><button key={name} className={page===name?'active':''} onClick={()=>{setPage(name);setEdit(null);setMessage(null)}}><Icon size={18}/>{name}</button>)}</nav><div className="side-note">Fresh produce management<br/><span>Administrator workspace</span><button className="logout-btn" onClick={logout}><LogOut size={16}/> Log out</button></div></aside>
<main className="main"><header className="top"><div><div className="eyebrow">Operations workspace</div><h1>{page}</h1></div><button className="btn subtle" onClick={load} disabled={busy}><RefreshCw size={16}/> {busy?'Loading...':'Refresh data'}</button></header>
{message&&<div className={'notice '+message.type}>{message.text}<button onClick={()=>setMessage(null)}>×</button></div>}
{page==='Dashboard'&&<><div className="hero"><div className="hero-text"><span className="hero-label">BATLOUNG FARM • FRESH PRODUCE DISTRIBUTION</span><h2>Welcome back,<br/><em>to Batloung Farm.</em></h2><p>Manage fresh produce, monitor sales and keep stock moving — all in one place.</p></div><div className="hero-fruit" aria-label="Colourful fruit photography"/></div><div className="stats">{[['Fruit varieties',fruits.length],['Available boxes',totalStock],['Sales revenue',money(salesRevenue)],['Outstanding credit',money(outstanding)]].map(([a,b])=><div className="stat" key={a}><span>{a}</span><strong>{b}</strong></div>)}</div><div className="two dashboard-charts"><Panel title="Sales overview"><SalesBars sales={sales} purchases={purchases}/><p className="small-muted">Sales revenue compared with supplier purchase costs by month; not a net-profit calculation.</p></Panel><Panel title="Payment status breakdown"><RingChart paid={paidCount} partial={partialCount} unpaid={unpaidCount}/></Panel></div><div className="two"><Panel title="Recent transactions"><DataTable rows={recent} columns={[["kind","Type",x=><span className="pill">{x}</span>],["name","Supplier / vendor"],["total","Amount",money],["when","Date",x=>new Date(x).toLocaleDateString()]]}/></Panel><Panel title="Fruit varieties & boxes"><div className="mini-fruit-grid">{stockGrouped.map(f=><div className="mini-fruit" key={f.fruit_id}><div className="mini-fruit-name">🍓 {f.fruit_name}</div><span className="small-muted">S: {f.small} · M: {f.medium} · L: {f.large}</span></div>)}</div></Panel></div></>}
{page==='Fruits'&&<Panel title="Fruit catalogue & availability" actions={<button className="btn" onClick={()=>setEdit({type:'fruit',id:null,data:{...emptyFruit}})}><Plus size={16}/> Add fruit</button>}><p className="small-muted">One card per fruit variety. Prices are the selling prices per box, and stock is tracked by size.</p><div className="fruit-catalogue">{fruits.map(f=>{const x=stockGrouped.find(a=>a.fruit_id===f.fruit_id)||{};return <article className="fruit-card" key={f.fruit_id}><div className="fruit-card-head"><span className="fruit-photo-wrap">{fruitPhoto(f.fruit_name)?<img className="fruit-photo" src={fruitPhoto(f.fruit_name)} alt={f.fruit_name} loading="lazy" decoding="async"/>:<Apple size={34} aria-label="Fruit"/>}</span><StockState value={stockAvailability(x.status?x:{...x,status:f.status})}/></div><h3>{f.fruit_name}</h3><div className="record-id">Fruit ID: #{f.fruit_id}</div><div className="catalogue-sizes"><div><span>Small</span><strong>{money(f.price_small)}</strong><small>{x.small||0} boxes · {f.status==='AVAILABLE'&&Number(x.small)>0?'In stock':'Out of stock'}</small></div><div><span>Medium</span><strong>{money(f.price_medium)}</strong><small>{x.medium||0} boxes · {f.status==='AVAILABLE'&&Number(x.medium)>0?'In stock':'Out of stock'}</small></div><div><span>Large</span><strong>{money(f.price_large)}</strong><small>{x.large||0} boxes · {f.status==='AVAILABLE'&&Number(x.large)>0?'In stock':'Out of stock'}</small></div></div><button className="btn subtle card-edit" onClick={()=>setEdit({type:'fruit',id:f.fruit_id,data:{...f}})}>Edit fruit & prices</button></article>})}</div></Panel>}
{page==='Stock'&&<Panel title="Stock by fruit & packaging size" actions={<span className="small-muted">In stock = at least one available box; out of stock = zero boxes or fruit marked unavailable</span>}><p className="small-muted">One row per fruit variety. Each box size has its own inventory count and stock availability.</p><DataTable rows={stockGrouped} columns={[["fruit_id","Fruit ID"],["fruit_name","Fruit variety"],["small","Small boxes",(x,r)=><QuantityState quantity={x} enabled={r.status==='AVAILABLE'}/>],["medium","Medium boxes",(x,r)=><QuantityState quantity={x} enabled={r.status==='AVAILABLE'}/>],["large","Large boxes",(x,r)=><QuantityState quantity={x} enabled={r.status==='AVAILABLE'}/>],["status","Overall stock",(_,r)=><StockState value={stockAvailability(r)}/>]]}/></Panel>}
{page==='Suppliers'&&<><Panel title="Supplier directory" actions={<button className="btn" onClick={()=>setEdit({type:'supplier',id:null,data:{...emptySupplier}})}><Plus size={16}/> Add supplier</button>}><p className="small-muted">Hover over a supplier row to preview the saved address on Google Maps. Suppliers linked to purchases cannot be deleted.</p><DataTable rows={suppliers} onRowHover={r=>setMapSelection(old=>({...old,supplier:r}))} columns={[["supplier_id","Supplier ID"],["business_name","Business"],["contact_person","Contact"],["province","Province"],["phone","Telephone"],["supplier_actions","Actions",(_,r)=><div className="row-actions"><button className="textbtn" onClick={()=>setEdit({type:'supplier',id:r.supplier_id,data:{...r}})}>Edit</button><button className="textbtn" onClick={()=>setPriceSupplier(r)}>Set prices</button><button className="textbtn danger" disabled={busy} onClick={()=>removeRecord('supplier',r)}>Delete</button></div>]]}/></Panel><MapsPreview kind="supplier" record={mapSelection.supplier||suppliers[0]}/></>}
{page==='Vendors'&&<><Panel title="Registered vendors" actions={<button className="btn" onClick={()=>setEdit({type:'vendor',id:null,data:{...emptyVendor}})}><Plus size={16}/> Add vendor</button>}><p className="small-muted">Newly registered vendors will appear in the Sales form dropdown after saving. Hover over a vendor row to preview its location.</p><input className="search" placeholder="Filter vendors by name or phone" value={search} onChange={e=>setSearch(e.target.value)}/><DataTable rows={vendors.filter(v=>(v.vendor_name+v.phone_number).toLowerCase().includes(search.toLowerCase()))} onRowHover={r=>setMapSelection(old=>({...old,vendor:r}))} columns={[["vendor_id","Vendor ID"],["vendor_name","Vendor"],["phone_number","Phone"],["location","Location"],["vendor_actions","Actions",(_,r)=><div className="row-actions"><button className="textbtn" onClick={()=>setEdit({type:'vendor',id:r.vendor_id,data:{...r}})}>Edit</button><button className="textbtn danger" disabled={busy} onClick={()=>removeRecord('vendor',r)}>Delete</button></div>]]}/></Panel><MapsPreview kind="vendor" record={mapSelection.vendor||vendors[0]}/></>}
{page==='Purchases'&&<><Panel title="Record incoming purchase"><OrderForm type="purchase" fruits={fruits} people={suppliers} onSubmit={x=>save('/purchases','POST',x)} busy={busy}/></Panel><PurchaseHistory purchases={purchases}/></>}
{page==='Sales'&&<><Panel title="Record outgoing sale"><OrderForm type="sale" fruits={fruits} people={vendors} onSubmit={x=>save('/sales','POST',x)} busy={busy}/></Panel><Panel title="Sales history"><DataTable rows={sales} columns={[["sale_id","Sale #"],["vendor_name","Vendor"],["total_amount","Amount",money],["payment_status","Payment"],["outstanding_balance","Outstanding",money]]}/></Panel></>}
{page==='Payments'&&<><Panel title="Record additional payment"><PaymentForm sales={sales.filter(x=>Number(x.outstanding_balance)>0)} onSubmit={(id,d)=>save('/payments/'+id,'POST',d)} busy={busy}/><p className="small-muted">Payments update cumulative amounts on the existing sales record. This eight-table design does not keep individual payment history.</p></Panel><Panel title="Outstanding vendor balances"><DataTable rows={data.balances||[]} columns={[["vendor_name","Vendor"],["outstanding_balance","Balance",money]]}/></Panel></>}
{page==='Reports'&&<Reports notify={notify}/>}
{priceSupplier&&<SupplierPriceEditor supplier={priceSupplier} fruits={fruits} onClose={()=>setPriceSupplier(null)}/>}{edit&&<div className="overlay"><div className="modal"><div className="panel-head"><h2>{edit.id?'Update':'Add'} {edit.type}</h2><button className="close" onClick={()=>setEdit(null)}>×</button></div><form onSubmit={e=>{e.preventDefault();save('/'+(edit.type==='fruit'?'fruits':edit.type==='vendor'?'vendors':'suppliers')+(edit.id?'/'+edit.id:''),edit.id?'PUT':'POST',edit.data)}}><div className="formgrid">{Object.keys(edit.data).filter(k=>!['fruit_id','vendor_id','supplier_id','registration_date'].includes(k)).map(k=><Field key={k} label={k.replaceAll('_',' ')} value={edit.data[k]} type={k.startsWith('price_')?'number':'text'} options={k==='status'?['AVAILABLE','UNAVAILABLE']:undefined} onChange={v=>setEdit({...edit,data:{...edit.data,[k]:v}})}/>)}</div>{(edit.type==='vendor'||edit.type==='supplier')&&<p className="small-muted">Enter a complete, verifiable address. Maps will search for this saved place; it does not provide live GPS tracking.</p>}<div className="modal-actions"><button type="button" className="btn subtle" onClick={()=>setEdit(null)}>Cancel</button><button className="btn" disabled={busy}><Save size={16}/> Save changes</button></div></form></div></div>}
</main></div>}
function PurchaseHistory({purchases}){
  const [selected,setSelected]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  async function view(id){
    setSelected(null);setError('');setLoading(true);
    try{setSelected(await request('/purchases/'+id));}
    catch(e){setError(e.message);}
    finally{setLoading(false);}
  }
  return <Panel title="Purchase history">
    <p className="small-muted">Open a purchase to see the recorded fruit varieties, sizes, quantities, supplier costs and line totals. Prices reflect the original purchase, even if the supplier updates its prices later.</p>
    {error&&<div className="notice error" role="alert">{error}</div>}
    <DataTable rows={purchases} columns={[
      ['purchase_id','Purchase #'],['supplier_name','Supplier'],
      ['purchase_date','Date',x=>new Date(x).toLocaleDateString()],
      ['total_amount','Amount',money],
      ['details','Details',(_,r)=><button className="textbtn detail-link" type="button" disabled={loading} onClick={()=>view(r.purchase_id)}>View details</button>]
    ]}/>
    {loading&&<p className="small-muted" role="status">Loading purchase details…</p>}
    {selected&&<div className="overlay" onClick={()=>setSelected(null)}>
      <div className="modal purchase-detail-modal" role="dialog" aria-modal="true" aria-label={'Purchase '+selected.purchase_id+' details'} onClick={e=>e.stopPropagation()}>
        <div className="panel-head"><h2>Purchase #{selected.purchase_id}</h2><button type="button" className="close" onClick={()=>setSelected(null)} aria-label="Close purchase details">×</button></div>
        <div className="purchase-detail-summary"><span><b>Supplier:</b> {selected.supplier_name}</span><span><b>Date:</b> {new Date(selected.purchase_date).toLocaleDateString()}</span></div>
        <DataTable rows={selected.items||[]} columns={[
          ['fruit_id','Fruit ID'],['fruit_name','Fruit'],['packaging_size','Box size'],
          ['quantity','Boxes'],['unit_cost','Cost / box',money],['line_total','Line total',money]
        ]}/>
        <div className="purchase-detail-total"><span>Total purchase cost</span><strong>{money(selected.total_amount)}</strong></div>
        <div className="modal-actions"><button type="button" className="btn subtle" onClick={()=>setSelected(null)}>Close</button></div>
      </div>
    </div>}
  </Panel>;
}

function OrderForm({type,fruits,people,onSubmit,busy}){
  const isSale=type==='sale';
  const [person,setPerson]=useState('');
  const [items,setItems]=useState([{fruit_id:'',packaging_size:'SMALL',quantity:'1',unit_cost:''}]);
  const [method,setMethod]=useState('CASH');
  const [paid,setPaid]=useState('0');
  const [supplierPrices,setSupplierPrices]=useState([]),[priceError,setPriceError]=useState(''),[loadingPrices,setLoadingPrices]=useState(false);
  useEffect(()=>{if(isSale||!person){setSupplierPrices([]);setPriceError('');return;}let active=true;setLoadingPrices(true);setPriceError('');request('/supplier-prices/'+person).then(rows=>{if(active)setSupplierPrices(rows)}).catch(e=>{if(active){setSupplierPrices([]);setPriceError(e.message)}}).finally(()=>{if(active)setLoadingPrices(false)});return()=>{active=false}},[person,isSale]);
  const update=(i,k,v)=>setItems(old=>old.map((x,n)=>n===i?{...x,[k]:v}:x));
  const lines=items.map(x=>{
    const fruit=fruits.find(f=>String(f.fruit_id)===String(x.fruit_id));
    const amount=isSale?fruit?.['price_'+x.packaging_size.toLowerCase()]:supplierPrices.find(p=>String(p.fruit_id)===String(x.fruit_id)&&p.packaging_size===x.packaging_size)?.unit_cost;
    const price=Number(amount);
    const qty=Number(x.quantity);
    const valid=amount!==''&&amount!==undefined&&amount!==null&&Number.isFinite(price)&&price>=0&&Number.isInteger(qty)&&qty>0;
    return {price:valid?price:null,quantity:qty,total:valid?Math.round(price*100)*qty/100:null};
  });
  const missingSupplierPrices=!isSale&&person&&!loadingPrices
    ? items.flatMap((item,i)=>{
        if (!item.fruit_id || lines[i].price!==null) return [];
        const fruitName=fruits.find(f=>String(f.fruit_id)===String(item.fruit_id))?.fruit_name||`Fruit ${item.fruit_id}`;
        return [`${fruitName} (${item.packaging_size})`];
      })
    : [];
  const complete=lines.every(x=>x.total!==null);
  const grandTotal=complete?lines.reduce((sum,x)=>sum+x.total,0):null;
  const amountPaid=Number(paid);
  const balance=isSale&&grandTotal!==null&&Number.isFinite(amountPaid)?grandTotal-amountPaid:null;
  const chooseMethod=value=>{setMethod(value);if(value==='CREDIT')setPaid('0');else if(grandTotal!==null)setPaid(grandTotal.toFixed(2));};
  function submit(e){
    e.preventDefault();
    if(!person||!complete||grandTotal===null)return;
    if(isSale&&(!Number.isFinite(amountPaid)||amountPaid<0||amountPaid>grandTotal))return;
    const data={...(isSale?{vendor_id:Number(person),payment_method:method,amount_paid:paid}:{supplier_id:Number(person)}),items:items.map(x=>({...x,fruit_id:Number(x.fruit_id),quantity:Number(x.quantity),}))};
    onSubmit(data);
  }
  return <form onSubmit={submit}>
    <div className="formgrid">
      <Field label={isSale?'Vendor':'Supplier'} value={person} onChange={setPerson} options={[['','Select '+(isSale?'vendor':'supplier')],...people.map(p=>[String(p[isSale?'vendor_id':'supplier_id']),`#${p[isSale?'vendor_id':'supplier_id']} · ${p[isSale?'vendor_name':'business_name']}`])]}/>
      {isSale&&<>
        <Field label="Sale / payment option" value={method} onChange={chooseMethod} options={[["CASH","Cash"],["MOBILE_MONEY","Mobile money"],["CREDIT","Buy on credit (pay later)"]]}/>
        <Field label="Amount paid now (M)" type="number" value={paid} onChange={setPaid}/>
      </>}
    </div>
    {isSale&&<p className="small-muted">Choose <strong>Buy on credit</strong> when the vendor will pay later. Leave the amount at M0.00 for fully unpaid credit, or enter a deposit to record a partially paid sale. Cash and mobile-money payments can also be partial.</p>}
    {!isSale&&<><p className="small-muted">Supplier costs come from the saved supplier price list. Use Suppliers → Set prices to register costs for each fruit and box size before purchasing.</p>{priceError&&<div className="notice error">{priceError}</div>}{loadingPrices&&<p className="small-muted">Loading saved supplier prices…</p>}</>}<h3>Items</h3>
    {missingSupplierPrices.length>0&&<div className="notice error" role="alert">Cannot calculate this purchase yet: no saved supplier cost for {missingSupplierPrices.join(', ')}. Go to <strong>Suppliers → Set prices</strong> for the selected supplier, save each missing price, then return to Purchases.</div>}
    {items.map((x,i)=><div className="order-line" key={i}>
      <Field label="Fruit" value={x.fruit_id} onChange={v=>update(i,'fruit_id',v)} options={[["","Select fruit"],...fruits.map(f=>[String(f.fruit_id),`#${f.fruit_id} · ${f.fruit_name}`])]}/>
      <Field label="Box size" value={x.packaging_size} onChange={v=>update(i,'packaging_size',v)} options={['SMALL','MEDIUM','LARGE']}/>
      <Field label="Quantity (boxes)" type="number" value={x.quantity} onChange={v=>update(i,'quantity',v)}/>
      {!isSale&&<div className="line-preview"><span>Supplier cost / box</span><strong>{lines[i].price===null?'Set supplier price':money(lines[i].price)}</strong></div>}
      {isSale&&<div className="line-preview"><span>Selling price / box</span><strong>{lines[i].price===null?'Select fruit':money(lines[i].price)}</strong></div>}
      <div className="line-preview"><span>Line total</span><strong>{lines[i].total===null?'—':money(lines[i].total)}</strong></div>
      <button type="button" className="icon-btn" title="Remove line" disabled={items.length===1} onClick={()=>setItems(old=>old.filter((_,j)=>j!==i))}><Trash2 size={16}/></button>
    </div>)}
    <div className="order-summary" aria-live="polite">
      <div><span>{isSale?'Estimated selling total':'Estimated purchase total'}</span><strong>{grandTotal===null?'Complete item details':money(grandTotal)}</strong></div>
      {isSale&&<>
        <div><span>Payment status preview</span><strong>{balance===null||balance<0?'Check amount':amountPaid===0?'UNPAID':balance===0?'PAID':'PARTIALLY_PAID'}</strong></div>
        <div><span>Outstanding balance</span><strong>{balance===null||balance<0?'—':money(balance)}</strong></div>
      </>}
    </div>
    <div className="form-actions">
      <button type="button" className="btn subtle" onClick={()=>setItems(old=>[...old,{fruit_id:'',packaging_size:'SMALL',quantity:'1',unit_cost:''}])}><Plus size={16}/> Add item</button>
      <button type="submit" className="btn" disabled={busy||loadingPrices||!person||!complete||(isSale&&(!Number.isFinite(amountPaid)||amountPaid<0||amountPaid>grandTotal))}>{isSale?'Record sale':'Record purchase'}</button>
    </div>
    <p className="small-muted">Preview amounts are for convenience. The backend calculates and validates the final totals and updates stock in a MySQL transaction. Submit each transaction only once.</p>
  </form>;
}
function PaymentForm({sales,onSubmit,busy}){
  const [id,setId]=useState(''),[amount,setAmount]=useState(''),[method,setMethod]=useState('CASH');
  const selected=sales.find(s=>String(s.sale_id)===id);
  const due=Number(selected?.outstanding_balance??0);
  const n=Number(amount);
  const valid=id&&amount!==''&&Number.isFinite(n)&&n>0&&n<=due;
  return <form onSubmit={e=>{e.preventDefault();if(valid)onSubmit(id,{amount,payment_method:method})}}>
    <p className="small-muted">Credit sales appear below until their balance reaches M0.00. A repayment must be received as cash or mobile money; choosing credit does not count as a payment.</p>
    <div className="formgrid">
      <Field label="Sale with outstanding balance" value={id} onChange={setId} options={[["","Select sale"],...sales.map(s=>[String(s.sale_id),`Sale ${s.sale_id} · ${s.vendor_name} · ${money(s.outstanding_balance)} due`])]}/>
      <Field label="Payment amount received (M)" value={amount} type="number" onChange={setAmount}/>
      <Field label="Received via" value={method} onChange={setMethod} options={[["CASH","Cash"],["MOBILE_MONEY","Mobile money"]]}/>
    </div>
    {selected&&<div className="order-summary"><div><span>Outstanding before payment</span><strong>{money(due)}</strong></div><div><span>Outstanding after payment</span><strong>{amount===''||!Number.isFinite(n)||n<0||n>due?'Enter valid payment':money(due-n)}</strong></div></div>}
    <button className="btn" disabled={busy||!valid}>Record received payment</button>
  </form>;
}
function Reports({notify}){const [report,setReport]=useState('top-fruits'),[start,setStart]=useState('2026-11-01'),[end,setEnd]=useState('2026-11-30'),[rows,setRows]=useState(null);async function run(){try{const x=await request('/reports/'+report+(report==='revenue'?`?start=${start}&end=${end}`:''));setRows(x)}catch(e){notify(e.message,'error')}}return <Panel title="Business reports"><div className="formgrid"><Field label="Report" value={report} onChange={v=>{setReport(v);setRows(null)}} options={[["top-fruits","Five most sold fruits"],["revenue","Sales revenue date range"],["top-vendor","Top vendor by boxes"],["stock","Current stock"],["balances","Vendor outstanding balances"]]}/>{report==='revenue'&&<><Field label="Start date" type="date" value={start} onChange={setStart}/><Field label="End date" type="date" value={end} onChange={setEnd}/></>}</div><button className="btn" onClick={run}>Generate report</button>{rows!==null&&<div className="report-result">{Array.isArray(rows)?(report==='stock'?<DataTable rows={rows} columns={[["fruit_id","Fruit ID"],["fruit_name","Fruit variety"],["small_boxes","Small",(x,r)=><QuantityState quantity={x} enabled={r.status==='AVAILABLE'}/>],["medium_boxes","Medium",(x,r)=><QuantityState quantity={x} enabled={r.status==='AVAILABLE'}/>],["large_boxes","Large",(x,r)=><QuantityState quantity={x} enabled={r.status==='AVAILABLE'}/>],["status","Overall stock",(_,r)=><StockState value={stockAvailability(r)}/>]]}/>:<DataTable rows={rows} columns={rows.length?Object.keys(rows[0]).map(k=>[k,k.replaceAll('_',' ')]):[['result','Result']]}/>):<pre>{JSON.stringify(rows,null,2)}</pre>}</div>}</Panel>}
