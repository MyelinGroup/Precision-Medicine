const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'dbuser',
  password: 'dbuserpass',
  database: 'bigdata'
})

var dbParameters = { // Names set in event list percolate globally to classes storing the values
    'Events' : {'Name':'TINYTEXT','DateTime':'DATETIME','EventType':'TINYTEXT','EventCategory':'TINYTEXT','EventData':'MEDIUMTEXT'} 
}

function query(str){
    return new Promise((resolve,reject)=>{connection.query(str, (err, rows, fields) => {
        if (err) throw err    
        resolve(rows)
    })})
}
function connect(){
    connection.connect()
}
function initializedb(){ // creates tables and rows if don't exists already
    function createTableStrGen(key,dict){
        str = `CREATE TABLE ${key} (`
        for (const [key2, value] of Object.entries(dict)) {
            str+=`${key2} ${value},`
        }
        str = str.slice(0,-1);
        str+=");";
        return str;    
    }
    return new Promise(async (resolve,reject)=>{
        for (const [key, value] of Object.entries(dbParameters)) {
            res = await query(`SHOW TABLES LIKE \'%${key}%\';`);
            if(res.length==0){// if table doesnt already exists
                await query(createTableStrGen(key,value));
            }else{
                let val_copy = structuredClone(value);
                res = await query(`SHOW COLUMNS FROM ${key};`);
                for(let x = 0; x<res.length; ++x){ //check all present columns
                    if(val_copy[res[x].Field]!==undefined){
                        if(val_copy[res[x].Field]!==(res[x].Type).toUpperCase()){ //if columns dont match expected type
                            reject(`DB column ${res[x].Field} in table ${key} doesnt have the expected type ${val_copy[res[x].Field]} found type ${res[x].Type}`);
                        }
                        delete val_copy[res[x].Field];
                    }
                }

                for (const [key2, value2] of Object.entries(val_copy)) { // itterate all columns not found but expected to be in sql
                    console.log(`Adding column ${key2} in table ${key}`);
                    query(`ALTER TABLE ${key} ADD ${key2} ${value2}`);
                }
            }
          }
        console.log("DB initialized")
        resolve("nothin")
    })   
}

function end(){
    connection.end()
}

class EventForms{
    constructor(){

    }
}

Date.prototype.getSQLFormat = function(){
    return (`${this.getFullYear()}-${this.getMonth()+1}-${this.getDate()} ${this.getHours()}:${this.getMinutes()}:${this.getSeconds()}`);
}

function sqlDataEncoder(temp){
    if(temp.constructor === Date){ return temp.getSQLFormat() }
    if(temp.constructor === EventForms){ return JSON.stringify(temp)}
    return temp
}

class Event{
    constructor(DateTime = new Date()){
        this.param = [];
        this.namemaps = {'DateTime':'Date','EventData':'Form','EventType':'Type','EventCategory':'Cat'}
        for(const key in dbParameters['Events']){
            if(key in this.namemaps){this[this.namemaps[key]]
            }else{this[key]}
        }
        //initialize varibles here
        this['Date'] = DateTime;
        this['Form'] = new EventForms();
    }

    genSQLInsertStr(){ //gens insert sql query using namemaps provided and encoder
        let str = "INSERT INTO Events ("
        for(const key in dbParameters['Events']){
            str+=key + ",";
        }
        str = str.slice(0,-1) + ") VALUES ("
        let temp;
        for(const key in dbParameters['Events']){
            if(key in this.namemaps){temp = this[this.namemaps[key]]
            }else{temp = this[key]}
            str+=`"${sqlDataEncoder(temp)}",`
        }
        str = str.slice(0,-1) + ");"

        return str;
    }
        
}

function removeAllEvents(){
    return new Promise(async(resolve,reject)=>{await query("DELETE FROM Events;")
    resolve("Your problems")})}

function addEvent(e){
return new Promise(async (resolve,reject)=>{
    await query(e.genSQLInsertStr())
    resolve("Your problems")
})}

function pullEvents(){
    return new Promise(async (resolve,reject)=>{
        let even = await query('SELECT * FROM Events');

        for (const i in even) {
            console.log(even[i])
        }

        resolve('Resolved')
    })}





module.exports = {
    connect:connect,
    initialize:initializedb,
    end:end,
    Event:Event,
    addEvent:addEvent,
    pullEvents:pullEvents,
    EventForms:EventForms,
    removeAllEvents:removeAllEvents
  };