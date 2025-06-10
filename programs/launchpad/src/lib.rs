use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("LpP9xH3J9j9K9j9K9j9K9j9K9j9K9j9K9j9K9j9K9");

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
        let launch = &mut ctx.accounts.launch;
        launch.authority = ctx.accounts.authority.key();
        launch.mint = ctx.accounts.mint.key();
        launch.price = price;
        launch.total_supply = total_supply;
        launch.remaining_supply = total_supply;
        launch.start_time = start_time;
        launch.end_time = end_time;
        launch.min_contribution = min_contribution;
        launch.max_contribution = max_contribution;
        launch.created_at = Clock::get()?.unix_timestamp;

        // Transfer tokens to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.authority_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            total_supply,
        )?;

        Ok(())
    }

    pub fn participate(ctx: Context<Participate>, amount: u64) -> Result<()> {
        let launch = &mut ctx.accounts.launch;
        let current_time = Clock::get()?.unix_timestamp;

        require!(
            current_time >= launch.start_time && current_time <= launch.end_time,
            LaunchpadError::LaunchNotActive
        );
        require!(amount >= launch.min_contribution, LaunchpadError::BelowMinContribution);
        require!(amount <= launch.max_contribution, LaunchpadError::AboveMaxContribution);

        let token_amount = amount.checked_mul(launch.total_supply)
            .ok_or(LaunchpadError::Overflow)?
            .checked_div(launch.price)
            .ok_or(LaunchpadError::Overflow)?;

        require!(token_amount <= launch.remaining_supply, LaunchpadError::InsufficientSupply);

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

        launch.remaining_supply = launch.remaining_supply.checked_sub(token_amount)
            .ok_or(LaunchpadError::Overflow)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateLaunch<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Launch::LEN,
        seeds = [b"launch", mint.key().as_ref()],
        bump
    )]
    pub launch: Account<'info, Launch>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = authority,
    )]
    pub authority_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", mint.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
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
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8;
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