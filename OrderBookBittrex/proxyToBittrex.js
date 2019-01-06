const express = require('express');
const fetch = require('node-fetch');
const app = express();
const FETCH_SETTINGS = {
    method: 'get',
    headers: {
        'content-type': 'application/json'
    }
};
const MARKETS_URL = "/getMarkets";
const ORDERBOOK_URL = "/getPairOrderBook";
const BITTREX_API_MARKETS = "https://bittrex.com/api/v1.1/public/getmarkets";

app.use('/',express.static(__dirname));
app.get(MARKETS_URL,function (req,res) {
    fetch(BITTREX_API_MARKETS, FETCH_SETTINGS)
        .then(handleRes)
        .then((dataFromServer) => {
           errorCheck(dataFromServer);
            let marketsPairs = buildMarketsPair(dataFromServer);
            res.send(marketsPairs);
    })
});

app.get(ORDERBOOK_URL,function (req,res) {
    let baseCurrency = req.param('base');
    let marketCurrency = req.param('quote');
    fetch(`https://bittrex.com/api/v1.1/public/getorderbook?market=${baseCurrency}-${marketCurrency}&type=both`,FETCH_SETTINGS)
        .then(handleRes)
        .then((orderBookData) => {
            errorCheck(orderBookData);
            res.send(orderBookData);
    })
});

function errorCheck(dataFromServer){
    if(dataFromServer.success === "false"){
        throw new Error(message)
    }
}
function handleRes(res){
    return res.json();
}

function buildMarketsPair(marketsData){
    let validMarketData = {BTC: [], ETH: [], USDT: []};
    marketsData.result.forEach(function (element) {
        if (element.BaseCurrency == "BTC") {
            validMarketData.BTC.push(element.MarketCurrency);
        }
        else if (element.BaseCurrency == "ETH") {
            validMarketData.ETH.push(element.MarketCurrency);
        }
        else if (element.BaseCurrency == "USDT") {
            validMarketData.USDT.push(element.MarketCurrency);
        }
    })
    return validMarketData;

}

app.listen(8080, () => {
});
