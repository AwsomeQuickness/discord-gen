const request = require('request');
const lineReader = require('line-reader');

const dictionary = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const PROXY_FILE = "proxies.txt";

const TPS = 0.5;

let working = [];

var proxyLine = 0;
let proxyUrl = "";

function createCode() {
    var currentCode = "";
    for (var i = 0; i < 16; i++) {
        currentCode += dictionary[(Math.floor(Math.random() * dictionary.length))];
    }
    return currentCode;
}

function updateLine(){
    proxyLine++;
    var readLine = 0;
    lineReader.eachLine(PROXY_FILE, (line, last) => {
        readLine++;
        if (readLine === proxyLine) {
            proxyUrl = "http://" + line;
        }
        if (last) {
            readLine = 0;
        }
    });
}

function checkCode(code) {
    var pRequest = request.defaults({'proxy': proxyUrl});
    pRequest.timeout = 1500;
    pRequest.get(`https://discordapp.com/api/v6/entitlements/gift-codes/${code}?with_application=false&with_subscription_plan=true`,  (error, resp, body)  => {
        if (error) {
            console.log(`%cConnection error: switching proxy`, 'color:green');
            updateLine();
            return;
        }
        try {
            var thisBody = JSON.parse(body);
            if(thisBody.message != "Unknown Gift Code" && thisBody.message != "You are being rate limited.") {
                working.push(`https://discord.gift/${code}`);
                console.log('%cWorking code found!: ' + working[working.length], 'color:green');
                fs.writeFileSync('codes.txt', working.join('\n'), 'utf8');
            } else if(body.message === "You are being rate limited.") {
                updateLine();
                console.log("%cRate limit reached! Switching proxy...", 'color:green');
            } else console.log(`%cInvalid code: https://discord.gift/${code}`, 'color:green');

        } catch (theError) {
            console.log('%cAn error has occoured.', 'color:red');
            console.log('c%' + theError, 'color:red');
            return;
        }
    });
}

module.exports = () => {
    console.log('%cThis tool is made by cossinle#0746.', 'color:blue');
    console.log("%cPlease don't download tools from ytzmo#8888. He makes viruses.", 'color:red');

    checkCode(createCode());
    setInterval(() => {
        checkCode(createCode());
    }, (5/TPS) * 50);
}