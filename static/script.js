var tickers = JSON.parse(localStorage.getItem('tickers')) || [];
var counter = 15;

function startUpdateCycle() {
    updatePrices();
    setInterval( function() {
        counter--;
        $('#counter').text(counter);
        if ( counter <= 0 ) {
            updatePrices();
            counter = 15;
        }
    }, 1000)
}

$(document).ready(function(){

    tickers.forEach(function(ticker){
        addTickerToGrid(ticker);
    });

    updatePrices();

    $('#add-ticker-form').submit(function(e){
        e.preventDefault();
        var newTicker = $('#new-ticker').val().toUpperCase();
        if (!tickers.includes(newTicker)) {
            tickers.push(newTicker);
            localStorage.setItem('tickers', JSON.stringify(tickers))
            addTickerToGrid(newTicker);
        }
        $('new-ticker').val('');
        updatePrices();
    });

    startUpdateCycle();
});

function addTickerToGrid(ticker) {
    $('#tickers-grid').append(`<div id="${ticker}" class="stock-box"><h2>${ticker}</h2><p id="${ticker}-price"></p><p id="${ticker}-pct"></p></div>`)
}

function updatePrices(){
    tickers.forEach(function(ticker) {
        $.ajax({
            url: '/get_stock_data',
            type: 'POST',
            data: JSON.stringify({'ticker': ticker}),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(data) {
                var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100;
                $(`#${ticker}-price`).text(`$${data.currentPrice.toFixed(2)}`);
                $(`#${ticker}-pct`).text(`${changePercent.toFixed(2)}%`);
            }
        });
    });
}
