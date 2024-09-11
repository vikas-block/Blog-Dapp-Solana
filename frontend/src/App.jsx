import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import idl from "./blog_dapp.json";
import { Buffer } from "buffer";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

window.Buffer = Buffer;

const { SystemProgram, Keypair } = anchor.web3;

// const privateKey = Uint8Array.from([
//   206, 65, 145, 162, 160, 137, 130, 127, 73, 214, 0, 140, 128, 199, 66, 4, 18,
//   147, 132, 244, 162, 188, 29, 136, 53, 111, 35, 61, 72, 205, 109, 196, 168,
//   178, 40, 91, 43, 84, 10, 53, 161, 217, 146, 225, 235, 130, 26, 19, 69, 104,
//   180, 146, 78, 122, 213, 70, 178, 148, 38, 48, 216, 95, 243, 64,
// ]);

let myaccount = Keypair.generate();

const programID = new PublicKey(idl.metadata.address);
console.log(programID, "Program Id set correctly");

console.log("program ID ; - ", programID.toBase58());

const network = clusterApiUrl("devnet");

const opts = {
  preflightCommitment: "processed",
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",

  //boxShadow: 100,
  p: 4,
};

function App() {
  //const [count, setCount] = useState(0)

  const [walletAddress, setWalletAddress] = useState(null);
  const [walletName, setWalletName] = useState(null);
  //const [title, setTitle] = useState("");
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [currentPostkey, setCurrentPostkey] = useState(null);

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //connect wallet

  window.onload = async function () {
    try {
      if (window.solana) {
        const solana = window.solana;
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");
          const res = await solana.connect({ onlyIfTrusted: true });
          console.log("Connected with public Key :", res.publicKey.toString());
          setWalletAddress(res.publicKey.toString());
          fetchPosts();
        }
      } else {
        alert("Wallet not found! Get a phantom wallet");
      }
    } catch (err) {
      console.error(err);
    }
  };

  //Provider / environment setup

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new anchor.AnchorProvider(
      connection, // Corrected connection instance
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const connectwallet = async () => {
    console.log("Button clicked for wallet");
    if (window.solana) {
      const solana = window.solana;
      const res = await solana.connect();
      setWalletAddress(res.publicKey.toString());
      fetchPosts();
    } else {
      alert("wallet not found ! get a Phantom wallet");
    }
  };

  //creatPost function

  const createPost = async (title, content) => {
    try {
      const provider = getProvider();
      const program = new anchor.Program(idl, programID, provider);

      console.log("near to creation");
      console.log("program :- ", program);
      console.log("chdfgjsd :-", provider.wallet.publicKey);

      const tx = await program.rpc.createPost(title, content, {
        accounts: {
          post: myaccount.publicKey,
          author: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [myaccount],
      });

      console.log("Post created succefully");
      fetchPosts();
    } catch (err) {
      console.log("Error in creating account :", err);
    }
  };

  //fetchPosts function

  const fetchPosts = async () => {
    try {
      const provider = getProvider();
      const program = new anchor.Program(idl, programID, provider);

      const postAccounts = await program.account.blogPost.all();

      console.log("this is in progress");

      const postsList = postAccounts.map((account) => ({
        publicKey: account.publicKey.toString(),
        author: account.account.author.toString(),
        title: account.account.title,
        content: account.account.content,
        timestamp: account.account.timestamp.toString(),
      }));

      setPosts(postsList);

      console.log("Posts fetched successfully:", postsList);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  //deletePost function

  const deletePost = async (postpubkey) => {
    try {
      console.log("check POSTPUBKEY :-", postpubkey);

      const provider = getProvider();
      const program = new anchor.Program(idl, programID, provider);
      // await problem.account.c
      //console.log("Post_pubkey_checking :-", post.publicKey.toString());
      await program.rpc.deletePost({
        accounts: {
          post: postpubkey,
          author: provider.wallet.publicKey,
        },
      });
      alert("delete function run successfully");

      setPosts(
        posts.filter(
          (post) => post.publicKey.toString() !== postpubkey.toString()
        )
      );
    } catch (err) {
      console.log("Error in delete Function", err);
    }
  };

  //updatePost function

  const updatePost = async (title, content) => {
    try {
      const provider = getProvider();
      const program = new anchor.Program(idl, programID, provider);

      await program.rpc.updatePost(title, content, {
        accounts: {
          post: new PublicKey(currentPostkey),
          author: provider.wallet.publicKey,
        },
      });

      fetchPosts();
    } catch (err) {
      console.log("Error in updating post:", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost(title, content);
  };

  const handleSubmit2 = (e) => {
    e.preventDefault();
    if (currentPostkey) {
      updatePost(editTitle, editContent);
    }
  };

  return (
    <>
      <div className="initial">
        <div className="app-container">
          <img
            src="https://radiant-flame-44830ef920.media.strapiapp.com/5fad86e2327507cecea2d5e8_65379a0391616fd0bbda7515_Is_20_Solana_20_Ded_4afb6c283f.jpg"
            class="background-image"
          />
          <h2 className="h2">WELCOME TO BLOG DAPP</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <div className="box">
                {!walletAddress && (
                  <button className="btn2" onClick={connectwallet}>
                    Connect Wallet
                  </button>
                )}
              </div>

              {walletAddress && (
                <div>
                  <p className="xyz">
                    Connected wallet :{" "}
                    <span className="address"> {walletAddress}</span>
                  </p>
                  <div className="form-fields">
                    <input
                      className="inp"
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                      className="inp"
                      placeholder="Write Description about title"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                    <button className="btn" type="submit">
                      Create Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>

          {walletAddress && (
            <div className="posts-container">
              <h2 className="post-h2">Posts {posts.length}</h2>
              <blockquote class="scrol">
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <div key={index} className="post">
                      <>
                        <h3>Title :-</h3>
                        <p> {post.title}</p>

                        <h4>Description :- </h4>
                        <p>{post.content}</p>

                        <p>
                          <strong>Author:</strong> {post.author}
                          <p>
                            time :-{" "}
                            {new Date(post.timestamp * 1000).toLocaleString()}
                          </p>
                        </p>
                      </>

                      <div className="button_box">
                        <button
                          className="Dlt_button"
                          onClick={() => {
                            setEditTitle(post.title);
                            setEditContent(post.content);
                            setCurrentPostkey(post.publicKey);
                            handleOpen();
                          }}
                        >
                          Edit
                        </button>
                        <Modal open={open} onClose={handleClose}>
                          <Box sx={style}>
                            <TextField
                              label="Title"
                              fullWidth
                              margin="normal"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                            <TextField
                              label="Description"
                              fullWidth
                              margin="normal"
                              multiline
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            />
                            <button
                              variant="contained"
                              color="primary"
                              onClick={handleSubmit2}
                            >
                              Update
                            </button>
                          </Box>
                        </Modal>

                        <button
                          className="Dlt_button"
                          onClick={() => deletePost(post.publicKey)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No posts found.</p>
                )}
              </blockquote>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
