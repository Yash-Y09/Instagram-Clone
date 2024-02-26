const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")


router.get('/allpost',requireLogin,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/createpost',requireLogin,(req,res)=>{
    const{title,body,pic} = req.body
    if( !title || !body || !pic ){
        return res.status(422).json({error:"Please add all required fields"})
    }
    req.user.password = undefined
    const post = new Post({
        title,
        body,
        photo:pic,
        postedBy:req.user
    })
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/mypost',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id name")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
      $push: { likes: req.user._id },
    }, { new: true })
    .populate("postedBy", "_id name") // Populate the postedBy field
    .populate("comments.postedBy", "_id name")
      .then((result) => {
        if (!result) {
          // Handle case where post is not found
          return res.status(404).json({ error: 'Post not found' });
        }
        res.json(result);
      })
      .catch((err) => {
        console.error('Error liking post:', err);
        res.status(500).json({ error: 'Internal server error' });
      });
  });
  
  router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
      $pull: { likes: req.user._id },
    }, { new: true })
    .populate("postedBy", "_id name") // Populate the postedBy field
    .populate("comments.postedBy", "_id name")
      .then((result) => {
        if (!result) {
          // Handle case where post is not found
          return res.status(404).json({ error: 'Post not found' });
        }
        res.json(result);
      })
      .catch((err) => {
        console.error('Error unliking post:', err);
        res.status(500).json({ error: 'Internal server error' });
      });
  });

  router.put('/comment', requireLogin, (req, res) => {
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
      $push: { comments: comment },
    }, { new: true })
        .populate("comments.postedBy", "_id name")
        .populate("postedBy", "_id name")
      .then((result) => {
        if (!result) {
          // Handle case where post is not found
          return res.status(404).json({ error: 'Post not found' });
        }
        res.json(result);
      })
      .catch((err) => {
        console.error('Error liking post:', err);
        res.status(500).json({ error: 'Internal server error' });
      });
  });
  
//   router.delete('/deletepost/:postId',requireLogin,(req,res)=>{
//     Post.findOne({_id:req.params.postId})
//     .populate("postedBy","_id")
//     .exec((err,post)=>{
//         if(err || !post){
//             return res.status(422).json({error:err})
//         }if(post.postedBy._id.toString() === req.user._id.toString()){
//             post.remove()
//             .then(result=>{
//                 res.json(result)
//             }).catch(err=>{
//                 console.log(err)
//             })
//         }
//     })
//   })

router.delete('/deletepost/:postId',requireLogin, async (req, res) => {
    try {
        const post = await Post.findOne({_id: req.params.postId}).populate("postedBy", "_id");
        if (!post) {
            return res.status(404).json({error: 'Post not found'});
        }
        if (!req.user) {
            return res.status(401).json({error: 'User not authenticated'});
        }
        if (post.postedBy._id.toString() === req.user._id.toString()) {
            const result = await Post.deleteOne({_id: req.params.postId});
            res.json(result);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Server error'});
    }
});

// Add a new route to handle comment deletion
router.delete('/deletecomment/:postId/:commentId', requireLogin, async (req, res) => {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;

        const post = await Post.findById(postId).populate("postedBy","_id")
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Find the comment
        const comment = post.comments.find(comment => comment._id.toString() === commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if the user trying to delete the comment is the one who posted it
        if (comment.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'You are not authorized to delete this comment' });
        }

        // Remove the comment from the post
        post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);
        const result = await post.save();
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});

  


module.exports = router