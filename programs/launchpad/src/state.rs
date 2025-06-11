use anchor_lang::prelude::*;

#[account]
pub struct LaunchPool {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub total_supply: u64,
    pub remaining_supply: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub min_contribution: u64,
    pub max_contribution: u64,
    pub created_at: i64,
    pub market_cap_target: u64,
    pub followers_count: u32,
    pub auto_graduate_threshold: u64,
}

#[account]
pub struct UserProfile {
    pub user: Pubkey,
    pub following: Vec<Pubkey>,
    pub followers: Vec<Pubkey>,
    pub created_tokens: Vec<Pubkey>,
    pub trusted_status: bool,
    pub reputation_score: u32,
}
