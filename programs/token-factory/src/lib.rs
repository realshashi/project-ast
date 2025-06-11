use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
mod state;
use state::*;

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
        image_url: String,
        description: Option<String>,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let memecoin = &mut ctx.accounts.memecoin;
        
        // Input validation
        require!(decimals <= 9, TokenFactoryError::InvalidDecimals);
        require!(total_supply > 0, TokenFactoryError::InvalidSupply);
        require!(name.len() <= 32, TokenFactoryError::NameTooLong);
        require!(symbol.len() <= 10, TokenFactoryError::SymbolTooLong);
        require!(image_url.len() <= 200, TokenFactoryError::ImageUrlTooLong);
        
        // Initialize token data
        memecoin.authority = ctx.accounts.authority.key();
        memecoin.mint = ctx.accounts.mint.key();
        memecoin.name = name;
        memecoin.symbol = symbol;
        memecoin.decimals = decimals;
        memecoin.total_supply = total_supply;
        memecoin.image_url = image_url;
        memecoin.created_at = clock.unix_timestamp;
        memecoin.market_cap = 0;
        memecoin.is_graduated = false;
        memecoin.liquidity_pool = None;
        memecoin.raydium_pool = None;

        // Initialize metadata
        let metadata = &mut ctx.accounts.metadata;
        metadata.name = memecoin.name.clone();
        metadata.symbol = memecoin.symbol.clone();
        metadata.image_url = image_url;
        metadata.description = description;
        metadata.website = None;
        metadata.twitter = None;
        metadata.telegram = None;

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

    pub fn update_metadata(
        ctx: Context<UpdateMetadata>,
        website: Option<String>,
        twitter: Option<String>,
        telegram: Option<String>,
    ) -> Result<()> {
        let metadata = &mut ctx.accounts.metadata;
        let memecoin = &ctx.accounts.memecoin;

        require!(
            ctx.accounts.authority.key() == memecoin.authority,
            TokenFactoryError::Unauthorized
        );

        if let Some(website) = website {
            require!(website.len() <= 100, TokenFactoryError::WebsiteUrlTooLong);
            metadata.website = Some(website);
        }

        if let Some(twitter) = twitter {
            require!(twitter.len() <= 50, TokenFactoryError::SocialUrlTooLong);
            metadata.twitter = Some(twitter);
        }

        if let Some(telegram) = telegram {
            require!(telegram.len() <= 50, TokenFactoryError::SocialUrlTooLong);
            metadata.telegram = Some(telegram);
        }

        Ok(())
    }

    pub fn graduate_token(ctx: Context<GraduateToken>) -> Result<()> {
        let memecoin = &mut ctx.accounts.memecoin;
        
        require!(!memecoin.is_graduated, TokenFactoryError::AlreadyGraduated);
        require!(
            memecoin.market_cap >= 1_000_000, // Example: 1M minimum market cap
            TokenFactoryError::InsufficientMarketCap
        );

        // Setup Raydium pool logic would go here
        memecoin.is_graduated = true;
        // Additional graduation logic...

        Ok(())
    }
}

#[error_code]
pub enum TokenFactoryError {
    #[msg("Invalid decimals")]
    InvalidDecimals,
    #[msg("Invalid supply")]
    InvalidSupply,
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Symbol too long")]
    SymbolTooLong,
    #[msg("Image URL too long")]
    ImageUrlTooLong,
    #[msg("Website URL too long")]
    WebsiteUrlTooLong,
    #[msg("Social URL too long")]
    SocialUrlTooLong,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Token already graduated")]
    AlreadyGraduated,
    #[msg("Insufficient market cap for graduation")]
    InsufficientMarketCap,
}