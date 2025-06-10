use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("MkP9xH3J9j9K9j9K9j9K9j9K9j9K9j9K9j9K9j9K9");

#[program]
pub mod marketplace {
    use super::*;

    pub fn create_listing(
        ctx: Context<CreateListing>,
        price: u64,
        amount: u64,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        listing.seller = ctx.accounts.seller.key();
        listing.mint = ctx.accounts.mint.key();
        listing.price = price;
        listing.amount = amount;
        listing.created_at = Clock::get()?.unix_timestamp;

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

    pub fn buy_listing(ctx: Context<BuyListing>, amount: u64) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        require!(listing.amount >= amount, MarketplaceError::InsufficientAmount);

        // Transfer SOL from buyer to seller
        let transfer_amount = listing.price.checked_mul(amount)
            .ok_or(MarketplaceError::Overflow)?;
        
        **ctx.accounts.buyer.try_borrow_mut_lamports()? = ctx.accounts.buyer.lamports()
            .checked_sub(transfer_amount)
            .ok_or(MarketplaceError::InsufficientFunds)?;
        
        **ctx.accounts.seller.try_borrow_mut_lamports()? = ctx.accounts.seller.lamports()
            .checked_add(transfer_amount)
            .ok_or(MarketplaceError::Overflow)?;

        // Transfer tokens from vault to buyer
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.marketplace.to_account_info(),
                },
            ),
            amount,
        )?;

        listing.amount = listing.amount.checked_sub(amount)
            .ok_or(MarketplaceError::Overflow)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateListing<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        init,
        payer = seller,
        space = 8 + Listing::LEN,
        seeds = [b"listing", mint.key().as_ref(), seller.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,

    pub mint: Account<'info, anchor_spl::token::Mint>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = seller,
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

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
pub struct BuyListing<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub seller: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"listing", listing.mint.as_ref(), listing.seller.as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        mut,
        associated_token::mint = listing.mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", listing.mint.as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    /// CHECK: This is the marketplace PDA
    #[account(
        seeds = [b"marketplace"],
        bump
    )]
    pub marketplace: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
pub struct Listing {
    pub seller: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub amount: u64,
    pub created_at: i64,
}

impl Listing {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8;
}

#[error_code]
pub enum MarketplaceError {
    #[msg("Insufficient amount in listing")]
    InsufficientAmount,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Arithmetic overflow")]
    Overflow,
} 