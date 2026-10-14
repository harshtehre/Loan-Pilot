import { supabase } from './supabase';
const configuredApi = import.meta.env.VITE_API_URL as string | undefined;
const API = configuredApi?.trim().replace(/\/+$/, '');
export async function api<T>(path:string,options:RequestInit={}):Promise<T>{
 if(!API) throw new Error('Backend API is not configured. Set VITE_API_URL.');
 const session=(await supabase?.auth.getSession())?.data.session;
 const headers=new Headers(options.headers); if(!(options.body instanceof FormData)) headers.set('content-type','application/json');
 if(session?.access_token) headers.set('authorization',`Bearer ${session.access_token}`);
 const r=await fetch(`${API}${path}`,{...options,headers}); const body=await r.json().catch(()=>({}));
 if(!r.ok) throw new Error(body.error||`Request failed (${r.status})`); return body as T;
}
export const getJson=<T>(path:string)=>api<T>(path);
export const postJson=<T>(path:string,body:unknown)=>api<T>(path,{method:'POST',body:JSON.stringify(body)});
export const putJson=<T>(path:string,body:unknown)=>api<T>(path,{method:'PUT',body:JSON.stringify(body)});
export const patchJson=<T>(path:string,body:unknown)=>api<T>(path,{method:'PATCH',body:JSON.stringify(body)});
