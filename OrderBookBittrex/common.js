const FETCH_SETTINGS = {
    method: 'get',
    headers: {
        'content-type': 'application/json'
    }
};
const MARKETS_URL = "/getMarkets";
let vm;

function createViewModel() {
    vm = {
        orderType: ko.observable("sell"),
        orderBookInfo: ko.observableArray(),
        currencyMarketQuotes: ko.observableArray(),
        baseCurrency: ko.observable("USDT"),
        quoteCurrency: ko.observable(),
        minQuantity: ko.observable(),
        maxRate: ko.observable(),
        selectedPairText: function (){
            return this.baseCurrency() + "-" + this.quoteCurrency();
        },
        isVisible: function (quantity, rate) {
            return (quantity >= parseFloat(this.minQuantity())) && (rate <= parseFloat(this.maxRate()));
        },
        clickQuant: function () {
            initiateSliders();
            return true;
        }
    };
    ko.applyBindings(vm);
}

function setSelectValues() {
    let selectedBase = getParameterByName("base");
    let selectedQuote = getParameterByName("quote");
    if (selectedBase) {
        vm.baseCurrency(selectedBase);
    }
    if (selectedQuote) {
        vm.quoteCurrency(selectedQuote);
    }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function initiateSliders() {
    let type = vm.orderType();
    let chosenData = vm.orderBookInfo()[type];
    let sliderquant = document.getElementById("quantityRange");
    let sliderRate = document.getElementById("rateRange");

    sliderquant.min = findMinbyAtt(chosenData, "Quantity");
    sliderquant.max = findMaxbyAtt(chosenData, "Quantity");
    sliderRate.min = findMinbyAtt(chosenData, "Rate");
    sliderRate.max = findMaxbyAtt(chosenData, "Rate");

    vm.minQuantity(sliderquant.min);
    vm.maxRate(sliderRate.max);
}

function findMinbyAtt(arr, att) {
    let currMin = arr[0][att];
    for (let i = 1; i < arr.length; i++) {
        currMin = Math.min(currMin,arr[i][att]);
    }
    return currMin;
}

function findMaxbyAtt(arr, att) {
    let currMax = arr[0][att];
    for (let i = 1; i < arr.length; i++) {
        currMax = Math.max(currMax,arr[i][att]);
    }
    return currMax;
}

function fetchMarketData() {
    let baseCurr = vm.baseCurrency();
    let quoteCurr = vm.quoteCurrency();
    return fetch(`/getPairOrderBook?base=${baseCurr}&quote=${quoteCurr}`, FETCH_SETTINGS)
        .then(responseHandle)
        .then((dataFromServer) => {

            vm.orderBookInfo(dataFromServer.result);
        })
}

function initCurrMarketQuont(marketPairsData){
    vm.currencyMarketQuotes(marketPairsData);
}

function responseHandle(res){
    return res.json();
}

$(function() {
    createViewModel();
    fetch(MARKETS_URL, FETCH_SETTINGS)
    .then(responseHandle)
    .then(initCurrMarketQuont)
    .then(setSelectValues)
    .then(fetchMarketData)
    .then(initiateSliders)
});
