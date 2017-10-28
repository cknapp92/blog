const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
    res.render('login', { title: 'login'} );
}

exports.registerForm = (req, res) => {
    res.render('register', {title: 'register'} );
}

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'Supply a name').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Confirmed password cannot be blank').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        res.render('register', {title: 'Register', body: req.body });
        return;
    }
    next();
}

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next();
}

exports.account = (req, res) => {
    res.render('account', { title: 'Edit your account' });
}

exports.updateAccount = async (req, res) => {
  const updates = {
      name: req.body.name,
      email: req.body.email
  };

  const user = await User.findOneAndUpdate(
      { _id: req.user_id },
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
  );
  req.flash('success', 'updated profile');
  res.redirect('back');
}