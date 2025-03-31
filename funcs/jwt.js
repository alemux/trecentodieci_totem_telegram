// elenco funzioni per criptare e decriptare jsonwebtoken
var jwt = require('jsonwebtoken');
var jwt_secret = process.env.JWT_SECRET;

const JWT_class = new Object();

JWT_class.sign = async function(payload){

    let token = jwt.sign(payload, jwt_secret, { expiresIn: '90d'});
    return token;
}

JWT_class.decode = function(payload){
    return new Promise((resolve, reject) => {
        
        jwt.verify(payload, jwt_secret, function(err, decoded){
            if(err){
                reject(err);
            }
            else{
                resolve(decoded);
            }
        });

    });

}

module.exports = JWT_class;