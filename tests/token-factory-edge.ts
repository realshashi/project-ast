import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TokenFactory } from "../target/types/token_factory";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("token-factory-edge", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenFactory as Program<TokenFactory>;
  const wallet = provider.wallet as anchor.Wallet;

  it("fails to create token with empty name", async () => {
    const mintKeypair = anchor.web3.Keypair.generate();
    const mint = mintKeypair.publicKey;

    const [memecoin] = await PublicKey.findProgramAddress(
      [Buffer.from("memecoin"), mint.toBuffer()],
      program.programId
    );

    const creatorTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mint,
      owner: wallet.publicKey,
    });

    try {
      await program.methods
        .createMemecoin("", "TEST", 9, new anchor.BN(1000000000))
        .accounts({
          authority: wallet.publicKey,
          memecoin: memecoin,
          mint: mint,
          creatorTokenAccount: creatorTokenAccount,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();
      assert.fail("Expected error was not thrown");
    } catch (error) {
      assert.include(error.message, "Name cannot be empty");
    }
  });

  it("fails to create token with invalid decimals", async () => {
    const mintKeypair = anchor.web3.Keypair.generate();
    const mint = mintKeypair.publicKey;

    const [memecoin] = await PublicKey.findProgramAddress(
      [Buffer.from("memecoin"), mint.toBuffer()],
      program.programId
    );

    const creatorTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mint,
      owner: wallet.publicKey,
    });

    try {
      await program.methods
        .createMemecoin("Test Token", "TEST", 10, new anchor.BN(1000000000))
        .accounts({
          authority: wallet.publicKey,
          memecoin: memecoin,
          mint: mint,
          creatorTokenAccount: creatorTokenAccount,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();
      assert.fail("Expected error was not thrown");
    } catch (error) {
      assert.include(error.message, "Decimals must be between 0 and 9");
    }
  });

  it("fails to create token with zero supply", async () => {
    const mintKeypair = anchor.web3.Keypair.generate();
    const mint = mintKeypair.publicKey;

    const [memecoin] = await PublicKey.findProgramAddress(
      [Buffer.from("memecoin"), mint.toBuffer()],
      program.programId
    );

    const creatorTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mint,
      owner: wallet.publicKey,
    });

    try {
      await program.methods
        .createMemecoin("Test Token", "TEST", 9, new anchor.BN(0))
        .accounts({
          authority: wallet.publicKey,
          memecoin: memecoin,
          mint: mint,
          creatorTokenAccount: creatorTokenAccount,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();
      assert.fail("Expected error was not thrown");
    } catch (error) {
      assert.include(error.message, "Total supply must be greater than 0");
    }
  });

  it("fails to create token with duplicate symbol", async () => {
    // First token creation
    const mint1Keypair = anchor.web3.Keypair.generate();
    const mint1 = mint1Keypair.publicKey;

    const [memecoin1] = await PublicKey.findProgramAddress(
      [Buffer.from("memecoin"), mint1.toBuffer()],
      program.programId
    );

    const creatorTokenAccount1 = await anchor.utils.token.associatedAddress({
      mint: mint1,
      owner: wallet.publicKey,
    });

    await program.methods
      .createMemecoin("Test Token 1", "TEST", 9, new anchor.BN(1000000000))
      .accounts({
        authority: wallet.publicKey,
        memecoin: memecoin1,
        mint: mint1,
        creatorTokenAccount: creatorTokenAccount1,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mint1Keypair])
      .rpc();

    // Second token creation with same symbol
    const mint2Keypair = anchor.web3.Keypair.generate();
    const mint2 = mint2Keypair.publicKey;

    const [memecoin2] = await PublicKey.findProgramAddress(
      [Buffer.from("memecoin"), mint2.toBuffer()],
      program.programId
    );

    const creatorTokenAccount2 = await anchor.utils.token.associatedAddress({
      mint: mint2,
      owner: wallet.publicKey,
    });

    try {
      await program.methods
        .createMemecoin("Test Token 2", "TEST", 9, new anchor.BN(1000000000))
        .accounts({
          authority: wallet.publicKey,
          memecoin: memecoin2,
          mint: mint2,
          creatorTokenAccount: creatorTokenAccount2,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mint2Keypair])
        .rpc();
      assert.fail("Expected error was not thrown");
    } catch (error) {
      assert.include(error.message, "Symbol already exists");
    }
  });
});
