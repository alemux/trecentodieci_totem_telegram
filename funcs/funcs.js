var moment = require("moment");
var fs = require("fs");

const MysqlParameters = require("../configs/definitions").mysql_connection;
const mysql = require("mysql");

var funcs = {    
}



funcs.apiURL = function(){
    if(process.env.DEVELOPMENT_MODE === "true"){
        return process.env.DEVELOPMENT_URL;
    }else{
        return process.env.PRODUCTION_URL;
    }
}

/**
 * Funzione per valutare il path dell'immagine
 * @param {string} platform qcanavese | tsud | qvenaria
 * @param {*} path /img/pics/ || /img/pics_med/
 * @param {*} filename file_esempio.jpg
 * @returns 
 */
funcs.fullPathImage = function(platform, path, filename){
    // console.log("fullPathImage", platform, path, filename)
    let _filename = '';
    if(filename.indexOf('http') > -1){
        //return filename;
        _filename = filename;
    }else{
        // return funcs.platformURL(platform) + path + filename;
        _filename = funcs.platformImageURL(platform) + path + filename;
    }
    // console.log("fullPathImage: " + _filename);
    return _filename;
}



funcs.copy_file = function(oldfile, newfile){
    fs.copyFile(oldfile, newfile, function(err){
        if(err){
            console.log(err);
        }
    });
}

funcs.shuffle = function(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

funcs.shuffleAlt = function(array) {

    const results = [];
    let l = array.length;
    while (array.length>0) {
        let r = Math.floor(Math.random() * array.length);
        results.push(array[r]);
        array.splice(r, 1);
    }
    return results;

}

funcs.delete_file = function(filepath){
    fs.unlink(filepath, function(err){
        if(err){
            console.log(err);
        }
    });
}

funcs.test = function(){
    console.log("funcs works");
}

funcs.notNull = function(str){
	if(str === undefined){
		return "";
	}else{
		return str;
	}		
}

funcs.error = function(next, text){
    next(new Error(text));
}

funcs.ZeroIfNull = function(value){
    if(value===null || value === '' || value === undefined){
        return 0;
    }else{
        return value;
    }
}

funcs.calculate_perc_promo = function(x, y){
    return Number(((Number(x-y).toPrecision(2))*100) / x).toPrecision(2)
}

funcs.lang_label = function(lang){

    let lang_label = "Lingua non definita";
    switch(lang){
        case "it":
            lang_label = "Italiano";
            break;
        case "en":
            lang_label = "Inglese";
            break;
        case "fr":
            lang_label = "Francese";
            break;
        case "de":
            lang_label = "Tedesco";
            break;
        case "es":
            lang_label = "Spagnolo";
            break;
        case "zh-CN":
            lang_label = "Cinese";
            break;
        case "ru":
            lang_label = "Russo";
            break;
        case "sv":
            lang_label = "Svedese";
            break;
    }
    return lang_label;

}


funcs.sino = function(value, style){
    value = parseInt(value);
    let value_label, value_style;
    if(value===0){
        value_label = "NO";
        value_style = "label label-danger"
    }else{
        value_label = "SI";
        value_style = "label label-success";
    }

    if(style){
        value_label = `<span class="{value_style}">{value_label}</span>`;
    }
    return value_label;

}

funcs.sqlStringReplace = function (str){	
	return str = str.replace(/\'/g,'\'\'');	
}

funcs.ReturnXML = function(res, json_stream){

    var o2x = require('object-to-xml');

    res.set('Content-Type', 'text/xml');
    res.send(o2x({
        '?xml version="1.0" encoding="utf-8"?' : null,
        values: json_stream
    }));
    /*
    var options = {compact: true, ignoreComment: true, spaces: 4};
    var result = convert.json2xml(json_stream, options);

    res.setHeader('Content-Type', 'text/xml');
    res.send((result));
    */
}

funcs.ReturnJSON = function(res, json_stream){
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(json_stream));
}
funcs.formatDate = function(tipo ,val){
    if(tipo===undefined){
        tipo = "mysql";
    }
    if(tipo==="mysql"){
        return moment(val).format("YYYY/MM/DD");
    }
    if(tipo==="input-date"){
        return moment(val).format("YYYY-MM-DD");
    }
    if(tipo==="foldername"){
        return moment(val).format("YYYY-MM");
    }

    if(tipo === "txt"){
        return moment(val).format("YYYY/MM/DD HH:mm:ss");
    }

}

funcs.mysql_now = function(){
    return funcs.formatDate('txt', moment());
}


funcs.calc_imponibile = async function(t, iva){
    return ((t * 100) / ( 100 + iva )).toFixed(2);
}

funcs.calc_totivato = async function(t, iva){
    return (t + (t/100)*iva ).toFixed(2);
}

funcs.splitSelectManagerFieldsArray = function(config_table_field_array){
    let arrayBase = config_table_field_array.split(";");
    let arrayDef = [];
    for(var i=0; i<arrayBase.length; i++){
        arrayDef.push(arrayBase[i].split(":"));
    }
    return arrayDef;
}




funcs.load_global_options = async function(){
    
    let mysql_conn = mysql.createConnection(MysqlParameters);
    let sql = "SELECT * FROM tblconfig ORDER BY idconfig DESC LIMIT 1;";

    // ora devo attendere il caricamento dei dati E POI fare il return
    let configs;
    try{
        let result = await funcs.sql_exec(mysql_conn, sql, []);        
        if(result.length > 0){
            configs = result[0];
            configs.status = 200;            
        }else{            
            configs = {
                status: 501,
                description: "Impossibile leggere il file configurazione globale"
            }
        }
        
    } catch(err){
        console.log("load_global_options error", err);
        configs = err;
    }    
    funcs.sql_end(mysql_conn); // chiudo connessione
    return configs;

}

funcs.load_admtec_menu = async function(session){

   
    let level = session.livello;

    let mysql_conn = mysql.createConnection(MysqlParameters);
    sql = "select * from tblcontent_categoria where admtecmenu_minlivello>="+ mysql.escape(level) +";"

    let menu = await funcs.sql_exec(mysql_conn, sql, []);
    funcs.sql_end(mysql_conn); // chiudo connessione

   
    let obj = {
        menu: menu,
        auth_user: session
    }

    return obj;

}

funcs.load_select_manager_options = async function(level){
    let mysql_conn = mysql.createConnection(MysqlParameters);
    sql = "select idselect_manager, vocemenu from tblselect_manager where config_minlivelloadmin>="+ mysql.escape(level) +" order by ordine ASC;"

    let menu = await funcs.sql_exec(mysql_conn, sql, []);
    funcs.sql_end(mysql_conn); // chiudo connessione
    return menu;
}



funcs.check_numeric_value = function(value){
    //console.log("check_numeric_value => ", typeof value);
    value = String(value);
    let reg_string = /[^0-9]/gi;
    let reg_int = /[0-9]/gi;
    if(value.match(reg_int) !== null && value.match(reg_string) === null){
        return true;
    }else{
        return false;
    }

}


funcs.sql_exec = async function(mysql_conn, sql_string, escapeFields){
    
    try {
        return new Promise((resolve, reject) => {
            mysql_conn.query(sql_string, escapeFields, (er, rs) => {           
                if(er){
                    console.log(er);
                    reject({
                        status: 500,
                        err: er
                    });
                }else{
                    resolve(rs);
                }            
            });
        });
    } catch (error) {
        console.error('Failed to execute SQL query:', error.message);
        throw error;
    }

}

funcs.sql_end = async function(mysql_conn){
    if(mysql_conn){
        mysql_conn.end();
       // console.log("---- mysql connection closed [Funcs.sql_end]");
    }
}

funcs.sql_exec_auto = async function(sql_string, escapeFields){
    
    //console.log("sql_exec_auto sql_string", sql_string);
    //console.log("sql_exec_auto escapeFields", escapeFields);
    let mysql_conn = mysql.createConnection(MysqlParameters);
    mysql_conn.query(sql_string, escapeFields, (er, rs) => {
        if(er){
            console.log("sql_exec_auto ERROR", er);
        }else{
            //console.log("sql_exec_auto OK", rs);
        }
    });
    mysql_conn.end();

}



funcs.selectmanager_configtablearray = function(selectManagerDetail){

    let arrayBase = selectManagerDetail[0].config_table_field_array.split(";");
    let arrayDef = [];
    for(var i=0; i<arrayBase.length; i++){
        arrayDef.push(arrayBase[i].split(":"));
    }
    return arrayDef;

}


// JSON ORDER by order
funcs.compare = function( a, b ){
    if ( a.order < b.order ){
        return -1;
    }
    if ( a.order > b.order ){
        return 1;
    }
    return 0;
}

funcs.paginate = function(array, page_size, page_number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}




funcs.verify_platform = async function(platform){
    let platforms = await fs.readFileSync("./configs/platforms.json");
    platforms = JSON.parse(platforms);
    
    let platform_found = false;
    for(let i = 0; i < platforms.length; i++){
        if(platforms[i].reference === platform){
            platform_found = true;
            break;
        }
    }

    return platform_found;
}


funcs.filterBanners = function(payload, position){

    let response = { status: 200 }
    if(position === undefined){
        response.status = 400;
        response.message = "position undefined";
        return response;
    }

    /*
    {
        status: 200,
        posizioni: [],
        banners: [],
        info: { build_date: '2020-05-19 15:00:00' }
    }
    */

    let authorized_positions;

    // indico per la homepage quali idBanner_posizione sono validi
    if(position === 'homepage'){
        authorized_positions = [1, 2, 3, 4, 5, 7, 300, 301, 302, 1006, 1008];        
    }

    /* ==================== */

    let positions = payload.posizioni.filter((item) => {
        return authorized_positions.includes(item.idBanner_posizione);
    });
   
    for(let i = 0; i < positions.length; i++){
        positions[i].banners = payload.banners.filter((item) => {
            return item.idBanner_posizione === positions[i].idBanner_posizione;
        });
    }

    response.posizioni = positions;   
    return response; 

}

funcs.debug = function(...args) {
    if(process.env.DEVELOPMENT_MODE === "true") {
        console.log(...args);
    }
};

module.exports = funcs;