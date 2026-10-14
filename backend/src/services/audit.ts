import { supabaseAdmin } from '../supabase.js';
export async function audit(orgId:string,userId:string,action:string,metadata:Record<string,unknown>={}){
 await supabaseAdmin.from('audit_logs').insert({organization_id:orgId,user_id:userId,action,metadata});
}
