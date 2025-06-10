import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Launchpad } from "../target/types/launchpad";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("launchpad-edge", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Launchpad as Program<Launchpad>;
  const wallet = provider.wallet as anchor.Wallet;

  it("fails to create launch with invalid time range", async () => {
    const mintKeypair = anchor.web3.Keypair.generate();
    const mint = mintKeypair.publicKey;

    const [launch] = await PublicKey.findProgramAddress(
      [Buffer.from("launch"), mint.toBuffer()],
      program.programId
    );

    const [vault] = await PublicKey.findProgramAddress(
      [Buffer.from("vault"), mint.toBuffer()],
      program.programId
    );

    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(currentTime + 1000);
    const endTime = new anchor.BN(currentTime + 500); // End time before start time

    try {
      await program.methods
        .createLaunch(
          new anchor.BN(1000000),
          new anchor.BN(1000000000),
          startTime,
          endTime,
          new anchor.BN(10000000),
          new anchor.BN(1000000000)
        )
        .accounts({
          authority: wallet.publicKey,
          launch: launch,
          mint: mint,
          authorityTokenAccount: vault,
          vault: vault,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();
      assert.fail("Expected error was not thrown");
    } catch (error) {
      assert.include(error.message, "End time must be after start time");
    }
  });

  it("fails to create launch with invalid contribution limits", async () => {
    const mintKeypair = anchor.web3.Keypair.generate();
    const mint = mintKeypair.publicKey;

    const [launch] = await PublicKey.findProgramAddress(
      [Buffer.from("launch"), mint.toBuffer()],
      program.programId
    );

    const [vault] = await PublicKey.findProgramAddress(
      [Buffer.from("vault"), mint.toBuffer()],
      program.programId
    );

    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(currentTime + 1000);
    const endTime = new anchor.BN(currentTime + 10000);

    try {
      await program.methods
        .createLaunch(
          new anchor.BN(1000000),
          new anchor.BN(1000000000),
          startTime,
          endTime,
          new anchor.BN(1000000000), // Min contribution
          new anchor.BN(10000000) // Max contribution (less than min)
        )
        .accounts({
          authority: wallet.publicKey,
          launch: launch,
          mint: mint,
          authorityTokenAccount: vault,
          vault: vault,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();
      assert.fail("Expected error was not thrown");
    } catch (error) {
      assert.include(
        error.message,
        "Max contribution must be greater than min contribution"
      );
    }
  });

  it("fails to participate before launch start", async () => {
    const mintKeypair = anchor.web3.Keypair.generate();
    const mint = mintKeypair.publicKey;

    const [launch] = await PublicKey.findProgramAddress(
      [Buffer.from("launch"), mint.toBuffer()],
      program.programId
    );

    const [vault] = await PublicKey.findProgramAddress(
      [Buffer.from("vault"), mint.toBuffer()],
      program.programId
    );

    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(currentTime + 1000); // Start in the future
    const endTime = new anchor.BN(currentTime + 10000);

    // Create launch
    await program.methods
      .createLaunch(
        new anchor.BN(1000000),
        new anchor.BN(1000000000),
        startTime,
        endTime,
        new anchor.BN(10000000),
        new anchor.BN(1000000000)
      )
      .accounts({
        authority: wallet.publicKey,
        launch: launch,
        mint: mint,
        authorityTokenAccount: vault,
        vault: vault,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair])
      .rpc();

    // Try to participate
    const participantKeypair = anchor.web3.Keypair.generate();
    const participant = participantKeypair.publicKey;

    const participantTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mint,
      owner: participant,
    });

    try {
      await program.methods
        .participate(new anchor.BN(100000000))
        .accounts({
          participant: participant,
          authority: wallet.publicKey,
          launch: launch,
          participantTokenAccount: participantTokenAccount,
          vault: vault,
          launchpad: program.programId,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .signers([participantKeypair])
        .rpc();
      assert.fail("Expected error was not thrown");
    } catch (error) {
      assert.include(error.message, "Launch has not started");
    }
  });

  it("fails to participate after launch end", async () => {
    const mintKeypair = anchor.web3.Keypair.generate();
    const mint = mintKeypair.publicKey;

    const [launch] = await PublicKey.findProgramAddress(
      [Buffer.from("launch"), mint.toBuffer()],
      program.programId
    );

    const [vault] = await PublicKey.findProgramAddress(
      [Buffer.from("vault"), mint.toBuffer()],
      program.programId
    );

    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(currentTime - 10000); // Started in the past
    const endTime = new anchor.BN(currentTime - 1000); // Ended in the past

    // Create launch
    await program.methods
      .createLaunch(
        new anchor.BN(1000000),
        new anchor.BN(1000000000),
        startTime,
        endTime,
        new anchor.BN(10000000),
        new anchor.BN(1000000000)
      )
      .accounts({
        authority: wallet.publicKey,
        launch: launch,
        mint: mint,
        authorityTokenAccount: vault,
        vault: vault,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair])
      .rpc();

    // Try to participate
    const participantKeypair = anchor.web3.Keypair.generate();
    const participant = participantKeypair.publicKey;

    const participantTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mint,
      owner: participant,
    });

    try {
      await program.methods
        .participate(new anchor.BN(100000000))
        .accounts({
          participant: participant,
          authority: wallet.publicKey,
          launch: launch,
          participantTokenAccount: participantTokenAccount,
          vault: vault,
          launchpad: program.programId,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .signers([participantKeypair])
        .rpc();
      assert.fail("Expected error was not thrown");
    } catch (error) {
      assert.include(error.message, "Launch has ended");
    }
  });
});
