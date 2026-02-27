import { createClient } from '@supabase/supabase-js';
import { executeTask } from './agents';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Node types
export type WorkflowNodeType = 'trigger' | 'agent' | 'condition' | 'delay' | 'action';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  name: string;
  config: {
    agent_id?: string;
    condition?: string;
    delay_seconds?: number;
    action?: string;
    params?: any;
  };
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  condition?: string; // for condition nodes
}

export interface Workflow {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  is_active: boolean;
  last_run_at?: string;
  created_at: string;
}

// Execute a workflow
export async function executeWorkflow(workflowId: string): Promise<{ success: boolean; results?: any[]; error?: string }> {
  try {
    // 1. Get workflow
    const { data: workflow, error: wfError } = await supabaseAdmin
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();
    
    if (wfError || !workflow) {
      return { success: false, error: 'Workflow not found' };
    }
    
    const nodes = workflow.nodes as WorkflowNode[] || [];
    const edges = workflow.edges as WorkflowEdge[] || [];
    
    // 2. Build adjacency list from edges
    const adjacency: Record<string, string[]> = {};
    edges.forEach(edge => {
      if (!adjacency[edge.from]) adjacency[edge.from] = [];
      adjacency[edge.from].push(edge.to);
    });
    
    // 3. Find trigger node
    const triggerNode = nodes.find(n => n.type === 'trigger');
    if (!triggerNode) {
      return { success: false, error: 'No trigger node found' };
    }
    
    // 4. Execute workflow (simple BFS)
    const results: any[] = [];
    const visited = new Set<string>();
    const queue = [triggerNode.id];
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;
      
      let result: any = { node: node.name, type: node.type };
      
      switch (node.type) {
        case 'trigger':
          result.output = 'Workflow triggered';
          break;
          
        case 'agent':
          // Create and execute a task for the agent
          if (node.config.agent_id) {
            const { data: task } = await supabaseAdmin
              .from('agent_tasks')
              .insert({
                agent_id: node.config.agent_id,
                organization_id: workflow.organization_id,
                title: `Workflow: ${node.name}`,
                description: `Executed from workflow: ${workflow.name}`,
                status: 'pending'
              })
              .select()
              .single();
            
            if (task) {
              const execResult = await executeTask(task.id);
              result.output = execResult.output;
              result.success = execResult.success;
            }
          }
          break;
          
        case 'condition':
          // Simple condition evaluation
          result.output = `Condition: ${node.config.condition || 'default'}`;
          result.branches = adjacency[nodeId] || [];
          break;
          
        case 'delay':
          // In production, this would actually delay
          result.output = `Delayed ${node.config.delay_seconds || 0} seconds`;
          break;
          
        case 'action':
          result.output = `Action: ${node.config.action}`;
          break;
      }
      
      results.push(result);
      
      // Add next nodes
      const nextNodes = adjacency[nodeId] || [];
      nextNodes.forEach(nextId => {
        if (!visited.has(nextId)) queue.push(nextId);
      });
    }
    
    // 5. Update workflow last run
    await supabaseAdmin
      .from('workflows')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', workflowId);
    
    return { success: true, results };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get workflow by ID
export async function getWorkflow(workflowId: string, orgId: string) {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .eq('organization_id', orgId)
    .single();
  
  return { workflow: data, error };
}

// List workflows
export async function listWorkflows(orgId: string) {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  
  return { workflows: data || [], error };
}
