import type {FastifyInstance} from 'fastify'; import {z} from 'zod'; import {requireAuth} from '../auth.js'; import {aiChat,buildLoanSystemPrompt} from '../services/ai.js'; import {supabaseAdmin} from '../supabase.js'; import {audit} from '../services/audit.js';
export async function aiRoutes(app:FastifyInstance){
 app.post('/ai/chat',async(req)=>{const c=await requireAuth(req);const v=z.object({conversation_id:z.string().uuid().optional(),application_id:z.string().uuid().optional(),message:z.string().min(1).max(10000)}).parse(req.body);let cid=v.conversation_id;
  if(cid){const {data:conv,error}=await supabaseAdmin.from('ai_conversations').select('id').eq('id',cid).eq('organization_id',c.orgId).single();if(error||!conv)throw new Error('CONVERSATION_NOT_FOUND');}
  if(!cid){const {data,error}=await supabaseAdmin.from('ai_conversations').insert({organization_id:c.orgId,user_id:c.userId,application_id:v.application_id,title:v.message.slice(0,80)}).select().single();if(error)throw error;cid=data.id;}
  const history=(await supabaseAdmin.from('ai_messages').select('role,content').eq('conversation_id',cid).order('created_at')).data??[];
  const products=(await supabaseAdmin.from('loan_products').select('name,interest_rate,min_credit_score,min_monthly_income,max_loan_amount,min_tenure_months,max_tenure_months,eligibility_rules,required_documents').eq('organization_id',c.orgId).eq('active',true)).data??[];
  let appContext='';if(v.application_id){const {data:a}=await supabaseAdmin.from('applications').select('*,applicants(*),financial_profiles(*),documents(original_name,doc_type,extracted_fields,confidence,status),eligibility_results(*),risk_assessments(*)').eq('id',v.application_id).eq('organization_id',c.orgId).single();appContext=JSON.stringify(a??{});}
  const context=`Configured loan products: ${JSON.stringify(products)}\nApplication context: ${appContext}`;
  const {data:settings}=await supabaseAdmin.from('organization_settings').select('ai_detail').eq('organization_id',c.orgId).maybeSingle();
  const detail=settings?.ai_detail==='concise'||settings?.ai_detail==='detailed'?settings.ai_detail:'standard';
  const answer=await aiChat([{role:'system',content:buildLoanSystemPrompt(context,detail)},...history as any,{role:'user',content:v.message}]);
  await supabaseAdmin.from('ai_messages').insert([{conversation_id:cid,role:'user',content:v.message},{conversation_id:cid,role:'assistant',content:answer}]);await audit(c.orgId,c.userId,'ai.chat',{conversation_id:cid,application_id:v.application_id});return {conversation_id:cid,answer};});
 app.get('/ai/conversations',async req=>{const c=await requireAuth(req);const {data,error}=await supabaseAdmin.from('ai_conversations').select('id,title,application_id,created_at').eq('organization_id',c.orgId).eq('user_id',c.userId).order('created_at',{ascending:false});if(error)throw error;return data??[];});
}
