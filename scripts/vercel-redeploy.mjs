import axios from 'axios';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || '';
const PROJECT_ID = 'prj_lkscale'; // Update with actual project ID

async function redeploy() {
  if (!VERCEL_TOKEN) {
    console.log('❌ VERCEL_TOKEN not set');
    console.log('Set it with: export VERCEL_TOKEN=your_token');
    console.log('Get token from: https://vercel.com/account/tokens');
    return;
  }
  
  try {
    console.log('🚀 Triggering Vercel redeploy...\n');
    
    // Get project info
    const { data: project } = await axios.get(
      `https://api.vercel.com/v9/projects/${PROJECT_ID}`,
      { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
    );
    
    console.log(`Project: ${project.name}`);
    
    // Trigger deployment
    const { data: deployment } = await axios.post(
      `https://api.vercel.com/v9/projects/${PROJECT_ID}/deployments`,
      { target: 'production', meta: { reason: 'data-migration' } },
      { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
    );
    
    console.log(`✅ Deployment triggered!`);
    console.log(`URL: https://${deployment.url}`);
    console.log(`ID: ${deployment.id}`);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data?.message || error.message);
  }
}

redeploy().catch(console.error);
