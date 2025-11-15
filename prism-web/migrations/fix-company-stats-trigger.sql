-- Fix the update_company_stats trigger to reference correct table name
-- The trigger was referencing 'software_assets' but the actual table is 'software'

CREATE OR REPLACE FUNCTION public.update_company_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update company portfolio stats whenever software changes
  UPDATE companies
  SET
    total_software_count = (
      SELECT COUNT(*)
      FROM software
      WHERE company_id = NEW.company_id
    ),
    total_annual_software_spend = (
      SELECT COALESCE(SUM(total_annual_cost), 0)
      FROM software
      WHERE company_id = NEW.company_id
    ),
    total_savings_identified = (
      SELECT COALESCE(SUM(ua.optimization_opportunity), 0)
      FROM software sa
      LEFT JOIN usage_analytics ua ON sa.id = ua.software_id
      WHERE sa.company_id = NEW.company_id
    ),
    updated_at = NOW()
  WHERE id = NEW.company_id;

  RETURN NEW;
END;
$function$;

-- Verify the trigger exists
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trg_update_company_stats';
