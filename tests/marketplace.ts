import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Marketplace } from "../target/types/marketplace";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("marketplace", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Marketplace as Program<Marketplace>;
  const wallet = provider.wallet as anchor.Wallet;

  let mint: PublicKey;
  let listing: PublicKey;
  let vault: PublicKey;
  let buyer: PublicKey;
  let buyerTokenAccount: PublicKey;

  const price = new anchor.BN(1000000); // 0.001 SOL
  const amount = new anchor.BN(1000000000); // 1000 tokens

  it("Creates a new listing", async () => {
    // Generate keypair for mint
    const mintKeypair = anchor.web3.Keypair.generate();
    mint = mintKeypair.publicKey;

    // Derive PDAs
    [listing] = await PublicKey.findProgramAddress(
      [Buffer.from("listing"), mint.toBuffer(), wallet.publicKey.toBuffer()],
      program.programId
    );

    [vault] = await PublicKey.findProgramAddress(
      [Buffer.from("vault"), mint.toBuffer()],
      program.programId
    );

    // Create listing
    await program.methods
      .createListing(price, amount)
      .accounts({
        seller: wallet.publicKey,
        listing: listing,
        mint: mint,
        sellerTokenAccount: vault,
        vault: vault,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair])
      .rpc();

    // Fetch created listing account
    const listingAccount = await program.account.listing.fetch(listing);

    // Verify account data
    assert.equal(listingAccount.seller.toString(), wallet.publicKey.toString());
    assert.equal(listingAccount.mint.toString(), mint.toString());
    assert.ok(listingAccount.price.eq(price));
    assert.ok(listingAccount.amount.eq(amount));
  });

  it("Buys from a listing", async () => {
    // Generate buyer keypair
    const buyerKeypair = anchor.web3.Keypair.generate();
    buyer = buyerKeypair.publicKey;

    // Derive buyer token account
    buyerTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mint,
      owner: buyer,
    });

    const buyAmount = new anchor.BN(100000000); // 100 tokens

    // Buy from listing
    await program.methods
      .buyListing(buyAmount)
      .accounts({
        buyer: buyer,
        seller: wallet.publicKey,
        listing: listing,
        buyerTokenAccount: buyerTokenAccount,
        vault: vault,
        marketplace: program.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([buyerKeypair])
      .rpc();

    // Fetch updated listing account
    const listingAccount = await program.account.listing.fetch(listing);

    // Verify remaining amount
    assert.ok(listingAccount.amount.eq(amount.sub(buyAmount)));
  });
});
