use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};
use anchor_spl::associated_token::AssociatedToken;

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

        // Transfer tokens to vault
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.authority_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                &[&[b"launch_vault", ctx.accounts.launch.key().as_ref()][..]]
            ),
            total_supply,
        )?;

        Ok(())
    }

    pub fn participate(ctx: Context<Participate>, amount: u64) -> Result<()> {
        let clock = Clock::get()?;
        let launch = &mut ctx.accounts.launch;
        
        // Validate participation
        require!(launch.remaining_supply > 0, LaunchpadError::SoldOut);
        require!(clock.unix_timestamp >= launch.start_time, LaunchpadError::NotStarted);
        require!(clock.unix_timestamp <= launch.end_time, LaunchpadError::Ended);
        require!(amount >= launch.min_contribution, LaunchpadError::BelowMinContribution);
        require!(amount <= launch.max_contribution, LaunchpadError::AboveMaxContribution);
        require!(amount <= launch.remaining_supply, LaunchpadError::InsufficientSupply);
        
        // Update launch state
        launch.remaining_supply = launch.remaining_supply
            .checked_sub(amount)
            .ok_or(LaunchpadError::MathOverflow)?;

        require!(
            clock.unix_timestamp >= launch.start_time && clock.unix_timestamp <= launch.end_time,
            LaunchpadError::LaunchNotActive
        );
        
        let token_amount = amount.checked_mul(launch.total_supply)
            .ok_or(LaunchpadError::Overflow)?
            .checked_div(launch.price)
            .ok_or(LaunchpadError::Overflow)?;

        // Transfer SOL from participant to authority
        **ctx.accounts.participant.try_borrow_mut_lamports()? = ctx.accounts.participant.lamports()
            .checked_sub(amount)
            .ok_or(LaunchpadError::InsufficientFunds)?;
        
        **ctx.accounts.authority.try_borrow_mut_lamports()? = ctx.accounts.authority.lamports()
            .checked_add(amount)
            .ok_or(LaunchpadError::Overflow)?;

        // Transfer tokens from vault to participant
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.participant_token_account.to_account_info(),
                    authority: ctx.accounts.launchpad.to_account_info(),
                },
            ),
            token_amount,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateLaunch<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        seeds = [b"launch".as_ref(), authority.key().as_ref()],
        bump,
        payer = authority,
        space = Launch::LEN
    )]
    pub launch: Account<'info, Launch>,
    #[account(mut)]
    pub authority_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = launch
    )]
    pub vault: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Participate<'info> {
    #[account(mut)]
    pub participant: Signer<'info>,
    #[account(mut)]
    pub authority: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [b"launch", launch.mint.as_ref()],
        bump
    )]
    pub launch: Account<'info, Launch>,
    #[account(
        mut,
        associated_token::mint = launch.mint,
        associated_token::authority = participant,
    )]
    pub participant_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault", launch.mint.as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,
    /// CHECK: This is the launchpad PDA
    #[account(
        seeds = [b"launchpad"],
        bump
    )]
    pub launchpad: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
pub struct Launch {
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
}

impl Launch {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8;
}

#[error_code]
pub enum LaunchpadError {
    #[msg("Launch is not active")]
    LaunchNotActive,
    #[msg("Contribution below minimum")]
    BelowMinContribution,
    #[msg("Contribution above maximum")]
    AboveMaxContribution,
    #[msg("Insufficient supply")]
    InsufficientSupply,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Arithmetic overflow")]
    Overflow,
} 