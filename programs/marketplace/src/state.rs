use anchor_lang::prelude::*;

#[account]
pub struct MarketListing {
    pub seller: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub amount: u64,
    pub created_at: i64,
    pub curve_type: BondingCurveType,
    pub k_value: u64,
}

#[account]
pub struct LiquidityPool {
    pub mint: Pubkey,
    pub pool_token_a: Pubkey,
    pub pool_token_b: Pubkey,
    pub total_liquidity: u64,
    pub auto_inject_threshold: u64,
    pub is_graduated: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum BondingCurveType {
    Linear,
    Exponential,
    Sigmoid,
    Custom,
}
