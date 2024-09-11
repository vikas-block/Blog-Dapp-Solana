import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlogDapp } from "../target/types/blog_dapp";
const {SystemProgram}= anchor.web3;


describe("blog_dapp", () => {
  // Configure the client to use the local cluster.

  const provider=anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BlogDapp as Program<BlogDapp>;
  
  const postAccount  = anchor.web3.Keypair.generate();



  it("Creates a blog post!", async () => {
    // Add your test here.
    const tx = await program.methods.createPost(
    "First Post",
    "THis is my first post")
    .accounts({
       post: postAccount.publicKey,
       author:provider.wallet.publicKey,
       systemProgram: SystemProgram.programId,
      // timestamp: new Date().toISOString(),
    })
    .signers([postAccount])
    .rpc();
    //console.log("Your transaction signature", tx);
    const post = await program.account.blogPost.fetch(postAccount.publicKey);
    console.log("Post :- ",post);
  });

   it("Update a blog post ", async()=>{
    
    await program.methods.updatePost("Update Title","Updated content")
    .accounts({
      post:postAccount.publicKey,
      author:provider.wallet.publicKey,
    })
    .rpc();
    const post = await program.account.blogPost.fetch(postAccount.publicKey);
    console.log("Updated Post :- ",post); 

  })

});
