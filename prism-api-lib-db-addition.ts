// ADD THIS TO lib/db.ts in the featureQueries object:

  updateMetadata: async (id: string, data: {
    tags?: string[];
    estimatedComplexity?: string;
  }) => {
    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.tags) {
      updates.push(`tags = $${paramIndex++}`);
      params.push(data.tags);
    }

    if (data.estimatedComplexity) {
      updates.push(`estimated_complexity = $${paramIndex++}`);
      params.push(data.estimatedComplexity);
    }

    params.push(id);

    await query(`
      UPDATE feature_requests 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `, params);
  },
