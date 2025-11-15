// lib/vercel.ts

interface VercelDeployment {
  id: string;
  url: string;
  readyState: 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED' | 'CANCELED';
}

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

// Get deployment for a specific branch/commit
export async function getDeploymentForBranch(
  branch: string
): Promise<VercelDeployment | null> {
  try {
    const response = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&teamId=${VERCEL_TEAM_ID}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Find deployment for this branch
    const deployment = data.deployments.find((d: any) => 
      d.meta?.githubCommitRef === branch
    );

    if (!deployment) {
      return null;
    }

    return {
      id: deployment.id,
      url: deployment.url,
      readyState: deployment.readyState,
    };
  } catch (error) {
    console.error('Error getting Vercel deployment:', error);
    return null;
  }
}

// Wait for deployment to be ready
export async function waitForDeployment(
  deploymentId: string,
  maxWaitMs: number = 300000 // 5 minutes
): Promise<{ url: string; ready: boolean }> {
  const startTime = Date.now();
  const pollInterval = 10000; // 10 seconds

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const response = await fetch(
        `https://api.vercel.com/v13/deployments/${deploymentId}?teamId=${VERCEL_TEAM_ID}`,
        {
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Vercel API error: ${response.statusText}`);
      }

      const deployment = await response.json();

      if (deployment.readyState === 'READY') {
        return {
          url: `https://${deployment.url}`,
          ready: true,
        };
      }

      if (deployment.readyState === 'ERROR' || deployment.readyState === 'CANCELED') {
        throw new Error(`Deployment failed with state: ${deployment.readyState}`);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('Error polling deployment status:', error);
      throw error;
    }
  }

  throw new Error('Deployment timeout - took longer than 5 minutes');
}

// Get preview URL for a branch
export async function getPreviewUrl(branch: string): Promise<string | null> {
  const deployment = await getDeploymentForBranch(branch);
  
  if (!deployment) {
    return null;
  }

  if (deployment.readyState === 'READY') {
    return `https://${deployment.url}`;
  }

  // Wait for it to be ready
  const result = await waitForDeployment(deployment.id);
  return result.url;
}

// Trigger production deployment (after PR merge)
export async function triggerProductionDeployment(): Promise<string> {
  try {
    const response = await fetch(
      `https://api.vercel.com/v13/deployments?teamId=${VERCEL_TEAM_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'prism',
          project: VERCEL_PROJECT_ID,
          target: 'production',
          gitSource: {
            type: 'github',
            ref: 'main',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to trigger deployment: ${response.statusText}`);
    }

    const deployment = await response.json();
    
    // Wait for production deployment
    const result = await waitForDeployment(deployment.id);
    
    return result.url;
  } catch (error) {
    console.error('Error triggering production deployment:', error);
    throw new Error(`Failed to trigger production deployment: ${error.message}`);
  }
}
