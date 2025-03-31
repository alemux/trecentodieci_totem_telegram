const whitelist = [
    
]

var corsOptions = {
    origin: function(origin, cb){
        if( !origin || whitelist.indexOf(origin) !== -1){     
            // n Allowed", origin);
            cb(null, true);
        }else{
            console.log("#######################")
            console.log(!origin);
            console.log(whitelist.indexOf(origin));
            console.log("origin NotAllowed", origin);
            console.log("#######################")
            cb(new Error('Not allowed by CORS'));
        }
    }
}
module.exports = corsOptions;