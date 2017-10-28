const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', postController.homePage);
router.get('/posts', catchErrors(postController.getPosts));
router.get('/add', authController.isLoggedIn, postController.addPost);

router.post('/add', 
  postController.upload, 
  catchErrors(postController.resize), 
  catchErrors(postController.createPost));

router.post('/add/:id', 
  postController.upload,     
  catchErrors(postController.resize),
  catchErrors(postController.updatePost));

router.get('/posts/:id/edit', catchErrors(postController.editPost));

router.get(`/posts/:slug`, catchErrors(postController.getPostBySlug));

router.get('/tags', catchErrors (postController.getPostsByTag));
router.get('/tags/:tag', catchErrors (postController.getPostsByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);

router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));

router.get('/api/search', catchErrors(postController.searchPosts));

module.exports = router;
