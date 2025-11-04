-- Gamification & Leaderboard Tables
-- Feature #6: Savings Leaderboard
-- Created: January 2025

-- Company Scores & Rankings
CREATE TABLE IF NOT EXISTS company_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Overall Metrics
  total_savings DECIMAL(15,2) DEFAULT 0,
  total_spend DECIMAL(15,2) DEFAULT 0,
  efficiency_score INTEGER DEFAULT 0, -- 0-100
  optimization_rate DECIMAL(5,2) DEFAULT 0, -- Percentage of optimized software

  -- Category Scores (0-100 each)
  negotiation_score INTEGER DEFAULT 0,
  redundancy_score INTEGER DEFAULT 0,
  utilization_score INTEGER DEFAULT 0,
  contract_score INTEGER DEFAULT 0,
  shadow_it_score INTEGER DEFAULT 0,

  -- Activity Metrics
  software_count INTEGER DEFAULT 0,
  optimized_software_count INTEGER DEFAULT 0,
  contracts_reviewed INTEGER DEFAULT 0,
  alternatives_evaluated INTEGER DEFAULT 0,
  approvals_processed INTEGER DEFAULT 0,

  -- Rankings
  overall_rank INTEGER,
  category_rank_negotiation INTEGER,
  category_rank_redundancy INTEGER,
  category_rank_utilization INTEGER,
  previous_rank INTEGER,
  rank_change INTEGER, -- Positive = moved up

  -- Goals & Targets
  monthly_savings_goal DECIMAL(15,2),
  annual_savings_goal DECIMAL(15,2),
  goal_progress_percentage DECIMAL(5,2),

  -- Time Periods
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_current_period BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(company_id, period_start, period_end)
);

CREATE INDEX idx_company_scores_company ON company_scores(company_id);
CREATE INDEX idx_company_scores_rank ON company_scores(overall_rank);
CREATE INDEX idx_company_scores_current ON company_scores(is_current_period);

-- Achievement Badges
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Achievement Definition
  achievement_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., "first_10k_saved"
  achievement_name VARCHAR(255) NOT NULL,
  achievement_description TEXT NOT NULL,
  achievement_category VARCHAR(100) NOT NULL CHECK (achievement_category IN (
    'savings',
    'efficiency',
    'negotiation',
    'optimization',
    'milestones',
    'streaks',
    'special'
  )),

  -- Requirements
  requirement_type VARCHAR(100) NOT NULL CHECK (requirement_type IN (
    'total_savings',
    'efficiency_score',
    'software_optimized',
    'contracts_reviewed',
    'consecutive_months',
    'percentage_goal',
    'specific_action'
  )),
  requirement_value DECIMAL(15,2) NOT NULL,

  -- Display
  icon_emoji VARCHAR(10), -- 🏆, 💰, ⭐, etc.
  badge_color VARCHAR(50), -- gold, silver, bronze, blue, purple
  tier VARCHAR(50) CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  points_awarded INTEGER DEFAULT 0,

  -- Rarity
  rarity VARCHAR(50) CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Achievements (earned badges)
CREATE TABLE IF NOT EXISTS company_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,

  -- Earned Details
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  earned_value DECIMAL(15,2), -- The actual value when earned (e.g., $15,000 saved)
  progress_percentage DECIMAL(5,2), -- If working towards it

  -- Display
  is_featured BOOLEAN DEFAULT false, -- Show prominently
  is_new BOOLEAN DEFAULT true, -- Mark as "New!" for first 7 days

  UNIQUE(company_id, achievement_id)
);

CREATE INDEX idx_company_achievements_company ON company_achievements(company_id);
CREATE INDEX idx_company_achievements_earned_at ON company_achievements(earned_at);

-- Savings Events (for calculating totals)
CREATE TABLE IF NOT EXISTS savings_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Event Type
  event_type VARCHAR(100) NOT NULL CHECK (event_type IN (
    'negotiation_savings',
    'redundancy_removal',
    'license_optimization',
    'alternative_switch',
    'contract_renegotiation',
    'shadow_it_prevention',
    'waste_reduction'
  )),

  -- Financial Impact
  annual_savings DECIMAL(15,2) NOT NULL,
  monthly_savings DECIMAL(15,2),
  one_time_savings DECIMAL(15,2),

  -- Context
  software_id UUID REFERENCES software(id) ON DELETE SET NULL,
  software_name VARCHAR(255),
  description TEXT,

  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB, -- Additional event-specific data

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_savings_events_company ON savings_events(company_id);
CREATE INDEX idx_savings_events_type ON savings_events(event_type);
CREATE INDEX idx_savings_events_created_at ON savings_events(created_at);

-- Leaderboard Snapshots (historical rankings)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Snapshot Info
  snapshot_date DATE NOT NULL,
  snapshot_type VARCHAR(50) CHECK (snapshot_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),

  -- Ranking Data (JSONB for flexibility)
  rankings JSONB NOT NULL, -- [{company_id, rank, score, savings, ...}]

  -- Stats
  total_companies INTEGER,
  total_savings DECIMAL(15,2),
  average_efficiency DECIMAL(5,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(snapshot_date, snapshot_type)
);

CREATE INDEX idx_leaderboard_snapshots_date ON leaderboard_snapshots(snapshot_date);

-- Advisor Performance (if tracking individual advisors)
CREATE TABLE IF NOT EXISTS advisor_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Performance Metrics
  total_clients INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,
  total_savings_generated DECIMAL(15,2) DEFAULT 0,
  average_client_efficiency DECIMAL(5,2) DEFAULT 0,

  -- Activity
  contracts_reviewed INTEGER DEFAULT 0,
  negotiations_completed INTEGER DEFAULT 0,
  software_optimizations INTEGER DEFAULT 0,
  recommendations_made INTEGER DEFAULT 0,
  recommendations_accepted INTEGER DEFAULT 0,

  -- Rankings
  advisor_rank INTEGER,
  previous_rank INTEGER,
  rank_change INTEGER,

  -- Time Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_current_period BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX idx_advisor_performance_user ON advisor_performance(user_id);
CREATE INDEX idx_advisor_performance_rank ON advisor_performance(advisor_rank);

-- Goals & Milestones
CREATE TABLE IF NOT EXISTS company_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Goal Definition
  goal_type VARCHAR(100) NOT NULL CHECK (goal_type IN (
    'total_savings',
    'efficiency_score',
    'software_count_reduction',
    'utilization_increase',
    'contract_reviews',
    'shadow_it_elimination',
    'custom'
  )),

  goal_name VARCHAR(255) NOT NULL,
  goal_description TEXT,

  -- Target
  target_value DECIMAL(15,2) NOT NULL,
  current_value DECIMAL(15,2) DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0,

  -- Time Frame
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  completed_date DATE,

  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'missed', 'cancelled')),

  -- Rewards
  achievement_id UUID REFERENCES achievements(id) ON DELETE SET NULL, -- Award when completed

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_company_goals_company ON company_goals(company_id);
CREATE INDEX idx_company_goals_status ON company_goals(status);

-- Streaks (consecutive achievements)
CREATE TABLE IF NOT EXISTS achievement_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Streak Type
  streak_type VARCHAR(100) NOT NULL CHECK (streak_type IN (
    'monthly_savings',
    'efficiency_improvement',
    'goal_achievement',
    'daily_activity',
    'weekly_optimization'
  )),

  -- Streak Data
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(company_id, streak_type)
);

CREATE INDEX idx_achievement_streaks_company ON achievement_streaks(company_id);

-- Triggers for updated_at
CREATE TRIGGER update_company_scores_updated_at BEFORE UPDATE ON company_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advisor_performance_updated_at BEFORE UPDATE ON advisor_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_goals_updated_at BEFORE UPDATE ON company_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievement_streaks_updated_at BEFORE UPDATE ON achievement_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Initial Achievements
INSERT INTO achievements (achievement_key, achievement_name, achievement_description, achievement_category, requirement_type, requirement_value, icon_emoji, badge_color, tier, points_awarded, rarity) VALUES
  -- Savings Milestones
  ('first_1k_saved', 'Getting Started', 'Save your first $1,000', 'savings', 'total_savings', 1000, '🎯', 'bronze', 'bronze', 10, 'common'),
  ('first_10k_saved', 'Five Figures', 'Save $10,000 in total', 'savings', 'total_savings', 10000, '💰', 'silver', 'silver', 50, 'uncommon'),
  ('first_50k_saved', 'Major Milestone', 'Save $50,000 in total', 'savings', 'total_savings', 50000, '💎', 'gold', 'gold', 250, 'rare'),
  ('first_100k_saved', 'Six Figures', 'Save $100,000 in total', 'savings', 'total_savings', 100000, '🏆', 'gold', 'platinum', 500, 'epic'),
  ('first_250k_saved', 'Quarter Million', 'Save $250,000 in total', 'savings', 'total_savings', 250000, '👑', 'purple', 'platinum', 1000, 'epic'),
  ('first_500k_saved', 'Half Million Hero', 'Save $500,000 in total', 'savings', 'total_savings', 500000, '🌟', 'purple', 'diamond', 2500, 'legendary'),
  ('first_1m_saved', 'Millionaire', 'Save $1,000,000 in total', 'savings', 'total_savings', 1000000, '💫', 'gold', 'diamond', 5000, 'legendary'),

  -- Efficiency
  ('efficiency_50', 'Getting Efficient', 'Reach 50% efficiency score', 'efficiency', 'efficiency_score', 50, '📊', 'bronze', 'bronze', 20, 'common'),
  ('efficiency_75', 'Highly Efficient', 'Reach 75% efficiency score', 'efficiency', 'efficiency_score', 75, '📈', 'silver', 'silver', 75, 'uncommon'),
  ('efficiency_90', 'Optimization Expert', 'Reach 90% efficiency score', 'efficiency', 'efficiency_score', 90, '⚡', 'gold', 'gold', 200, 'rare'),
  ('efficiency_100', 'Perfect Efficiency', 'Reach 100% efficiency score', 'efficiency', 'efficiency_score', 100, '🎖️', 'purple', 'platinum', 1000, 'legendary'),

  -- Negotiation
  ('first_negotiation', 'Negotiator', 'Complete your first negotiation', 'negotiation', 'contracts_reviewed', 1, '🤝', 'bronze', 'bronze', 10, 'common'),
  ('negotiation_master', 'Master Negotiator', 'Complete 10 negotiations', 'negotiation', 'contracts_reviewed', 10, '💼', 'gold', 'gold', 150, 'rare'),

  -- Optimization
  ('first_optimization', 'Optimizer', 'Optimize your first software', 'optimization', 'software_optimized', 1, '🔧', 'bronze', 'bronze', 10, 'common'),
  ('optimization_10', 'Optimization Pro', 'Optimize 10 software tools', 'optimization', 'software_optimized', 10, '⚙️', 'silver', 'silver', 100, 'uncommon'),
  ('optimization_25', 'Optimization Expert', 'Optimize 25 software tools', 'optimization', 'software_optimized', 25, '🎯', 'gold', 'gold', 300, 'rare'),

  -- Streaks
  ('streak_3_months', '3 Month Streak', 'Save money for 3 consecutive months', 'streaks', 'consecutive_months', 3, '🔥', 'orange', 'silver', 50, 'uncommon'),
  ('streak_6_months', '6 Month Streak', 'Save money for 6 consecutive months', 'streaks', 'consecutive_months', 6, '🔥', 'orange', 'gold', 150, 'rare'),
  ('streak_12_months', 'Year Long Streak', 'Save money for 12 consecutive months', 'streaks', 'consecutive_months', 12, '🔥', 'red', 'platinum', 500, 'epic'),

  -- Special
  ('early_adopter', 'Early Adopter', 'One of the first 100 companies', 'special', 'specific_action', 1, '🚀', 'blue', 'gold', 100, 'rare'),
  ('goal_crusher', 'Goal Crusher', 'Achieve 5 goals', 'milestones', 'percentage_goal', 5, '💪', 'purple', 'gold', 200, 'rare')
ON CONFLICT (achievement_key) DO NOTHING;
