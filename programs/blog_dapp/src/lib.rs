use anchor_lang::prelude::*;


declare_id!("F3Q3sRSup4zWtezFtcuzhhBFh3UGDkDdeEfo5d8aRq9z");

#[program]
pub mod blog_dapp {
    use super::*;

    pub fn create_post(ctx: Context<CreatePost>, title: String,content: String) -> Result<()> {
        let post =&mut ctx.accounts.post;
        post.title=title;
        post.content=content;
        post.author = *ctx.accounts.author.key;
        post.timestamp = Clock::get()?.unix_timestamp;
        
        msg!("Timestamp set: {}", post.timestamp);
        Ok(())
    }

    pub fn update_post(ctx: Context<UpdatePost>,title: String,content: String)->Result<()>{

        let post = &mut ctx.accounts.post;
        require!(post.author==*ctx.accounts.author.key,CustomError::Unauthorized);
        post.title=title;
        post.content=content;
        Ok(())
    }
    
    pub fn delete_post(ctx:Context<DeletePost>)->Result<()>{

      //let post = &mut ct

        let post = &mut ctx.accounts.post;
        require!(post.author==*ctx.accounts.author.key,CustomError::Unauthorized);    
        // post.title= String::new();
        // post.content= String::new();
        // post.timestamp=0;     

        post.close(ctx.accounts.author.to_account_info())?;                      
            Ok(())
    }


}

#[derive(Accounts)]
pub struct CreatePost <'info> {

  #[account(init,payer = author, space = 9000)]
   pub post : Account<'info,BlogPost>,
   #[account(mut)]
   pub author : Signer<'info>,
   pub system_program : Program<'info, System>,

}

#[derive(Accounts)]
pub struct UpdatePost<'info>{

  #[account(mut)]
  pub post : Account<'info,BlogPost>,
  pub author : Signer<'info>,

}

#[derive(Accounts)]
pub struct DeletePost<'info>{

    #[account(mut, has_one=author,close = author)]
    pub post: Account<'info, BlogPost>,
    pub author: Signer<'info>,
}

#[account]
pub struct BlogPost{

    pub title : String,
    pub content : String,
    pub author : Pubkey,
    pub timestamp : i64,
}

#[error_code]
pub enum CustomError{

    #[msg("You are not authorized to perform this action")]
    Unauthorized,
}
