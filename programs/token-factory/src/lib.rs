use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("TokenFactory11111111111111111111111111111111");

#[program]
pub mod token_factory {
    use super::*;

    pub fn create_memecoin(
        ctx: Context<CreateMemecoin>,
        name: String,
        symbol: String,
        decimals: u8,
        total_supply: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let memecoin = &mut ctx.accounts.memecoin;
        
        // Input validation
        require!(decimals <= 9, TokenFactoryError::InvalidDecimals);
        require!(total_supply > 0, TokenFactoryError::InvalidSupply);
        require!(name.len() <= 32, TokenFactoryError::NameTooLong);
        require!(symbol.len() <= 10, TokenFactoryError::SymbolTooLong);
        
        memecoin.authority = ctx.accounts.authority.key();
        memecoin.mint = ctx.accounts.mint.key();
        memecoin.name = name;
        memecoin.symbol = symbol;
        memecoin.decimals = decimals;
        memecoin.total_supply = total_supply;
        memecoin.created_at = clock.unix_timestamp;

        // Mint initial supply to creator
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.creator_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                &[&[b"memecoin", ctx.accounts.memecoin.key().as_ref()][..]]
            ),
            total_supply,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateMemecoin<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Memecoin::LEN,
        seeds = [b"memecoin", mint.key().as_ref()],
        bump
    )]
    pub memecoin: Account<'info, Memecoin>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = authority,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = authority,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct Memecoin {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub total_supply: u64,
    pub created_at: i64,
}

impl Memecoin {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 1 + 8 + 8;
}

#[error]
pub enum TokenFactoryError {
    #[msg("Invalid decimals")]
    InvalidDecimals,
    #[msg("Invalid supply")]
    InvalidSupply,
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Symbol too long")]
    SymbolTooLong,
}