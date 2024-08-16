var tickers = JSON.parse(localStorage.getItem('tickers')) || [];
var lastPrices = {};
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
        addTickerToTable(ticker);
    });

    updatePrices();

    $('#add-ticker-form').submit(function(e){
        e.preventDefault();
        var newTicker = $('#new-ticker').val().toUpperCase();
        if (!tickers.includes(newTicker)) {
            tickers.push(newTicker);
            localStorage.setItem('tickers', JSON.stringify(tickers))
            addTickerToTable(newTicker);
        }
        $('new-ticker').val('');
        updatePrices();
    });

    $('#tickers-table').on('click', '.remove-btn', function() {
        var tickerToRemove = $(this).data('ticker');
        tickers = tickers.filter(t => t !== tickerToRemove);
        localStorage.setItem('tickers', JSON.stringify(tickers))
        $(`#${tickerToRemove}`).remove();
    });

    startUpdateCycle();
});

function addTickerToTable(ticker) {
    $('#tickers-table').append(
        `<tr id="${ticker}">
            <td>${ticker}</td>
            <td id="${ticker}-status"></td>
            <td id="${ticker}-price"></td>
            <td id="${ticker}-change"></td>
            <td id="${ticker}-pct"></td>
            <td><button class="remove-btn" data-ticker="${ticker}">Remove</button></td>
        </tr>`
    )
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
                var changePrice = data.currentPrice - data.openPrice
                var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100;
                var colorClass;
                if (changePercent <= -2) {
                    colorClass = 'dark-red'
                } else if (changePercent < 0) {
                    colorClass = 'green'
                } else if (changePercent == 0) {
                    colorClass = 'gray'
                } else if (changePercent <= 2) {
                    colorClass = 'red'
                } else {
                    colorClass = 'dark-green'
                }

                $(`#${ticker}-price`).text(`$${data.currentPrice.toFixed(2)}`);
                $(`#${ticker}-change`).text(`$ ${changePrice.toFixed(2)}`);
                $(`#${ticker}-pct`).text(`${changePercent.toFixed(2)}%`);
                $(`#${ticker}-price`).removeClass('dark-red red gray green dark-green').addClass(colorClass);
                $(`#${ticker}-pct`).removeClass('dark-red red gray green dark-green').addClass(colorClass);

                var flashClass;
                if (lastPrices[ticker] > data.currentPrice) {
                    flashClass = 'red-flash';
                    $(`#${ticker}-status`).text(`${'🔻'}`);
                } else if (lastPrices[ticker] < data.currentPrice) {
                    flashClass = 'green-flash';
                    $(`#${ticker}-status`).text(`${'🔺'}`);
                } else {
                    flashClass = 'gray-flash';
                    $(`#${ticker}-status`).text('⚖️');
                }
                lastPrices[ticker] = data.currentPrice;

                $(`#${ticker}`).addClass(flashClass);
                setTimeout(function(){
                    $(`#${ticker}`).removeClass(flashClass);
                }, 1000);
            }
        });
    });
}
