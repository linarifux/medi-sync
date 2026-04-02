import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  // Signs a token with the user's ID, using your secret, expiring in 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;