use anchor_lang::prelude::*;

#[account]
pub struct MemeToken {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub total_supply: u64,
    pub image_url: String,
    pub created_at: i64,
    pub market_cap: u64,
    pub is_graduated: bool,
    pub liquidity_pool: Option<Pubkey>,
    pub raydium_pool: Option<Pubkey>,
}

#[account]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub image_url: String,
    pub description: Option<String>,
    pub website: Option<String>,
    pub twitter: Option<String>,
    pub telegram: Option<String>,
}
