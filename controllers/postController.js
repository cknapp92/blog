const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const multer = require('multer');
const jimp = require('jimp'); // for resizing uploaded photos
const uuid = require('uuid'); // provides unique ids for uploaded photos
const User = mongoose.model('User');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: `That file type is not supported`}, false);
    }
  }
};

exports.homePage = async (req, res) => {
  const posts = await Post.find();
  res.render('index', { posts });
};

exports.addPost = (req, res) => {
  res.render('editPost', { title: 'Add Post' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    next();
};

exports.createPost = async (req, res) => {
  const post = await (new Post (req.body)).save();
  res.redirect(`/posts`);
};

exports.getPosts = async (req, res) => {
  const posts = await Post.find();  
  res.render('posts', { title: 'Posts', posts });
};

exports.editPost = async (req, res) => {
  // res.json(req.params); 
  const post = await Post.findOne({ _id: req.params.id});
  res.render('editPost', { title: `Edit ${post.name}`, post });
};

exports.updatePost = async (req, res) => { 
  const post = await Post.findOneAndUpdate({ _id: req.params.id}, req.body, {
    new: true,
    runValidators: true
  }).exec();
  res.redirect(`/posts/`);
};

exports.getPostBySlug = async (req, res, next) => {
  const post = await Post.findOne({ slug: req.params.slug });
  if (!post) return next();
  res.render('post', { title: `${post.name}`, post });
};

exports.getPostsByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Post.getTagsList();
  const postsPromise = Post.find({ tags: tagQuery });
  const [tags, posts] = await Promise.all([tagsPromise, postsPromise]);
  res.render('tag', { tags, title: 'Tags', tag, posts })
}

exports.searchPosts = async (req, res) => {
  const posts = await Post
  .find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: { $meta: 'textScore' }
  })
  .sort({
    score: { $meta: 'textScore'}
  })
  .limit(5); // limit to five results
  res.json(posts);
};

exports.heartPost = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User.
    findByIdAndUpdate(req.user._id,
      { [operator]: { hearts: req.params.id }},
      { new: true }
    )
  res.json(user);
}