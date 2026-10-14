import type { FastifyRequest } from 'fastify';
import { supabaseAdmin } from './supabase.js';

export type AuthContext = { userId:string; orgId:string; role:'owner'|'admin'|'loan_officer'|'analyst'|'viewer' };
export class HttpError extends Error { constructor(public statusCode:number, message:string){super(message)} }

export async function requireAuth(req:FastifyRequest):Promise<AuthContext>{
  const h=req.headers.authorization;
  if(!h?.startsWith('Bearer ')) throw new HttpError(401,'UNAUTHORIZED');
  const token=h.slice(7);
  const {data,error}=await supabaseAdmin.auth.getUser(token);
  if(error||!data.user) throw new HttpError(401,'UNAUTHORIZED');
  const {data:profile,error:pe}=await supabaseAdmin.from('users').select('organization_id,status').eq('id',data.user.id).maybeSingle();
  if(pe) throw pe;
  if(!profile) throw new HttpError(403,'PROFILE_NOT_FOUND');
  if(profile.status==='disabled') throw new HttpError(403,'ACCOUNT_DISABLED');
  const {data:role,error:re}=await supabaseAdmin.from('roles').select('role').eq('user_id',data.user.id).eq('organization_id',profile.organization_id).maybeSingle();
  if(re) throw re;
  return {userId:data.user.id,orgId:profile.organization_id,role:(role?.role??'viewer') as AuthContext['role']};
}
export const canWrite=(role:string)=>['owner','admin','loan_officer','analyst'].includes(role);
export const canAdmin=(role:string)=>['owner','admin'].includes(role);
export const canManageProducts=(role:string)=>['owner','admin','analyst'].includes(role);
