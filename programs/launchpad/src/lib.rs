use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};
use anchor_spl::associated_token::AssociatedToken;
mod state;
use state::*;

declare_id!("Launchpad11111111111111111111111111111111");

#[program]
pub mod launchpad {
    use super::*;

    pub fn create_launch(
        ctx: Context<CreateLaunch>,
        price: u64,
        total_supply: u64,
        start_time: i64,
        end_time: i64,
        min_contribution: u64,
        max_contribution: u64,
        market_cap_target: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let launch = &mut ctx.accounts.launch;
        
        // Input validation
        require!(price > 0, LaunchpadError::InvalidPrice);
        require!(total_supply > 0, LaunchpadError::InvalidSupply);
        require!(start_time > clock.unix_timestamp, LaunchpadError::InvalidStartTime);
        require!(end_time > start_time, LaunchpadError::InvalidEndTime);
        require!(min_contribution > 0, LaunchpadError::InvalidMinContribution);
        require!(max_contribution >= min_contribution, LaunchpadError::InvalidMaxContribution);
        
        launch.authority = ctx.accounts.authority.key();
        launch.mint = ctx.accounts.mint.key();
        launch.price = price;
        launch.total_supply = total_supply;
        launch.remaining_supply = total_supply;
        launch.start_time = start_time;
        launch.end_time = end_time;
        launch.min_contribution = min_contribution;
        launch.max_contribution = max_contribution;
        launch.created_at = clock.unix_timestamp;
        launch.market_cap_target = market_cap_target;
        launch.followers_count = 0;
        launch.auto_graduate_threshold = market_cap_target;

        // Initialize user profile if it doesn't exist
        if ctx.accounts.user_profile.data_is_empty() {
            let user_profile = &mut ctx.accounts.user_profile;
            user_profile.user = ctx.accounts.authority.key();
            user_profile.following = vec![];
            user_profile.followers = vec![];
            user_profile.created_tokens = vec![ctx.accounts.mint.key()];
            user_profile.trusted_status = false;
            user_profile.reputation_score = 0;
        }

        Ok(())
    }

    pub fn follow_user(ctx: Context<FollowUser>) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        let target_profile = &mut ctx.accounts.target_profile;

        if !user_profile.following.contains(&target_profile.user) {
            user_profile.following.push(target_profile.user);
            target_profile.followers.push(user_profile.user);
        }

        Ok(())
    }

    pub fn participate_launch(
        ctx: Context<ParticipateLaunch>,
        amount: u64
    ) -> Result<()> {
        let launch = &mut ctx.accounts.launch;
        let clock = Clock::get()?;

        require!(
            clock.unix_timestamp >= launch.start_time,
            LaunchpadError::LaunchNotStarted
        );
        require!(
            clock.unix_timestamp <= launch.end_time,
            LaunchpadError::LaunchEnded
        );
        require!(
            amount >= launch.min_contribution,
            LaunchpadError::BelowMinContribution
        );
        require!(
            amount <= launch.max_contribution,
            LaunchpadError::AboveMaxContribution
        );

        // Transfer tokens
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.launch_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        launch.remaining_supply = launch.remaining_supply
            .checked_sub(amount)
            .ok_or(LaunchpadError::InvalidCalculation)?;

        // Update market cap
        let market_cap = launch.price
            .checked_mul(launch.total_supply - launch.remaining_supply)
            .ok_or(LaunchpadError::InvalidCalculation)?;

        // Check if we hit the graduation threshold
        if market_cap >= launch.auto_graduate_threshold {
            // Trigger graduation process
            // This would integrate with the token-factory program
        }

        Ok(())
    }
}

#[error_code]
pub enum LaunchpadError {
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Invalid supply")]
    InvalidSupply,
    #[msg("Invalid start time")]
    InvalidStartTime,
    #[msg("Invalid end time")]
    InvalidEndTime,
    #[msg("Below minimum contribution")]
    BelowMinContribution,
    #[msg("Above maximum contribution")]
    AboveMaxContribution,
    #[msg("Launch not started")]
    LaunchNotStarted,
    #[msg("Launch ended")]
    LaunchEnded,
    #[msg("Invalid calculation")]
    InvalidCalculation,
}