use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;
mod state;
use state::*;

declare_id!("Marketplace11111111111111111111111111111111");

#[program]
pub mod marketplace {
    use super::*;

    pub fn create_listing(
        ctx: Context<CreateListing>,
        initial_price: u64,
        amount: u64,
        curve_type: BondingCurveType,
        k_value: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let listing = &mut ctx.accounts.listing;
        
        // Input validation
        require!(initial_price > 0, MarketplaceError::InvalidPrice);
        require!(amount > 0, MarketplaceError::InvalidAmount);
        require!(k_value > 0, MarketplaceError::InvalidKValue);
        
        listing.seller = ctx.accounts.seller.key();
        listing.mint = ctx.accounts.mint.key();
        listing.price = initial_price;
        listing.amount = amount;
        listing.created_at = clock.unix_timestamp;
        listing.curve_type = curve_type;
        listing.k_value = k_value;

        // Create liquidity pool
        let pool = &mut ctx.accounts.liquidity_pool;
        pool.mint = ctx.accounts.mint.key();
        pool.pool_token_a = ctx.accounts.pool_token_a.key();
        pool.pool_token_b = ctx.accounts.pool_token_b.key();
        pool.total_liquidity = 0;
        pool.auto_inject_threshold = 1_000_000; // Example: 1M threshold
        pool.is_graduated = false;

        // Transfer tokens to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.seller_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        let pool = &mut ctx.accounts.liquidity_pool;
        
        // Calculate price based on bonding curve
        let price = calculate_price(
            listing.price,
            listing.amount,
            amount,
            &listing.curve_type,
            listing.k_value,
        )?;

        // Update liquidity pool
        pool.total_liquidity = pool.total_liquidity.checked_add(price)
            .ok_or(MarketplaceError::Overflow)?;

        // Check if we need to graduate to Raydium
        if pool.total_liquidity >= pool.auto_inject_threshold && !pool.is_graduated {
            // Inject liquidity into Raydium
            inject_liquidity_to_raydium(ctx, pool)?;
        }

        // Execute trade
        execute_trade(ctx, amount, price)?;

        Ok(())
    }
}

// Helper functions
fn calculate_price(
    initial_price: u64,
    total_supply: u64,
    amount: u64,
    curve_type: &BondingCurveType,
    k_value: u64,
) -> Result<u64> {
    match curve_type {
        BondingCurveType::Linear => {
            // P = P0 + kx
            Ok(initial_price.checked_add(k_value.checked_mul(amount)
                .ok_or(MarketplaceError::Overflow)?)
                .ok_or(MarketplaceError::Overflow)?)
        },
        BondingCurveType::Exponential => {
            // P = P0 * e^(kx)
            // Simplified implementation
            Ok(initial_price.checked_mul(k_value)
                .ok_or(MarketplaceError::Overflow)?)
        },
        // Add other curve types...
        _ => Err(MarketplaceError::UnsupportedCurveType.into()),
    }
}

#[error_code]
pub enum MarketplaceError {
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid k value")]
    InvalidKValue,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Unsupported curve type")]
    UnsupportedCurveType,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
}